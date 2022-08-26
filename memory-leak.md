#JavaScript Memory Leak

## 自習：JavaScriptのメモリリークについて

https://qiita.com/tkdn/items/ea4f034e0d661def244a#3-%E3%82%AF%E3%83%AD%E3%83%BC%E3%82%B8%E3%83%A3

> JavaScript開発者もメモリリークについて考えなくてはならない。

> 高水準言語を扱っているときも開発者はメモリ管理について理解をするべきである。

> 自動的なメモリ管理については問題が生じる場合もあるのです。

> ガベージコレクタは、不要となったメモリの一部を見つけて自動的にそのメモリを解放するために、メモリの割り当ていちと使用を追跡する。

> ただし残念なことに、このプロセスは「近似」なのです。なぜなら、メモリのある一部が必要であるか知るという一般的な問題は決めることが不可能だからです。

つまりアルゴリズムじゃそれが不要なメモリだ！と判定できないというわけですね。

> ガベージコレクションのアルゴリズムにおける主なコンセプトは**参照**の一部に依存しています。

主なアルゴリズムは以下の2つ。`参照がゼロになったらGC`、`mark&sweep`。

> これは一番シンプルなガベージコレクションのアルゴリズムです。あるオブジェクトへの参照がゼロになったら、このオブジェクトは "ガベージコレクト可能だ" と判断するのです。

そいつは誰かから参照されているか？

> アルゴリズムはすべてのルートとその子オブジェクトを辿り調査し、アクティブ（つまりガベージではないということ）なものとしてマークしていきます。ルートから到達できないものはすべてガベージとしてマークされるでしょう。

そいつには到達可能か？

循環参照は`参照がゼロになったらGC`だと参照されているから永遠にGCできないけど、`mark&sweep`なら両者が到達できないならGCできる。

C++の話みたいになってきたCOMでも使えばいいかしら。

#### 4種類の一般的なJavaScript共通のメモリリーク

- 予期しないグローバル変数

**グローバル変数に参照されているものはGCできない。**

グローバル変数に参照されているものは常にアクティブである。

定義されていない変数が参照されるとそれはグローバルオブジェクトに追加されてしまう。

これは関数のthisがグローバル変数を指しているから起こることと関係があるようで、

`use strict`で防止できる。

関数が内部でグローバル変数を参照すると、関数は存在する変数を参照しているままになるのでその関数は用が済んでもGCされない。

なのでどうしてもグローバル変数にアクセスしたいときは、関数内部でグローバル変数にアクセスする変数をnullにすること。

```JavaScript
var theThing = null;    // グローバル変数
var replaceThing = function () {

  var originalThing = theThing; // originalThingはグローバル変数の参照を持ち...
  var unused = function () {
    if (originalThing) // クロージャでグローバル変数の参照を持ってしまった
      console.log("hi");
  };

  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log("message");
    }
  };
  originalThing = null  // nullで参照をなくす
};
```

しかしいまいち「それが参照されている」の定義がわからん。

- 放置されたタイマーorコールバック

`setInterval()`は指定の時間間隔でコールバック関数を実行する。

```JavaScript
var serverData = loadData();

setInterval(function() {
    var renderer = document.getElementById('renderer');
    if(renderer) {
        renderer.innerHTML = JSON.stringify(serverData);
    }
}, 5000);
// 
// serverDataはGCされることはない
// 
```

setIntervalは、GCするにしてもまずは止める必要がある。

つまるところ、こうしたインターバルAPIは止めて削除する仕組みをつくるのはプログラマの責任である。



- closure

クロージャは、クロージャを生成する関数の内部変数への参照を持ち続けることができる、
特別なコンテキストを持つ関数のことである。

クロージャはその生成関数から生成された後も、生成関数の中の変数への参照を持ち続ける。

以下の強調は覚えておくべきクロージャの特性である。

**同じ親関数内のなかでクロージャスコープが複数生成されると、そのスコープは共有される**

誰に共有されるの？っていうとその生成されたクロージャ同士でスコープが共有されるという意味だと思う。

いいかえると、

**同じ関数の中で生成されたクロージャ同士は、そのスコープを共有する。**

ということ。

```JavaScript
var theThing = null;

var replaceThing = function () {

  var originalThing = theThing;
//   
// closure: unused
// 
  var unused = function () {
    // 
    // 親関数の変数を参照
    // 
    if (originalThing) // 'originalThing' への参照
      console.log("hi");
  };

    // グローバル変数theThingは、
    // クロージャを生成する関数の中で代入された。
    // 
    // 
  theThing = {
    longStr: new Array(1000000).join('*'),
    // 
    // closure: someMethod
    // 
    someMethod: function () {
      console.log("message");
    }
  };
};

setInterval(replaceThing, 1000);
```

上記の例だと、

someMethod()のために生成されたスコープはunused()に共有されることになる。

unused()がまったく使われないとしても、someMethodはtheThingに参照されているがゆえに