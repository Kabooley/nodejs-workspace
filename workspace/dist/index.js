"use strict";
/************************************************************
 *
 * Implememt Command Interpreter
 * **********************************************************/
// {
//   const async1 = () => {
//     console.log("async1: invoked");
//     return setTimeout(function() {
//         console.log("async1: wait 5 sec.");
//     }, 5000);
//   };
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// //   const async2 = () => {
// //     console.log("async2: invoked");
// //     setTimeout(function() {
// //         console.log("async2: wait 8 sec.");
// //         return Promise.resolve();
// //     }, 8000);
// //   };
//   // const async2 = (): Promise<void> => {
//   //   console.log("async2: invoked");
//   //   return new Promise((resolve, reject) => {
//   //       setTimeout(function() {
//   //           console.log("async2: wait for 8 sec.");
//   //           return resolve();
//   //       }, 8000);
//   //   });
//   // }
//   const temporary = (): Promise<void> => {
//     return new Promise((resolve, reject) => {
//       setTimeout(function() {
//         console.log("wait for 7 sec.");
//         return resolve();
//       }, 7000);
//     })
//   };
//   const async2 = async (): Promise<void> => {
//     console.log("async2: invoked.");
//     for(let i = 1; i < 40000; i++) {
//       // console.log(i);
//     };
//     await temporary();
//     console.log("async2: done.");
//   }
//   const sync1 = () => {
//     console.log("sync1: invoked.");
//     // // 
//     // // blocking: 2万ループするまで次に行かなくなるのか検証
//     // // 
//     // for(let i = 0; i < 20000; i++) {
//     //     console.log(i);
//     //   }
//   };
//   const async3 = () => {
//     console.log("async3 invoked.");
//     return setTimeout(function() {
//         console.log("async3: wait for 12 sec");
//     }, 12000);
//   };
// let promise = Promise.resolve();
// [async1, async2, sync1, async3].forEach(f => {
//     promise = promise.then(() => f());
// });
// promise.then(() => {
//     console.log("done");
// });
// }
/*******************************************
 * 同期関数と非同期関数の処理順序を
 * 場合別に実験することで
 * 処理のされ方の違いを理解する
 *
 *
 * *****************************************/
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function#%E9%9D%9E%E5%90%8C%E6%9C%9F%E9%96%A2%E6%95%B0%E3%81%A8%E5%AE%9F%E8%A1%8C%E9%A0%86
{
    function resolveAfter2Seconds() {
        console.log("starting slow promise");
        return new Promise(resolve => {
            setTimeout(function () {
                resolve("slow");
                console.log("slow promise is done");
            }, 2000);
        });
    }
    function resolveAfter1Second() {
        console.log("starting fast promise");
        return new Promise(resolve => {
            setTimeout(function () {
                resolve("fast");
                console.log("fast promise is done");
            }, 1000);
        });
    }
    function sequentialStart() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('==SEQUENTIAL START==');
            // 1. これは即時実行される
            const slow = yield resolveAfter2Seconds();
            console.log(slow); // 2. これは 1. の 2 秒後に実行される
            const fast = yield resolveAfter1Second();
            console.log(fast); // 3. これは 1. の 3 秒後に実行される
        });
    }
    function concurrentStart() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('==CONCURRENT START with await==');
            const slow = resolveAfter2Seconds(); // ただちにタイマーを起動
            const fast = resolveAfter1Second(); // ただちにタイマーを起動
            for (let i = 1; i < 30000; i++) { }
            ;
            console.log("loop done");
            // 1. これは即時実行される
            console.log(yield slow); // 2. これは 1. の 2 秒後に実行される
            console.log(yield fast); // 3. fast はすでに解決しているので、これは 1. の 2 秒後 (2.の直後) に実行される
        });
    }
    function concurrentPromise() {
        console.log('==CONCURRENT START with Promise.all==');
        return Promise.all([resolveAfter2Seconds(), resolveAfter1Second()]).then((messages) => {
            console.log(messages[0]); // slow
            console.log(messages[1]); // fast
        });
    }
    function parallel() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('==PARALLEL with await Promise.all==');
            // 2 つの jobs を並列に実行し両方が完了するのを待つ
            yield Promise.all([
                (() => __awaiter(this, void 0, void 0, function* () { return console.log(yield resolveAfter2Seconds()); }))(),
                (() => __awaiter(this, void 0, void 0, function* () { return console.log(yield resolveAfter1Second()); }))()
            ]);
        });
    }
    sequentialStart(); // 2 秒後に "slow" をログ出力し、その 1 秒後に "fast" をログ出力する
    // 直前の処理を待つ
    setTimeout(concurrentStart, 4000); // 2 秒後に "slow" と "fast" をログ出力する
    // 直前の処理を待つ
    setTimeout(concurrentPromise, 7000); // concurrentStart と同様
    // 直前の処理を待つ
    setTimeout(parallel, 10000); // 本当に並列処理となるため 1 秒後に "fast" とログ出力し、その 1 秒後に "slow" とログ出力する
}
