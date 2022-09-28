# JavaScript Tips

開発中に経験したことをかたっぱしから走り書き。

## 目次

[for...in vs for...of](#for...in-vs-for...of)
[`[].slice.call()`](#`[].slice.call()`)
[](#)
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