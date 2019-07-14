import observer from "../observer/index";
import { isArray, isObject } from "../../uilt/uilt";
import * as createObserverArr  from "../createObserverArr/index";
import * as createObserver from "../createObserver/index";

export const observerSetArrIndex = ( observerArr, originArr, callback, dataPath, i ) => {
   
    Object.defineProperty( observerArr, i, {
        get() {
            if( isArray( originArr[ i ] ) ) { 
                return originArr[ i ].getObserverArray ? 
                    originArr[ i ].getObserverArray : 
                    createObserver.createObserArr( originArr, i, callback, `${dataPath}[${i}]` );
            }
            if( isObject( originArr[ i ] ) ) { 
                return originArr[ i ].getObserverObject ? 
                    originArr[ i ].getObserverObject : 
                    createObserver.createObserver( Object.create( {} ), originArr[ i ], callback, `${dataPath}[${i}]` );
            }
            return originArr[ i ];
        },
        set( newValue ) {   
            if( !createObserverArr.arrfun.is ) {
                const valPath = `${ dataPath }[${ i }]`;
                observer( originArr, i, newValue, valPath, callback );  
            }
        }
    } );
    
};

export const observerSetArrData = ( observerArr, originArr, callback, dataPath ) => { 
    observerArr.forEach( ( v, i ) => {
        observerSetArrIndex( observerArr, originArr, callback, dataPath, i );
    } );
};