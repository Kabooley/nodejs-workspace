/************************************************************
 * 
 * Implememt Command Interpreter 
 * **********************************************************/ 

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

  const async2 = (): Promise<void> => {
    console.log("async2: invoked");
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            console.log("async2: wait for 8 sec.");
            return resolve();
        }, 8000);
    });
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