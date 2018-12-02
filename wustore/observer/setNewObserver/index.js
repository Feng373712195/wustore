import { isObject,isArray } from '../../uilt/uilt'
import { observerSetArrIndex } from '../observerSetArrData/index'
import { craeteObserverProp } from '../createObserver/index'

export function setNewObserver( observerdata,orginal,callback,dataPath,key ){
    if( isObject(orginal) ) craeteObserverProp( observerdata,orginal,callback,dataPath,key )
    else if( isArray(orginal) ) observerSetArrIndex( observerdata,orginal,callback,dataPath,key )
    else console.error(`set obsever error for ${dataPath}`)
}