import  { isObject,isArray,isFunction } from '../../uilt/uilt' 
import isSetData from '../../manage/is-set-data/index'

const observer = (setdata,key,newval,dataPath,cb) => {
    
    // console.log( 'observer' )
    // console.log( setdata )
    // console.log( setdata[key],'old' )
    // console.log( newval,'newval' )
    
    // console.log( setdata[key] === newval,'setdata[key] === newval',setdata[key],'setdata[key]',newval,'newval' ) 
    if( setdata[key] === newval ) return 
    
    isFunction(cb) && cb.apply(null,[setdata,key,newval,dataPath]);
}

export default observer