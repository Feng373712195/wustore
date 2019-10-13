# Wustore

    wustore 是一个小程序使用的全局状态管理工具

## API

### ceateStore

#### 参数：

    source （Object)接受一个对象参数，这个对象为store的默认值

#### 返回：
wu    
    store对象 

#### 例子：
    
    // app.js
    improt { createStore  } from '/wustore/store/create'
    const source = { x:1 }
    createStore( source )

### appMapStore

#### 参数：

    mapStore （Array) 接受一个数组参数，调用了getMapStore 的页面或者组件的 mapStore 参数 都会合并 mapGlobalStore的 mapStore 

#### 返回：

    无

#### 例子：
    
    // app.js
    import { mapGlobalStore } from '/wustore/store/create'
    mapGlobalStore(['user_info'])

#### 贴士：

    如需调用mapGlobalStore ，则建议在 app.js 调用 mapGlobalStore  

#### 参数：

    updateData （Object) 接受一个对象参数，相当与 小程序setData的第一个参数，不过只能用来更新store的数据，功能与 this.updateStore 一致，只不过 this.updateStore 需要页面或者组件赋使用getMapStore之后才会对this赋予updateStore方法更新 store.appUpdateStore与updateStore区别与可以在app.onLanch时或者app.js一些全局方法中更新store。 

### appUpdateStore

#### 返回：

    无

#### 例子：
    
    // app,js
    import { appUpdateData } from '/wustore/store/create'
    appUpdateData({ x:111 })

#### 贴士：

    参考updateStore贴士

### getMapStore

#### 参数：

    this （page/component)  页面或者组件对象
    [mapStore]  （Array） 数组中的值为页面或者组件需要用到的store的筛选字段，执行完getMapStore 将会在 this.data.store 出现这些数据
    [watch]  (Object)   watch对象的key为store中数据路径，当store中对应路径的数据发生变化，则会执行key对应的value的回调方法

#### 返回：

    无

#### 例子：
    
    // page or component
    // store = {  x:{ y:1 },x2:{ y2:2 } }

    import { getMapStore } from '/wustore/store/create'
    
    // watch参数的两种写法
    const storeWatch = { 
         // 深度观察
        ‘x’:{
            deep:true,
            handle(that,oldVal,newVal){   
                console.log('change x')
            }
        }
        ‘x.y’(that,oldVal,newVal){
            console.log('change x.y', 'olaVal', oldVal , 'newVal' ,newVal )
        }
    }

    Page({
        onLoad(){
            getMapStore(this,['x'],storeWatch)
             
            console.log( this.data.store )
            // 控制的输出  { x:{ y:1 } }

            this.updateStore({ 'x.y':2 })
            // 控制的输出  change x
            // 控制的输出  change x.y  'olaVal', 1 , 'newVal' , 2 
        }
    })

#### 贴士：
    
     - watch 的回调函数会返回三个参数 第一个是当前的页面或者组件实例，第二个参数是改变之前的值，如果改变之前的值为引用对象则为一个改变前的值的深拷贝，第三个参数为当前对象也就是但是store中对象数据的值


### updateStore

#### 参数：

    updateData （Object) 接受一个对象参数，相当与 小程序setData的第一个参数，不过只能用来更新store的数据。当调用完getMapStore才在当前上下文中有updateStore调用。

#### 返回：

    无

#### 例子：
    
    // page or component
    // store = {  x:{ y:1 },x2:{ y2:2 } }

    import { getMapStore } from '/wustore/store/create'
    
    Page({
        onLoad(){
            getMapStore(this,['x'])
            this.updateStore({ 'x.y':2 })
            // store = {  x:{ y:2 },x2:{ y2:2 } }
        }
    })

#### 注意：
    
    注意：updateStore 的 updateData 中数据路径的书写规则要按照 setData 一样否则会报错
    store.对象属性   正确  store[‘对象属性’]  错误
    store[数组索引]  正确  store.数组索引     错误

### setStoreProp

#### 参数：

    dataPath（String)   接受一个字符串参数，对象的数据路径
    setkey  （String）  接受一个字符串参数，对象新添加的属性名称
    val   （Any）  新添加属性的值

#### 返回：

    无

#### 例子：
    
    // page or component
    // store = {  x:{ y:{  } }  }

    import { getMapStore，setStoreProp  } from '/wustore/store/create'
    
    Page({
        onLoad(){
            getMapStore(this,['x'])
            setStoreProp( 'x.y','z','111' )
            // 下次更新 则新增的属性就会渲染在视图上
            this.updateStore({  })
            
        }
    })
    