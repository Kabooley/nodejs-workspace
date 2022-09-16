# JavaScript Tips

開発中に経験したことをかたっぱしから走り書き。

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