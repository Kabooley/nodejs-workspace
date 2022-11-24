/*********************************************************
 * Find out how to handle error 
 * in parallelly executed promise chain sequnces.
 * 
 * *******************************************************/
import { rejects } from "assert";

 

// 逐次処理させたい関数の型
type iSequentialAsyncTask = ((a?: any) => any) | ((a?: any) => Promise<any>);

const sequentialAsyncTasks = (
tasks: iSequentialAsyncTask[]
) => {
let promise = Promise.resolve();
tasks.forEach((t) => {
    promise = promise.then(t);
});
return promise;
};

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
    };
      
      function seq2(m: string) {
        console.log("seq2");
        console.log(`seq2 prev: ${m}`);
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve("Solved: seq2");
            console.log("seq2 is done");
          }, 3000);
        });
      }
      
    
    function seq3(m: string) {
        console.log("seq3");
        console.log(`seq3 prev: ${m}`);
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve("Solved: seq3");
            console.log("seq3 is done");
          }, 3000);
        });
    };
      
      function seq4(m: string) {
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

    
    function task1() {
        console.log("task1");
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve("Solved: task1");
            console.log("task1 is done");
          }, 3000);
        });
    };
      
      function task2(m: string) {
        console.log("task2");
        console.log(`task2 prev: ${m}`);
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve("Solved: task2");
            console.log("task2 is done");
          }, 3000);
        });
      }
      
    
    function task3(m: string) {
        console.log("task3");
        console.log(`task3 prev: ${m}`);
        return new Promise((resolve, reject) => {
          setTimeout(function () {
            resolve("Solved: task3");
            // reject("Error at task3");
            console.log("task3 is done");
          }, 3000);
        });
    };
      
      function task4(m: string) {
        console.log("task4");
        console.log(`task4 prev: ${m}`);
        return new Promise((resolve) => {
          setTimeout(function () {
            resolve("Solved: task4");
            console.log("task4 is done");
          }, 3000);
        });
      }

    // Generate parallel sequences.
    
    const sequences: Promise<any>[] = [Promise.resolve(), Promise.resolve(), Promise.resolve()];

    for(let i = 0; i < sequences.length; i++) {
        console.log(i);
        sequences[i] = sequences[i]
        .then(() => seq1)
        .then((m) => seq2)
        .then((m) => seq3)
        .then((m) => seq4)
        .catch((e) => {
            console.error(`parallel${i} error handler`);
            console.error(e);
            // まずはスローしないで
        });
        console.log(sequences[i]);
    };

    let tasks: iSequentialAsyncTask[] = [];

    tasks.push(task1);
    tasks.push(task2);
    tasks.push(task3);
    tasks.push(() => {
        console.log("Start parallel seuqnces");
        return Promise.all(sequences)
    });
    tasks.push(task4);


    (async function() {
        // const pre = await Promise.all(sequences).catch(e => console.error(e));
        // console.log(pre);

        const result = await sequentialAsyncTasks(tasks).catch(e => {
            console.error("This is finall error handler.");
            console.error(e);
        });
    
        console.log(result);
    })();
}