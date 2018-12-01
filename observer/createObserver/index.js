import observer from '../observer/index'
import { deep,isArray,isObject } from '../../uilt/uilt'
import setObserverObject from '../setObserverObject/index'
import setObserverArray from '../setObserverArray/index'

import getSourceObject from '../setSourceObject/index'
import getSourceArray from '../setSourceArray/index'

import { createObserverArr } from '../createObserverArr/index'

export const createObserArr = (orginal,x,callback,dataPath) => {
    // const arr = deep( orginal[x] )
    const arr  = setObserverArray( deep( orginal[x] ) ,  orginal[x] )
    getSourceArray( arr , orginal[x], )
    orginal[x].forEach((item,index) => { 
        if(isObject(item)) arr.splice( index,1, createObserver( Object.create({}),item,callback,`${ dataPath }[${ index }]` ) )
        if(isArray(item))  arr.splice( index,1, createObserArr( orginal[x],index,callback,`${ dataPath }[${ index }]` ) )
    })
    return createObserverArr( orginal,x,arr,orginal[x],callback,dataPath )
}

export function craeteObserverProp( observerdata, orginal , callback, dataPath , x ){

    let observerObj;
    if( isObject(orginal[x]) ){
        observerObj = createObserver( Object.create({}),orginal[x],callback, dataPath ? `${ dataPath }.${ x }` : x )
    }
    
    let observerArr;
    if( isArray(orginal[x]) ){
        observerArr = createObserArr(orginal,x,callback,dataPath ? `${ dataPath }.${ x }` : x )
    }

    Object.defineProperty(observerdata,x,{ 
        get(){
            if( isArray(orginal[x]) ){
                // 当重新赋值为数组 把数组进行数据拦截
                // return observerArr ? observerArr : createObserArr(orginal,x,callback, dataPath ? `${ dataPath }.${ x }` : `${x}` )
                return orginal[x].getObserverArray ? orginal[x].getObserverArray : createObserArr(orginal,x,callback, dataPath ? `${ dataPath }.${ x }` : `${x}` )
            }
            if( isObject(orginal[x]) ){
                // console.log( orginal[x],'===---orginal[x]---===', orginal[x].getObserverObject ,'orginal[x].getObserverObject' )
                // console.log( orginal[x],'===---orginal[x]---===', orginal[x].getSourceObject ,'orginal[x].getSourceObject' )
                // 当重新赋值为数组 把数组进行数据拦截
                // return observerObj ? observerObj : createObserver( Object.create({}),orginal[x],callback, dataPath ? `${ dataPath }.${ x }` : `${x}` )
                return orginal[x].getObserverObject ? orginal[x].getObserverObject : createObserver( Object.create({}),orginal[x],callback, dataPath ? `${ dataPath }.${ x }` : `${x}` )
            }
            return orginal[x];
        },
        set(newVal){
            const ValPath = dataPath ? `${ dataPath }.${ x }` : `${x}`;
            observer(orginal,x,newVal,ValPath,callback);          
        },
        enumerable : true,
        configurable : true
    })

 }

export const createObserver = ( observerdata,orginal,callback,dataPath ) => {
    
    dataPath = dataPath || '' ;    
    
    observerdata = setObserverObject( observerdata , orginal )
    getSourceObject( observerdata,orginal )
    for(let x in orginal){
        craeteObserverProp( observerdata, orginal , callback, dataPath , x )
    }
    return observerdata
    
}