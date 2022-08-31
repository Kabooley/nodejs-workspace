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

これを継続渡しスタイルで実現しようとするとコールバック地獄になりがち。

継続渡しスタイルでも実現できる方法を一般化すると以下のようになる。

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
