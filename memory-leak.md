# Memory leak in JavaScript

JavaScript でもメモリリークは起こるよという話。

どう起こるのかとどう防ぐのかをまとめる。

TODO: TIL へ追加のこと。

## 目次

[参照と参照カウント](#参照と参照カウント)
[循環参照：参照カウントの限界](#循環参照：参照カウントの限界)
[Mark & Sweep](#Mark-&-Sweep)
[オブジェクトは明示的に到達不能にする必要がある](#オブジェクトは明示的に到達不能にする必要がある)
[４つの JavaScript 共通のメモリリーク](#４つの-JavaScript-共通のメモリリーク)
[オブザーバと循環参照についての備考](#オブザーバと循環参照についての備考)
[Chrome Devtools でメモリ監視](#Chrome-Devtools-でメモリ監視)

## MDN におけるメモリリークの記事

https://developer.mozilla.org/ja/docs/Web/JavaScript/Memory_Management

ガベージコレクションが、割り当てられたメモリがもはや不要であると判断するのは不可能で、GC ができるのはそれに近いことをするということである。

なので開発者は、メモリの開放において GC の限界を見極めて GC に任せられるか開発者が明示的に開放すべきかを判断できないといけない。

GC がもつその「近似的な」アルゴリズムは２つある。参照カウントと Mark & Sweeep アルゴリズムである。

#### 参照と参照カウント

参照：

参照とは、あるオブジェクトが別のオブジェクトにアクセスできるとき、**前者が後者を参照している**という。

ここでいうオブジェクトは通常の JavaScript オブジェクトだけじゃなくて、関数のスコープ、グローバル歴史家るスコープを含む。

ある変数がオブジェクトにアクセスできるならそれは参照しているといえる。

ある変数がプリミティブを指しているなら別に参照はしていない。のかな。

> (あるオブジェクトがどこからも参照されていないの判断基準は)　**"あるオブジェクトがその他のオブジェクトから参照されていない"こと**と定義します。あるオブジェクトは、それに対する参照がゼロの時にガベージコレクト可能であると見なされます。

つまり、「参照されている」側がそのまま参照されているとそのメモリが解放されなくて、

参照している側は原因になっている、ということ。

つまりメモリ解放の操作は主に参照している側に対して行われて、参照されている側へ操作は行わない...という意味のはず。

参照カウント：

参照されている対象を参照しているものの数。下記のコードを見た方が早い。

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
//   自分自身を指すプロパティをもつことで循環参照が発生してしまっている
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

**グローバル変数である限り GC はそれを収集することはできない。**

なので、グローバル変数を使って大量の巨大なデータを一時的に保存しておこうと考えて使うような場合、

非常に注意にしなくてはならない。

こうしたデータは、用が済んだ場合に、

- null を割り当てる
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

**`setInterval()`はアクティブである限り、(GC は)ハンドラを回収することはできない。**

ハンドラが GC できないなら、ハンドラの依存関係も GC できない。ようである。

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

DOM 要素もリスナも不要になったらここまですれば安心というわけですな。

- DOM ツリー上に要らない要素があれば消すこと。

- そのリスナも消すこと。

##### オブザーバと循環参照についての備考

> かつてオブザーバと循環参照は、JavaScript 開発者の悩みの種でした。これは Internet Explorer のガベージコレクタのバグ（あるいは設計上の判断）によるものでした。古いバージョンの Internet Explorer では、DOM ノードと JavaScript コード間の循環参照を検出することができませんでした。これはオブザーバーの典型的な例で、通常オブザーバーは（上記の例のように）observable への参照を保持します。言い換えれば、Internet Explorer でノードに observer が追加されるたびに、リークが発生していたのです。これが、開発者がノードの前にあるハンドラを明示的に削除したり、オブザーバ内の参照を null にしたりするようになった理由です。現在では、モダンブラウザ（Internet Explorer や Microsoft Edge を含む）は、これらのサイクルを検出し、正しく処理することができる最新のガベージコレクションアルゴリズムを使用しています。つまり、ノードを到達不能にする前に removeEventListener を呼び出すことは、厳密には必要ではありません。

> jQuery のようなフレームワークやライブラリは、ノードを破棄する前にリスナーを削除します（そのための特定の API を使用する場合）。これはライブラリによって内部的に処理され、古い Internet Explorer のような問題のあるブラウザの下で実行されても、リークが発生しないことを確認します。

3. DOM の参照外

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

DOM ツリー上では、子要素は親要素を参照する。

例えばテーブル要素とせる要素があるとしてセルはテーブルの子要素とする。

将来テーブル要素を削除するけどせる要素への参照は保持するとする。

そのときの GC の挙動は、テーブルもセルも GC しないである。

理由は子要素のセル要素が親要素への参照を持つために、

テーブル要素は参照が切れていないからである。

DOM 要素は内部的に親要素を参照するので、ただ削除するだけだと GC されない場合があるので注意。

4. closures

**同じ親関数の中で生成された複数のクロージャは、クロージャ同士スコープを共有する**

> The important thing is that once a scope is created for closures that are in the same parent scope, that scope is shared.

```JavaScript
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  var unused = function () {
    if (originalThing)
      console.log("hi");
  };
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
};
setInterval(replaceThing, 1000);
```

`replaceThing`が呼び出されるたびに、`theThing`は巨大な配列とクロージャを抱えることになる。

同時に`unused`は`originalThing`を内に抱えるクロージャとして生成される。

つまり、

unused はまったく使われるはずがないクロージャなのに、someMethod とスコープが共有されているから、

originalThing が常にアクティブになってしまう。(つまり GC されない)

ちょっとまだぴんと来ない。

more details explained:

https://blog.meteor.com/an-interesting-kind-of-javascript-memory-leak-8b47d2e7f156

> JavaScript はひそかに関数型プログラミング言語であり、その関数はクロージャーです。関数オブジェクトは、そのスコープが終了した場合でも、それを囲むスコープで定義された変数にアクセスできます。クロージャによってキャプチャされたローカル変数は、それらが定義されている関数が終了するとガベージ コレクションされ、スコープ内で定義されたすべての関数自体が GC されます。

```JavaScript
// example 1
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  theThing = {
    longStr: new Array(1000000).join('*')
  };
};
setInterval(replaceThing, 1000);
```

毎秒 replaceThing()が実行されると、thiThing を新しく動的確保された巨大な文字列に置き換えて、ローカル変数の originalThing へそれを保存する。

しかし、replaceThing()が返されたら、グローバル変数の theThing の古い値は GC されるので、

メモリの使用率は一定に収まる。

しかし、もしもクロージャが replaceTHing を「長持ち」させたらどうなる？

```JavaScript
// example 2
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
};
setInterval(replaceThing, 1000);
```

someMethod は originalThing への参照を持つ。クロージャだから。

originalThing は毎秒呼び出されるたびに theThing を与えられて、そうして someMethod というクロージャが生成される。

クロージャは親関数のスコープを維持するから、

クロージャが生成される ーー＞　親関数のスコープがクロージャごとに新たに生成される ーー＞　クロージャの数だけ親関数スコープの変数だけメモリが食われる

という仕組みになる。

今回特別なのは、originalThing に巨大な配列がわたされるから、originalThing がクロージャに参照され、クロージャの数だけ巨大な配列がメモリに展開されてしまうのである。

幸い、モダンな JavaScript は上記の場合、originalTHing が使われていないと判断できるから GC 可能らしい。（どういう仕組みだ？）

で、先のコードに戻る

```JavaScript
// example 3
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  var unused = function () {
    if (originalThing)
      console.log("hi");
  };
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
};
setInterval(replaceThing, 1000);
```

これだと GC できずに毎秒大量のメモリが食われる。

先の状況と何が違うんだい？

> したがって、コードが originalThing を再び参照する方法はありませんが、ガベージ コレクションは行われません。なんで？クロージャーを実装する典型的な方法は、すべての関数オブジェクトがそのレキシカルスコープを表す辞書スタイルのオブジェクトへのリンクを持つことです。 replaceThing 内で定義された両方の関数が実際に originalThing を使用した場合、originalThing が何度も割り当てられたとしても、両方の関数が同じオブジェクトを取得することが重要になるため、両方の関数が同じ字句環境を共有します。

> 現在、Chrome の V8 JavaScript エンジンは、変数がクロージャーによって使用されていない場合、レキシカル環境から変数を除外するのに十分スマートであるようです。これが、最初の例がリークしない理由です。

> しかし、変数がいずれかのクロージャーによって使用されるとすぐに、そのスコープ内のすべてのクロージャーによって共有されるレキシカル環境に行き着きます。そして、それはメモリリークにつながる可能性があります.

つまり、

- クロージャを生成する関数(つまり親関数)内の変数のうち、クロージャから参照されない変数はスコープアウトしたら GC 対象になる。

- しかし、クロージャから明示的に参照される変数ならばそれは GC されない。

- そして、その変数は、同じ親関数から生成されたクロージャ同士で共有されるのである。

解決策:

```JavaScript
// example 3
var theThing = null;
var replaceThing = function () {
  var originalThing = theThing;
  var unused = function () {
    if (originalThing)
      console.log("hi");
  };
  theThing = {
    longStr: new Array(1000000).join('*'),
    someMethod: function () {
      console.log(someMessage);
    }
  };
  // NOTE: ここでnullすると解決
  originalThing = null;
};
setInterval(replaceThing, 1000);
```

解決策はこのクロージャ親関数の replaceThing()の終りの方で originalThing = null することです。

こうすることで、依然 originalThing が someMethod のレキシカルスコープにいても、

最早巨大な配列への参照を持たないでいられる。

ほんまか？

確認してみよう。

TODO: 要確認。devtools のメモリリーク確認方法。

https://developer.chrome.com/docs/devtools/memory-problems/

> 要約すると、いくつかのクロージャーで使用されているが、使用し続ける必要があるクロージャーでは使用されていない大きなオブジェクトがある場合は、使用が終了したら、ローカル変数がそのオブジェクトを指していないことを確認してください。残念ながら、これらのバグは非常に微妙な場合があります。 JavaScript エンジンについて考える必要がなければ、はるかに良いでしょう。

## Chrome Devtools でメモリ監視

https://developer.chrome.com/docs/devtools/memory-problems/

##### メモリの膨張：どの位が「多すぎる」の？

使用する端末のスペックの違いなどあれど、（メモリリークについて調査したいアプリケーションを）展開する主なターゲット端末で調べてみるといい。

そこでのパフォーマンスが悪ければそれは「多すぎる」。

##### chorme task manager から

chrome のメニュー>その他のツール>タスクマネージャからタスクマネージャを開いて、

右クリックして JavaScript memory を有効にすると

JS が占有しているメモリを表示してくれる。

もしもここの値が「増え続け」ていたら、それはメモリリークを起こしているかも。

###### devtools の timeline recordings で

タイムラインパネルは調査するページのメモリ状況を視覚化するのに役立ちます。

- 調査したいページを開く
- そのページで Devtools のパフォーマンス>Timeline パネルを開く
- Memory のチェックボックスをチェックする
- Record の ● しるしをクリックする

推奨：ゴミ箱マークは GC のことで、記録中に GC ボタンをクリックすると強制的に GC するらしい。

##### 検証

JavaScript において 1 文字は常に 2byte とのこと

https://stackoverflow.com/a/46735247

これを 100 万個にした配列なので、

2 \* 1000000 = 2MB

毎秒 2mb 増えるはずで、10 回繰り返すから 20mb 増えるはず。

実行前：

- JavaScript メモリ：3676kb
- Heap snapshot:

実行後：

- JavaScript メモリ：3676kb は？
