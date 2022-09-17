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

で最終的にreturnするpromiseは最後の結果になっている。



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