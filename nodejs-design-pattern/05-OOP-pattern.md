# Applying Object Oriented Design Pattern

オブジェクト指向デザインパターンのNode.jsへの適用

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

