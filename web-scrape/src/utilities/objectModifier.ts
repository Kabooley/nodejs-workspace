/************************************************************
 * Utilities for modifying Objects.
 * 
 * **********************************************************/ 

interface iReplacableKeyObject {
    [key: string]: any
};

/****
 * `keys`配列の末尾のプロパティをオブジェクト`o`のなかから発見したら、そのプロパティを返す。
 * 見つからなかった場合undefinedを返す。
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