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