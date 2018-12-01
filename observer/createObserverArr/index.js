import observer from '../observer/index'
import { observerSetArrData } from '../observerSetArrData/index'

export const arrfun = { is:false }
export const createObserverArr = (setdata,key,observerArr,originArr,callback,dataPath ) => {


    const arrhandles = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'reverse',
    ]
  
    let proxpArr = [];

    arrhandles.forEach(v=>{
        Object.defineProperty(observerArr,v,{
          get:function(){
            return (...arg)=>{
                    arrfun.is = true
                    const ret = proxpArr[v].apply(observerArr,arg);
                    proxpArr[v].apply(originArr,arg); 
                    observer( setdata,key,originArr,dataPath,callback );
                    //执行数组的方法后 重新检测数组长度进行监听
                    observerSetArrData( observerArr,originArr,callback,dataPath )
                    arrfun.is = false;
                    return ret;  
            }
          },
          enumerable : false,
          configurable : false
        })
    })
  
    observerSetArrData( observerArr,originArr,callback,dataPath )
    return observerArr;

}
