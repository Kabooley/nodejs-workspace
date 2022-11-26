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
{
  function task1(taskNumber: number) {
    console.log(`${taskNumber}: task1`);
    return new Promise((resolve) => {
      setTimeout(function () {
        resolve("Solved: task1");
        console.log("task1 is done");
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
        resolve(`${taskNumber}: Solved: task3`);
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

  const i = 0;
  const p = Promise.resolve().then(() => task1(i))
  .then((m) => task2(i, m as string))
  .then((m) => task3(i, m as string))
  .then((m) => task4(i, m as string))
  .then((m) => task5(i, m as string))
  .catch(e => {
      console.error(`Error @sequence: ${i}`);
      console.error(e);
      throw e;
  });
}


/*********************************************************************
 * 実験その２：
 * 
 * **Promise.all(...promises)のpromisesの一つでエラーが起こっても、他のpromisesはそのまま実行されて中断されることはない**
 * 
 * Promise.all()は確かに中断される。
 * 
 * その意味は、
 * - エラーが発生したときにPromise.all().catch()がすぐさま実行されるが、Promise.all().then()は実行されない
 * という意味。
 * 
 * Promise.all()以降の処理は異常系に移動するけど、
 * Promise.all()でエラーを起こさなかった他のpromisesはそのまま最後まで走り続ける
 * 
 * 
 * ということでall()させているpromisesは一度走り出したら他でエラーが起こっても、
 * 自身でエラーでも発生しない限り止まらないのである。
 * 
 * 
 * 例：
 * 
 * Promiseチェーンからなるpromiseの配列をPromise.all()させるとする。
 * promise配列の一つがエラーを起こしても、他の配列要素であるpromiseは
 * 最後まで実行し続けることが確認できる。
 * 
 * NOTE: 「実験その１」の方で触れた通り、以下のPromise.all()はあまり意味がないけどエラーの伝番を理解するためこんなコードである。
 * 
 * 
 * Promiseはキャンセル可能なのか？:
 * 
 * できない。
 * 
 * Stackoverflowによるとキャンセルはできないという投稿の指示が高い。
 * 参考：https://stackoverflow.com/a/30235261
 * 
 * しない方がいいまである。
 * *******************************************************************/ 
{
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


  const sequences: Promise<any>[] = [Promise.resolve(), Promise.resolve(), Promise.resolve()];
  for(let i = 0; i < sequences.length; i++) {
      sequences[i] = sequences[i]
      .then(() => task1(i))
      .then((m) => task2(i, m as string))
      .then((m) => task3(i, m as string))
      .then((m) => task4(i, m as string))
      .then((m) => task5(i, m as string))
      .catch(e => {
          console.error(`Error @sequence: ${i}`);
          console.error(e);
          throw e;
      });
  };

  Promise.all(sequences)
  .then((r) => {
      console.log("All done.");
      console.log(r);})
  .catch(e => {
      console.error("Last error catcher.");
      console.error(e);
  });
  /*
    実行結果：
    ```
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
    Error @sequence: 1
    Error @task3 @sequence1
    Last error catcher.
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

    わかったこと：

    sequence[1]で発生したエラーがsequences[1]のcatch()から再スローされて、
    Promise.all().catch()まで伝番している。

    Pormise.all()は内部でエラーが発生したのでPromise.all().then()は実行されない。

    他のsequencesは最後まで実行されていることがわかる。
  */ 
}

/*********************************************************************
 * 実験その３：
 * 逐次処理のタスクの一つが並列処理を呼出したらどうなるか？
 * 
 * ここまでの話より：
 * - 逐次処理はその生成段階ですでに走り出している
 * - Promise.all()の一部でエラーが発生しても他のpromiseは中断されない
 * 
 * *******************************************************************/ 