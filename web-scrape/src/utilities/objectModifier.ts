/************************************************************
 * Utilities for modifying Objects.
 * 
 * **********************************************************/ 

interface iReplacableKeyObject {
    [key: string]: any
};

/****
 * T
 * 
 * */ 
export const retrieveDeepProp = <T>(keys: string[], o: object): T => {
    return keys.reduce((previousValue: iReplacableKeyObject, currentValue: string) => {
      return (previousValue !== undefined && previousValue.hasOwnProperty(currentValue)) ? previousValue[currentValue] : undefined
    }, o) as T;
  };


  
/****
 * 
 * 
 * */  
export const hasProperties = < T extends object>(obj: T, keys: (keyof T)[]): boolean => {
    let result: boolean = true;
    keys.forEach((key: keyof T) => {
        result = result && obj.hasOwnProperty(key);
    });
    return result;
 };
 
 
/***
 * ジェネリック型のオブジェクト`obj`から、keysのプロパティからなるオブジェクトを生成する。
 * プロパティを取り出すわけではないことに注意。
 * 
 * @type {T extends object} - オブジェクトだけを受け付けるのでジェネリックで指定できるT型はオブジェクトでなくてはならない
 * @param {T} obj
 * @param {(keyof T)[]} keys - key string of T type object that about to retrieve.
 * 
 * NOTE: そのプロパティが存在することを前提としている
 * */  
export const takeOutPropertiesFrom = < T extends object>(obj: T, keys: (keyof T)[]): T => {
    let o: T = <T>{};
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };


 // /***
//  * DEPRICATED: retrieveDeepProp()に取って代わった。
//  * 
//  * 
//  * Retrieves nested property.
//  * Passed keys element in keys array must be ordered same as property nested in the object.
//  * 
//  * If specified key does not exist in object, then returns undefined.
//  * 
//  * objの中から、keys配列のプロパティに順番にアクセス可能で、
//  * 一番最後の要素に一致するプロパティを返す。
//  * アクセスできなかったらundefinedを返す。
//  * keys配列はobjのプロパティのネスト
//  * */ 
//  const retrieveDeepProp = <T extends object>(obj: T, keys: string[]): any | undefined => {
//     let o: iReplacableKeyObject | undefined = obj;
//     keys.forEach(key => {
//       if(o !== undefined && o.hasOwnProperty(key)){
//         o = o[key];
//       }
//       else{ o = undefined;}
//     });
//     return o;
// };

