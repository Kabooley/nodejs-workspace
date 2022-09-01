# 3章 コールバックを用いた非同期パターン


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

TODO:　逐次処理と並列処理の本質を理解すること