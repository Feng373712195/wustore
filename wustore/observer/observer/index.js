import { isFunction } from "../../uilt/uilt";

const observer = ( setdata, key, newval, dataPath, cb ) => {

    if( setdata[ key ] === newval ) return;

    isFunction( cb ) && cb.apply( null, [ setdata, key, newval, dataPath ] );
};

export default observer;