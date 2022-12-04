# JavaScript Tips

開発中に経験したことをかたっぱしから走り書き。

## 目次

[for...in vs for...of](#for...in-vs-for...of)

[`[].slice.call()`](#`[].slice.call()`)

[`!!`の意味](#`!!`の意味)

[Promiseとasync/awaitの変換](#Promiseとasync/awaitの変換)

[Singleton](#Singleton)

[Deep dive into Promise chain](#Deep dive into Promise chain)

[配列の中には他の配列の何かが含まれているのか検査する](#配列の中には他の配列の何かが含まれているのか検査する)

[Promiseチェーンで任意の場所でエラーハンドリング](#Promiseチェーンで任意の場所でエラーハンドリング)

[Promiseチェーン](#Promiseチェーン)

[promise 入れ子](#promise 入れ子)

[逐次処理](#逐次処理)


## for...in vs for...of

for...of: 反復可能オブジェクトに対して反復的な処理を行うループを作成

for...in: 列挙可能プロパティすべてに対して継承された列挙可能プロパティも含めて反復処理を行う

ということで、

for...inはオブジェクトの中のプロパティ一つ一つを順番に取り出すのに使う。

for...ofは配列や反復可能オブジェクトに対して一つ一つを順番に取り出すのに使う。

## `[].slice.call()`

https://stackoverflow.com/questions/2125714/explanation-of-slice-call-in-javascript

https://stackoverflow.com/a/2125746

例：

```TypeScript
// 最終的にURLからなる配列を返すことになる関数
export function getPageLinks(currentUrl: string, body: any): string[] {
    return [].slice.call(Cheerio.load(body)('a'))
        .map(element => getLinkUrl(currentUrl, element))
        .filter(element => !!element)
    ;
};
```

- `['ant', 'bison', 'camel', 'duck', 'elephant'].slice()`

これは`Array ["ant", "bison", "camel", "duck", "elephant"]`を返す

- 配列上オブジェクト

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#%E9%85%8D%E5%88%97%E7%8A%B6%E3%82%AA%E3%83%96%E3%82%B8%E3%82%A7%E3%82%AF%E3%83%88

```JavaScript
function list() {
  return Array.prototype.slice.call(arguments)
}

let list1 = list(1, 2, 3) // [1, 2, 3]
```

つまり、slice()メソッドの拡張である。

`[].slice.call(...)`は`Array.prototype.slice.call(...)`と同じらしい。

`[]`はプロトタイプのsliceにアクセスするためのアクセスキーみたいなもの。

`[].slice`は関数オブジェクトを返す。

で、その関数をcall()しているので、その関数を呼び出しているということになる。

つまり、

```JavaScript
const list = [].slice().call(arguments);

list(Cheerio.load(body)('a'));
```

と同じである。

argumentsが、複数の要素を返す関数の場合、その要素分だけ拡張sliceが要素を配列へ返す。



## `!!`の意味

https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript

https://stackoverflow.com/questions/29312123/how-does-the-double-exclamation-work-in-javascript


`arr.filter(element => !!element)`でfalthy(null, undefined, 0などのこと)を取り除く常套手段らしい。

`arr.filter(val => val)`でも同じことができるらしい。(確認してない）

## map().filter() chain

map()はコールバック内で定義する条件に一致しない要素は返さないのではなくて、undefinedを返す。

なのでmap()を使った後はfilterでfalthyを排除する機能を追加してフィルタリングする場面が多い。

`[...].map(/* get element you want */).filter(/* filter not to return falthy*/)`

## Promiseとasync/awaitの変換

基本: async関数の戻り値は暗黙的にPromiseにラップされる。

```JavaScript
async function bar() {
  return 11;
}

// Very similar to next function

function bar() {
  return Promise.resolve(1);
}
```

上記の例は同期的な呼び出しになる。

async関数ではawait式が呼び出されるまで同期的に実行される。

なので、await式のない非同期関数は同期的に実行されるのである。

ということで、非同期に実行するには次の通りにする。

```JavaScript
// returnしていないので戻り値は暗黙的にundefinedをラップしたPromiseになる
async function foo() {
  await 1;
};

// Equal to next function.

function foo() {
  return Promise.resolve(1).then(() => undefined);
};
```

Promiseへの変換を見ての通り、

await式の後のコードは`.then`コールバックの中に存在すると考えていい。

await式を含むasync関数のチェーン：

```JavaScript
async function task1() {
  await Promise.solve("task 1 is done");
}
async function task2() {
  await Promise.solve("task 2 is done");
}
async function task3() {
  await Promise.solve("task 3 is done");
}


const t1 = task1();
const t2 = task2();
const t3 = task3();

const tasks = [t1, t2, t3];
let promise = Promise.resolve();
tasks.forEach(task => {
  promise = promise.then(() => return task());
});

await promise.then(() => console.log('done'));
```

## Singleton

モジュールを使うなら簡単に実装できる...のか？

例：

```JavaScript
// Profiler.ts

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

例ではclass `Profiler`はグローバルではない。

module.exportsに登録されているのはNODE_ENVの設定値によって返す値を変更する無名関数しか公開されていない。

なのでimport/exportを使ってファイルを取り込むようなときは、

exportするもの以外はプライベートである。

```TypeScript
 import type puppeteer from 'puppeteer';

 let isInstantiated: boolean = false;

 export class RequestInterceptor {
     private cbList: ((event: puppeteer.HTTPRequest) => void)[];
     constructor(private page: puppeteer.Page){
         // Force number of instance to only one. 
         if(isInstantiated)
            throw new Error("RequestInterceptor instance is already exists.");
         else isInstantiated = true;

         this.cbList = [];
         this.run = this.run.bind(this);
         this.on = this.on.bind(this);
         this.off = this.off.bind(this);
         this.removeAll = this.removeAll.bind(this);
     };

     static createInstance(page: puppeteer.Page) {
      return new RequestInterceptor(page);
     }
 
     /***
      * Call setRequestInterception to set true.
      * And add request event handler to not stall requests.
      * 
      * TODO: Encapsul this method.
      * */ 
     async run(): Promise<void> {
         await this.page.setRequestInterception(true);
         this.page.on("request", (r) => {
             if(r.isInterceptResolutionHandled())return;
             r.continue();
         });
     };
 
     /***
      * Add request event handler.
      * 
      * NOTE: DO NOT PASS ANONYMOUS FUNCTION
      * 
      * cb must include
      * `if(event.isInterceptResolutionHandled())return;`
      * */ 
     on(cb: (event: puppeteer.HTTPRequest) => void): void {
         this.page.on("request", cb);
         this.cbList.push(cb);
     };
 
     /***
      * Remove request event handler.
      * 
      * */   
     off(cb: (event: puppeteer.HTTPRequest) => void): void {
         this.page.off("request", cb);
         // TODO: remove specified cb from listener
         this.cbList = this.cbList.filter(registeredCb => registeredCb !== cb);
     };
 
     /***
      * Remove all request event handler.
      * 
      * */
     removeAll():void {
      this.cbList.forEach(cb => {
         this.page.off("request", cb);
      });
      this.cbList = [];
     }
 };

```

## Deep dive into Promise chain

#### Async 関数はPromiseを返す

https://stackoverflow.com/a/35302535

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function

> (async関数の戻り値は) Promise で、非同期関数から返される値で解決するか、または非同期関数内で捕捉されなかった例外で拒否されます。

以下は完全に有効である

```JavaScript
async function increment(num) {
  return num + 1;
}
// Logs: 4
increment(3).then(num => console.log(num));
```

上記は以下のように書き直すことができる

```JavaScript
function increment(num) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {resolve(num + 1);});
  })
};
```

ということでasync関数はPromiseを返す。

#### throw vs. reject

https://qiita.com/legokichi/items/b14bf7dbb0cf041955d6

https://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw



## 配列の中には他の配列の何かが含まれているのか検査する

たとえばこういうこと

```JavaScript
const expected = ["foo", "bar"];
const target = ["goo", "boo", "rah", "bee", "foo"];
```
- targetにはexpectedの要素のうち少なくとも一つでも含まれているかどうか
- targetはexpectedの要素のうち一つも含まれていないかどうか
- targetはexpectedの要素のうちすべての要素を含んでいるかどうか


上記の検査を実現したい。

#### 参考

1. 配列の中に特定の値が含まれているかどうか

https://stackoverflow.com/questions/237104/how-do-i-check-if-an-array-includes-a-value-in-javascript

https://stackoverflow.com/questions/12623272/how-to-check-if-a-string-array-contains-one-string-in-javascript

> `Array.prototype.includes()`か`Array.prototype.indexOf()`を使え

2. 配列の中には、他の配列の値のうち、すくなくともが一つ含まれているか（ひとつも含まれていないか）

https://stackoverflow.com/questions/16312528/check-if-an-array-contains-any-element-of-another-array-in-javascript

https://stackoverflow.com/questions/37428338/check-if-a-string-contains-any-element-of-an-array-in-javascript

> `Array.prototype.some()`と`Array.prototype.include()`(`Array.prototype.indexOf()`)の組み合わせを使え

3. ある配列は、他の配列のすべての要素が含まれているのかどうか

https://stackoverflow.com/questions/53606337/check-if-array-contains-all-elements-of-another-array

> `Array.prototype.every()`と`Array.prototype.include()`(`Array.prototype.indexOf()`)の組み合わせを使え

#### ある配列には他の配列要素のうち少なくとも一つは含まれているかどうか

`Array.prototype.some()`と`Array.prototype.include()`(`Array.prototype.indexOf()`)の組み合わせを使え

some()は与えられた配列の要素のうちひとつでもテスト関数を合格したらtrueを返す。

```JavaScript
// 以下の配列要素を含むのか調べる
const expectedStrings = ["foo", "bar"];
// 検査対象3パターン
const target = ["goo", "boo", "rah", "bee", "foo"];
const target2 = ["goo", "boo", "rah", "bee", "Moo"];
const target3 = ["goo", "boo", "rah", "bee", "bar"];

// テスト関数
const checkIncludes = (element) => expectedStrings.includes(element);

// 実施結果
console.log(target.some(checkIncludes));    // true
console.log(target2.some(checkIncludes));   // false
console.log(target3.some(checkIncludes));   // true

// 同様に...
const expectedCommands = ["byKeyword", "fromBookmark"];
const correctArgvUnderscore = ["collect", "byKeyword"];
const incorrectArgvUnderscore = ["collect", "byKeywordd"];

const isCommandIncludesSubcommand = (c) => expectedCommands.includes(c);

console.log(correctArgvUnderscore.some(isCommandIncludesSubcommand));   // true
console.log(incorrectArgvUnderscore.some(isCommandIncludesSubcommand)); // false
```
このように少なくとも一つでも含めばtrueなのでfalseが帰ってきたら一つも含まないということになる。

#### ある配列は他の配列のすべての要素が含まれているか

```JavaScript
let array1 = [1,2,3],
    array2 = [1,2,3,4],
    array3 = [1,2];

let checker = (arr, target) => target.every(v => arr.includes(v));

console.log(checker(array2, array1));  // true
console.log(checker(array3, array1));  // false
```

#### まとめ

```JavaScript
const expected = ["byKeyword", "fromBookmark"];
const target = ["Check", "if", "array", "contains", "all", "elements"];
const target2 = ["Check", "if", "array", "contains", "byKeyword", "fromBookmark"];
const target3 = ["Check", "if", "array", "contains", "byKeyword"];

// target配列のうちexpect配列の要素が少なくとも一つは含まれかどうか
// true: 少なくとも一つは含む
// false: ひとつも含まない
const isIncludesAtLeastOne = (expect, target) => {
    return expect.some(e => target.includes(e));
};

// target配列はexpect配列をすべて含むかどうか
// true: すべて含む
// false: 少なくとも一つ欠けている
const isIncludesAllOf = (expect, target) => {
    return expect.every(e => target.includes(e));
};

console.log(isIncludesAtLeastOne(expected, target));    // false
console.log(isIncludesAtLeastOne(expected, target2));   // true
console.log(isIncludesAtLeastOne(expected, target3));   // true

console.log(isIncludesAllOf(expected, target));     // false
console.log(isIncludesAllOf(expected, target2));    // true
console.log(isIncludesAllOf(expected, target3));    // false
```


## Promiseチェーン

いろいろいじってプロミスチェーンを理解する。

#### 結論

- then()ハンドラは同期関数であること。

  `promise.then(() => functionReturnsPromise())`は有効である。
  `promise.then(() => {functionReturnsPromise();})`は無効である。
  つまりreturnで非同期関数を返すかPromiseを返すならばよし。
  内部でただ非同期処理をするのはなしである。

- `promise.then(() => async関数)`は可能。

    async関数の処理が完了してから次のプロミスチェーンに移る。

- `promise.then(() => 非同期関数)`は正しいが、`promise.then(() => {非同期関数()})`は正しくない。

    `promise.then(() => 非同期関数)`の非同期関数がエラーをthrowしても補足されない。
    `promise.then(同期関数)`の同期関数がエラーをthrowしたら補足される。
    `promise.then(() => 非同期関数)`の非同期関数がreject()したら補足される。

- then()のなかではpromiseを返すようにすること、またはthen()のハンドラは同期関数であること。

- Promiseの入れ子をすると、入れ子のエラーは外側のPromiseチェーンのエラーハンドラで補足できるけど、内側のPromiseチェーンは外側のPromiseチェーンを補足できない

- then()を呼出した時点でそのプロミスは実行されている

  なのでひとまずPromiseチェーンを定義しておいて好きな時に呼び出し
  呼出した時点でPromiseチェーンが実行されてほしくて、それまで何もしないでほしい
  そんな場合、
  Promiseチェーンは何かしらの関数でラップされておかなくてはならない。
  そうでない場合、
  Promiseチェーンはすぐさまイベントキューへ登録される。

```TypeScript
  // return 非同期関数
  const async1 = () => {
    console.log("async1: invoked");
    return setTimeout(function() {
        console.log("async1: wait 5 sec.");
    }, 5000);
  };

  // 非同期関数が完了してからreturn Promise.resolve();
  const async2 = () => {
    console.log("async2: invoked");
    setTimeout(function() {
        console.log("async2: wait 8 sec.");
        return Promise.resolve();
    }, 8000);
  };

  // ただの同期関数
  const sync1 = () => {
    console.log("sync1: invoked.");
    console.log("sync1: no wait.");
    for(let i = 0; i < 1000; i++) {
      console.log(i);
    }
  };

  // async1と同様
  const async2 = () => {
    console.log("async2 invoked.");
    return setTimeout(function() {
        console.log("async2: wait for 12 sec");
    }, 12000);
  };

let promise = Promise.resolve();

[async1, async2, sync1, async2].forEach(f => {
    promise = promise.then(() => f());
});

promise.then(() => {
    console.log("done");
});
```
結果:

```bash
$ node ./dist/index.js
async1: invoked
async2: invoked
sync1: invoked.
sync1: no wait.
async2 invoked.
done
async1: wait 5 sec.   # 実行してから5秒
async2: wait 8 sec.   # 同様に
async2: wait for 12 sec　# 同様に
```

ここからわかるのは、

- then()はそのコールバックを同期的に呼び出している。
then()のコールバックの内容が非同期関数ならばそれらは非同期に処理される。

- then()のコールバック関数が非同期的に`return Promise.resolve()`しても関係なく同期的に次の処理へ移っている。
なので非同期処理は単純にイベントループのキューへ登録されて処理は同期部分へさっさと戻ってくるようだ。
then()のなかで非同期処理を完了させてから次のthen()へ移動させたいときは、別のアプローチをとる必要があるようだ。

1. then()のコールバック同期関数をブロックしてみる

```TypeScript
const sync1 = () => {
  console.log("sync1: invoked.");
  // 
  // blocking: 2万ループするまで次に行かなくなるのか検証
  // 
  for(let i = 0; i < 20000; i++) {
      console.log(i);
    }
};
```
結果：

```bash
$ node ./dist/index.js
async1: invoked
async2: invoked
sync1: invoked.
0
1
2

# 省略...

19984
19985
19986
19987
19988
19989
19990
19991
19992
19993
19994
19995
19996
19997
19998
19999
async2 invoked.
done
async1: wait 5 sec.
async2: wait 8 sec.
async2: wait for 12 sec
```

then()の中身の同期処理が長いとプロミスチェーンの以降の部分の呼び出しがブロックされる。
sync1のループが終了しない限りasync2は呼び出されていないことがわかる。

なのでプロミスチェーンに同期関数を含めることは可能だが、常にブロッキング発生することには注意しなくてはならない。


1. 非同期処理が完了してから次のthen()へ移動させる

初めの方で、非同期処理はイベントループへさっさと登録されて同期処理へすぐ戻ってくることが分かった。

では非同期処理の完了を待ってから次のthen()へ移動するようにさせたいときはどうすべきか。

```TypeScript
/************************************************************
 * 
 * Implememt Command Interpreter 
 * **********************************************************/ 

  const async1 = () => {
    console.log("async1: invoked");
    return setTimeout(function() {
        console.log("async1: wait 5 sec.");
    }, 5000);
  };

  // 明示的にPromiseがresolve()を返すようにした
  const async2 = (): Promise<void> => {
    console.log("async2: invoked");
    return new Promise((resolve, reject) => {
        setTimeout(function() {
            console.log("async2: wait for 8 sec.");
            return resolve();
        }, 8000);
    });
  }

  const sync1 = () => {
    console.log("sync1: invoked.");
  };

  const async3 = () => {
    console.log("async3 invoked.");
    return setTimeout(function() {
        console.log("async3: wait for 12 sec");
    }, 12000);
  };

let promise = Promise.resolve();

[async1, async2, sync1, async3].forEach(f => {
    promise = promise.then(() => f());
});

promise.then(() => {
    console.log("done");
});
```

結果：

```bash
$ node ./dist/index.js
async1: invoked
async2: invoked
async1: wait 5 sec.
async2: wait for 8 sec.
sync1: invoked.
async3 invoked.
done
async3: wait for 12 sec
```

async2のsetTimeoutが完了してから次のsync1のthen()が呼び出されていることがわかる。

つまり明示的にPromiseがresolve()を返せばthen()の完了のタイミングを施御することはできる。

3. then()がasync関数(内容は同期処理)を返す場合

async関数は暗黙的にPromiseを返すので、その処理内容は非同期として登録されるはず...

```TypeScript
  const async1 = () => {
    console.log("async1: invoked");
    return setTimeout(function() {
        console.log("async1: wait 5 sec.");
    }, 5000);
  };

  const async2 = async (): Promise<void> => {
    console.log("async2: invoked.");
    for(let i = 1; i < 40000; i++) {
      console.log(i);
    };
    console.log("async2: done.");
  }

  const sync1 = () => {
    console.log("sync1: invoked.");
  };

  const async3 = () => {
    console.log("async3 invoked.");
    return setTimeout(function() {
        console.log("async3: wait for 12 sec");
    }, 12000);
  };

let promise = Promise.resolve();

// [async1, async2, sync1, async3].forEach(f => {
//     promise = promise.then(() => f());
// });

// promise.then(() => {
//     console.log("done");
// });
```
結果：

```bash
async1: invoked
async2: invoked.
0
1
2
# 中略...
39998
39999
async2: done.
sync1: invoked.
async3 invoked.
done
async1: wait 5 sec.
async3: wait for 12 sec
```

同期的に処理された。これはMDNの次の記述からそういうものであるとわかる。

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Statements/async_function

> 非同期関数の本体は、 await 式で分割されていると考えることができます。最上位のコードは、 (ある場合) 最初の await 式まで、それを含めて同期的に実行されます。したがって、await 式のない非同期関数は同期的に実行されます。しかし、関数本体の中に await 式がある場合、非同期関数は常に非同期に完了します。

ということでasync関数の中身が完全に同期処理であるならばそれは同期関数として扱う

4. then()がasync関数（内容は非同期処理）を返すとき

結論：**then()がasync関数を返すとawait呼出の非同期処理を含むとしてもその完了を待つ（同期的に解決される）**

async関数が内部でawaitで非同期関数を呼び出す。

```TypeScript
const timer = (msg: string, time: number): Promise<void> => {
  return new Promise((resolve, rejct) => {
    setTimeout(function() {
      console.log(msg);
      resolve();
    }, time);
  })
};

const async1 = async () => {
  console.log("async1: invoked");
  await timer("async1: wait 5 sec.", 5000);
};


const async2 = async () => {
  console.log("async2: invoked");
  await timer("async2: wait 10 sec.", 10000);
};


const async3 = async () => {
  console.log("async3: invoked");
  await timer("async3: wait 15 sec.", 15000);
};


const sync1 = () => {
  console.log("sync1: invoked.");
};


let promise = Promise.resolve();

[async1, async2, sync1, async3].forEach(f => {
    promise = promise.then(() => f());
});

promise.then(() => {
    console.log("done");
});
```

結果：

```bash
async1: invoked 
async1: wait 5 sec.   # wait for 5 sec.
async2: invoked   # Immediately
async2: wait 10 sec. # wait for 10 sec.
sync1: invoked. # Immediately
async3: invoked # Immediately
async3: wait 15 sec. # wait for 15 sec.
done 
```

まとめ：

async関数がthen()から返されるとき、そのasync関数が内部でawaitで非同期処理を呼び出していても、
then()はその完了を待つ。

次の変更を施してもそれ等が守られているのがわかる

```TypeScript
const timer = (msg: string, time: number): Promise<void> => {
  return new Promise((resolve, rejct) => {
    setTimeout(function() {
      console.log(msg);
      resolve();
    }, time);
  })
};

const async1 = async () => {
  console.log("async1: invoked");
  await timer("async1: wait 5 sec.", 5000);
};


const async2 = async () => {
  console.log("async2: invoked");
  await timer("async2: wait 10 sec.", 10000);
  // NOTE: 次の呼び出しがこのループ中に行われるのか確認するため
  for(let i = 0; i < 30; i++) {
    console.log(i);
  }

};


const async3 = async () => {
  console.log("async3: invoked");
  await timer("async3: wait 15 sec.", 15000);
};



const sync1 = () => {
  console.log("sync1: invoked.");
  // NOTE: 次の呼び出しがこのループ中に行われるのか確認するため
  for(let i = 0; i < 30; i++) {
    console.log(i);
  }
};


let promise = Promise.resolve();

[async1, async2, sync1, async3].forEach(f => {
    promise = promise.then(() => f());
});

promise.then(() => {
    console.log("done");
});
```
```bash
async1: wait 5 sec. 
async2: invoked 
async2: wait 10 sec. 
# 非同期処理が完了してから次の処理へ移動しているし...
0
1
2
3
4
5
# ...
26
27
28
29
# それ等が終わってから次のthen()へ移っている
sync1: invoked. 
0
1
2
3
# ...
27
28
29
async3: invoked 
async3: wait 15 sec. 
done 
```
#### promise入れ子

https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Using_promises#%E5%85%A5%E3%82%8C%E5%AD%90

**正しくないわけではないが、原則Promiseチェーンは入れ子にしない方がよい**

> 単純なプロミス連鎖は、不注意な構成の結果として入れ子が発生することがあるので、入れ子にせずに平らに保つのがベストです。

ただし、

> 正しく使用すれば、エラー回復の精度が高まります。

```JavaScript
doSomethingCritical()
  .then((result) =>
    doSomethingOptional(result)
      .then((optionalResult) => doSomethingExtraNice(optionalResult))
      .catch((e) => {})
  ) // オプションの処理が失敗すれば無視して進める
  .then(() => moreCriticalStuff())
  .catch((e) => console.error("Critical failure: " + e.message));
```

> 内側の catch 文は doSomethingOptional() と doSomethingExtraNice() からの失敗だけを捕捉し、捕捉したあと moreCriticalStuff() へと処理が続きます

ここで発生する問題は、

- 入れ子のチェーンはスコープが限られる
- 入れ子のチェーンの結果に関わらず外側のチェーンは続けて実行される
- 入れ子のチェーンは外側のチェーンで発生したエラーを捕捉しない

つまり、

入れ子チェーンで発生したエラーは外側のチェーンのcatch()では補足されるけど
外側のチェーンで発生したエラーは入れ子のcatch()で補足されないので
入れ子のチェーンはエラーを知ることなく走り続けることになる。


## 逐次処理

#### CASE: 引数も戻り値もとる関数をtaskとして逐次処理させるとき

Node.js Design Patternより、Promiseを使った逐次処理を知った。

テキストでは戻り値を返さない、かつ引数をとらない関数を逐次処理させていた。

なので非常にシンプルなのだが、

戻り値を返すし、その戻り値を次のthenが必要とする場合を考える。

そんな逐次処理を実現するとき。

#### 結論

```TypeScript
let tasks: (((a?:any) => any) | ((a?: any) => Promise<any>))[] = [];
// This can't accept.
// let tasks: (Promise<any> | ((a?:any) => any) | ((a?: any) => Promise<any>))[] = [];
let promise = Promise.resolve();

tasks.push(/* then handler function */);
// ...

// 引数は?でとっても取らなくてもいいようにする
tasks.forEach((t?) => {
  promise = promise.then(t);
});

promise.then(() => {
  console.log("all done");
});
// or
// await promise;  // If context is inside of async function.
```

then handler functionは非同期関数でも同期関数でも大丈夫。

引数をとってもとらなくても、戻り値を返しても返さなくても大丈夫。

今回tasksはthen()のハンドラ関数を含めるので、

`Promise<any>`は含めることはできない。

`let tasks: (((a?:any) => any) | ((a?: any) => Promise<any>) | Promise<any>)[] = [];`はできないという意味。

戻り値をとるか取らないかはtask次第。

#### 使いどころ

テキストでは全く同じ関数を別の引数などで呼び出して順番通りに実行するのに最適な逐次処理であった。

今回の自作の逐次処理は、どんな引数をとるのか、どんな戻り値が返されるのかあらかじめ把握しているときに使うことができる。

つまり`tasks`の要素の順番が重要である場合である。

#### 検証

テスト内容：

```JavaScript
// テキストの逐次処理パターン

let tasks = [/* ...tasks */];
let promise = Promise.resolve();    // 空の解決済プロミスの生成
tasks.forEach(task => {
    promise = promise.then(() => { return task(); });
});

promise.then(() => {
    // All tasks completed.
})
```

```TypeScript
// 戻り値引数をとる逐次処理
function resolveAfter6Seconds(m: string) {
  console.log("starting slow promise")
  console.log(`display previous value: ${m}`);
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("slow")
      console.log("slow promise is done")
    }, 6000)
  })
}

function resolveAfter3Seconds(m: string) {
  console.log("starting fast promise");
  console.log(`display previous value: ${m}`);
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("fast")
      console.log("fast promise is done")
    }, 3000)
  })
}

function sync(m: string) {
  console.log("starting sync function");
  console.log(`display previous value: ${m}`);
  return "sync done";
}

function resolveAfter10Seconds(m: string) {
  console.log("starting very slow promise");
  console.log(`display previous value: ${m}`);
  return new Promise(resolve => {
    setTimeout(function() {
      resolve("very slow")
      console.log("very slow promise is done")
    }, 10000)
  })
};

let tasks: (((a?:any) => any) | ((a?: any) => Promise<any>))[] = [];
let promise = Promise.resolve();

tasks.push(resolveAfter6Seconds);
tasks.push(resolveAfter3Seconds);
tasks.push(sync);
tasks.push(resolveAfter10Seconds);

tasks.forEach(t => {
  promise = promise.then(t);
});

promise.then((a?: any) => {
  console.log("all done.");
  console.log(a);
});
```
検証1: 期待する出力結果通りに動くか

```bash
starting slow promise
display previouse value: undefined    # しょっぱなの呼び出しだから引数がなくundefinedになる
# promise.thenではpromiseを返すまで次のthen()に処理が移動しないので、
# この時点から6秒経過後
slow promise is done
# 次のthenへ移動
starting fast promise
display previouse value: slow
# この時点から3秒経過後
fast promise is done
# 次のthenへ移動
starting sync function
display previouse value: fast
# 次のthenへ移動
starting very slow promise
display previouse value: sync done
# この時点から10秒後
very slow pormise is done
# 終了
all done.
very slow
```
結果、

```bash
starting slow promise 
display previous value: undefined 
slow promise is done 
starting fast promise 
display previous value: slow 
fast promise is done 
starting sync function 
display previous value: fast 
starting very slow promise 
display previous value: sync done 
very slow promise is done 
all done. 
very slow 
```

期待通りに動作。

検証２：引数をとらないハンドラが含まれても期待通りに動作するか

```TypeScript

function sync2() {
  console.log("starting sync function");
  console.log("sync 2 would not get parameter. But returns value.");
  return "sync2 done";
};

tasks.forEach((t?) => {
  promise = promise.then(t);
});
```

```bash
starting slow promise 
display previous value: undefined 
slow promise is done 
starting fast promise 
display previous value: slow 
fast promise is done 
starting sync function 
display previous value: fast 
# sync2: 引数をとらないけど戻り値を返す関数
starting sync2 function 
sync 2 would not get parameter. But returns value. 
starting very slow promise 
display previous value: sync2 done 
very slow promise is done 
all done. 
very slow 
```

ここに記録しないけど、引数も取らないし戻り値も返さない関数も受け入れることができた。

#### 使いやすいインタフェイスにしてみる

```TypeScript
type iSequentialAsyncTasks = (((a?:any) => any) | ((a?: any) => Promise<any>))[];
const sequentialAsyncTasks = (tasks: iSequentialAsyncTasks) => {
  let promise = Promise.resolve();
  tasks.forEach(t => {
    promise = promise.then(t);
  });
  return promise;
};

sequentialAsyncTasks(tasks).then((a) => {
  console.log("sequentail async tasks done.");
  console.log(a);
});
```
最後のpromise.then()の引数（戻り値）も取得できた。

次のようにしてもいい。

```TypeScript
type iGenTask = <T>((a?:any) => T) | ((a?: any) => Promise<T>);
type iSequentialAsyncTask = ((a?:any) => any) | ((a?: any) => Promise<any>);
type iSequentialAsyncTasks = iSequentialAsyncTasks[];
const sequentialAsyncTasks = (
  tasks: iSequentialAsyncTasks,
  tailEnd: iGenTask
  ) => {
  let promise = Promise.resolve();
  tasks.forEach(t => {
    promise = promise.then(t);
  });
  return promise.then(tailEnd);
};

sequentialAsyncTasks(tasks).then((a) => {
  console.log("sequentail async tasks done.");
  console.log(a); // aは出力されなかった...
});
```
動作確認：

```TypeScript
{

// -----------
function resolveAfter6Seconds(m: string) {
  console.log("starting slow promise");
  console.log(`display previous value: ${m}`);
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve("slow");
      console.log("slow promise is done");
    }, 6000);
  });
}

function resolveAfter3Seconds(m: string) {
  console.log("starting fast promise");
  console.log(`display previous value: ${m}`);
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve("fast");
      console.log("fast promise is done");
    }, 3000);
  });
}

function sync(m: string) {
  console.log("starting sync function");
  console.log(`display previous value: ${m}`);
  return "sync done";
}

function sync2() {
  console.log("starting sync2 function");
  console.log("sync 2 would not get parameter. But returns value.");
  return "sync2 done";
}

function sync3() {
  console.log("starting sync3 function");
  console.log("sync3 would not get parameter and return value.");
  return;
}

function resolveAfter10Seconds(m: string) {
  console.log("starting very slow promise");
  console.log(`display previous value: ${m}`);
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve("very slow");
      console.log("very slow promise is done");
    }, 10000);
  });
}
// -----------

let tasks: (((a?: any) => any) | ((a?: any) => Promise<any>))[] = [];

tasks.push(resolveAfter6Seconds);
tasks.push(resolveAfter3Seconds);
tasks.push(sync);
tasks.push(sync2);
tasks.push(sync3);
tasks.push(resolveAfter10Seconds);


type iGenTask<T> = ((a?: any) => T) | ((a?: any) => Promise<T>);
type iSequentialAsyncTask = ((a?: any) => any) | ((a?: any) => Promise<any>);
type iSequentialAsyncTasks = iSequentialAsyncTask[];

const sequentialAsyncTasks = (
  tasks: iSequentialAsyncTasks
) => {
  let promise = Promise.resolve();
  tasks.forEach((t) => {
    promise = promise.then(t);
  });
  return promise;
};

// const sequentialAsyncTasks = <T>(
//   tasks: iSequentialAsyncTasks,
//   tailEnd: iGenTask<T>
// ): Promise<T> => {
//   let promise = Promise.resolve();
//   tasks.forEach((t) => {
//     promise = promise.then(t);
//   });
//   return promise.then(tailEnd);
// };

sequentialAsyncTasks(tasks).then((a) => {
  console.log(a);
  console.log("sequential async tasks done.");
});

}
```

