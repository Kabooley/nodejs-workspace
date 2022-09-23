
/*********************************************************
 * Task Queue for Promise base tasks. Execution is sequential.
 * 
 * 
 * *******************************************************/ 
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

    // Execute tasks sequential.
    // Callbackベースになっているのでasync/awaitベースに修正
    execute(cb: () => void): void {
        // 
        if(!this.tasks.length) return;
        let promise = Promise.resolve();
        this.tasks.forEach(task => promise = promise.then(() => { return task(); }));
        promise.then(() => { cb(); });
    };
};



