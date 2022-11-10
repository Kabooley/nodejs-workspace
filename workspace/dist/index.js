"use strict";
{
    // -----------
    function resolveAfter6Seconds(m) {
        console.log("starting slow promise");
        console.log(`display previous value: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("slow");
                console.log("slow promise is done");
            }, 6000);
        });
    }
    function resolveAfter3Seconds(m) {
        console.log("starting fast promise");
        console.log(`display previous value: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("fast");
                console.log("fast promise is done");
            }, 3000);
        });
    }
    function sync(m) {
        console.log("starting sync function");
        console.log(`display previous value: ${m}`);
        return "sync done";
    }
    function sync2() {
        console.log("starting sync2 function");
        console.log("sync 2 would not get parameter. But returns value.");
        return "sync2 done";
    }
    function sync3() {
        console.log("starting sync3 function");
        console.log("sync3 would not get parameter and return value.");
        return;
    }
    function resolveAfter10Seconds(m) {
        console.log("starting very slow promise");
        console.log(`display previous value: ${m}`);
        return new Promise((resolve) => {
            setTimeout(function () {
                resolve("very slow");
                console.log("very slow promise is done");
            }, 10000);
        });
    }
    // -----------
    let tasks = [];
    tasks.push(resolveAfter6Seconds);
    tasks.push(resolveAfter3Seconds);
    tasks.push(sync);
    tasks.push(sync2);
    tasks.push(sync3);
    tasks.push(resolveAfter10Seconds);
    const sequentialAsyncTasks = (tasks) => {
        let promise = Promise.resolve();
        tasks.forEach((t) => {
            promise = promise.then(t);
        });
        return promise;
    };
    // const sequentialAsyncTasks = <T>(
    //   tasks: iSequentialAsyncTasks,
    //   tailEnd: iGenTask<T>
    // ): Promise<T> => {
    //   let promise = Promise.resolve();
    //   tasks.forEach((t) => {
    //     promise = promise.then(t);
    //   });
    //   return promise.then(tailEnd);
    // };
    sequentialAsyncTasks(tasks).then((a) => {
        console.log(a);
        console.log("sequential async tasks done.");
    });
}
