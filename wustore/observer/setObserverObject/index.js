/** 设置源对象 
 * @param origin {Object} 源对象
 * @param data {Object} 要设置的对象
 * @returns data
*/
const setObserverObject = (data,origin) => {

    Object.defineProperty(origin,'getObserverObject',{
        get:function(v){
            return data
        },
        enumerable : false,
        configurable : true
    });

    return data;
}

export default setObserverObject