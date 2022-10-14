# JavaScript Tips

開発中に経験したことをかたっぱしから走り書き。

## 目次

[for...in vs for...of](#for...in-vs-for...of)
[`[].slice.call()`](#`[].slice.call()`)
[`!!`の意味](#`!!`の意味)
[Promiseとasync/awaitの変換](#Promiseとasync/awaitの変換)
[Singleton](#Singleton)
[Promiseエラーハンドリング](#Promiseエラーハンドリング)
[](#)
[](#)

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

## Promiseエラーハンドリング

#### throw vs. reject

TODO: 要検証

https://qiita.com/legokichi/items/b14bf7dbb0cf041955d6

というひともいれば

https://stackoverflow.com/questions/33445415/javascript-promises-reject-vs-throw

とも言われている

