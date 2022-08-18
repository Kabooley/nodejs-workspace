# Note for Node.js Design Pattern

## コールバック・パターン

「一貫性のないAPI」だと発見困難なバグの原因になる

「一貫性のあるAPI」とは、

同期処理と非同期処理が混在せず同期処理のみはたまた非同期処理のみで実装された関数

同期処理と非同期処理が混在するような関数は非常に発見が困難なバグの温床になる

Node.jsでは同期的継続渡し、非同期的継続渡し、PromiseAPIなど同じ処理をするけど別バージョンである関数がたくさんあるので、

それらを混在させないように気を付けよう。


#### Node.jsにおけるコールバックの慣習

- コールバックを必要とする関数は必ず一番最後の引数としてコールバックを受け取るようにする

- 継続渡しスタイルではエラーが発生したらコールバックがエラーを受け取るようにする

- コールバックは必ずエラーの有無をチェックすること

- エラーの型は必ず`Error`型とすること

同期的なダイレクトスタイルの関数におけるエラーの伝番はthrow文によってなされるので必ずtry-catchで囲うこと

非同期の継続渡しの関数のエラーの伝番はコールバックでエラーオブジェクトを渡すことでなされる

たとえばこの非同期にコールバックを実行させる関数で、エラーをスローする関数を呼び出すけどtry-catchで囲わなかったとき

```JavaScript
"use strict";

const fs = require('fs');
function readJSON(filename, callback) {
  fs.readFile(filename, 'utf8', (err, data) => {
    let parsed;
    if(err)
    //propagate the error and exit the current function
      return callback(err);

    // エラーが起こったら、
    // callbackの第一引数にエラーを渡さなくてはならないが
    // 
    // 本来エラーを起こしうるJSON.parse()をtry-catchで囲わないので
    // エラーはどこにもキャッチされずに
    // callbackはエラーが渡されないからおかしなことになる
    callback(null, JSON.parse(data));
  });
}

let cb = (err, data) => {
  if (err) {
    return console.error(err);
  }

  console.log(data)
};

readJSON('valid_json.json', cb); // dumps the content
readJSON('invalid_json.json', cb); // prints error (SyntaxError)
```

## モジュール・パターン

名前空間がJavaScriptには存在しないのでアプリやライブラリから名前衝突が起こって簡単にグローバルな変更ができてしまう。

これを回避する方法が「公開モジュールパターン」

```JavaScript
"use strict";

const mod = (() => {
  const privateFoo = () => {};
  const privateBar = [];

  const exported = {
    publicFoo: () => {},
    publicBar: () => {}
  };

  return exported;
})();

console.log(mod);
```

