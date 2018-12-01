const _toString = Object.prototype.toString;

const isArray = obj => ([].isArray && [].isArray(obj)) || toString.call(obj) === '[object Array]'
const isObject = (val) => typeof val === 'object' && toString.call(val) === '[object Object]';
const isFunction = (fun) => typeof fun === 'function' && toString.call(fun) === '[object Function]';

// 深拷贝
const deep = data => {
  let o;
  if (isArray(data)) {
    o = [];
    data.forEach((val, index) => {
      if (isArray(val) || isObject(val)) o[index] = deep(val);
      else { o[index] = val };
    })
  }
  if (isObject(data)) {
    o = {};
    for (var x in data) {
      if (isArray(data[x]) || isObject(data[x])) o[x] = deep(data[x]);
      else { o[x] = data[x] };
    }
  }
  return o;
}

// 获取数组相同项
function searchRepeat(arr1,arr2){
  const res = [];
  if( isArray(arr1) && isArray(arr2) ){
      arr1.forEach( item => arr2.indexOf( item ) != -1 && res.push( item ) )
  }
  return res;
}

function arrDiff(arr1,arr2){
  const res = [];
  if( isArray(arr1) && isArray(arr2) ){
      arr2.forEach( item => arr1.indexOf(item) ==-1 && res.push(item) )
  }
  return res
}

// 扁平化对象
const flatObject = (flatobj) => {
  const obj = {};
  Object.keys(flatobj).forEach( key => Object.assign(obj,flatobj[key]) )
  return obj;
}

module.exports = {
  isArray,
  isObject,
  isFunction,
  deep,
  searchRepeat,
  arrDiff,
  flatObject
}
