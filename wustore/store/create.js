const { isObject,isArray,flatObject,deep,arrDiff } = require('../uilt/uilt')
import { createObserver } from '../observer/createObserver/index'
import { setNewObserver } from '../observer/setNewObserver/index'
import isSetData from '../manage/is-set-data/index'
import updateData from '../manage/update-data/index'
import watchMap from '../manage/watch-map/index';
import useStore from '../manage/use-store/index'

import setSourceObject from '../observer/setSourceObject/index'


let store = null;

let globalStore = [];

let todoGlobaUpadte = {};

let isUpdate = false;

// 是否执行watch
let isWatch = true;

// wcstore dataPath 规则  
// store.对象属性 true  store[‘对象属性’] false   
// store[数组索引] true  store.数组索引 false

// 把使用者写的对象路径 转成 wcstore 统一风格 在watch中可以用来判断是否使用了watch
const strTransformPath = function( _store,str,cb){

    str = str.replace(/^store\./,'');
    const orgin = _store
    let points = [ orgin ];
    let keys = [];

    str.replace(/(\w+)(?=\.)|(\w+)\[(\w+)\]|\[(\w+)\]/g,function($1,chain1,chain2,brackets1,brackets2){ 
        
        if( chain1 ){
            
            points.push( points[points.length-1][chain1] )
            keys.push( chain1 )
            str = str.replace($1 + '.','')
        }
        else if( chain2 && brackets1 ){
            
            points.push( points[points.length-1][chain2] )
            keys.push( chain2 )
            points.push( points[points.length-1][brackets1] )
            keys.push( brackets1 )
            str = str.replace($1,'')
        }
        else if( brackets2 ){
            
            points.push( points[points.length-1][brackets2] )
            keys.push( brackets2 )
            str = str.replace($1,'')
        }
    })

    if(str){
        const lastKey = str.replace('.','')
        points.push( points[points.length-1][lastKey] )
        keys.push( lastKey )
    }

    cb( points[points.length-2],keys[keys.length-1],points,keys )
}

// 寻找webview对象
const findWebview = function(webviewid){
    return useStore.pages.find( page => page.__wxExparserNodeId__ === webviewid )
}

// wcstore setData
const _setData = function(data){
    isSetData.is = true
    this.setData(data)
    isSetData.is = false
} 

const getDataRoot = function(dataPath){
    const reg = /^\w+(?=\.|\[)?/;
    return reg.exec(dataPath)[0];
}

// 数据observer 观察回调
const observerCB = function(setdata,key,newval,dataPath){
    // 有时setData 会触发到 observerCb 如果是setData执行过程中调用到observerCb 不往下执行
    if( isSetData.is ) return 
    
    // 不是在 updateStore 中执行的更新 observerCb 不往下执行 
    if( !isUpdate ){
        setdata[key] = newval
        return;
    } 

    
    // 防止赋 已经可以监听的值
    const getNewVal = (val)=>{
        return val.getSourceObject ? val.getSourceObject : val.getSourceArray ? val.getSourceArray : val
    }

    const getOldVal = (val)=>{
        if( val ){
            return val.getObserverObject ? val.getObserverObject : val.getObserverArray ? val.getObserverArray : val
        }else{
            return val
        }
    }

    // 判断是否是赋值 自己的值
    if( getOldVal(setdata[key]) === newval ){
        if( isObject( getOldVal(setdata[key]) ) ){
            const diffkey = arrDiff( Object.keys( setdata[key] ),Object.keys( newval ) )
            if( diffkey.length == 0 ) return 
            diffkey.forEach( key => {
                newval.getSourceObject[key] = newval[key]
                setNewObserver( newval , newval.getSourceObject , observerCB , dataPath, key )
            })
        }
        // console.log( 'set self' )
    }

    // 小程序首页还未开始加载
    if( !useStore.currentPage.id ){ 
        setdata[key] = newval;
        return;
    }

    // 设置旧值 用于watch时返回
    let oldVal = null;
    if( isObject(setdata[key]) || isArray(setdata[key]) ){
        // 改变了引用类型的值
        oldVal = deep( setdata[key] )
        cleanUpdate = true;
    }else{
        oldVal = setdata[key]
    }

    // 把源对象 设置新值
    setdata[key] = getNewVal(newval);

    //以下为watch与update操作    
    let cleanUpdate = false;
    const dataRoot = getDataRoot(dataPath);

    const upDateNewVal = isObject( setdata ) ? setdata.getObserverObject[key] : setdata.getObserverArray[key]
    const curtPageComponents = useStore.pageComponents[useStore.currentPage.id]
    //页面记录更新
    updateData.setUpdataData( useStore.currentPage.id,dataPath,dataRoot,cleanUpdate,upDateNewVal )
    isWatch && watchMap.checkIsWatch( useStore.currentPage.id,dataPath, useStore.currentPage.webview ,oldVal,upDateNewVal )

    //页面组件记录更新
    curtPageComponents && curtPageComponents.forEach( component=>{
        const componentId = component.__wxExparserNodeId__
        updateData.setUpdataData(useStore.currentPage.id,dataPath,dataRoot,cleanUpdate,upDateNewVal,componentId)
        isWatch && watchMap.checkComponentIsWatch( useStore.currentPage.id,dataPath,component,oldVal,upDateNewVal ) 
    })

}
 
// 创建store
const createStore = function(source){
    store = createObserver( Object.create({}) ,source, observerCB );
    return store;
}

// 为引用对象设置新属性
const setStoreProp = function(storeDataPath,setkey,val){

    strTransformPath( store,storeDataPath,function(point,key){
            const hasProp = point[key].hasOwnProperty(setkey);
            
            if( !hasProp ){
                // 对新的属性的监听
                const source = isObject( point ) ? point[key].getSourceObject : point[key].getSourceArray 
                source[setkey] = '@@@new prop@@@'
                setNewObserver( point[key] , 
                                source , 
                                observerCB , 
                                `${storeDataPath}`,
                                setkey )
            }
            
            isUpdate = true
            point[key][setkey] = val
            isUpdate = false
    })
}

// 防止框架之外的逻辑重写onShow 
const __observerPageShowHook = function(mapstore){
    
    const onshow = this.onShow
    let beforeShowEventCount = 0;

    const beforeShow = function(mapstore){
        
        if( beforeShowEventCount >= 1 ){
            return;
        }

        ++beforeShowEventCount

        // 页面show 重新 useStore.currentPage.id 当前页面 webviewId
        useStore.currentPage.webview = this
        useStore.currentPage.id = this.__wxExparserNodeId__

        const updataAndRunWatch = ( that,isComponents ) => {
            
            const currenPageTodoUpdate = flatObject( isComponents ?
                                                     updateData.getUpdataData( useStore.currentPage.id,that.__wxExparserNodeId__  ) :
                                                     updateData.getUpdataData( useStore.currentPage.id ) )
            // console.log('--- beforeShow currenPageTodoUpdate  ---',currenPageTodoUpdate)
            // const checkIsWatchHandleName = isComponents?'checkComponentIsWatch':'checkIsWatch'
            
            const todoUpdateKeys = Object.keys(currenPageTodoUpdate)

            if( todoUpdateKeys.length > 0 ){ 

                // todoUpdateKeys.forEach( dataPath => { 
                //     watchMap[checkIsWatchHandleName]( 
                //                                         useStore.currentPage.id ,
                //                                         // dataPath.replace('store.',''), 
                //                                         dataPath,
                //                                         that,
                //                                         '@@@cache oldval@@@',
                //                                         currenPageTodoUpdate[dataPath]
                //                                     )
                // })
                
                _setData.bind( that,currenPageTodoUpdate )()
                // 页面 runWatchHandles
                watchMap.runWatchHandles( useStore.currentPage.id )
                // 页面组件 runWatchHandles
                watchMap.runComponentsWatch( useStore.currentPage.id )
            }
        }

        updataAndRunWatch( this );
        const currentPageComponent = useStore.pageComponents[useStore.currentPage.id];

        currentPageComponent && currentPageComponent.length > 0 && currentPageComponent.forEach( component=>{
            updataAndRunWatch( component,true );
        })

        // clear 当前页和组件 uodate
        updateData.clearUpdateData( useStore.currentPage.id )

        setTimeout(()=>{ beforeShowEventCount = 0; })
    }

    Object.defineProperty(this,'onShow',{
        get(){
            return this.__onshow ? this.__onshow : onshow
        },
        set(newval){   
            this.__onshow = function(...arg){ 
                    let setNewShow = null;
                    [beforeShow.bind(this,mapstore),newval.bind(this,...arg)]
                    .map((fn,index)=>{  
                        if(index == 0) beforeShowEventCount == 0 && fn()
                        else{ setNewShow = fn }
                    })
                    setNewShow()
                }
        }
    })

    this.onShow = onshow;
}

// 防止框架之外的逻辑重写onUnload
const __observerWxPageUnloadHook =  function(){
    const onunload = this.onUnload
    let beforeUnloadEventCount = 0;
    
    const beforeUnload = function(){

        if( beforeUnloadEventCount >= 1 ){
            return;
        }    
        
        ++beforeUnloadEventCount

        // 执行过unload的页面 从 useStore.pages 中移除 
        const pageIndex = useStore.pages.indexOf(this)
        // 未对组件 removeWatchPageMap
        watchMap.removeWatchPageMap( useStore.pages[pageIndex].__wxExparserNodeId__ )
        // 未对组件 removeUpdateData
        updateData.removeUpdateData( useStore.pages[pageIndex].__wxExparserNodeId__ )
        useStore.pages.splice( pageIndex,1 );

        setTimeout(()=>{ beforeUnloadEventCount = 0 })
    };

    Object.defineProperty(this,'onUnload',{
        get(){
            return this.__onunload ? this.__onunload : onunload
        },
        set(newval){
            this.__onunload = function(...arg){ 
                let setNewUnload = null;
                [beforeUnload.bind(this),newval.bind(this,...arg)]
                .map((fn,index)=>{  
                    if(index == 0) beforeUnloadEventCount == 0 && fn()
                    else{ setNewUnload = fn }
                })
                setNewUnload()  
            }
        }
    })
    this.onUnload = onunload;
}

// store 页面更新函数
const updateStore = function(update,option = {}){
    const { nowatch } = option

    console.log('updateStore',update,'that',this)

    isUpdate = true

    if( !update || !isObject(update) ){
        console.error('no updateStore data')
        isUpdate = false
        return;
    }

    const that = this;

    nowatch && (isWatch = false)

    if( update && isObject(update) ){

        Object.keys( update ).forEach( dataPath => {
            strTransformPath( store,dataPath,function(point,key,points,keys){
                if( that ){
                    const dataRoot = getDataRoot(dataPath);
                    if( that.__mapstorekey.indexOf( dataRoot ) === -1 ){
                        console.error(`no mapstore for ${ dataRoot }`)
                        return;
                    }
                }
                
                if( update[dataPath] === undefined ) return 
                const hasProp = point.hasOwnProperty(key);

                if( !hasProp ){
                    // 对新的属性的监听
                    const replacelastPropReg = /\[\d+\]|\.\w+$/
                    const source = isObject( point ) ? point.getSourceObject : point.getSourceArray ;
                    source[key] = '@@@new prop@@@'
                    setNewObserver( point , 
                                    source , 
                                    observerCB , 
                                    dataPath.replace( replacelastPropReg ,'' ), 
                                    key )
                }
                point[key] = update[dataPath];
                
            })
        })
        
    }

    if( !that ){
        isUpdate = false
        return;
    }

    const currenPageTodoUpdate = updateData.getUpdataData(useStore.currentPage.id);
    const currentPageComponent = useStore.pageComponents[useStore.currentPage.id];
    const pageComponentsTodoUpdate =  updateData.pageComponentsUpdateMap.get(useStore.currentPage.id)

    // 如果 没有更新的数据 则使用update不往下执行
    if( Object.keys( currenPageTodoUpdate ).length === 0 ){
        isUpdate = false
        return;
    }
    

    // 当前页面的toUpdate 存入其他使用页面 todoUpdate中 会在页面onSHOW时执行 update
    useStore.pages.forEach((page)=>{
        if( page.__wxExparserNodeId__ !== useStore.currentPage.id ){
            // 页面的待更新
            updateData.todoUpdateData( page, currenPageTodoUpdate  )
            if( isWatch ){
                const currenPageTodoUpdate = flatObject( updateData.getUpdataData( useStore.currentPage.id ) )
                const todoUpdateKeys = Object.keys(currenPageTodoUpdate)
                todoUpdateKeys.forEach( dataPath => { 
                    watchMap['checkIsWatch']( 
                                                page.__wxExparserNodeId__, 
                                                // dataPath.replace('store.',''), 
                                                dataPath,
                                                page,
                                                '@@@cache oldval@@@',
                                                currenPageTodoUpdate[dataPath]
                                            )
                })
            }
            // 页面的组件待更新
            const pageComponent = useStore.pageComponents[page.__wxExparserNodeId__]
            pageComponent && pageComponent.length > 0 && pageComponent.forEach(component => { 
                updateData.todoUpdateData( page, currenPageTodoUpdate , true , component )
                if( isWatch ){
                    const currenPageTodoUpdate = flatObject( updateData.getUpdataData( useStore.currentPage.id,component.__wxExparserNodeId__  )  )
                    const todoUpdateKeys = Object.keys(currenPageTodoUpdate)
                    todoUpdateKeys.forEach( dataPath => { 
                        watchMap['checkComponentIsWatch']( 
                                                            page.__wxExparserNodeId__, 
                                                            // dataPath.replace('store.',''), 
                                                            dataPath,
                                                            component,
                                                            '@@@cache oldval@@@',
                                                            currenPageTodoUpdate[dataPath]
                                                        )
                    }) 
                }  
            })
        }
    })

   

    isWatch = true

    // 当前页面更新
    _setData.bind( that,flatObject( currenPageTodoUpdate ) )()
    // 页面的组件更新
    currentPageComponent && currentPageComponent.length > 0 && currentPageComponent.forEach(component => { 
        _setData.bind( component,flatObject( pageComponentsTodoUpdate.get(component.__wxExparserNodeId__) ) )()
    })

    // clear 当前页面和组件 Update
    updateData.clearUpdateData( useStore.currentPage.id )    
    // 页面 运行watch runWatchHandles
    watchMap.runWatchHandles( useStore.currentPage.id )
    // 页面组件 运行watch runWatchHandles
    watchMap.runComponentsWatch( useStore.currentPage.id )

   

    isUpdate = false
}

const getfilterStore = function(mapStoreKey){
    let mapStore = {  }
    mapStoreKey.forEach( storekey => {
        if( this.data.hasOwnProperty(storekey) ) console.error( `page has data key for ${ storekey }` )
        else if( !store.hasOwnProperty(storekey) ) console.error( `store not find ${storekey}` )
        else Object.assign( mapStore,{ [storekey]:store[storekey]  } )
    })
    return mapStore
}

const addMapStore = function(addMapStoreKey){
    if( !this ) return
    if( !isArray(addMapStoreKey) ){
         console.error('addMapStore param not array')
    }
    const diffMapStoreKey = arrDiff( this.__mapstorekey,addMapStoreKey )
    this.__mapstorekey = this.__mapstorekey.concat(diffMapStoreKey)
    _setData.bind(this, getfilterStore.call(this,diffMapStoreKey) )()
}

const getMapStore = function(that,mapstore = [],watch = {}){

    let isComponents = false;
    
    // 页面选择的 store
    that.__mapstorekey = [...new Set(mapstore.concat(globalStore))]
    const mapStore = getfilterStore.call(that,that.__mapstorekey)
    
    // store 数据不再开放给用户操作
    // page.store = mapStore

    // 拥有onShow 与 onUnload 为 page 否则为 组件
    if( that.onShow && that.onUnload ){
        __observerPageShowHook.bind(that,mapstore)()
        __observerWxPageUnloadHook.bind(that)()
        useStore.currentPage.id = that.__wxExparserNodeId__
        useStore.currentPage.webview = that
        useStore.pages.push( that )
    }
    else{
        isComponents = true;
        if( !useStore.pageComponents[useStore.currentPage.id] ){
            useStore.pageComponents[useStore.currentPage.id] = []
        }
        useStore.pageComponents[useStore.currentPage.id].push( that )
    }
 
    that.updateStore = updateStore.bind( 
                                         isComponents ? useStore.currentPage.webview :  
                                         that ); 
    
    that.addMapStore = addMapStore.bind( 
                                        isComponents ? useStore.currentPage.webview :  
                                        that  );

    _setData.bind(that,mapStore)()

    if( watch && isObject(watch) ){
        watchMap.setWatchPageMap( 
            isComponents ? that.__wxExparserNodeId__ : that.__wxExparserNodeId__ ,
            watch,
            isComponents,
            isComponents ? { component:that, componentFromWebviewId:useStore.currentPage.id } : undefined
        )
    }

}

const appMapStore = function(mapstore){ 
    // 未处理异步情况
    globalStore = mapstore
}

const appUpdateStore = function(update,option = {}){ 
    // 还未有 useStore.currentPage.id 说明 小程序page首页onShow还未完成
    updateStore.bind( useStore.currentPage.id ?
                      useStore.currentPage.webview : 
                      null )(update,option)
}

export { 
    createStore,
    getMapStore,
    appMapStore,
    appUpdateStore,
    setStoreProp
};

// Object.keys(page.watch).forEach((dataPath)=>{
    // strTransformPath(store,dataPath,(point,key,points,keys)=>{ 
    //     let watchPath = '' 
    //     
    //     
    //     keys.forEach( (key,index) => {
    //         ''
    //         if( isArray(points[index]) ){ watchPath += `[${key}]` } 
    //         else if( isObject(points[index]) ){ watchPath += `${index == 0 ? '': '.'}${key}` }
    //     })
    // })
// })

// 可以监听到数组的执行方法
// store.a.push('111')
// store.a.splice(0,1)
// store.a.pop()
// store.a.unshift('111') 
// store.a.reverse()
// store.a.shift()

// push 数组新增之后也可以监听最新索引
// store.a.push('111')
// store.a[3] = '222'


// unshift 数组新增之后也可以监听最新索引
// store.a.unshift('111')
// store.a[0] = '222'


// 嵌套的属性也可以监听的到
// store.b.two[1][2] = '111'
// store.b.one.subObj.test1 = '1111'

// 普通类型重新赋值为引用类型可以进行监听

// 对象中的
// store.c = { a:'1',b:'2' }

// store.c.a = 111

// store.c = [1,2,3]

// store.c[0] = 'aaa'

//数组中的
// store.a[0] = [1,2,3]
// store.a[0] = { a:'1',b:'2' }
// store.a[0].a = '111'
