# Asynchronous pattern using ES6

Promise APIはNode.jsで導入されているけど、未導入のＡＰＩを使うときとか、

古いバージョンのAPIをプロミス化させたいときに使えるパターン。

## Node.jsのAPIをプロミス化する

コールバックベースのNode.js APIを、Node.jsのコールバック引数のお作法を利用することでプロミス化させる。

```JavaScript
// utilities.js

module.exports.promisify = function(callbackBasedApi) {
  return function promisified() {
    let args = [].slice.call(arguments);
    return new Promise((resolve, reject) => {
        // * : 引数の末尾に追加する特別な関数
      args.push((err, result) => {
        if(err) {
          return reject(err);
        }
        if(arguments.length <= 2) {
          resolve(result);
        } else {
          resolve([].slice.call(arguments, 1));
        }
      });
      callbackBasedApi.apply(null, args);
    });
  }
};

// index.js

const utilities = require('./utilities');

const request = utilities.promisify(require('request'));
const fs = require('fs');
const mkdirp = utilities.promisify(require('mkdirp'));
const readFile = utilities.promisify(fs.readFile);
const writeFile = utilities.promisify(fs.writeFile);
```

ということで依存モジュールをプロミス化した。

promisify()は

- promisified()はreturn new Promise()でプロミスを返す。
- argsはpromisified関数がとる引数の配列を意味する。
- promisified()の引数の末尾に追加する関数が上記の`*`のところの関数`(err, result)=>{}`

**コールバックAPIは必ず末尾の引数をコールバック引数とするのがNode.jsのお作法なのでこれをりようすることで、**
**この特別なコールバック引数が必ず実行されて、結果プロミスを返すことが実現している**

#### (自習) arguments オブジェクト

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Functions/arguments

> arguments は配列風 (Array-like) オブジェクトであり、関数に渡された引数の値を含んでおり、関数内からアクセスすることができます。

ということで、

- `argument`は関数内部から参照できる関数の引数を含むオブジェクト
- `arguments[0]`な感じでアクセスできる
- 配列風なだけで配列ではない

次の構文はargumentsを配列に変換する常套手段：

```JavaScript
var args = Array.prototype.slice.call(arguments);
// 配列リテラルを使用すると上記よりも短くなりますが、空の配列を作成します
var args = [].slice.call(arguments);

// ES6的な方法
let args = Array.from(arguments);
// or
let args = [...arguments];

```

## 逐次処理

先のプロミス化の処理に伴ってコールバックAPIの書き方からプロミス・チェーンの書き方にすると、

どのようなメリット（またはデメリット）が生まれるのか確認する。

```JavaScript
// Callback based API

let spidering = new Map();
function spider(url, nesting, callback) {
  if(spidering.has(url)) {
    return process.nextTick(callback);
  }
  spidering.set(url, true);

  const filename = utilities.urlToFilename(url);
  fs.readFile(filename, 'utf8', function(err, body) {
    if(err) {
      if(err.code !== 'ENOENT') {
        return callback(err);
      }

      return download(url, filename, function(err, body) {
        if(err) {
          return callback(err);
        }
        spiderLinks(url, body, nesting, callback);
      });
    }

    spiderLinks(url, body, nesting, callback);
  });
}

// Promise based API
function spider(url, nesting) {
  let filename = utilities.urlToFilename(url);
  return readFile(filename, 'utf8')
    .then(
      (body) => (spiderLinks(url, body, nesting)),
      (err) => {
        if(err.code !== 'ENOENT') {
          throw err;
        }
        
        return download(url, filename)
          .then(body => spiderLinks(url, body, nesting))
        ;
      }
    );
}
```

コールバックと比較して一番わかるのが、

- エラーハンドリングを書く回数が圧倒的に減る
- エラーリレーしなくて済む
- ネストが深くならない

コールバックベースだと、

エラーオブジェクトのリレーが必ず発生していたが、

プロミスを使えばエラーが発生しても`.catch()`で捕まえてくれるからリレーしなくて済む。


## 配列の各要素に対して非同期処理を実行する

配列のような可変長のデータに対してプロミスを適用するには。

```JavaScript
// 適用前
function spiderLinks(currentUrl, body, nesting, callback) {
  if(nesting === 0) {
    return process.nextTick(callback);
  }
  let links = utilities.getPageLinks(currentUrl, body);  // ❶

  function iterate(index) {                              // ❷
    if(index === links.length) {
      return callback();
    }
    spider(links[index], nesting - 1, function(err) {    // ❸
      if(err) {
        return callback(err);
      }
      iterate(index + 1);
    });
  }
  iterate(0);                                            // ❹
}



// 適用後
function spiderLinks(currentUrl, body, nesting) {
  let promise = Promise.resolve();
  if(nesting === 0) {
    return promise;
  }
  const links = utilities.getPageLinks(currentUrl, body);
  links.forEach(link => {
    promise = promise.then(() => spider(link, nesting - 1));
  });
  
  return promise;
}

// 呼び出し側
spiderLinks(currentUrl, body, nesting)
.then(
    // すべてのタスクが完了したときに行う処理
)
.catch(
    // エラーが起こったときの処理
)
```

これまた圧倒的にコード量が減っている。

`iterate()`から`forEach()`になって10行近くが3行になった。

どうなったのか。

1. 空の解決済プロミスを生成する
2. 条件が合えばそのまま空の解決済のプロミスを返す
3. 空のプロミスに対して`.then`をつけることでthenハンドラを強制的に発生させて、プロミスを返させている
4. forEachで一気にlinks分プロミスチェーンを呼び出す
5. forEach()で各処理が終わったら解決済プロミスを返す

どうやら、

最終的に`promise`は次の通りになるっぽい。

```JavaScript
promise
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  .then(() => spider(link, nesting - 1))
  // ...以降、linksの数だけ
```

つまりforEach()するごとに`promise`に`.then(() => spider(link, nesting - 1))`を追加していっているのである。

もしくは、前のループで解決されたプロミスを次のループでつなげるthenの開始地点としている。

これなら確かに順番通りの実行が担保されている！

で最終的にreturnするpromiseは最後のコールバックの結果になっている。



## 逐次イテレーション・パターン

先の配列逐次処理の一般化

```JavaScript
let tasks = [/* ...tasks */];
let promise = Promise.resolve();    // 空の解決済プロミスの生成
tasks.forEach(task => {
    promise = promise.then(() => { return task(); });
});

promise.then(() => {
    // All tasks completed.
})
```

#### (自習) Promise + forEach()例

https://stackoverflow.com/a/38362312

forEach()ではプロミスを配列に突っ込んで、後で実行する。

```JavaScript
let promises = [];
array.forEach((e) => {
  promises.push(
    /* Implementation that returns promise finally */ 
  )
});

Promise.all(promises)
  .then(/* resolve */)
  .catch(/* error handling */);
```

これでもいいけど、「順番通りに実行する」は実現できていないかもしれない。
Promise.all()は配列の中のプロミスのうちいずれかが拒否されたらすぐさま拒否を返す。

## 並列処理

Promise.all()を使えば並列処理を実現できる。

Promise.all()の特徴として、

- すべて解決されたときにのみ解決とする
- 一つでも拒否が返されたら即座に拒否を返し残ったプロミスは無視される
- どのプロミスが先に処理完了するのかは定かではない

並列処理をコールバックAPIベースの並列処理からプロミスベースの並列処理に変換する

```JavaScript
// 変換前
function spiderLinks(currentUrl, body, nesting, callback) {
  if(nesting === 0) {
    return process.nextTick(callback);
  }

  const links = utilities.getPageLinks(currentUrl, body);  //[1]
  if(links.length === 0) {
    return process.nextTick(callback);
  }

  let completed = 0, hasErrors = false;

  function done(err) {
    if(err) {
      hasErrors = true;
      return callback(err);
    }
    if(++completed === links.length && !hasErrors) {
      return callback();
    }
  }

  links.forEach(function(link) {
    spider(link, nesting - 1, done);
  });
}

// 変換後
function spiderLinks(currentUrl, body, nesting) {
  if(nesting === 0) {
    return Promise.resolve();
  }
  
  const links = utilities.getPageLinks(currentUrl, body);
  //  spider()はプロミスを返す
  const promises = links.map(link => spider(link, nesting - 1));
  
  return Promise.all(promises);
}
```

すごく短い！

- mapで`link => spider()`から返されるプロミスを配列で格納する
- Promise.all()するだけ

比較すると、

- `done`がいらなくなった

## 同時実行数を制限した並列処理パターン

ES6のAPIに同時実行数を制限する機能はない。

前章のTaskQueueに変更を加えて実現する。

```JavaScript
// 変更前
class TaskQueue {
  constructor (concurrency) {
    this.concurrency = concurrency;     // 同時実行数上限
    this.running = 0;                   // 実行ちゅうタスク数
    this.queue = [];                    // タスクキュー
  }

  pushTask (task) {
    this.queue.push(task);
    this.next();
  }

  next() {
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();  // 次のタスクを取得
      task (() => {                     // タスクを実行する。その際、コールバックAPIの第一引数
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
};
```

```JavaScript
// 変更後
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task) {
    this.queue.push(task);
    this.next();
  }

  next() {
    while(this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task().then(() => {
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
};
```

task()の実行の仕方が異なる。

プロミス：`task().then()`でtask()を実行して、then()で同時実行数の更新を行う

コールバックAPIでは`task(() => {})`でtask()がコールバック引数を受け取ることを利用している。

そこだけ。

使う側：

```JavaScript
let downloadQueue = new TaskQueue(2);

function spiderLinks(currentUrl, body, nesting) {
  if(nesting === 0) {
    return Promise.resolve();
  }
  
  const links = utilities.getPageLinks(currentUrl, body);
  //we need the following because the Promise we create next
  //will never settle if there are no tasks to process
  if(links.length === 0) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    let completed = 0;
    let errored = false;
    links.forEach(link => {
      // Task that is registered to taskQueue
      let task = () => {
        return spider(link, nesting - 1)
          .then(() => {
            // Check if all tasks are done.
            if(++completed === links.length) {
              resolve();
            }
          })
          .catch(() => {
            if (!errored) {
              errored = true;
              reject();
            }
          })
        ;
      };
      // --------------------------------------
      downloadQueue.pushTask(task);
    }); 
  });
}
```

ということで、

taskQueueに登録されるタスク: `spider().then().catch()`を実行する関数

このtask()が実行さるごとに`completed`がインクリメントされて毎task()実行時にチェックされ、全てのtask()が完了したらresolve()になる。

task()には、実行したい処理に加えて、並列処理したいタスク群がすべて完了したのかどうかチェックするロジックを組み込むこと(エラーチェックロジックもね)。

#### 検証： Promise化したtaskQueueを使ってみる

サンプルプログラムを動かすだけだけど、同時実行数が制限通りになっているのかログをとる。

```JavaScript
// TaskQeue.js
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  pushTask(task) {
    this.queue.push(task);
    this.next();
  }

  next() {
    // LOG ---
    console.log(`next() running: ${this.running} / ${this.concurrency}`);
    // -------
    while(this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      task().then(() => {
        this.running--;
        this.next();
      });
      this.running++;
    }
  }
};
```

で確認したら確かに`1/2`または`2/2`で同時実行数が制限されていた。

## Promise化並列処理（同時実行数制限有）まとめ

同時実行数制限タスクキュー：

```JavaScript
// TaskQeue.js
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;   // 同時実行上限数
    this.running = 0;                 // 現在同時実行しているタスク数
    this.queue = [];                  // タスクを格納している配列
  }

  // とにかくタスクをqueueに突っ込んでnext()へ丸投げするだけ
  // そのタスクを実行するのかどうかは完全にnext()が判断するので
  // pushTask()はキューに突っ込んでそれをすぐに実行するのかどうかはnext()に委譲する
  pushTask(task) {
    this.queue.push(task);
    this.next();
  }

  next() {
    // LOG ---
    console.log(`next() running: ${this.running} / ${this.concurrency}`);
    // -------

    // 1. 現在実行数が上限を下回るときだけwhileループが回る
    while(this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift();
      // task()をひとまず走らせる
      // task()は非同期処理なのでtask()の呼出だけして完了は待たずにwhileループは回る
      task().then(() => {
      // taskが完了したらrunningをデクリメントしてnext()を呼び出す
        this.running--;
        this.next();
      });
      // task()を呼び出したらインクリメント
      this.running++;
    }
  }
};
```

処理の流れ：

next()>while(0 < 2)>task1() running++>while(1 < 2)>task2() running++> while loop done.

task1().then() running-->next()>while(1 < 2)>task3() running++>while loop done.

くりかえし...


呼び出し側：

```JavaScript
```

## コールバックとプロミスを両立するAPI

APIをライブラリで公開するとき、プロミスベースにするべきか、コールバックベースにするべきか。

コールバックベースAPIを基本的に提供するけど、コールバックが省略されたときはプロミスを提供するようにする。

```JavaScript
// 割り算を行うAPI
module.exports = function asyncDivision (dividend, divisor, cb) {
  return new Promise((resolve, reject) => {  // ❶

    // 次コールスタックが空になったら実行される
    process.nextTick(() => {
      const result = dividend / divisor;
      if (isNaN(result) || !Number.isFinite(result)) {
        const error = new Error('Invalid operands');
        if (cb) { cb(error); }  // ❷
        return reject(error);
      }

      if (cb) { cb(null, result); }  // ❸
      resolve(result);
    });

  });
};
```

エラーでもfullFilledでも、コールバック引数があればその結果を、コールバック引数があろうとなかろうとプロミスを返す。

```JavaScript
// Usage

asyncDivision(10, 2, (err, result) => {
  if(err)console.error(err.message);
  console.log(result)
})

asyncDivision(10, 2).then(result => console.log(result)).catch(err => console.error(err.message));
```


#### (自習) `process.nextTick()`

https://nodejs.org/dist/latest-v16.x/docs/api/process.html#processnexttickcallback-args

> process.nextTick()はコールバック引数を「次のtickキュー」に追加する。

> このキューは、JavaScript スタックでの現在の操作が完了するまで実行された後、イベント ループの続行が許可される前に完全に排出されます。 process.nextTick() を再帰的に呼び出すと、無限ループが発生する可能性があります。背景の詳細​​については、イベント ループ ガイドを参照してください。

ということで、

コールスタックが空になって、イベントキューがキューからイベントをコールスタックへ送る前に、tickキューの中身は完全に排出される（コールスタックへ）。

ということかしら？

https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/#process-nexttick

> process.nextTick()は非同期APIだけど、技術的にはイベントループの一部ではない。

> 代わりに、イベントループの現在のフェーズに関係なく、現在の操作が完了した後に nextTickQueue が処理されます。ここで、操作は、基礎となる C/C++ ハンドラーからの移行として定義され、実行する必要がある JavaScript を処理します。

> 図を振り返ると、特定のフェーズで process.nextTick() を呼び出すたびに、process.nextTick() に渡されたすべてのコールバックが解決されてから、イベント ループが続行されます。これにより、再帰的な process.nextTick() 呼び出しを行ってしまうと I/O を「枯渇」させ、イベント ループがポーリング フェーズに到達できなくなるため、いくつかの悪い状況が発生する可能性があります。

あんまり詳細に入るつもりはないのでこの辺で。

まとめ：

- `process.nextTick()`は、そのコールバック引数を`nextTickQueue`へ追加するメソッドである。

- `nextTickQueue`は、コールスタックが空になったら、イベントループが稼働する前に、そのキューの中身をすべて排出（実行）する。



## ジェネレータ

割愛。

今のところ使うことはなさそうなので。