/*********************************************************
 * 逐次処理と並列処理とPromiseの実験
 * *******************************************************/

// 逐次処理させたい関数の型
type iSequentialAsyncTask = ((a?: any) => any) | ((a?: any) => Promise<any>);

// 逐次処理生成関数。then()ハンドラは引数をとることができる。
const sequentialAsyncTasks = (
tasks: iSequentialAsyncTask[]
) => {
let promise = Promise.resolve();
tasks.forEach((t) => {
    // console.log(`Added: ${t}`);
    promise = promise.then(t);
});
return promise;
};

/*********************************************************************
 * 実験その１：
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


// /*********************************************************************
//  * 実験その２：
//  * 
//  * **Promise.all(...promises)のpromisesの一つでエラーが起こっても、他のpromisesはそのまま実行されて中断されることはない**
//  * 
//  * Promise.all()は確かに中断される。
//  * 
//  * その意味は、
//  * - エラーが発生したときにPromise.all().catch()がすぐさま実行されるが、Promise.all().then()は実行されない
//  * という意味。
//  * 
//  * Promise.all()以降の処理は異常系に移動するけど、
//  * Promise.all()でエラーを起こさなかった他のpromisesはそのまま最後まで走り続ける
//  * 
//  * 
//  * ということでall()させているpromisesは一度走り出したら他でエラーが起こっても、
//  * 自身でエラーでも発生しない限り止まらないのである。
//  * 
//  * 
//  * 例：
//  * 
//  * Promiseチェーンからなるpromiseの配列をPromise.all()させるとする。
//  * promise配列の一つがエラーを起こしても、他の配列要素であるpromiseは
//  * 最後まで実行し続けることが確認できる。
//  * 
//  * NOTE: 「実験その１」の方で触れた通り、以下のPromise.all()はあまり意味がないけどエラーの伝番を理解するためこんなコードである。
//  * 
//  * 
//  * Promiseはキャンセル可能なのか？:
//  * 
//  * できない。
//  * 
//  * Stackoverflowによるとキャンセルはできないという投稿の指示が高い。
//  * 参考：https://stackoverflow.com/a/30235261
//  * 
//  * しない方がいいまである。
//  * *******************************************************************/ 
// {
//     function task1(taskNumber: number) {
//       console.log(`${taskNumber}: task1`);
//       return new Promise((resolve) => {
//         setTimeout(function () {
//           resolve(`${taskNumber}: Solved: task1`);
//           console.log(`${taskNumber}: task1 is done`);
//         }, 3000);
//       });
//   };
    
//     function task2(taskNumber: number, m: string) {
//       console.log(`${taskNumber}: task2`);
//       console.log(`${taskNumber}: task2 prev: ${m}`);
//       return new Promise((resolve) => {
//         setTimeout(function () {
//           resolve(`${taskNumber}: Solved: task2`);
//           console.log(`${taskNumber}: task2 is done`);
//         }, 3000);
//       });
//     }
    

//     function task3(taskNumber: number, m: string) {
//       console.log(`${taskNumber}: task3`);
//       console.log(`${taskNumber}: task3 prev: ${m}`);
//       return new Promise((resolve, reject) => {
//         setTimeout(function () {
//           // Errorをわざと起こす
//           if(taskNumber === 1) reject(`Error @task3 @sequence${taskNumber}`);
//           else resolve(`${taskNumber}: Solved: task3`);
//           console.log(`${taskNumber}: task3 is done`);
//         }, 3000);
//       });
//     }
    

//     function task4(taskNumber: number, m: string) {
//       console.log(`${taskNumber}: task4`);
//       console.log(`${taskNumber}: task4 prev: ${m}`);
//       return new Promise((resolve) => {
//         setTimeout(function () {
//           resolve(`${taskNumber}: Solved: task4`);
//           console.log(`${taskNumber}: task4 is done`);
//         }, 3000);
//       });
//     }

//     function task5(taskNumber: number, m: string) {
//       console.log(`${taskNumber}: task5`);
//       console.log(`${taskNumber}: task5 prev: ${m}`);
//       return new Promise((resolve) => {
//         setTimeout(function () {
//           resolve(`${taskNumber}: Solved: task5`);
//           console.log(`${taskNumber}: task5 is done`);
//         }, 3000);
//       });
//     }


//   const sequences: Promise<any>[] = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
//   for(let i = 0; i < sequences.length; i++) {
//       sequences[i] = sequences[i]
//       .then(() => task1(i))
//       .then((m) => task2(i, m as string))
//       .then((m) => task3(i, m as string))
//       .then((m) => task4(i, m as string))
//       .then((m) => task5(i, m as string))
//       .catch(e => {
//           console.error(`Error @sequence: ${i}`);
//           console.error(e);
//           throw e;
//       });
//   };

//   Promise.all(sequences)
//   .then((r) => {
//       console.log("All done.");
//       console.log(r);})
//   .catch(e => {
//       console.error("Last error catcher.");
//       console.error(e);
//   });
//   /*
//     実行結果：
//     ```
//     0: task1
//     1: task1
//     2: task1
//     0: task1 is done
//     0: task2
//     0: task2 prev: 0: Solved: task1
//     1: task1 is done
//     1: task2
//     1: task2 prev: 1: Solved: task1
//     2: task1 is done
//     2: task2
//     2: task2 prev: 2: Solved: task1
//     0: task2 is done
//     0: task3
//     0: task3 prev: 0: Solved: task2
//     1: task2 is done
//     1: task3
//     1: task3 prev: 1: Solved: task2
//     2: task2 is done
//     2: task3
//     2: task3 prev: 2: Solved: task2
//     0: task3 is done
//     0: task4
//     0: task4 prev: 0: Solved: task3
//     1: task3 is done
//     Error @sequence: 1
//     Error @task3 @sequence1
//     Last error catcher.
//     Error @task3 @sequence1
//     2: task3 is done
//     2: task4
//     2: task4 prev: 2: Solved: task3
//     0: task4 is done
//     0: task5
//     0: task5 prev: 0: Solved: task4
//     2: task4 is done
//     2: task5
//     2: task5 prev: 2: Solved: task4
//     0: task5 is done
//     2: task5 is done
//     ```

//     わかったこと：

//     sequence[1]で発生したエラーがsequences[1]のcatch()から再スローされて、
//     Promise.all().catch()まで伝番している。

//     Pormise.all()は内部でエラーが発生したのでPromise.all().then()は実行されない。

//     他のsequencesは最後まで実行されていることがわかる。
//   */ 
// }

/*********************************************************************
 * 実験その３：
 * 逐次処理のタスクの一つが並列処理を呼出したらどうなるか？
 * 
 * ここまでの話より：
 * - 逐次処理はその生成段階ですでに走り出す
 * - Promise.all()の一部でエラーが発生しても他のpromiseは中断されない
 * 
 * `generateParallelProc()`という関数で並列処理の生成をラッピングした。
 * 
 * 並列処理の生成を関数でラップして、
 * その関数を呼び出すことでその場で並列処理を生成するようにすれば
 * 配列`seqs`の順番通りに並列処理を実行させることができた。
 * 
 * 
 * 実験その４：
 * この状態で並列処理でエラーが起こったらどうなるのか？
 * 
 * 並列処理番号1番(seuqnces[1])のtask3でエラーが発生する。
 * sequences[1]のcatch()でエラー補足、
 * sequentialAsyncTasks.catch()でエラー補足
 * でエラーはちゃんと伝番できている。
 * 
 * ただし、先の実験の通り、並列処理のエラーを起こさなかったPromiseは最後まで走り続け中断されることはない。
 * sequentialAsyncTasks()の処理はエラーが起こった段階でcatch()へ処理が移行するのでそこで中断される。
 * 
 * 並列処理を呼び出すthen()ハンドラは次のどちらの呼び出しでも同じエラーハンドリングになる。
 * ```
 * () => {
      console.log("START: Parallel Process.");
      return Promise.all(generateParallelProc())
      // NOTE: この呼出方法も同じ結果になるのでアリ。
      // return Promise.all(generateParallelProc()).catch(e => {throw e});
    },
 * ```
 *
 * なので並列処理で特別エラーが起こった時に実施しておきたい内容は、
 * Promise.all().catch()にその処理を盛り込むとよい。
 * *******************************************************************/ 
{

  // --- tasks : Executed in parallel process --

  function task1(taskNumber: number) {
    console.log(`${taskNumber}: task1`);
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`${taskNumber}: Solved: task1`);
        console.log(`${taskNumber}: task1 is done`);
      }, 3000);
    });
};
  
  function task2(taskNumber: number, m: string) {
    console.log(`${taskNumber}: task2`);
    console.log(`${taskNumber}: task2 prev: ${m}`);
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`${taskNumber}: Solved: task2`);
        console.log(`${taskNumber}: task2 is done`);
      }, 3000);
    });
  }
  

  function task3(taskNumber: number, m: string) {
    console.log(`${taskNumber}: task3`);
    console.log(`${taskNumber}: task3 prev: ${m}`);
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        // Errorをわざと起こす
        if(taskNumber === 1) reject(`Error @task3 @sequence${taskNumber}`);
        else resolve(`${taskNumber}: Solved: task3`);
        // resolve(`${taskNumber}: Solved: task3`);
        console.log(`${taskNumber}: task3 is done`);
      }, 3000);
    });
  }
  

  function task4(taskNumber: number, m: string) {
    console.log(`${taskNumber}: task4`);
    console.log(`${taskNumber}: task4 prev: ${m}`);
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`${taskNumber}: Solved: task4`);
        console.log(`${taskNumber}: task4 is done`);
      }, 3000);
    });
  }

  function task5(taskNumber: number, m: string) {
    console.log(`${taskNumber}: task5`);
    console.log(`${taskNumber}: task5 prev: ${m}`);
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`${taskNumber}: Solved: task5`);
        console.log(`${taskNumber}: task5 is done`);
      }, 3000);
    });
  }

  // --- seq : Executed by sequential ---

  function seq1(m: string) {
    console.log(`seq1`);
    console.log(`seq1: prev result: ${m}`)
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`Solved: seq1`);
        console.log(`seq1 is done`);
      }, 3000);
    });
  };

  function seq2(m: string) {
    console.log(`seq2`);
    console.log(`seq2: prev result: ${m}`)
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`Solved: seq2`);
        console.log(`seq2 is done`);
      }, 3000);
    });
  };

  function seq3(m: string) {
    console.log(`seq3`);
    console.log(`seq3: prev result: ${m}`)
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`Solved: seq3`);
        console.log(`seq3 is done`);
      }, 3000);
    });
  };

  function seq4(m: string) {
    console.log(`seq4`);
    console.log(`seq1: prev result: ${m}`)
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`Solved: seq4`);
        console.log(`seq4 is done`);
      }, 3000);
    });
  };

  function seq5(m: string) {
    console.log(`seq5`);
    console.log(`seq5: prev result: ${m}`)
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve(`Solved: seq5`);
        console.log(`seq5 is done`);
      }, 3000);
    });
  };
  

  // Generator of parallel process 

  /***
   * 並列処理を関数でラップする。
   * この関数を呼び出したときに並列処理が生成されるので、
   * 勝手に走り出すことはない。
   * 
   * */ 
  const generateParallelProc = (): Promise<any>[] => {
    const sequences: Promise<any>[] = [
      Promise.resolve(), Promise.resolve(), Promise.resolve()
    ];
    for(let i = 0; i < 3; i++) {
      sequences[i] = sequences[i]
      .then(() => task1(i))
      .then((m) => task2(i, m as string))
      .then((m) => task3(i, m as string))
      .then((m) => task4(i, m as string))
      .then((m) => task5(i, m as string))
      .catch(e => {
        console.error(`Error while parallel sequences ${i}`);
        console.error(e);
        throw e;
      });
    };
    return sequences;
  }

  
  // Sequential process with parallel Construction
  
  const seqs: iSequentialAsyncTask[] = [
    seq1, seq2, seq3, 
    () => {
      console.log("START: Parallel Process.");
      return Promise.all(generateParallelProc())
      // NOTE: この呼出方法も同じ結果になるのでアリ。
      // return Promise.all(generateParallelProc()).catch(e => {throw e});
    },
    seq4, seq5];

  (async function() {
    sequentialAsyncTasks(seqs)
    .then(result => {
      console.log("All done.");
      console.log(result);
    })
    .catch(e => {
      console.error("Last Error Handler");
      console.error(e);
    })
  })();

  /*
    実験その３の結果：
    ```
    seq1
    seq1: prev result: undefined
    seq1 is done
    seq2
    seq2: prev result: Solved: seq1
    seq2 is done
    seq3
    seq3: prev result: Solved: seq2
    seq3 is done
    START: Parallel Process.
    0: task1
    1: task1
    2: task1
    0: task1 is done
    0: task2
    0: task2 prev: 0: Solved: task1
    1: task1 is done
    1: task2
    1: task2 prev: 1: Solved: task1
    2: task1 is done
    2: task2
    2: task2 prev: 2: Solved: task1
    0: task2 is done
    0: task3
    0: task3 prev: 0: Solved: task2
    1: task2 is done
    1: task3
    1: task3 prev: 1: Solved: task2
    2: task2 is done
    2: task3
    2: task3 prev: 2: Solved: task2
    0: task3 is done
    0: task4
    0: task4 prev: 0: Solved: task3
    1: task3 is done
    1: task4
    1: task4 prev: 1: Solved: task3
    2: task3 is done
    2: task4
    2: task4 prev: 2: Solved: task3
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
    seq1: prev result: 0: Solved: task5,1: Solved: task5,2: Solved: task5
    seq4 is done
    seq5
    seq5: prev result: Solved: seq4
    seq5 is done
    All done.
    Solved: seq5
    ```

    実験其の4の結果：
    ```
    seq1
    seq1: prev result: undefined
    seq1 is done
    seq2
    seq2: prev result: Solved: seq1
    seq2 is done
    seq3
    seq3: prev result: Solved: seq2
    seq3 is done
    START: Parallel Process.
    0: task1
    1: task1
    2: task1
    0: task1 is done
    0: task2
    0: task2 prev: 0: Solved: task1
    1: task1 is done
    1: task2
    1: task2 prev: 1: Solved: task1
    2: task1 is done
    2: task2
    2: task2 prev: 2: Solved: task1
    0: task2 is done
    0: task3
    0: task3 prev: 0: Solved: task2
    1: task2 is done
    1: task3
    1: task3 prev: 1: Solved: task2
    2: task2 is done
    2: task3
    2: task3 prev: 2: Solved: task2
    0: task3 is done
    0: task4
    0: task4 prev: 0: Solved: task3
    1: task3 is done
    Error while parallel sequences 1
    Error @task3 @sequence1
    Last Error Handler
    Error @task3 @sequence1
    2: task3 is done
    2: task4
    2: task4 prev: 2: Solved: task3
    0: task4 is done
    0: task5
    0: task5 prev: 0: Solved: task4
    2: task4 is done
    2: task5
    2: task5 prev: 2: Solved: task4
    0: task5 is done
    2: task5 is done
    ```
  */ 
}