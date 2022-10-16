# Applying Object Oriented Design Pattern

オブジェクト指向デザインパターンのNode.jsへの適用

## 目次
[ファクトリ](#ファクトリ)
[公開コンストラクタ](#公開コンストラクタ)
[プロキシ](#プロキシ)
[デコレータ](#デコレータ)
[ミドルウェア](#ミドルウェア)
[](#)
[](#)
[](#)
[自習：ロギングの実装](#自習：ロギングの実装)


## ファクトリ

ファクトリを使うことでオブジェクトの生成を実装から分離できる。

1. `new`の代わりにファクトリ関数を使うことの柔軟性：

```JavaScript
function createImage(name) {
    return new Image(name);
};

const image = createImage("cat.png");

// 柔軟なファクトリ

function createImage(name) {
    if(name.match(/\.jpeg$/)) {
        return newJpegImage(name);
    }
    else if(name.match(/\.gif$/)) {
        return newGifImage(name);
    }
    else if(name.match(/\.png$/)) {
        return newPngImage(name);
    }
}
```

どう柔軟なのかというと、

- 後からの変更や追加が容易である。
- 既存のコードを壊すことがない。

2. アクセス制御を実現できる

JavaScriptにおいてアクセス制御子は存在しない。

JavaScriptにおいてアクセス制御を実現するにはクロージャを使うか関数スコープを用いるほかない。

`new`演算子で生成する場合だとプライベート変数を実現できないが、

上記の方法をとったファクトリ関数で生成するならば実現できる。

```JavaScript
// 通常のコンストラクタ関数
// 
// コンストラクタのプロパティとして登録するにはthisに登録するほかないが
const Person = function(name) {
    this.name = name;
};

// ファクトリ関数ならばそれをカプセル化することができる
const createPerson = function(name) {
    const privateProperties = {};

    const person = {
        setName: name => {
            if(!name) throw new Error("...");
            privateProperties.name = name;
        },
        getName: () => {
            return privateProperties.name;
        }
    };

    person.setName(name);
    return person;
};

// anotherPersonが取得したのはクロージャ関数なので
// そもそもnameプロパティを持たない
// よってnameは外部から隠されている
const anotherPerson = createPerson("Dave");
console.log(anotherPerson);
// {setName: ƒ setName(), getName: ƒ getName()}
```

テキストでは他にもプライベートを実現する方法が載っていた。

TypeScriptの`private`指定子は実際にはアクセスを制御していない、

TypeScriptコンパイラでコンパイルするときとIntelliscenseがエラーを出すだけで

生成されるjsコードは依然パブリックなままであることに注意。

#### 単純なコードプロファイラの作成

デバグモードとプロダクトモードで提供する機能を分けたい。

デバグモードではProfilerのインスタンスを、

プロダクトモードではProfilerの一部の機能を

提供するようにしたいとする。

どちらも`new`で実現する場合、

呼出す側かProfilerのどちらかに、これがプロダクトモードなのかデバグモードなのか

判断して提供する機能を変更するロジックを組む込まなくてはならない。

```JavaScript
"use strict";

class Profiler {
  constructor(label) {
    this.label = label;
    this.lastTime = null;
  }

  start() {
    this.lastTime = process.hrtime();
  }

  end() {
    const diff = process.hrtime(this.lastTime);
    console.log(
			//       `タイマー "${this.label}": ${diff[0]}秒+${diff[1]}ナノ秒`
      `Timer "${this.label}" took ${diff[0]} seconds and ${diff[1]} nanoseconds.`
    );
  }
}

let profiler;
if(process.env.NODE_ENV === 'development') {
    profiler = new Profiler(label);
}
else if(process.env.NODE_ENV === 'production') {
    return {
      start: function() {},
      end: function() {}
    }
};
```
ファクトリ関数を用意すれば呼出が一行で済むし自動で判断してくれる。

```JavaScript
module.exports = function(label) {
  if(process.env.NODE_ENV === 'development') {
    return new Profiler(label);        // ❶
  } else if(process.env.NODE_ENV === 'production') {
    return {             // ❷
      start: function() {},
      end: function() {}
    }
  } else {
    throw new Error('Must set NODE_ENV'); // NODE_ENVの設定が必要
  }
};

```

- 呼び出し側はファクトリ関数を呼び出すだけでいいので利用側は知らなくていい
- どんな条件下で必要なものを提供すべきかあとから追加したり変更できる

#### 合成可能ファクトリ関数

異なる性質のオブジェクト同士をクラス継承なしで合成させる方法。

> 複数のファクトリ関数から「合成」によって機能拡張されたファクトリ関数を新たに生成できるようなタイプのものです。

> 特に異なるオブジェクトから振舞やプロパティを継承するときに、複雑なクラス階層を構築しなくてもオブジェクトを生成できるので便利である。

npm モジュール stampitを使う。

https://stampit.js.org/api/quick-start

例：ゲームキャラクタの生成

```JavaScript
"use strict";

// キャラクタの原型で拡張可能なオブジェクト
const stampit = require('stampit');

const haveName = stampit()
  .props({
    name: 'anonymous'
  })
;

const haveCoordinates = stampit()
  .props({
    x: 0,
    y: 0
  })
;

const character = stampit(haveName, haveCoordinates)
  .props({
    lifePoints: 100
  })
;

const mover = stampit(haveName, haveCoordinates)
  .methods({
    move(xIncr, yIncr) {
      this.x += xIncr;
      this.y += yIncr;
      console.log(`${this.name} moved to [${this.x}, ${this.y}]`);
     // console.log(`${this.name}は[${this.x}, ${this.y}]に動いた`);
    }
  })
;

const slasher = stampit(haveName)
  .methods({
    slash(direction) {
      console.log(`${this.name} slashed to the ${direction}`);
     // console.log(`${this.name}は${direction}に切りつけた`);
    }
  })
;

const shooter = stampit()
  .props({
      bullets: 6
  })
  .methods({
    shoot(direction) {
      if (this.bullets > 0) {
        --this.bullets;
        console.log(`${this.name} shoot to the ${direction}`);
        // console.log(`${this.name}は${direction}へ撃った`);
      }
    }
  })
;

const runner = stampit(character, mover);
const samurai = stampit(character, mover, slasher);
const sniper = stampit(character, shooter);
const gunslinger = stampit(character, mover, shooter);
const westernSamurai = stampit(gunslinger, samurai);

const gojiro = westernSamurai();
gojiro.name = 'Gojiro Kiryu';
gojiro.move(1,0);
gojiro.slash('left');
gojiro.shoot('right');
// gojiro.slash('左');
// gojiro.shoot('右');
```

要はstampitという拡張可能な`.prop`と`.method`があり、それぞれに異なるオブジェクトを追加できる。



#### ファクトリ関数のまとめ

- `new`の代わりにファクトリ関数でインスタンスを提供するようにすれば後からの変更や追加が容易である。
- 利用側は条件によって必要なインスタンスを知らなくていい。
- ファクトリ関数がクロージャを使えばコンストラクタ関数では実現できないアクセス制御が可能になる。
- 合成ファクトリを使えば異なる性質のオブジェクト同士をクラス継承なしで合成できる

## 自習:JavaScriptのファクトリパターン

ファクトリパターンでは*ファクトリ関数*を使って新しいオブジェクトを生成することができる

ファクトリ関数とは`new`なしで新しいオブジェクトを返す関数のことである。


## 公開コンストラクタ

Revealing Constructor

Promise()コンストラクタのようなコンストラクタのこと。

コンストラクタのコードだけがresolveとrejectにアクセスすることができて、

一旦Promiseのオブジェクトが生成されてしまうと完全に受け渡し可能になる。

他のコードからはreject, resolveにアクセスすることはできない

```JavaScript
// Promiseコンストラクタは、
// Promise()に渡す関数にのみ公開されていて、
// resolve, rejectを操作できる
const generatePromise = () => {
  return new Promise((resolve, reject) => {
    // ...
    return resolve(/*...*/)
  })
};

// pからはresolve, rejectにアクセスできない
// (たとえgeneratePromiseがクロージャじゃなくても)
const p = genereatePromise();
```

#### 読み出し専用イベントエミッタ

コンストラクタへ渡す関数以外からはﾒｿｯﾄﾞemitを呼び出すことができない。

そんな例。

executorにのみ`emit`が公開されている:

```JavaScript
const EventEmitter = require('events');

module.exports = class Roee extends EventEmitter {
  constructor (executor) {
    super();
    const emit = this.emit.bind(this);
    this.emit = undefined;
    executor(emit);
  }
};
```

EventEmitterのemitメソッドはコンストラクタの内部変数のemitへ渡されて、

本来のemitはundefinedで削除した。

こうすることでexecutorにのみemitが使えるようになる。

tickerではそのemitにアクセスできる関数を与える

```JavaScript
const Roee = require('./roee');

const ticker = new Roee((emit) => {
  let tickCount = 0;
  setInterval(() => emit('tick', tickCount++), 1000);
});

module.exports = ticker;
```

```JavaScript
const ticker = require('./ticker');

ticker.on('tick', (tickCount) => console.log(tickCount, 'TICK'));
// ticker.emit('something', {}); <-- これは失敗する
// require('events').prototype.emit.call(ticker, 'someEvent', {}); <-- これが成功する
```

公開コンストラクタを使うことで、emitを非公開にすることができた。

NOTE: **executor以外からemitは呼び出せなくなる**

なので公開コンストラクタを使うと特定のメソッドの使用を制限することが可能になる。

一般的なユースケースは容易に思いつかない。

## プロキシ

プロキシとは、他のオブジェクト（サブジェクト）へのアクセスを制御するオブジェクトである。

プロキシとサブジェクトは同一のインタフェイスをもつ

利用する側から見ると両者は同一のインタフェイスを持つので完全に透過的。

プロキシはサブジェクトへのアクセスを傍受して前処理や後処理を追加可能で機能を拡張する。

#### 合成

合成とは、あるオブジェクトを他のオブ江jクトと組み合わせて機能を拡張する技法。

- サブジェクトと同じインタフェイスを持ったプロキシオブジェクトを新たに生成する
- サブジェクトへの参照はプロキシの内部に保存する
- サブジェクトは利用側から渡されるか、プロキシ内部で生成する

case1: NOTE: subjectにプロトタイプがあり、正しいプロトタイプチェーンを維持したいという場合

プロトタイプチェーンを継承する場合は、subjectがプロトタイプチェーンを使うことを前提にしているときにsubjectのプロキシを作りたいなら有用である。

```JavaScript
"use strict";

function createProxy(subject) {
  
  // Object.getPrototypeOf():
  // > 指定されたオブジェクト[[Prototype]]の値を返す。
  const proto = Object.getPrototypeOf(subject);

  function Proxy(subject) {
    this.subject = subject;
  }

  // Object.create():
  // > 指定されたプロトタイプオブジェクトとプロパティから、新しいオブジェクトを生成します。
  Proxy.prototype = Object.create(proto);

  //proxied method
  Proxy.prototype.hello = function(){
    return this.subject.hello() + ' world!';
  };

  //delegated method
  Proxy.prototype.goodbye = function(){
    return this.subject.goodbye
      .apply(this.subject, arguments);
  };

  return new Proxy(subject);
}

module.exports = createProxy;
```

case2: NOTE: プロトタイプチェーンなど継承を避ける場合

以下の場合ならreturnされるのはオブジェクトリテラルで継承は発生しない。

```JavaScript
function createProxy(subject) {
  return {
    hello: () => (subject.hello() + 'world!'),
    goodbye: () => (subject.goodbye.apply(subject, arguments))
  }
}
```

ユースケース２：オブジェクト拡張(モンキーパッチング)

サブジェクトのメソッドをプロキシ版で直接置き換えて修正してしまう方ほである

```JavaScript
function creareProxy(subject) {
  const helloOrig = subject.hello;
  subject.hello = () => (helloOrig.call(this) + 'world!');

  return subject;
}
```

NOTE: デメリットは本来のメソッドを直接修正してしまう点。

#### 合成とオブジェクト拡張の比較

合成：

- サブジェクトのもともとの振舞を変更しないので最も安全なプロキシの作成法である

- メソッドを一つだけプロキシで処理したい場合に、他のすべてのメソッドを手作業で委譲しなければならない点である。

オブジェクト拡張：

- サブジェクト自体を修正するので委譲に関する様々な面倒がなくなる

JavaScriptでプロキシを作成する最も現実的な手法である

サブジェクトの修正が問題にならない場面ならば大いに有用である。

#### ログ出力付きのストリームの作成

ストリームのwrite()への呼出をすべて傍受して、

呼出のたびにログに記録するようにする。

オブジェクト合成を使う。

```JavaScript
"use strict";

const fs = require('fs');

// stream.Writableのファクトリ関数
function createLoggingWritable(writableOrig) {
  const proto = Object.getPrototypeOf(writableOrig);

  function LoggingWritable(writableOrig) {
    this.writableOrig = writableOrig;
  }

  LoggingWritable.prototype = Object.create(proto);

  // write()のオーバーライド
  //
  LoggingWritable.prototype.write = function(chunk, encoding, callback) {
    if(!callback && typeof encoding === 'function') {
      callback = encoding;
      encoding = undefined;
    }
    console.log('Writing ', chunk);
    return this.writableOrig.write(chunk, encoding, function() {
      console.log('Finished writing ', chunk);
      callback && callback();
    });
  };

  // on(), end()は委譲される
  // 他必要なstream.Writableメソッドは委譲を明示しなくては使えないよ
  LoggingWritable.prototype.on = function() {
    return this.writableOrig.on
      .apply(this.writableOrig, arguments);
  };

  LoggingWritable.prototype.end = function() {
    return this.writableOrig.end
      .apply(this.writableOrig, arguments);
  };

  return new LoggingWritable(writableOrig);
}

// USAGE

const writable = fs.createWriteStream('test.txt');
const writableProxy = createLoggingWritable(writable);

writableProxy.write('First chunk');
writableProxy.write('Second chunk');
writable.write('This is not logged');
writableProxy.end();
```

そもそもstream.write()はその呼出のたびにconsole.log()させることはできない。

strea.write()のコールバック関数はwrite()の書き込みが完了したときに呼び出されるからだ。

このプロキシでは呼出されたときに必ずログをとる。

#### 現場でのプロキシ

> プロキシは「ミドルウェア」と呼ばれることもあります。ミドルウェアパターンの中に現れて、関数の入出力の前処理、後処理を可能にするからである。

TODO: 実践：何かプロキシ化してみる
TODO: 自作ストリームを例のようにミドルウェアをつけて拡張する


#### 実践

これはテキスト関係ない自主的なプロキシの実践である

@`web-scrape/components/fileSys`

TypeScriptに直すのに大変な労力を使うので、

.jsファイルを.tsファイルへインポートできるようにする。

問題は型エラーがすごく出そうなことか...

## デコレータ

> デコレータは既存のオブジェクトの振舞を動的に拡張する構造パターンです。

継承と異なり、振舞がすべてのクラスのオブジェクトに追加されるのではなく、

明示的にデコレートされるインスタンスにのみ適用される。

プロキシと異なるのは、

プロキシは既存のオブジェクトのインタフェイスを拡張したり就職したりするのに対して、

デコレータは新しい機能を追加する


```JavaScript
"use strict";

function decorate(component) {
  const proto = Object.getPrototypeOf(component);
  
  function Decorator(component) {
    this.component = component;
  }
  
  Decorator.prototype = Object.create(proto);
  
  //new method
  Decorator.prototype.greetings = function() {
    return 'Hi!';
  };
  
  //delegated method
  Decorator.prototype.hello = function() {
    return this.component.hello.apply(this.component, arguments); 
  };
  
  return new Decorator(component);
}

class Greeter {
  hello(subject) {
    return `Hello ${subject}`;
  }
}

const decoratedGreeter = decorate(new Greeter());
console.log(decoratedGreeter.hello('world')); // uses original method
console.log(decoratedGreeter.greetings()); // uses new method

```

ポイントは、

既存のオブジェクト(`Greeter`)のインタフェイスには`hello`しかないけど、

デコレータを使えば`greeting`という新しい機能を追加できた。

そこがプロキシと違うところ。

## アダプタ

> アダプタは本来のものと異なるインタフェイスを使ってオブジェクトへのアクセスを可能にするものである。

例：fs.readFile()とfs.writeFile()をdb.get()とdb.put()へ確実に変換できるようにする

fsのメソッドとIndexedDBのnpmパッケージLevelUPのデータベースメソッドとが変換可能にする。

つまり普段fs.writeFile()を利用するのと同じようにfs.writeFile()を使うだけで、

dbメソッドが自動的に実行されるようになる。

下記の例は、実際にはfsのメソッドをラップしているのではなくて

要は同じ名前のモジュールを作成している。

- createFsAdapter()は最終的にローカル変数`fs`を返す
- createFsAdaptor()内部で模倣したいfsのメソッドを定義する
- 模倣メソッドは自身の中でfsと同様にふるまう（返すエラーとか）

```JavaScript
"use strict";

const path = require('path');

module.exports = function createFsAdapter(db) {
  const fs = {};

  fs.readFile = (filename, options, callback) => {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    } else if(typeof options === 'string') {
      options = {encoding: options};
    }

    db.get(path.resolve(filename), {         //[1]
        valueEncoding: options.encoding
      },
      (err, value) => {
        if(err) {
          if(err.type === 'NotFoundError') {       //[2]
            err = new Error(`ENOENT, open "${filename}"`);
            err.code = 'ENOENT';
            err.errno = 34;
            err.path = filename;
          }
          return callback && callback(err);
        }
        callback && callback(null, value);       //[3]
      }
    );
  };

  fs.writeFile = (filename, contents, options, callback) => {
    if(typeof options === 'function') {
      callback = options;
      options = {};
    } else if(typeof options === 'string') {
      options = {encoding: options};
    }

    db.put(path.resolve(filename), contents, {
      valueEncoding: options.encoding
    }, callback);
  };

  return fs;
};

//  USAGE

const levelup = require('level');
const fsAdapter = require('./fsAdapter');

const db = levelup('./fsDB', {valueEncoding: 'binary'});
const fs = fsAdapter(db);

fs.writeFile('file.txt', 'Hello!', () => {
  fs.readFile('file.txt', {encoding: 'utf8'}, (err, res) => {
    console.log(res);
  });
});

//try to read a missing file
fs.readFile('missing.txt', {encoding: 'utf8'}, (err, res) => {
  console.log(err);
});
```

つまり結局は同じ名前のメソッドを勝手に定義して使っているだけ。

とはいえ直感的にわかりやすいので

アダプタする価値はある。

#### アダプタを使いそうな場面

ブラウザはfsがない。

ブラウザなので。

しかし

アダプタを適切に定義できれば

fsを使うアプリケーションをブラウザ内で実行することができるようになるのである。


## ミドルウェア

パターンとしてのミドルウェア

主要なロジックにサポート機能を提供する

0mqを理解する大前提でソケットがわからん。

## まとめ

プロキシは、オブジェクトの既存のインタフェイスを拡張または修飾したりする

デコレータは、オブジェクトに新しい機能を追加する。

プロキシやデコレータのメリットはいちいち既存のクラスを拡張する必要がないことである。

アダプタは異なるオブジェクトのインタフェイス同士を変換可能にしてアクセスできるようにするものである。

## 自習：ロギングの実装

いろんな関数の実行内容を記録する方法をまとめたい

#### プロキシのオブジェクト合成で

テキスト6.3.3の内容

