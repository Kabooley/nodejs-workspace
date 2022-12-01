/***
 * Filters that return only the values that match the necessity keys.
 * 
 * @param {T} target - Target object to be fitlered.
 * @param {(keyof T)[]} necessity - Property names which going to retrieve from target.
 * @return {{[Property in keyof T]?: T[Property]}} - Filtered object concist of properties which matched with nessecity.
 * If no properties are matched, return empty object.
 * */   
export const filterOnlyMatchedKey = <T>(
    target: T,
    necessity: (keyof T)[]
    ): {[Property in keyof T]?: T[Property]} => {
    let filtered = {} as {[Property in keyof T]?: T[Property]};
    necessity.forEach((key: (keyof T)) => {
        if(target[key] !== undefined) filtered[key] = target[key];
            // 上記の方法ではなく下の方法だと次のような謎のオブジェクトが吐き出される 
            // filtered = {...filtered, ...(target[key] as {[Property in keyof T]?: T[Property]})};
            // { 0: "E", 1: "d"}
    });
    return filtered;
};

// --- USAGE ---
// 
// interface iCollectOptions {
//     keyword: string;
//     tags?: string[];
//     bookmarkOver?: number;
//     userName?: string;
// };
// 
// const opt: iCollectOptions = {
//     keyword: "COWBOYBEBOP",
//     tags: ["cool", "awesome"],
//     userName: "Ed",
//     bookmarkOver: 1000
// };
// 
// const validOptions: (keyof iCollectOptions)[] = ["bookmarkOver", "userName"];
// 
// console.log(filterOnlyMatchedKey<iCollectOptions>(opt, validOptions));
  
