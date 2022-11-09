/************************************************************
 * 
 * Implememt Command Interpreter 
 * **********************************************************/ 


/****************************************************
 * TODO: promisifyを用途に合わせる.
 * 
 * 現状promisifyはどんな関数を受け入れられるのかわかっていない。
 * 
 * 元のページをよく確認したら、promisifyはラップされる関数がcallback関数をとることを前提にしていた...
 * 
 * **************************************************/ 
{
  // NOTE: このpromisifyだと戻り値がPromise<unknown>で固定される
  // 
  // USAGE
  // function foo() { console.log("this is foo.");};
  // const functionReturnsPromise = promisify(foo);
  // const resultOfFoo = functionReturnsPromise();
  // // resultOfFoo: Promise<unknown> 
  function promisify(f: (a?: any) => any) {
    return function (...args: any[]): Promise<unknown> {
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

  // そのため戻り値をジェネリックにする
  function promisifyGenerics<T>(f: (a?: any) => T) {
    return function (...args: any[]): Promise<T> {
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
  function foo() { console.log("this is foo.");};
  // promisifyGenericsにジェネリクスの型を与えないとPromise<unknown>になってしまう
  const functionReturnsPromise: (...args: any[]) => Promise<void> = promisifyGenerics<void>(foo);
  const resultOfFoo = functionReturnsPromise();
  // resultOfFoo: Promise<void>
  function bar() { return "this is bar";};
  const functionReturnsBarPromise = promisifyGenerics<string>(bar);
  const resultOfBar = functionReturnsBarPromise();
  // resultOfBar: Promise<string>


  // check if synchronous function converted to asynchronous
  const async1 = () => {
    console.log("async1: invoked");
    return setTimeout(function() {
        console.log("async1: wait 5 sec.");
    }, 5000);
  };
 
  const async2 = async () => {
    console.log("async2: invoked.");
    return setTimeout(function() {
      console.log("async2: done.");
    }, 5000);
  };

  const sync1 = () => {
    console.log("sync1: invoked.");
    for(let i = 0; i < 20000; i++) {
        if(i === 19999) console.log(i);
      }
    console.log("sync1: done");
  };

  
  const async3 = () => {
    console.log("async3 invoked.");
    return setTimeout(function() {
        console.log("async3: wait for 12 sec");
    }, 12000);
  };

  let promise = Promise.resolve();

  [async1, async2, promisifyGenerics<void>(sync1), async3].forEach(f => {
      promise = promise.then(() => f());
  });

  promise.then(() => {
      console.log("done");
  });

}

{
  const async1 = () => {
    console.log("async1: invoked");
    return setTimeout(function() {
        console.log("async1: wait 5 sec.");
    }, 5000);
  };

//   const async2 = () => {
//     console.log("async2: invoked");
//     setTimeout(function() {
//         console.log("async2: wait 8 sec.");
//         return Promise.resolve();
//     }, 8000);
//   };

  // const async2 = (): Promise<void> => {
  //   console.log("async2: invoked");
  //   return new Promise((resolve, reject) => {
  //       setTimeout(function() {
  //           console.log("async2: wait for 8 sec.");
  //           return resolve();
  //       }, 8000);
  //   });
  // }

  const temporary = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        console.log("wait for 7 sec.");
        return resolve();
      }, 7000);
    })
  };

  const async2 = async (): Promise<void> => {
    console.log("async2: invoked.");
    for(let i = 1; i < 40000; i++) {
      // console.log(i);
    };
    await temporary();
    console.log("async2: done.");
  }

  const sync1 = () => {
    console.log("sync1: invoked.");
    // // 
    // // blocking: 2万ループするまで次に行かなくなるのか検証
    // // 
    // for(let i = 0; i < 20000; i++) {
    //     console.log(i);
    //   }
  };

  const async3 = () => {
    console.log("async3 invoked.");
    return setTimeout(function() {
        console.log("async3: wait for 12 sec");
    }, 12000);
  };

let promise = Promise.resolve();

[async1, async2, sync1, async3].forEach(f => {
    promise = promise.then(() => f());
});

promise.then(() => {
    console.log("done");
});

}
