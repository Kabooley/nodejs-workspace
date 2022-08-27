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

> (`参照がゼロになったらGC`) これは一番シンプルなガベージコレクションのアルゴリズムです。**あるオブジェクトへの参照がゼロになったら、このオブジェクトは "ガベージコレクト可能だ" と判断するのです。**

> (`mark&sweep`) アルゴリズムはすべてのルートとその子オブジェクトを辿り調査し、アクティブ（つまりガベージではないということ）なものとしてマークしていきます。ルートから到達できないものはすべてガベージとしてマークされるでしょう。


循環参照は`参照がゼロになったらGC`だと参照されているから永遠にGCできないけど、`mark&sweep`なら両者が到達できないならGCできる。

C++の話みたいになってきたCOMでも使えばいいかしら。

#### 4種類の一般的なJavaScript共通のメモリリーク

- 予期しないグローバル変数

**グローバル変数に参照されているものはGCできない。**

グローバル変数に参照されているものは常にアクティブである。

つまり、グローバル変数は常にアクティブだから、グローバル変数に参照されている限りＧＣできないという意味だ。

たとえば、JavaScriptの特殊なふるまいとして、

定義されていない変数が参照されるとそれはグローバルオブジェクトに追加されてしまう。

これは関数のthisがグローバル変数を指しているから起こることと関係があるのかないのか、

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


# Memory leak in JavaScript

## MDN におけるメモリリークの記事

https://developer.mozilla.org/ja/docs/Web/JavaScript/Memory_Management

ガベージコレクションが、割り当てられたメモリがもはや不要であると判断するのは不可能で、GC ができるのはそれに近いことをするということである。

なので開発者は、メモリの開放において GC の限界を見極めて GC に任せられるか開発者が明示的に開放すべきかを判断できないといけない。

#### 参照と参照カウント

参照とは、あるオブジェクトが別のオブジェクトにアクセスできるとき、前者が後者を**参照している**という。

ここでいうオブジェクトは通常の JavaScript オブジェクトだけじゃなくて、関数のスコープ、グローバル歴史家るスコープを含む。

ある変数がオブジェクトにアクセスできるならそれは参照しているといえる。

ある変数がプリミティブを指しているなら別に参照はしていない。のかな。

> (あるオブジェクトがどこからも参照されていないの判断基準は)　**"あるオブジェクトがその他のオブジェクトから参照されていない"こと**と定義します。あるオブジェクトは、それに対する参照がゼロの時にガベージコレクト可能であると見なされます。

```JavaScript
var o = {
  a: {
    b:2
  }
};
// bを含むオブジェクトはaに参照されている
// aを含むオブジェクトはoに参照されている
// どちらもGCの対象にならない


var o2 = o;
// o2がoを参照している
// oに代入したオブジェクト(aを含むオブジェクトのこと)の
// 参照カウント（自身を参照しているオブジェクトの数）が2になった
// (oとo2に参照されている)

o = 1;
// 'o' はもうオブジェクトを参照していません。これで、このオブジェクトを
// 参照するのは 'o2' だけになりました

var oa = o2.a;
// oaはo2.aの指しているものを参照している
// なので先のオブジェクトのbの参照カウントが２になった
// (o2とoa)



o2 = "yo";
// もともと 'o' に代入されていたオブジェクトを参照するものはいなくなりました。
// （オブジェクトaを内包するオブジェクトのこと）
//
// このため、このオブジェクトはガベージコレクトの対象となります。
// しかしながら、そのオブジェクトのプロパティ 'a' が指していたオブジェクトは
// （bのこと）
//
// まだ変数 'oa' に参照されているため、解放することはできません。

oa = null;
// もともと 'o' に代入されていたオブジェクトのプロパティ 'a' が指していた
// オブジェクトへの参照が一つも無くなったため、ガベージコレクションの対象
// となりました。

// プロトタイプチェーンでは、
// 自身のプロパティへの参照と、
// プロトタイプへの参照を持つ
const Person = function(name) {
    this.name = name;
};

Person.prototype.sayHi = function() {
    console.log(`Hi, this is ${this.name}`);
};

const John = new Person("John");

// JohnはPersonを参照している
John.sayHi();
```

#### 循環参照：参照カウントの限界

> 循環に関しては限界があります。次の例では、2 つのオブジェクトが生成され、互いに参照しているため、循環を形成しています。
> これらは関数の呼び出し後にはスコープを外れるため、実際には役に立たず、本来であれば開放してもかまわないはずです。
> しかし、参照カウントアルゴリズムは、これら 2 つのオブジェクトがそれぞれ少なくとも 1 回参照されているため、どちらもガベージコレクトできないと見なします。

```JavaScript
// 例１
function f(){
  var o = {};
  var o2 = {};
  o.a = o2; // o references o2
  o2.a = o; // o2 references o

  return "azerty";
}

f();

// 例２
var div;
window.onload = function(){
  div = document.getElementById("myDivElement");
  div.circularReference = div;
  div.lotsOfData = new Array(10000).join("*");
};

```

div は自身のプロパティに自身を参照させている。

さらに div はとんでもなく巨大な配列を抱えている。

div が DOM ツリーから削除された後も、

div は自身のプロパティによって参照されたままなので、

div というオブジェクトのメモリは維持され続け、しかもその解放されないサイズは巨大である。

なので div.circulateReference プロパティは明示的に削除または null を割り当てなくてはならない。

#### Mark & Sweep

> このアルゴリズムは、"あるオブジェクトがもはや必要ない"ことを、"あるオブジェクトが到達不能である"ことと定義します。

ＧＣは定期的に、

root オブジェクト(JavaScript において`window`、Node.js において`global`)から開始して、root から参照できるオブジェクトと、そのオブジェクトから参照できるオブジェクト...と参照をたどっていき、root から参照をたどって到達可能なオブジェクトと到達不可能なオブジェクトを区別する。

そうして、到達不可能なオブジェクトはＧＣ対象とする。

これによって、参照カウンタでは対象にならなかった循環参照はＧＣの対象になる。

近代的なブラウザはこの M&S アルゴリズムを採用した GC を使っている。

#### オブジェクトは明示的に到達不能にする必要がある

GC が採用しているアルゴリズムの限界が上記の通り分かったので

M&S アルゴリズムが「もう不要である」と判断できないオブジェクトについてはプログラマが明示的に参照を切らなくてはならない。

#### ４つの JavaScript 共通のメモリリーク

https://auth0.com/blog/four-types-of-leaks-in-your-javascript-code-and-how-to-get-rid-of-them/

1. 宣言されていない変数はグローバルオブジェクトのプロパティとして登録されてしまう

```JavaScript
// 例１
function foo(arg) {
    bar = "this is a hidden global variable";
}

// Is in fact:

function foo(arg) {
    window.bar = "this is an explicit global variable";
}

// 例２
function hoge() {
    this.bar = "this is an explicit global variable";
}
```

これって文字列`"this is an explicit global variable"`への参照が増えるってことかしら。

つまり関数`foo`が要済みになっても

解決策：

```JavaScript
// 1. use strictを使う

```
