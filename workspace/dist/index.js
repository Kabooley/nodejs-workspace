"use strict";
/*********************************************************
 * Find out how to handle error
 * in parallelly executed promise chain sequnces.
 *
 * 1. Promiseチェーンの一つがPromise.all()を返したら、順番通り処理されるのか
 * 2. Promise.all()で一つのプロミスがエラーを起こしたらすべて中断されのか
 * 3. Promiseチェーンの一つがPromise.all()を返すコードの修正方法の模索
 * *******************************************************/
const sequentialAsyncTasks = (tasks) => {
    let promise = Promise.resolve();
    tasks.forEach((t) => {
        // console.log(`Added: ${t}`);
        promise = promise.then(t);
    });
    return promise;
};
/*********************************************************************
 * 前提として知っておくべきこと１：
 *
 * **Promiseはthen()呼出で直ぐ実行される**
 *
 * promise.then()は定義ではなくてそのまま処理の呼び出しである。
 * なのですぐさまthen()ハンドラが実行される。
 *
 * 以下では逐次処理を変数`p`へ格納しているが
 * これはこの呼出で既に実行されている。
 *
 * つまり、
 * 逐次処理を定義するときはそれを定義するときに
 * すぐに実行してもいい内容でなくてはならないということになる。
 *
 * *******************************************************************/
// {
//   function task1(taskNumber: number) {
//     console.log(`${taskNumber}: task1`);
//     return new Promise((resolve) => {
//       setTimeout(function () {
//         resolve("Solved: task1");
//         console.log("task1 is done");
//       }, 3000);
//     });
// };
//   function task2(taskNumber: number, m: string) {
//     console.log(`${taskNumber}: task2`);
//     console.log(`${taskNumber}: task2 prev: ${m}`);
//     return new Promise((resolve) => {
//       setTimeout(function () {
//         resolve(`${taskNumber}: Solved: task2`);
//         console.log(`${taskNumber}: task2 is done`);
//       }, 3000);
//     });
//   }
//   function task3(taskNumber: number, m: string) {
//     console.log(`${taskNumber}: task3`);
//     console.log(`${taskNumber}: task3 prev: ${m}`);
//     return new Promise((resolve, reject) => {
//       setTimeout(function () {
//         resolve(`${taskNumber}: Solved: task3`);
//         console.log(`${taskNumber}: task3 is done`);
//       }, 3000);
//     });
//   }
//   function task4(taskNumber: number, m: string) {
//     console.log(`${taskNumber}: task4`);
//     console.log(`${taskNumber}: task4 prev: ${m}`);
//     return new Promise((resolve) => {
//       setTimeout(function () {
//         resolve(`${taskNumber}: Solved: task4`);
//         console.log(`${taskNumber}: task4 is done`);
//       }, 3000);
//     });
//   }
//   function task5(taskNumber: number, m: string) {
//     console.log(`${taskNumber}: task5`);
//     console.log(`${taskNumber}: task5 prev: ${m}`);
//     return new Promise((resolve) => {
//       setTimeout(function () {
//         resolve(`${taskNumber}: Solved: task5`);
//         console.log(`${taskNumber}: task5 is done`);
//       }, 3000);
//     });
//   }
//   const i = 0;
//   const p = Promise.resolve().then(() => task1(i))
//   .then((m) => task2(i, m as string))
//   .then((m) => task3(i, m as string))
//   .then((m) => task4(i, m as string))
//   .then((m) => task5(i, m as string))
//   .catch(e => {
//       console.error(`Error @sequence: ${i}`);
//       console.error(e);
//       throw e;
//   });
// }
/*********************************************************************
 * 前提として知っておくべきこと２：
 *
 * **Promise.all(...promises)のpromisesの一つでエラーが起こっても、他のpromisesはそのまま実行されて中断されることはない**
 *
 * Promise.all()は確かに中断される。
 * その意味は、
 * - Promise.all().then()は実行されずエラーが発生したときにPromise.all().catch()がすぐさま実行される
 * Promise.all()以降の処理は異常系に移動するけど、
 * Promise.all()でエラーを起こさなかった他のpromisesはそのまま最後まで走り続ける
 *
 *
 * ということでall()させているpromisesは一度走り出したら他でエラーが起こっても止まらないのである。
 *
 *
 * 例：
 *
 * Promiseチェーンからなるpromiseの配列をPromise.all()させるとする。
 * promise配列の一つがエラーを起こしても、他の配列要素であるpromiseは
 * 最後まで実行し続けることが確認できる。
 *
 * NOTE: 「前提として１」の方で触れた通り、以下のPromise.all()はあまり意味がないけどエラーの伝番を理解するためこんなコードである。
 * *******************************************************************/
{
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
                if (taskNumber === 1)
                    reject(`Error @task3 @sequence${taskNumber}`);
                else
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
    ;
    Promise.all(sequences)
        .then((r) => {
        console.log("All done.");
        console.log(r);
    })
        .catch(e => {
        console.error("Last error catcher.");
        console.error(e);
    });
    /*
      実行結果：
      ```
      ```
    */
}
// /**************************************************
//  * PromiseチェーンからなるPromise配列をPromise.all()したとき、
//  * 一部でエラーが起こったらPromise配列のすべてのPromiseは中断されるのか？
//  * 
//  * 検証：
//  * 
//  * - すべて中断されるのか
//  * - エラーの伝番はどのように行われるのか
//  * 
//  * わかったこと：
//  * 
//  * - エラーが発生したプロミスチェーンだけ中止されて他のプロミスチェーンは最後まで実行される
//  * - エラーが発生した場合上記の通りだが、Promise.all().then()のthenハンドラは実行されない
//  * - エラーが発生したらPromise.all().catch()がすぐさま実行される
//  * - 発生したエラーはそのプロミスチェーンで補足されて再スローしたらPromise.all().catch()で補足される
//  *      そのプロミスチェーンにcatch()がなくてもPromise.all().catch()があればそこで補足される
//  * 
//  * - 今回の特殊な場合（PromiseチェーンからなるPromise配列をPromise.all()したと）ではPromiseはすべて中断されるわけではないことは分かった。
//  * 
//  * 検証２：Promise.all()は途中キャンセルできるのか？
//  * 
//  * **出来ません**
//  * 参考：https://stackoverflow.com/a/30235261
//  * 
//  * しかも、しない方がいいまである。
//  * 
//  * ということで、Promise.all()しているプロミスを中止しないといかんとなったら実装を見直すべきかも。
//  * 
//  * 検証３：Promise.all()で直接実行させたい関数を呼ぶのではなくて実行信号を送信する関数を呼び出すとかしてみるといいのかしら？
//  * 
//  * 
//  * ************************************************/ 
// /*
// NOTE: 復習 Promise.all()
// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
// Promise.all()は
//   入力されたすべてのプロミスが解決されるか、
//   入力された反復可能オブジェクトにプロミスが含まれていないとき
// の2通りの時に解決される
// Promise.all()は
//   入力されたプロミスのいずれかが拒否される
//   プロミス以外のものがエラーを起こすと
// 直ちに拒否される
// そもそもPromise.all()の解決された状態とは？
// 引数として渡されたPromise配列の解決された値からなる配列を返す。
// Promise.all(promises).then()であれば処理がthenに移る
// 拒否された状態とは？
// Promise.all().then()は実行されず、Promise.all().catch()が実行される。
// */ 
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
//     };
//     /***
//      * Promise.all()するまでもなくPromise.all()へ渡すsequencesは既に実行されている
//      * 多分promise.then()でpromiseチェーンを生成するから
//      * 
//      * 
//      * */ 
//     // Promise.all(sequences)
//     // .then((r) => {
//     //     console.log("All done.");
//     //     console.log(r);})
//     // .catch(e => {
//     //     console.error("Last error catcher.");
//     //     console.error(e);
//     // });
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
// };
