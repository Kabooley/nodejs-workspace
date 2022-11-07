/************************************************
 * 
 * 
 * **********************************************/ 
import * as utilities from 'util';
/****
 * arguments: 関数に渡された引数の値を含む配列風オブジェクト
 * 
 * */ 
  // usage:
//   let loadScriptPromise = promisify(loadScript);     // loadScriptPromiseはPromiseを返す関数である
// loadScriptをラップした関数で、関数は実行されていない
// loadScriptPromise()でPromiseを返す、このときloadScriptへ渡す引数をとる
//   loadScriptPromise(...).then(...);

// TODO: 調査：f.call(null, ...args)の...argsがわからん
export function promisify(f: (a?: any) => any) {
    return function (...args: any[]) {
      return new Promise((resolve, reject) => {
        function callback(err: Error, result: any) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
        args.push(callback);
        f.call(null, ...args); // call the original function
      });
    };
  };   

// then()の型:
//  then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;

/*
then()はその引数に成功したときの関数と失敗したときの関数をとる
Promise.resolve().then(
    onFulfilledFunction | IdentityFunction,
    onRejectedFunction | ThrowerFunction
);

いずれの引数もオプショナルである



*/ 