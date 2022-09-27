# TypeScript Tips

TODO: TypeScriptの書籍を買え！

## 目次

[TypeScriptはprivate指定子でスコープを制御してくれるわけではない](#TypeScriptはprivate指定子でスコープを制御してくれるわけではない)
[後から動的にプロパティを追加するつもりの空のオブジェクト](#後から動的にプロパティを追加するつもりの空のオブジェクト)
[割り当てられる前に使用しています](#割り当てられる前に使用しています)
[Typeだけインポートする](#Typeだけインポートする)
[`document`とかが使えないときは](#`document`とかが使えないときは)

## TypeScriptはprivate指定子でスコープを制御してくれるわけではない

*インテリセンスとTypeScriptコンパイラがそれを許さないだけ。*

```TypeScript
class Person {
    constructor(private name: string, private age: number) {}
};

var person = new Person("Dave", 28);

console.log(person);
console.log(person.name); // Error highlights.
```
コンパイル後：

```JavaScript
"use strict";
var Person = /** @class */ (function () {
    function Person(name, age) {
        this.name = name;
        this.age = age;
    }
    return Person;
}());
;
var person = new Person("Dave", 28);
person.name = "peet";


console.log(person);
// Person {name: "Dave", age: 28, constructor: Object}

// ためしにコンパイル後のjsファイルにだけ次を追加しても
console.log(person.name);
// Dave
// アクセスできることがわかる。
```
TypeScriptでは`private`を指定できるけれど、

それにアクセスしてはいけないとエラーを起こすのはIntellisenseとTypeScriptコンパイラだけで、

生成されるコードがアクセスできないように元のコードを工夫してくれるわけではない。

参考：

https://stackoverflow.com/a/12713869

> 型チェックと同様に、メンバーのプライバシーはコンパイラ内でのみ適用されます。 
> プライベート プロパティは通常のプロパティとして実装され、クラス外のコードはアクセスできません。 

> クラス内で真にプライベートなものを作成するには、クラスのメンバーにすることはできません。オブジェクトを作成するコード内の関数スコープ内で作成されるローカル変数になります。これは、クラスのメンバーのように、つまり this キーワードを使用してアクセスできないことを意味します。


## 後から動的にプロパティを追加するつもりの空のオブジェクト

https://bobbyhadz.com/blog/typescript-add-dynamic-property-to-object

```TypeScript
interface Person {
  [key: string]: any;
}

const obj: Person = {};

obj.name = 'Tom';
obj.age = 30;
```

実践してみたところ：

```TypeScript
/************************
 * Command Line Parser
 * 
 * Using yargs
 * 
 * Enable 
 * - Search keyword
 * - Avoiding hard-coding username and password. 
 * */ 
import yargs from 'yargs/yargs';

interface iCommand {
    [key: string]: string | number;
}

const argv = yargs(process.argv.slice(2));
const command: iCommand = {};

argv.command({
    command: "get-image",
    describe: "get image",
    builder: {
        // Login ID
      username: {
        describe: "username",
        demandOption: true,
        type: "string",
      },
    //   Login Password
      password: {
        describe: "password",
        demandOption: true,
        type: "string",
      },
    //   Search keyword
      keyword: {
        describe: "keyword",
        demandOption: false,
        type: "string",
      },
    },
    handler: function (argv) {
      command.username = argv.username;
      command.password = argv.password;
      command.keyword = argv.keyword
        ? argv.keyword
        : constants.searchKeyword.ExclusiveTwoB;
    },
  
})
```

## 割り当てられる前に使用されています

Variable 'browser' is used before being assigned.

参考：

https://stackoverflow.com/q/66804267/13891684

https://stackoverflow.com/a/64595844/13891684

`初期化前変数の宣言: 初期化時に付ける型 | undefined`と宣言する。

```TypeScript
import * as puppeteer from 'puppeteer';

let browser: puppeteer.Browser;

(async function(commands) {
    try {
        browser = await puppeteer.launch();
        const loginPage = await browser.newPage();
    }
    catch(e) {
        console.error(e);
        // Error: Variable 'browser' is used before being assigned.
        if(browser !== undefined) browser.close();
    }
})(commands);
```

```TypeScript
import * as puppeteer from 'puppeteer';

// Added "| undefined"
let browser: puppeteer.Browser | undefined;

(async function(commands) {
    try {
        browser = await puppeteer.launch();
        const loginPage = await browser.newPage();
    }
    catch(e) {
        console.error(e);
        // TODO: Fix this.
        if(browser !== undefined) browser.close();
    }
})(commands);
```

## Typeだけインポートする

https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export

モジュールをインポートしたけど、そのモジュール自体は使わずに、型情報だけしか参照しないような場合、TypeScriptはエラーを出す。

`This import is never used as a value and must use 'import type' because 'importsNotUsedAsValues' is set to 'error'.`

指摘されている通り、`import type`を使うと解決。

```TypeScript
// import * as puppeteer from 'puppeteer';      // Error.
import type puppeteer from 'puppeteer';

export async function login(
    page: puppeteer.Page, 
    {username, password}: {username: string, password: string}
    ) {
        // ...
}
```

## `document`とかが使えないときは

```TypeScript
// 下記のdocumentが見つからないとか言われる
const login = async function(page: puppeteer.Page, 
    {username, password}: {username: string, password: string}
    ) {
    try {
        await page.goto(url, { waitUntil: "domcontentloaded" });

        // Get login and password form dom
        const [$username, $password, $login] = await page.evaluate(() => {
            const $username = document.querySelector('');
            const $password = document.querySelector('');
            const $login = document.querySelector('');
            if(!$username || !$login || !$password) throw new Error('DOM: username or password or login-button were not found');
            
            return [$username, $password, $login];
        });
      
```

https://stackoverflow.com/questions/41336301/typescript-cannot-find-name-window-or-document

ということでコンフィグを変更する。

```JSON
// tsconfig.json
{
  {
    // ...
    "lib": ["dom"]
    // ...
  }
}
```

## オブジェクトが少なくとも持つプロパティを指定する方法

例えばオブジェクトが次のような2つのプロパティをs少なくとも持つけど

そのほかの予測不可能なプロパティを持つことも許すような型付け。

```JavaScript
const obj = {
  title: "hoge",  // required
  id: "12344",    // required
  author: "fugafuga",     // optional
}

// Valid
const obj1 = {
  title: "foo",
  id: "09876"
};

// Invalid
const obj2 = {
  title: "dsfsdfs",
  author: "ffjfd"
};
```

参考：

https://stackoverflow.com/questions/40510611/typescript-interface-require-one-of-two-properties-to-exist



わからんかった。

## string | undefinedな配列からundefinedを取り除く処理の型付け

https://qiita.com/suin/items/cda9af4f4f1c53c05c6f

例えば、Array.prototype.mapはときおりundefinedを返すけど、それをArray.prototype.filterでundefinedを除く処理を追加するとする

そのとき、

```TypeScript
const collectElementsAsArray = (data: iIllustMangaElement[]): string[] => {
    const arr = data.map((e: iIllustMangaElement) => {
        if(e.id !== undefined) return e.id
    });
    return arr.filter(id => id !== undefined);
}
// エラー：filterはfilter<string | undefined>(): (string | undefined)[]だからstring[]にはならないよ～
```

となるので型ガードが通用しない。くたばれ。

このように`Array.prototype.map()`や`Array.prototype.filter()`はどうしてもタプル型でundefinedを含むことが前提になってしまう。

そんな時はこうするといいらしい。

1. ユーザ定義型ガード

```TypeScript
const collectElementsAsArray = (data: iIllustMangaElement[]): string[] => {
    const arr = data.map((e: iIllustMangaElement) => {
        if(e.id !== undefined) return e.id
    });
    // `: id is string`の部分
    return arr.filter((id): id is string => id !== undefined);
}
```

2. 指定の型ではないことをコンパイラに伝える

```TypeScript
const collectElementsAsArray = <T>(data: T[], key: keyof T): T[keyof T][] => {
    const arr = data.map((e: T) => {
        if(e[key] !== undefined) return e[key];
    });
    // `: v is Exclude<typeof v, undefined>`の部分
    return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
}
```

あとこのままだと、map()が` Not all code paths return a value.`という指摘を受ける。

要は、条件分岐で値を返さない時があるから返すようにしてという指摘。（初歩的なミス）

```TypeScript
const collectElementsAsArray = <T>(data: T[], key: keyof T): T[keyof T][] => {
    const arr = data.map((e: T) => {
        if(e[key] !== undefined) return e[key];
        // こうする
        else return undefined;
    });
    return arr.filter((v): v is Exclude<typeof v, undefined> => v !== undefined);
}
```
