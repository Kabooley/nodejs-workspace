module.exports = class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency;
        this.running = 0;
        this.queue = [];
    }

    pushTask(task) {
        // 
        // DEBUG:
        console.log('pushTask()');
        // 
        // 
        this.queue.push(task);
        // 
        // なんでここでnext()呼び出しているの？
        // 
        this.next();
    }

    next() {
        // 
        // DEBUG:
        console.log(`next() r: ${this.running} ql: ${this.queue.length}`);
        // 
        // 
        // 同時実行数より実行ちゅうタスク数が下回ること、且つタスクキューが空でないこと
        while(this.running < this.concurrency && this.queue.length) {
            // 
            // DEBUG:
            console.log("task() execute");
            // 
            // 
            // Array.prototype.shift()は配列から最初の要素を取り除き、その要素を返す。
            const task = this.queue.shift();
            task(() => {
                this.running--;
                this.next();
            });
            this.running++;
        }
    }
};
