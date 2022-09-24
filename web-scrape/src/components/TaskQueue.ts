/*********************************************************
 * TaskQueue classes.
 * 
 * Ref: 
 * - O'Reilly Node.js Design Pattern 2nd Edit.
 * - https://stackoverflow.com/a/24586168
 * *******************************************************/ 


/***
 * Task Queue for asynchronous tasks.
 * 
 * 同期関数用。存在の必要性を感じない。
 * */ 
 export class TaskQueue {
    private tasks: (() => void)[];
    constructor() {
        this.push = this.push.bind(this);
        this.execute = this.execute.bind(this);
        this.tasks = [];
    }

    push(task: () => void) {
        this.tasks.push(task);
    };

    execute(): void {
        this.tasks.forEach(task => {task();} );
    };
};


/***
 * TaskQueue for Promisified tasks.
 * 
 * taskに非同期関数を登録できる。
 * ただし、taskの戻り値はvoidでなくてはならない。
 * 
 * */ 
 export class TaskQueuePromise {
    private tasks: (() => Promise<void>)[];
    constructor() {
        this.push = this.push.bind(this);
        this.execute = this.execute.bind(this);
        this.tasks = [];
    }

    push(task: () => Promise<void>) {
        this.tasks.push(task);
    };

    execute(): Promise<void> {
        let promise = Promise.resolve();
        if(!this.tasks.length) return promise;
        this.tasks.forEach(task => promise = promise.then(() => { return task(); }));
        return promise;
    };
};


// --- USAGE ----
// 
// async function task1(): Promise<void> {
//     const promise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("task 1 is done"), 1000);
//     });
//     console.log(await promise);
//     return;
//   };
  
  
//   async function task2(): Promise<void> {
//     const promise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("task 2 is done"), 2000);
//     });
//     console.log(await promise);
//     return;
//   };
  
  
//   async function task3(): Promise<void> {
//     const promise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("task 3 is done"), 3000);
//     });
//     console.log(await promise);
//     return;
//   };
  
  
//   async function task4(): Promise<void> {
//     const promise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("task 4 is done"), 4000);
//     });
//     console.log(await promise);
//     return;
//   };
  
  
//   async function task5(): Promise<void> {
//     const promise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve("task 5 is done"), 5000);
//     });
//     console.log(await promise);
//     return;
//   };
  
  
//   function done() {
//      console.log("done");
//   }
  
  
//   (async function () {
//     const queue = new TaskQueue();
  
//     queue.push(task1);
//     queue.push(task2);
//     queue.push(task3);
//     queue.push(task4);
//     queue.push(task5);
  
//     await queue.execute(done);
//   })();  