import { isFunction } from '../../uilt/uilt'

const watchOldCache = { };

class watchMap {
    constructor(){
        // 只检查匹配数据路径 watch
        this.dataPathWatchs = new Map();
        // 深检查 watch
        this.deepWatchs = new Map();
        // 存储待触法 watch 函数
        this.watchHandles = new Map();

        // 组件 watchMap
        this.componentWatchs = new Map();
    }
    getWatchPageMap(webviewId){
        return this.dataPathWatchs.get(webviewId) 
    }
    setWatchPageMap(id,watchs,isComponents,componentdata){ 

        const dataPathWatchs = {};
        const deepWatchs = {};
        
        Object.keys(watchs).forEach(dataPath => {
            if( watchs[dataPath].deep ) Object.assign( deepWatchs,{ [dataPath]:watchs[dataPath].handle } )
            else Object.assign( dataPathWatchs,{ [dataPath]:watchs[dataPath] })
        })

        if( isComponents ){
            const { component, componentFromWebviewId } = componentdata
            !this.componentWatchs.has(componentFromWebviewId) && this.componentWatchs.set( componentFromWebviewId, new Map() )
            this.componentWatchs.get( componentFromWebviewId ).set( component.__wxExparserNodeId__,{ dataPathWatchs,deepWatchs,watchHandles:[] })
        }
        else{
            this.dataPathWatchs.set(id,dataPathWatchs) 
            this.deepWatchs.set(id,deepWatchs)
            this.watchHandles.set(id,[]); 
        }

        // this.dataPathWatchs.set(id,dataPathWatchs)
        // this.deepWatchs.set(id,deepWatchs)
        // this.watchHandles.set(id,[]); 
        
    }
    checkIsWatch(webviewId,dataPath,that,oldVal,newVal){
        let _oldVal = oldVal !== '@@@cache oldval@@@' ? (watchOldCache[dataPath] = oldVal) : watchOldCache[dataPath];
        // 检查页面是否有 watch 监听
        if( this.checkHasWatch(webviewId) ){
            if( this.checkIsDeepWatch( webviewId,dataPath,that,oldVal,newVal ) ){ 
                // 此处是否 return 待参考vue
                // return;
            }
            const watchs = this.getWatchPageMap( webviewId )
            if( watchs[dataPath] ){
                isFunction(watchs[dataPath]) && this.pushTodoWatchHandles( webviewId,watchs[dataPath].bind(that,_oldVal,newVal) );
            }
        }
        
    }
    checkComponentIsWatch(webviewId,dataPath,that,oldVal,newVal){

        // 检查页面组件是否有 watch 监听
        const componentId = that.__wxExparserNodeId__
        if( this.componentWatchs.get(webviewId) && this.componentWatchs.get(webviewId).get(componentId) ){
            const componentWatch =  this.componentWatchs.get(webviewId).get(that.__wxExparserNodeId__);
            const { dataPathWatchs , deepWatchs , watchHandles } = componentWatch
            if( this.checkIsDeepWatch( componentId,dataPath,that,oldVal,newVal,true,componentWatch  ) ){ 

            }

            if( dataPathWatchs[dataPath] ){
                let _oldVal = oldVal ? (watchOldCache[dataPath] = oldVal) : oldVal = watchOldCache[dataPath];
                isFunction(dataPathWatchs[dataPath]) && this.pushTodoWatchHandles( 
                                                                componentId,
                                                                dataPathWatchs[dataPath].bind(that,_oldVal,newVal),
                                                                true,
                                                                componentWatch );
            }
        }

    }
    checkIsDeepWatch(nodeId,dataPath,that,oldVal,newVal,isComponents,componentWatch){
        let isWatch = false;
        const deepWatchs = isComponents ? componentWatch.deepWatchs : this.deepWatchs.get(nodeId)
        const deepWatchKeys = Object.keys( deepWatchs ); 

        for( let i = 0 ; i < deepWatchKeys.length ; i++ ){
            if( dataPath.indexOf( deepWatchKeys[i] ) === 0  ){
                let _oldVal = oldVal ? (watchOldCache[dataPath] = oldVal) : oldVal = watchOldCache[dataPath];

                isComponents ?
                this.pushTodoWatchHandles( nodeId,deepWatchs[ deepWatchKeys[i] ].bind( that,_oldVal,newVal ) , true , componentWatch ):
                this.pushTodoWatchHandles( nodeId,deepWatchs[ deepWatchKeys[i] ].bind( that,_oldVal,newVal ) )
                isWatch = true
                break;  
            } 
        }
        return isWatch;
    }
    checkHasWatch(id){
        return this.deepWatchs.get( id ) || this.getWatchPageMap( id )  ? true : false
    }
    runWatchHandles(webviewId){
       const watchs = this.watchHandles.get(webviewId)
       watchs && watchs.length > 0 && watchs.forEach( fn=>fn() );
       this.crealTodoWatchHandles(webviewId)
    }
    runComponentsWatch(webviewId){
        const pageComponentWatchs = this.componentWatchs.get( webviewId )
        if( !pageComponentWatchs ) return;
        for( let [ componentId, componentWatch ] of pageComponentWatchs ){
            const { dataPathWatchs,deepWatchs,watchHandles } = componentWatch;
            watchHandles && watchHandles.length > 0 && watchHandles.forEach( fn=>fn() );
            this.clearComponentsTodoWatchHandles( componentWatch );
        }
    }
    pushTodoWatchHandles(webviewId,handle,isComponents,componentWatch){ 
        isComponents ?
        componentWatch.watchHandles.push( handle ) :
        this.watchHandles.get(webviewId).push( handle ) 
    }
    crealTodoWatchHandles(webviewId){
        this.watchHandles.set(webviewId,[]);
    }
    clearComponentsTodoWatchHandles(watch){
        watch.watchHandles = []
    }
    removeWatchPageMap(webviewId){
        this.dataPathWatchs.delete(webviewId)
        this.deepWatchs.delete(webviewId)
        this.watchHandles.delete(webviewId)
        // 删除页面相关组件 update
        this.componentWatchs.delete(webviewId)
    }
}

export default new watchMap;