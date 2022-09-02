# 3章 コールバックを用いた非同期パターン


NOTE: ここのノートではテキストのメモと、自分なりの解釈の２つを記述するので内容が重複する部分が発生する。

コールバックをうまく使いこなして、保守が容易なコードを書くための、いくつかの原則とパターンを学ぶ。

クロージャを多用することは望ましくない。理由はアプリケーションが大規模化するにしたがって関数呼び出しのレベルが深くなって、コードの制御フローの追跡が困難になるからである。

## コールバック地獄

- 関数の開始位置と終了位置が分かりづらい
- 変数のスコープが重複してしまう
- クロージャを多用するので明示的に開放しないとメモリリークの原因になる

```JavaScript
function spider(url, callback) {
  const filename = utilities.urlToFilename(url);
  fs.exists(filename, exists => {        // ❶
    if(!exists) {
      console.log(`Downloading ${url}`);

        // errをやめてerr1などにするべき
      request(url, (err, response, body) => {      // ❷
        if(err) {
          callback(err);
        } else {

            // errをやめてerr2などにするべき
          mkdirp(path.dirname(filename), err => {    // ❸
            if(err) {
              callback(err);
            } else {

              fs.writeFile(filename, body, err => { // ❹
                if(err) {
                  callback(err);
                } else {
                  callback(null, filename, true);
                }
              });
            }
          });
        }
      });
    } else {
      callback(null, filename, false);
    }
  });
}
```

上記のコールバック地獄の例は...

errが重複している。fs.writeFile()のコールバックのerrがmkdirp()のコールバックのerrを隠してしまう。

mkdirp()やwriteFile()の引数としての関数(インライン関数)はすべてクロージャである。


## 非同期パターン

#### 基本原則：**クロージャを乱用しない**

- ネストのレベルを下げる(if文にelseを書かずreturnで早めに抜ける)
- コールバックをインラインではなくて独立した関数として定義し、必要なデータを引数として渡しクロージャを使わない
こうするとエラーが発生したときにスタックとレースに関数名が記録されるのでデバグが容易になる。
- 一つの関数にネスト下コールバックを記述しない。複数の関数に分割する。

以上３つ。

```JavaScript
// else文を削除して書き換える方法

// 変更前
if(err){
    callback(err);
}
else {
    // codes without error
}

// 変更後
if(err) {
    return callback(err);
}
// codes without error
```

NOTE: `return callback(err);`すること。

return文で抜けないと、エラーのコールバック呼び出し後も関数の実効が続いてしまう。

return文でコールバックを返すことで、エラーの処理もできるし続きに行かせないしで解決できる。


```JavaScript
"use strict";

function saveFile(filename, contents, callback) {
  mkdirp(path.dirname(filename), err => {
    if(err) {
      return callback(err);
    }
    fs.writeFile(filename, contents, callback);
  });
}

function download(url, filename, callback) {
  console.log(`Downloading ${url}`);
  request(url, (err, response, body) => {
    if(err) {
      return callback(err);
    }
    saveFile(filename, body, err => {
      if(err) {
        return callback(err);
      }
      console.log(`Downloaded and saved: ${url}`);
      callback(null, body);
    });
  });
}

function spider(url, callback) {
  const filename = utilities.urlToFilename(url);
  fs.exists(filename, exists => {
    if(exists) {
      return callback(null, filename, false);
    }
    download(url, filename, err => {
      if(err) {
        return callback(err);
      }
      callback(null, filename, true);
    })
  });
}
```

spider()の機能を分割した。`saveFile()`と`download()`である。
再利用可能な部分を分割すればテストが容易になる。


#### 逐次処理

複数のタスクを決められた順番で一つずつ実行すること。

- 既知の複数のタスクを単に決められた順番で実行する

- あるタスクの出力を次のタスクの入力として使う

- 複数のタスクを繰り返し行う。この際各要素に対して非同期の処理を実行する

以上を実現した一連の実装が逐次処理である。

これを継続渡しスタイルで実現しようとするとコールバック地獄になりがち。

一般化した継続渡しスタイルでの逐次処理：

```JavaScript
function task1(callback) {
    asyncOperation(() => {
        task2(callback);
    });
}
function task2(callback) {
    asyncOperation(() => {
        task3(callback);
    });
}
function task3(callback) {
    asyncOperation(() => {
        callback();
    });
}

task1(() => { console.log("tasks 1, 2 and 3 executed")});
```

- 各タスクは別々の関数として実行される
- 非同期処理を呼び出しその処理が完了したら次のタスクを呼び出している
- 処理順序はハードコーディングである


##### 配列の各要素に対する非同期処理

配列の各要素に対して処理を呼び出す

処理の順番が動的に決まる場合。

次の`spiderLinks()`

下記は、あたえられたURLページ上に存在する（ホストドメインが同じ）リンクURLをたどっていくプログラム。

```JavaScript
"use strict";

const request = require('request');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const utilities = require('./utilities');

/****
 * spiderLinks()は与えられたURL(currentUrl)のページ上に存在するリンクURLを取得して
 * それらのURLを配列にしてURL要素一つずつをspider()に渡す関数である。
 * 
 * 引数のcallbackは再帰完了もしくはエラー発生時に実行する関数となる。
 * */ 
function spiderLinks(currentUrl, body, nesting, callback) {
  if(nesting === 0) {
    // 再帰終了になったら、
    // 次のイベントループが発生する前にcallbackを実行させる
    return process.nextTick(callback);
  }

  // ページに含まれるすべてのリンクを配列で取得する
  let links = utilities.getPageLinks(currentUrl, body);  // ❶

  // 引数index値がlinksの配列の長さに到達するまで
  // links[index]のURLをspiderへ供給し続ける再帰関数
  function iterate(index) {                              // ❷
    if(index === links.length) {
      return callback();
    }

    // spider()を再帰的に呼び出しリンクを一つずつ処理する
    // 呼出のたびにnestingの値を一つずつ減らすことで無限ループを防止している
    spider(links[index], nesting - 1, function(err) {    // ❸
      if(err) {
        return callback(err);
      }
      iterate(index + 1);
    });
  }
  iterate(0);                                            // ❹
}

function saveFile(filename, contents, callback) {
  // ...
}

function download(url, filename, callback) {
  // ...
}

function spider(url, nesting, callback) {
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

spider(process.argv[2], 1, (err) => {
  if(err) {
    console.log(err);
    process.exit();
  } else {
    console.log('Download complete');
  }
});

```

これを一般化したのが次、

```JavaScript
function iterate(index) {
  if(index === tasks.length) {
    // 再帰が終了したらfinish()を実行する
    return finish();
  }

  const task = tasks[index];
  // task()は非同期関数である
  task(function() {
    iterate(index + 1);
  })
}

function finish() {
  // complete iteration
}

iterate(0);
```

いまいちわからん。

##### （自習）逐次処理の節までのおさらい

コールバック関数とは：

> ある関数（FuncAとする）を呼び出すときに、引数として渡す関数（FuncBとする）のことで、

> FuncAの処理が完了したときにFuncAの結果を通知するために起動される関数のことである。

ということで、


```JavaScript
import fs from 'node:fs';

fs.writeFile(filename, data, () => {
  // ...
})
```

上記のfs.writeFile()に渡している`() => {}`がコールバック関数である。

`fs.writeFile()`の処理結果を取得し、そのまま実行されるのがこの`() => {}`である。

そしてこのような結果を伝番させる手法のことを「継続渡しスタイル」という。

コールバック関数を取る関数を呼び出すと、（コールバック関数が同期的に呼び出されるなら）コールバック関数の完了まで呼び出し元に処理が戻らない。


ダイレクトスタイル、同期的に継続渡しスタイル、非同期継続渡しスタイルとは：

```JavaScript
// Direct Style
// 
// return 文で処理結果を返す関数のこと
function sum(a, b) {
  return a + b;
}

// Synchronous Continuation-Passing Style
// 
// callback()の完了によってsum()呼び出しが完了する
function sum(a, b, callback) {
  callback(a + b);
}

// Asynchronous Continuation-Passing style
// 
// callback()は非同期的に呼び出されるので、sum()が完了次第呼び出し元に処理は戻る
function sum(a, b, callback) {
    setTimeout(() => callback(a + b), 1000);
}
```

イベントループについて：

JavaScriptにおいて非同期処理の関数は、同期関数の実行されるメモリの場所とは異なる場所へ追加される。

コールスタック：同期関数が追加されるメモリの場所で、LIFO（後入れ先出し）で追加された関数が順番に実行される。

イベント・キュー：非同期関数が追加されるメモリの場所で、追加された関数が、コールスタックが空になったタイミングで順番（先入先出）に実行される。

つまり非同期関数がいつ実行されるのかといえば、キューに追加されてから次コールスタックが空になったらである。

JavaScriptがシングルスレッドと呼ばれる所以は、関数がコールスタックで順番に実行されることを指す。

イベントループはコールスタックが空になったかを監視して、空になったらキューから要素を取り出してスタックへ追加する役目を負った存在である。

非同期関数もイベントループによって遅れてコールスタックに追加されるのでシングルスレッドであるといえる。

非同期継続渡しスタイル関数が陥りやすい問題：

コールバック地獄である。なぜコールバック地獄になってしまうのか。

呼び出された関数 > 呼び出された関数で処理完了し結果をコールバック関数へ渡す >  コールバック関数での処理完了 

...と来た時に、コールバック関数の実行結果を渡したい関数をそのままコールバック関数の中に記述することができるから。

```JavaScript
function spider(url, callback) {
  const filename = utilities.urlToFilename(url);
  fs.exists(filename, exists => {        // ❶
    if(!exists) {

      request(url, (err, response, body) => {      // ❷
        if(err) {
          callback(err);
        } else {

          mkdirp(path.dirname(filename), err => {    // ❸
            if(err) {
              callback(err);
            } else {

              fs.writeFile(filename, body, err => { // ❹
                if(err) {
                  callback(err);
                } else {
                  callback(null, filename, true);
                }
              });
            }
          });
        }
      });
    } else {
      callback(null, filename, false);
    }
  });
}
```

上記の例だと、

`fs.exists()`のコールバック関数内部で`request()`を呼び出しそのコールバック関数内部でまた`fs.writeFile()`を呼び出しさらにコールバック関数が...とコールバック関数>継続渡しスタイル関数>コールバック関数>継続渡しスタイル関数という繰り返しに陥り多数のクロージャ(コールバック関数のこと)を生成してしまう。

クロージャの乱用は禁物である。

コールバック地獄を回避するための基本原則：

- if文にelse文を続けさせないでreturn文でなるべく早く抜ける。こうすることでネストが浅くなる。
- コールバック関数はインラインで書かずに独立した関数をあらかじめ定義してそれを渡すようにすることでクロージャの生成をさせない
- 複数の関数に分割する。

## 逐次処理も並列処理も非同期関数を呼び出しているけどどこが違うの？

NOTE: 下記一般化はエラーチェックなどを無視している

一般化された逐次処理：

```JavaScript
function task1(callback) {
    asyncOperation(() => {
        task2(callback);
    });
}
function task2(callback) {
    asyncOperation(() => {
        task3(callback);
    });
}
function task3(callback) {
    asyncOperation(() => {
        callback();
    });
}

task1(() => { console.log("tasks 1, 2 and 3 executed")});

```

task1()が実行される>
task1は内部で非同期処理をするCPSであるので、asyncOperation()はイベントキューに登録されてすぐに処理が呼び出し元へ戻る>
イベントキューからtask1のasyncOperation()がポップされると、task2が呼び出される>
task2のasyncOperation()がイベントキューに登録される>
イベントキューからtask2のasyncOperation()がポップされて、task3が呼び出される>
task3のasyncOperation()がイベントキューに登録される>
callback()が実行される>
完了


一般化された並列処理：

```JavaScript
const tasks = [/* ... */];

let completed = 0;

tasks.forEach(task => {
  // task()は非同期関数である
  task(() => {
    if(++completed === tasks.length) {
      finish();
    }
  })
})

function finish() {
  // すべてのタスクの終了
}
```
forEach()で非同期CPS関数を一気に呼出している。

非同期関数の呼び出しなので、各task()の呼出において制御はすぐに戻るからすべてのtask()はほぼ一気に呼出したことになる。

CPSであるtask()自身の処理が完了したら、コールバック関数で「すべてのタスクが完了したのか」のチェックと、完了タスクカウンタのインクリメントを行っている

つまり、並行処理させたい処理を一気に呼出して、それらのコールバック関数に完了チェックをさせてすべての完了をチェックさせる。

両者の違い：

逐次処理はイベントキューに追加する非同期関数は1度に一つであるが、

並行処理は一気にすべての非同期関数をイベントキューへ追加している。

#### 3.2.4.3 並行処理における競合状態

Nodeのようなシングルスレッド・アーキテクチャでも競合状態が発生する。

競合状態は再現性が低いので通常デバッグが困難である。並行処理を実装するときは十分このことに気を付けること。

以下のコードだと、2つのタスクが同じURLに対してspider()を実行すると問題が発生する。

```JavaScript
function spider(url, nesting, callback) {
  //...

  // この`filename`というのはパスのことである
  const filename = utilities.urlToFilename(url);
  // このreadFileはすでにローカルに同じファイルがあるなら処理をスキップするために存在する
  // 前のコードだと`fs.exist()`を使っていた。
  fs.readFile(filename, 'utf8', function(err, body) {
    if(err) {
      // ENOENT: "No such a file or directory"
      // ファイルが存在しないときだけ続行する。
      if(err.code !== 'ENOENT') {
        return callback(err);
      }

      return download(url, filename, function(err, body) {
        // ...
      });
    }
    // ...
  });
}
```

2つのタスクが同時に同じURLに対してspider()を呼び出すと、

本来逐次処理であったならば`fs.readFile()`の時点でそのファイルは存在するからスキップしていいよの条件文でスキップできたのだが、

並列処理だとその時点では片方のタスクが「処理中」でファイルが出来上がっていない可能性があるために、

「そのファイルはないから続行していいよ」の判断がされて実行されてしまうのである。


解決策：同じURLがダウンロードされていないかチェック機能を追加すること


```JavaScript
// NOTE: 処理中または処理済のURLをここに格納するようにする。
const spidering = new Map();

function spider(url, nesting, callback) {
  // NOTE: そのURLが処理中または処理済ならスキップする
  if(spidering.has(url))return process.nextTick(callback);
  // そうじゃないなら処理する
  spidering.set(url, true);

  // この`filename`というのはパスのことである
  const filename = utilities.urlToFilename(url);
  // このreadFileはすでにローカルに同じファイルがあるなら処理をスキップするために存在する
  // 前のコードだと`fs.exist()`を使っていた。
  fs.readFile(filename, 'utf8', function(err, body) {
    if(err) {
      // ENOENT: "No such a file or directory"
      // ファイルが存在しないときだけ続行する。
      if(err.code !== 'ENOENT') {
        return callback(err);
      }

      return download(url, filename, function(err, body) {
        // ...
      });
    }
    // ...
  });
}
```

#### 3.2.5 同時実行数を制限した並列処理パターン

同時に実行可能なタスク数は制限するのが当然ですね。

その実装方法。

1. 最初に制限いっぱいまでタスクを起動する
2. タスクが完了するたびに、制限いっぱいまでタスクを起動する

先の逐次処理と並列処理をミックスするような実装になる。

```JavaScript
const tasks = [/* ... */];

// 同時実行タスク数の上限
const concurrency = 2;

let running = 0,  // 同時実行タスク数
  completed = 0,  // 完了タスク数
  index = 0;      // 実行するタスクのインデックス

function next() {
  // 同時実行数が上限を超えていない　且つ indexがタスクの総数を超えていない
  while(running < concurrency && index < tasks.length) {
    task = tasks[index++];
    task(() => {

      // すべてのタスクが完了したらここで再帰ともに終了させる
      if(completed === tasks.length) {
        return finish();
      }
      
      // 残るタスクがある場合再帰呼出
      // taskのコールバックが呼び出されている時点でtaskは完了しているので
      // completeをインクリメント、実行中の数をデクリメントする
      completed++, running--;
      next();
    });
    running++;
  }
}

next();

function finishi(){ /*  すべてのタスクの終了 */ };
```

taksのコールバック内部でnext()を再帰呼出することで、逐次処理を実現している。

while()文で同時実行数いっぱいまでタスクを実行させる

TODO: spider ver4を実装してみる