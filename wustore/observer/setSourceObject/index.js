/** 设置源对象 
 * @param origin {Object} 源对象
 * @param data {Object} 要设置的对象
 * @returns data
*/
const setSourceObject = (data,origin) => {

    Object.defineProperty(data,'getSourceObject',{
        get:function(v){
            return origin
        },
        enumerable : false,
        configurable : true
    });

    return origin;
}

export default setSourceObject