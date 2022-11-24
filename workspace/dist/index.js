"use strict";
/*********************************************************
 * Find out how to handle error
 * in parallelly executed promise chain sequnces.
 *
 * *******************************************************/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const sequentialAsyncTasks = (tasks) => {
    let promise = Promise.resolve();
    tasks.forEach((t) => {
        // console.log(`Added: ${t}`);
        promise = promise.then(t);
    });
    return promise;
};
/***********************************************************
 * 検証：
 * - Promiseチェーンのエラーハンドリングの挙動確認
 * - PromiseチェーンのthenハンドラがPromise.all()を返しても大丈夫かの確認
 *
 * わかったこと：
 * - PromiseチェーンでPromise.all(...PROMISES)を返すとPROMISESがすぐに実行されてPromiseチェーンは順番通り実行にならない
 *
 *      たぶんだけど、PromiseチェーンのなかのthenでPromise.all()を返すのは入れ子という扱いなんだと思う。
 *      Promise.all()を返すthenハンドラはPromise.all()を返すのではなくてresolve()を返すようにすれば解決するかも...
 *      （https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises#%E5%85%A5%E3%82%8C%E5%AD%90）
 *
 * - PromiseチェーンがPromise.all(...PROMISES)を返すとき、PROMISESでエラーが発生すると最終的にunhandledPromiseRejectionになる
 *
 *      Promise.all().catch()では補足されるのだけれどPromiseチェーンで補足されない。
 *      上の話の通りだからかも。
 *
 * 検証２：
 * Promise.all()を返すthen()ハンドラをPromiseでラップする。
 * 修正版の関数に変更。
 * *********************************************************/
{
    // Definition of async functions
    function seq1() {
        console.log("seq1");
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("Solved: seq1");
                console.log("seq1 is done");
            }, 3000);
        });
    }
    ;
    function seq2(m) {
        console.log("seq2");
        console.log(`seq2 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("Solved: seq2");
                console.log("seq2 is done");
            }, 3000);
        });
    }
    function seq3(m) {
        console.log("seq3");
        console.log(`seq3 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("Solved: seq3");
                console.log("seq3 is done");
            }, 3000);
        });
    }
    ;
    function seq4(m) {
        console.log("seq4");
        console.log(`seq4 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("Solved: seq4");
                console.log("seq4 is done");
            }, 3000);
        });
    }
    // Definition of tasks
    function task1(taskNumber) {
        console.log(`${taskNumber}: task1`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(`${taskNumber}: Solved: task1`);
                console.log(`${taskNumber}: task1 is done`);
            }, 3000);
        });
    }
    ;
    function task2(taskNumber, m) {
        console.log(`${taskNumber}: task2`);
        console.log(`${taskNumber}: task2 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(`${taskNumber}: Solved: task2`);
                console.log(`${taskNumber}: task2 is done`);
            }, 3000);
        });
    }
    function task3(taskNumber, m) {
        console.log(`${taskNumber}: task3`);
        console.log(`${taskNumber}: task3 prev: ${m}`);
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                // Errorをわざと起こす
                // if(taskNumber === 1) reject(`Error @task3 @sequence${taskNumber}`);
                // else resolve(`${taskNumber}: Solved: task3`);
                resolve(`${taskNumber}: Solved: task3`);
                console.log(`${taskNumber}: task3 is done`);
            }, 3000);
        });
    }
    function task4(taskNumber, m) {
        console.log(`${taskNumber}: task4`);
        console.log(`${taskNumber}: task4 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(`${taskNumber}: Solved: task4`);
                console.log(`${taskNumber}: task4 is done`);
            }, 3000);
        });
    }
    function task5(taskNumber, m) {
        console.log(`${taskNumber}: task5`);
        console.log(`${taskNumber}: task5 prev: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve(`${taskNumber}: Solved: task5`);
                console.log(`${taskNumber}: task5 is done`);
            }, 3000);
        });
    }
    // Generate parallel sequences.
    const sequences = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
    for (let i = 0; i < sequences.length; i++) {
        sequences[i] = sequences[i]
            .then(() => task1(i))
            .then((m) => task2(i, m))
            .then((m) => task3(i, m))
            .then((m) => task4(i, m))
            .then((m) => task5(i, m))
            .catch(e => {
            console.error(`Error @sequence: ${i}`);
            console.error(e);
            throw e;
        });
    }
    let tasks = [];
    tasks.push(seq1);
    tasks.push(seq2);
    tasks.push(seq3);
    // tasks.push(() => {
    //     console.log("Start parallel seuqnces");
    //     return Promise.all(sequences)
    //     .catch(e => {
    //         console.error("Error caught at Promise.all()");
    //         console.error(e);
    //     })
    // });
    // 
    // NOTE: 修正版
    tasks.push(() => {
        return new Promise((resolve, reject) => {
            console.log("Start parallel sequences.");
            Promise.all(sequences)
                .then((r) => resolve(r))
                .catch(e => reject(e));
        });
    });
    tasks.push(seq4);
    (function () {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("START");
            const result = yield sequentialAsyncTasks(tasks).catch(e => {
                console.error("This is finall error handler.");
                console.error(e);
            });
            console.log("ALL DONE");
            console.log(result);
        });
    })();
    /*
    実行結果：

    逐次処理で順番に実行するからseq1, seq2, seq3, 並列処理, seq4の順番になるはずだけど
    なぜか並列処理がしょっぱなで実行されている。

    つまり

    ```
        START
        0: task1
        1: task1
        2: task1
        seq1
        0: task1 is done
        0: task2
        0: task2 prev: 0: Solved: task1
        1: task1 is done
        1: task2
        1: task2 prev: 1: Solved: task1
        2: task1 is done
        2: task2
        2: task2 prev: 2: Solved: task1
        seq1 is done
        seq2
        seq2 prev: Solved: seq1
        0: task2 is done
        0: task3
        0: task3 prev: 0: Solved: task2
        1: task2 is done
        1: task3
        1: task3 prev: 1: Solved: task2
        2: task2 is done
        2: task3
        2: task3 prev: 2: Solved: task2
        seq2 is done
        seq3
        seq3 prev: Solved: seq2
        0: task3 is done
        0: task4
        0: task4 prev: 0: Solved: task3
        1: task3 is done
        1: task4
        1: task4 prev: 1: Solved: task3
        2: task3 is done
        2: task4
        2: task4 prev: 2: Solved: task3
        seq3 is done
        Start parallel seuqnces
        0: task4 is done
        0: task5
        0: task5 prev: 0: Solved: task4
        1: task4 is done
        1: task5
        1: task5 prev: 1: Solved: task4
        2: task4 is done
        2: task5
        2: task5 prev: 2: Solved: task4
        0: task5 is done
        1: task5 is done
        2: task5 is done
        seq4
        seq4 prev: 0: Solved: task5,1: Solved: task5,2: Solved: task5
        seq4 is done
        ALL DONE
        Solved: seq4
    ```
    */
}
/**************************************************
 * 検証：
 * 逐次処理であるPromiseチェーン3つを並列処理したときにエラーが起こった時の挙動の確認
 *
 * - すべて中断されるのか
 * - エラーの伝番はどのように行われるのか
 *
 * わかったこと：
 *
 * - エラーが発生したプロミスチェーンだけ中止されて他のプロミスチェーンは最後まで実行される
 * - エラーが発生した場合上記の通りだが、Promise.all().then()のthenハンドラは実行されない
 * - 発生したエラーはそのプロミスチェーンで補足されて再スローしたらPromise.all().catch()で補足される
 *      そのプロミスチェーンにcatch()がなくてもPromise.all().catch()があればそこで補足される
 *
 * ************************************************/
// {
//     function task1(taskNumber: number) {
//         console.log(`${taskNumber}: task1`);
//         return new Promise((resolve) => {
//           setTimeout(function () {
//             resolve("Solved: task1");
//             console.log("task1 is done");
//           }, 3000);
//         });
//     };
//       function task2(taskNumber: number, m: string) {
//         console.log(`${taskNumber}: task2`);
//         console.log(`${taskNumber}: task2 prev: ${m}`);
//         return new Promise((resolve) => {
//           setTimeout(function () {
//             resolve(`${taskNumber}: Solved: task2`);
//             console.log(`${taskNumber}: task2 is done`);
//           }, 3000);
//         });
//       }
//       function task3(taskNumber: number, m: string) {
//         console.log(`${taskNumber}: task3`);
//         console.log(`${taskNumber}: task3 prev: ${m}`);
//         return new Promise((resolve, reject) => {
//           setTimeout(function () {
//             // Errorをわざと起こす
//             if(taskNumber === 1) reject(`Error @task3 @sequence${taskNumber}`);
//             else resolve(`${taskNumber}: Solved: task3`);
//             console.log(`${taskNumber}: task3 is done`);
//           }, 3000);
//         });
//       }
//       function task4(taskNumber: number, m: string) {
//         console.log(`${taskNumber}: task4`);
//         console.log(`${taskNumber}: task4 prev: ${m}`);
//         return new Promise((resolve) => {
//           setTimeout(function () {
//             resolve(`${taskNumber}: Solved: task4`);
//             console.log(`${taskNumber}: task4 is done`);
//           }, 3000);
//         });
//       }
//       function task5(taskNumber: number, m: string) {
//         console.log(`${taskNumber}: task5`);
//         console.log(`${taskNumber}: task5 prev: ${m}`);
//         return new Promise((resolve) => {
//           setTimeout(function () {
//             resolve(`${taskNumber}: Solved: task5`);
//             console.log(`${taskNumber}: task5 is done`);
//           }, 3000);
//         });
//       }
//     const sequences: Promise<any>[] = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
//     for(let i = 0; i < sequences.length; i++) {
//         sequences[i] = sequences[i]
//         .then(() => task1(i))
//         .then((m) => task2(i, m as string))
//         .then((m) => task3(i, m as string))
//         .then((m) => task4(i, m as string))
//         .then((m) => task5(i, m as string))
//         .catch(e => {
//             console.error(`Error @sequence: ${i}`);
//             console.error(e);
//             throw e;
//         });
//     }
//     Promise.all(sequences)
//     .then((r) => {
//         console.log("All done.");
//         console.log(r);})
//     .catch(e => {
//         console.error("Last error catcher.");
//         console.error(e);
//     });
//     // 結果：
//     // エラーが起こったプロミスチェーンだけ中断して、ほかのプロミスチェーンは最後まで実行された
//     /* 結果：
//         エラーが起こったプロミスチェーンだけ中断して、ほかのプロミスチェーンは最後まで実行された
//         Promise.all().then()のthenハンドラは実行されなかった
//         エラーはそれが起こったプロミスチェーン上のcatch() --> 再スローでPromise.all().catch()で補足された。
//         つまりPromise.all()で一部でエラーが起きてもPromise.all()は中断されなかった。
//         ```
//         $ node ./dist/index.js
//         0: task1
//         1: task1
//         2: task1
//         task1 is done
//         0: task2
//         0: task2 prev: Solved: task1
//         task1 is done
//         1: task2
//         1: task2 prev: Solved: task1
//         task1 is done
//         2: task2
//         2: task2 prev: Solved: task1
//         0: task2 is done
//         0: task3
//         0: task3 prev: 0: Solved: task2
//         1: task2 is done
//         1: task3
//         1: task3 prev: 1: Solved: task2
//         2: task2 is done
//         2: task3
//         2: task3 prev: 2: Solved: task2
//         0: task3 is done
//         0: task4
//         0: task4 prev: 0: Solved: task3
//         1: task3 is done
//         Error @sequence: 1
//         Error @task3 @sequence1
//         Last error catcher.
//         Error @task3 @sequence1
//         2: task3 is done
//         2: task4
//         2: task4 prev: 2: Solved: task3
//         0: task4 is done
//         2: task4 is done
//         ```
//         ということはreject()を実行するだけではいけないということか？
//     */ 
// }
