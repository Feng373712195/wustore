# Wustore

   wustore 是一个小程序使用的全局状态管理工具，参考了vuex的一些概念与借鉴了vue数据拦截的原理。
   
   #### 优势
   
   1、当全局状态修改时，后台页面组件不会发发生更新， 会在页面是触发onShow时再去进行更新。
   
   2、可以监听每次状态的修改，并知道修改了哪个属性。
   
   3、每次修改都是利用了数据拦截进行收集，并在拦截时判断状态的值是否改变是否需要修改，小程序性能得到优化。
   
   
---
    
## Usage

### 如何创建store

首先在app.js引入 createStore 方法
   
然后再app.js中创建项目中的全局store
   
    // app.js
    import { createStore } from 'wustore/store/create';
    const store = { key:'value' };
    createStore(store);

完成这一步之后就为项目好了项目的状态管理中心，项目中的全局状态都存储在这个对象中，通常称之为store。

### 页面或者组件如何使用状态

之后为要使用全局状态的页面或者组件 引入 wustore/store/create 方法

这个方法用起来有点像 vuex中的mapState

    // 页面
    import { getMapStore } from 'wustore/store/create'
    Page({
        onLoad(){
            getMapStore(this,['stateA','stateB'])
        }
    })
-

    //组件
    import { getMapStore } from 'wustore/store/create'
    Component({
        ready(){
            getMapStore(this,['stateA','stateB'])
        }
    })
    
调用完后就会在页面中注入全局状态了，如果在视图层使用到的话，其他地方修改也会视图也会更新。

### 如何更新

当调用完了 getMapStore 后页面或者组件实例会添加 updateStore 方法

写法和setData相同，用此方法更新数据，就可以更新全局状态中的状态，并且视图会进行更新。

### 还有其他用法 请看API

---
    
## API

###  - ceateStore
       
#### 作用：
    
    为项目中添加一个中心全局状态对象，项目中的全局状态都为它管理

#### 参数：

    source （Object)接受一个对象参数，这个对象为store的默认值

#### 返回：
    
    store

#### 例子：
    
    // app.js
    improt { createStore  } from '/wustore/store/create'
    const source = { x:1 }
    createStore( source )

### - appMapStore

#### 作用：
    
    此方法通常在app.js中使用 ，此方法可以用来为所用页面和组件组件统一要注入的状态，例如登陆状态，用户信息等

#### 参数：

    mapStore （Array) 接受一个数组参数，调用了getMapStore的页面或者组件的mapStore参数都会合并appMapStore的参数

#### 返回：

    无

#### 例子：
    
    // app.js
    import { appMapStore } from '/wustore/store/create'
    appMapStore(['user_info'])

#### 贴士：

    如需调用appMapStore ，则建议在 app.js 调用appMapStore  

#### 参数：

    updateData （Object) 接受一个对象参数，相当与 小程序setData的第一个参数，不过只能用来更新store的数据，功能与 this.updateStore 一致，只不过 this.updateStore 需要页面或者组件赋使用getMapStore之后才会对this赋予updateStore方法更新 store.appUpdateStore与updateStore区别与可以在app.onLanch时或者app.js一些全局方法中更新store。 

### - appUpdateStore

#### 作用：
    
    此方法可以用来更新全局状态，和updateStore的区别是此方法不局限与页面和组件，可以引入此方法在一些工具模块文件或者自定义库中调用去更新全局状态

#### 返回：

    无

#### 例子：
    
    // app,js
    import { appUpdateData } from '/wustore/store/create'
    appUpdateData({ x:111 })

#### 贴士：

    参考updateStore贴士

### - getMapStore

    此方法来为页面或者组件注入要使用的全局状态

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
    
     watch 的回调函数会返回三个参数 第一个是当前的页面或者组件实例，第二个参数是改变之前的值，如果改变之前的值为引用对象则为一个改变前的值的深拷贝，第三个参数为当前对象也就是但是store中对象数据的值


### - updateStore

#### 作用：
    
    此方法在页面或者组件调用完getMapStore后会自动添加到实例中，可以用来更新全局状态 。

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

### - setStoreProp

#### 作用：
    
    此方法为一些引用类型的状态新增新属性时，需要调用此方法，在下次updateStore时会对视图更新。具体原因可以参考Vue.set

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
    
