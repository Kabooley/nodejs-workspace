# Memory leak in JavaScript

JavaScriptでもメモリリークは起こるよという話。

どう起こるのかとどう防ぐのかをまとめる。

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

**グローバル変数である限りGCはそれを収集することはできない。**

なので、グローバル変数を使って大量の巨大なデータを一時的に保存しておこうと考えて使うような場合、

非常に注意にしなくてはならない。

こうしたデータは、用が済んだ場合に、

- nullを割り当てる
- 再割り当てをする

を遵守しなくてはならない。

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

foo();
```

防止策：

```JavaScript
// 1. use strictを使う
"use strict";

// bar is undefined
function foo(arg) {
    bar = "this is a hidden global variable";
}

// `this` is undefined 
function hoge() {
    this.bar = "this is an explicit global variable";
}

foo();
hoge();
```
参照を切る方法：

```JavaScript
window.temporaryBigData = new Array(1000000).join('*');

// later temporaryBigData is already nothing for all,
// then you should...

window.temporaryBigData = null;
// or
window.temporaryBigData = "";
```

2. 放置されたタイマーまたは放置されたコールバック

> setInterval の使用は、JavaScript では非常に一般的です。他のライブラリは、コールバックを取るオブザーバーやその他の機能を提供します。これらのライブラリのほとんどは、自身のインスタンスも到達不能になった後、コールバックへの参照を到達不能にする処理を行います。

タイマーの例：

> ただし、setInterval の場合、次のようなコードは非常に一般的です。

```JavaScript
var someResource = getData();
setInterval(function() {
    var node = document.getElementById('Node');
    if(node) {
        // Do stuff with node and someResource.
        node.innerHTML = JSON.stringify(someResource));
    }
}, 1000);
```

**`setInterval()`はアクティブである限り、(GCは)ハンドラを回収することはできない。**

ハンドラがGCできないなら、ハンドラの依存関係もGCできない。ようである。

> However, the handler, as the interval is still active, cannot be collected (the interval needs to be stopped for that to happen). If the interval handler cannot be collected, its dependencies cannot be collected either. That means that someResource, which presumably stores sizable data, cannot be collected either.

上記の場合でいえば、

`setInterval()`を明示的に停止させない限り、`someResource`も回収できないのだ。

```JavaScript
var someResource = getData();
const timerId = setInterval(function() {
    var node = document.getElementById('Node');
    if(node) {
        // Do stuff with node and someResource.
        node.innerHTML = JSON.stringify(someResource));
    }
}, 1000);

// 用が済んだら明示的に停止して
clearInterval(timerId);
```

コールバックの例：

> オブザーバの場合、オブザーバが不要になったら（あるいは関連するオブジェクトが到達不能になりそうになったら）、明示的に削除するよう呼びかけることが重要である。

> (中略) オブジェクトが破棄される前にこれらのオブザーバを明示的に削除することは、依然としてグッドプラクティスです。たとえば

例：addEventListener()のコールバック

```JavaScript
var element = document.getElementById('button');

function onClick(event) {
    element.innerHtml = 'text';
}

element.addEventListener('click', onClick);
// Do stuff
element.removeEventListener('click', onClick);
element.parentNode.removeChild(element);
// Now when element goes out of scope,
// both element and onClick will be collected even in old browsers that don't
// handle cycles well.
```

つまり、

オブザーバの削除：`removeEventListener()`

到達不能にするための処理：`element.parentNode.removeChild(element);`

をすれば完全に参照がなくなる。

DOM要素もリスナも不要になったらここまですれば安心というわけですな。

- DOMツリー上に要らない要素があれば消すこと。

- そのリスナも消すこと。

##### オブザーバと循環参照についての備考

> かつてオブザーバと循環参照は、JavaScript開発者の悩みの種でした。これは Internet Explorer のガベージコレクタのバグ（あるいは設計上の判断）によるものでした。古いバージョンの Internet Explorer では、DOM ノードと JavaScript コード間の循環参照を検出することができませんでした。これはオブザーバーの典型的な例で、通常オブザーバーは（上記の例のように）observableへの参照を保持します。言い換えれば、Internet Explorer でノードに observer が追加されるたびに、リークが発生していたのです。これが、開発者がノードの前にあるハンドラを明示的に削除したり、オブザーバ内の参照をnullにしたりするようになった理由です。現在では、モダンブラウザ（Internet ExplorerやMicrosoft Edgeを含む）は、これらのサイクルを検出し、正しく処理することができる最新のガベージコレクションアルゴリズムを使用しています。つまり、ノードを到達不能にする前にremoveEventListenerを呼び出すことは、厳密には必要ではありません。

> jQueryのようなフレームワークやライブラリは、ノードを破棄する前にリスナーを削除します（そのための特定のAPIを使用する場合）。これはライブラリによって内部的に処理され、古い Internet Explorer のような問題のあるブラウザの下で実行されても、リークが発生しないことを確認します。

3. DOMの参照外

> データ構造内に DOM ノードを格納すると便利な場合があります。テーブル内の複数の行の内容を迅速に更新したいとします。各 DOM 行への参照をディクショナリまたは配列に格納することは理にかなっている場合があります。この場合、同じ DOM 要素への 2 つの参照が保持されます。1 つは DOM ツリーにあり、もう 1 つは辞書にあります。将来、これらの行を削除することにした場合は、両方の参照を到達不能にする必要があります。

```JavaScript
var elements = {
    button: document.getElementById('button'),
    image: document.getElementById('image'),
    text: document.getElementById('text')
};

function doStuff() {
    image.src = 'http://some.url/image';
    button.click();
    console.log(text.innerHTML);
    // Much more logic
}

function removeButton() {
    // The button is a direct child of body.
    document.body.removeChild(document.getElementById('button'));

    // At this point, we still have a reference to #button in the global
    // elements dictionary. In other words, the button element is still in
    // memory and cannot be collected by the GC.
}
```