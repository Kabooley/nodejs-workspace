# TypeScript Tips

TODO: TypeScriptの書籍を買え！

## 目次

[TypeScriptはprivate指定子でスコープを制御してくれるわけではない](#TypeScriptはprivate指定子でスコープを制御してくれるわけではない)

[エラー：割り当てられる前に使用されています](#エラー：割り当てられる前に使用されています)

[Typeだけインポートする](#Typeだけインポートする)

[`document`とかが使えないときは](#`document`とかが使えないときは)

[動的にオブジェクトのプロパティを追加するようなメソッドの型付け](#動的にオブジェクトのプロパティを追加するようなメソッドの型付け)

[非公開classの型情報だけを公開したいとき](#非公開classの型情報だけを公開したいとき)

[DOM操作](#DOM操作)

[ネストされたプロパティにアクセスする方法](#ネストされたプロパティにアクセスする方法)

[keyを動的に変更可能なオブジェクトの型作成まとめ](#keyを動的に変更可能なオブジェクトの型作成まとめ)

[関数のthis指定](#関数のthis指定)

[オーバーロード](#オーバーロード)


## TypeScriptはprivate指定子でスコープを制御してくれるわけではない

*インテリセンスとTypeScriptコンパイラがそれを許さないだけ。*

`private`指定子に限った話ではなくてTypeScriptとはそういうものなだけ。

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


## エラー：割り当てられる前に使用されています

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


## 動的にオブジェクトのプロパティを追加するようなメソッドの型付け


https://stackoverflow.com/a/45339463


TypeScriptで以下を実現しようとすると、

```JavaScript
var obj = {};
obj.name = "Mike";
```

必ずエラーになる。

```TypeScript
var obj = {};
obj.name = "Mike";
// Error: property name does not exist in {}

// 同様にエラー
ooo["name"] = "Mike";
```

ということで、

- `var obj = {}`で初期化されるオブジェクト
- 後から動的にとある型のプロパティを追加することになる


そんなオブジェクトの型付けをどう実現すればいいか。

アプローチ：

```TypeScript
export const hasProperties = < T extends object>(obj: T, keys: (keyof T)[]): boolean => {
    let result: boolean = true;
    keys.forEach((key: keyof T) => {
        result = result && obj.hasOwnProperty(key);
    });
    return result;
 };
 
 
/***
 * ジェネリック型のオブジェクト`obj`から、keysのプロパティだけを取り出したオブジェクトを生成する。
 * 
 * @type {T extends object} - オブジェクトだけを受け付けるのでジェネリックで指定できるT型はオブジェクトでなくてはならない
 * @param {T} obj
 * @param {(keyof T)[]} keys - key string of T type object that about to retrieve.
 * 
 * NOTE: そのプロパティが存在することを前提としている
 * */  
export const takeOutPropertiesFrom = < T extends object>(obj: T, keys: (keyof T)[]): T => {
    let o: T = <T>{};
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
 };

// これの場合、戻り値の型がRecord<keyof T, T[keyof T]>となるので扱いに非常に困るかも
const takeOutPropertyFrom = < T extends object>(obj: T, keys: (keyof T)[]): Record<keyof T, T[keyof T]> => {
    let o: Record<keyof T, T[keyof T]> = {} as Record<keyof T, T[keyof T]>;
    keys.forEach((key: keyof T) => {
        o[key] = obj[key];
    });
    return o;
};
```

- `Record<key, value>`を使って動的プロパティ追加可能オブジェクトの型を定義する
- `{} as TYPE`または`<TYPE>{}`で初期化時に空のオブジェクトを渡すことを許可させる 

1. `Record<key, value>`を使って動的プロパティ追加可能オブジェクトの型を定義する

https://stackoverflow.com/a/44441178

```TypeScript
var obj: {[k: string]: any} = {};

// becomes

var obj: Record<string,any> = {};

// MyType can now be defined by extending Record type

interface MyType extends Record<string,any> {
    typesafeProp1?: number,
    requiredProp1: string,
}
```

2. `{} as TYPE`で初期化時に空のオブジェクトを渡すことを許可させる

https://stackoverflow.com/a/45339463

```TypeScript
type User = {
    Username: string;
    Email: string;
}

const user01 = {} as User;
const user02 = <User>{};

user01.Email = "foo@bar.com";
```

## (自習) オブジェクトとプロパティ動的型付け

#### `typeof`

typeofはJavaScriptオブジェクトをtypeに変換できる。

```TypeScript

// Prints "string"
console.log(typeof "Hello world");

let s = "hello";
// let n: string
let n: typeof s;
   

const dummy = {
  error: false,
  message: "",
  body: {
      illustId: "12345",
      illustTitle: "title of this artwork",
      illustType: 0,
      sl:"",
      urls:{
          original:"",
      },
      pageCount: 3
  }
};

// type iDummy = {
//   error: boolean;
//   message: string;
//   body: {
//       illustId: string;
//       illustTitle: string;
//       illustType: number;
//       sl: string;
//       urls: {
//          original: string;
//       };
//      pageCount: number;
//   }
type iDummy = typeof dummy;
```


#### 添え字アクセス

https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html

TypeScriptではオブジェクトの添え字アクセスを可能としている。

JavaScriptでの添え字アクセスじゃなくて型情報の添え字アクセスのこと。

基本

```TypeScript

type Person = { age: number; name: string; alive: boolean };
// Age: number
type Age = Person["age"];

// I1 = string | number
type I1 = Person["age" | "name"];

// type I2 = string | number | boolean
type I2 = Person[keyof Person];
 
// type I3 = string | number
type AliveOrName = "alive" | "name";
type I3 = Person[AliveOrName];
```

## for...inループで取り出せる列挙可能プロパティは型注釈がつけられずstringになる

なので列挙可能プロパティがループで取り出されるたびに取り出されたプロパティに型注釈はつけられない。

別のループを使おう。

## 非公開classの型情報だけを公開したいとき

以下のクラス`RequestInterceptor`は非公開である。

公開されているのは`createRequestInterceptor`だけである。

```TypeScript
// Interceptor.ts

 import type puppeteer from 'puppeteer';

//  true as instance is already exists.
 let isInstantiated: boolean = false;

 class RequestInterceptor implements iRequestInterceptor {
    private cbList: ((event: puppeteer.HTTPRequest) => void)[];
    constructor(public page: puppeteer.Page){
        this.cbList = [];
        this.run = this.run.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.removeAll = this.removeAll.bind(this);
    };

    async run(): Promise<void> {
        // ...
    };

    add(cb: (event: puppeteer.HTTPRequest) => void): void {
        // ...
    };

    remove(cb: (event: puppeteer.HTTPRequest) => void): void {
        // ...
    };

    removeAll():void {
        // ...
    };
};



// Limited number of instance to only one.
 export const createRequestInterceptor = (page: puppeteer.Page): RequestInterceptor => {
    if(!isInstantiated) {
        isInstantiated = true;
        return new RequestInterceptor(page);
    }
    else throw new Error('RequestInterceptor is already exist.');
 };
```

この場合、使う側は`createRequestInterceptor`の返すクラス`RequestInterceptor`の型情報を知るすべがない。

なので`RequestInterceptor`の型情報だけを外部へ公開して、クラス自体は隠したままにしたい。

そんなとき。

参考：

https://stackoverflow.com/a/54372558/13891684

https://www.typescriptlang.org/docs/handbook/utility-types.html#instancetypetype

`InstanceOf<TYPE>`

> Type のコンストラクター関数のインスタンス型から構成される型を構築します。

`InstanceOf<typeof CLASSNAME>`でクラスCLASSNAMEの型情報を生成することができる。

```TypeScript
// Interceptor.ts
export type iRequestInterceptor = InstanceType<typeof RequestInterceptor>;
// type iRequestInterceptor = RequestInterceptor

// index.ts
import { createRequestInterceptor } from "./Interceptor";
import type { iRequestInterceptor } from "./Interceptor";

const interceptor: iRequestInterceptor = createRequestInterceptor(page);
```

取得できた。

## DOM操作

https://www.typescriptlang.org/docs/handbook/dom-manipulation.html

#### HTML文字列から特定の要素を探したいとき

https://www.typescriptlang.org/docs/handbook/dom-manipulation.html#documentcreateelement

HTTPレスポンスのbodyからHTMLを取得して、

そのHTMLから特定の要素を探したい。

そんなとき。

```TypeScript
    const html: HTMLHtmlElement = document.createElement('html');
    html.innerHTML = await response.text();


    const template: HTMLTemplateElement = document.createElement('template');
    template.innerHTML = await response.text();
    const json = template.content.querySelector('#meta-preload-data')!.getAttribute("content");
    metaPreloadData = json ? JSON.parse(json): undefined;
```


## ネストされたプロパティにアクセスする方法

想定するシナリオ：

オブジェクトから特定の深度のプロパティを取り出す。
プロパティとその方は使う側が知っているものとする。

Array.prototype.reduce()が使える。

```TypeScript

interface iReplacableKeyObject {
    [key: string]: any
};

export const retrieveDeepProp = (keys: string[], o: object) => {
    return keys.reduce((previousValue: iReplacableKeyObject, currentValue: string) => {
      return (previousValue !== undefined && previousValue.hasOwnProperty(currentValue)) ? previousValue[currentValue] : undefined
    }, o)
  };


// 下記と全く同じことをしてくれる

 const retrieveDeepProp = <T extends object>(obj: T, keys: string[]): any | undefined => {
    let o: iReplacableKeyObject | undefined = obj;
    keys.forEach(key => {
      if(o !== undefined && o.hasOwnProperty(key)){
        o = o[key];
      }
      else{ o = undefined;}
    });
    return o;
};
```

しかしこのままだと戻り値が必ず`iReplacableKeyObject`になってしまって結局使えない

こうするといいらしい

```TypeScript
export const retrieveDeepProp = <T>(keys: string[], o: object) => {
    return keys.reduce((previousValue: iReplacableKeyObject, currentValue: string) => {
      return (previousValue !== undefined && previousValue.hasOwnProperty(currentValue)) ? previousValue[currentValue] : undefined
    }, o) as T;     // NOTE: 型推論をasで禁止した
  };

// USAGE
let result: iIllustManga = retrieveDeepProp<iIllustManga>(["body", "illustManga"], res);
```

これで期待通りのものを取得できるようになった。


## keyを動的に変更可能なオブジェクトの型作成まとめ

TypeScriptでは、{}で初期化されたオブジェクトは、

空のオブジェクトという型を持つ変数とみなされるので、

後からプロパティの変更ができなくなる。

```TypeScript
// obj: {}という型付けになる。
const obj = {};

obj.name = "Mike";
// Error: property name does not exist in {}
```

ではobjにはどんな型を与えれば後からプロパティを追加できるようになるか？

#### 基本

```TypeScript
interface iDynamicKeyObject {
    [key: string]: any;
};

const obj: iDynamicKeyObject = {};

obj.name = "John";
```

このとき、`obj.name`等はプロパティはすべて`any`型になる

#### 基本: `keyof`

https://www.typescriptlang.org/docs/handbook/2/keyof-types.html

`keyof`はオブジェクトのキーからなるタプル型を生成する。

```TypeScript
type Point = { x: number; y: number };
// Same as `type P = "x" | "y"`
type P = keyof Point;
```

オブジェクトのキーを`string`とするとき、それはstring | numberとなる。

これはJavaScriptで`obj[0]`は常に`obj["0"]`と同義だからである。

```TypeScript
// これならkeyがnumberと注釈されているので
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
// Same as `type A = number`

// しかしkeyをstringとすると...
type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
// type M = string | number
```
#### 基本: Mapped type with `key in keyof Type` 

https://www.typescriptlang.org/docs/handbook/2/mapped-types.html

`type XXX<Type> { [key in keyof Type]: any}`は何をしているのか？

`Type`のkeyをXXXのプロパティ名として採用させている。

```TypeScript
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};

type FeatureFlags = {
  darkMode: () => void;
  newUserProfile: () => void;
};
 
type FeatureOptions = OptionsFlags<FeatureFlags>;
           
// type FeatureOptions = {
//     darkMode: boolean;
//     newUserProfile: boolean;
// }
```

つまり、

type`FeatureFlags`のプロパティ名だけを`FeatureOptions`に採用させて、

その値は`OptionsFlags`で指定している通り`boolean`にさせている。

#### 必ず特定のkeyとvalueの型組み合わせをとることを指定する

実践編。

`key in`を使うと、プロパティの型がkeyと対応しなくなる。

なので`Property`とmapped-typeを使う。

```TypeScript
// 問題のある例
interface Person {
    name: string;
    age: number;
};

type iDynamicObject<T> {
    [key in keyof T]: T[keyof T];
};

const John: iDynamicObject<Person> = {} as iDynamicObject<Person>;

John.country = "John";  // Error。これは想定内。
John.name = false;      // Error。これは想定内。
// 以下は有効である
John.name = 1234;       // stringだけにしたいのにnumberも有効になっている
John.age = "Wick";      // numberだけにしたいのにstringも有効になっている
```

`John`のプロパティはすべて`string | number`の型を受け付けるようになってしまう。

なので`John.name = 123`を受け付けてしまう。

`name: string`を守りたいのだがこれだと困る。

これは`key`の代わりに`Property`を使うと解決する

```TypeScript
// 解決した例
    interface Person {
        name: string;
        age: number;
    };

    type iDynamicObject<T> = {
        [Property in keyof T]: T[Property];
    };

    const John: iDynamicObject<Person> = {} as iDynamicObject<Person>;

    // Valid
    John.name = "John";
    John.age = 20;
    // Invalid
    John.country = "John";
    John.name = false;
    John.name = 1234;
    John.age = "Wick";
```

#### キー名を動的に配列で与えるようにしたいオブジェクトの型付け

例えば文字列配列の各要素をプロパティ名とするオブジェクトの型を定義したい。

そうすることでプロパティ名を自由に変更できる再利用性の高いオブジェクトに対応できる。

```TypeScript
    const bookmarkCommandKeys = ["bookmarkOver", "tag", "author"] as const;
    // "bookmarkOver" | "tag" | "author"
    type iL = typeof bookmarkCommandKeys[number];

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    // これならコマンドの配列を受け取ればkeyを制限することができる
    // Tは"string | symbol | number"型でないといけない
    // 例: typeof 文字列配列[number]
    type iCommandBuild<T extends string | symbol | number> = {
        [key in T]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild<iL> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };

```

この場合なら、

後から配列に新たな要素を追加または不要な要素を削除するだけで、

`bookmarkCommandBuilder`のプロパティを追加・削除可能である。


#### キー名を動的に別の型で与えるようにしたいオブジェクトの型付け

先の配列の代わりに型を渡す場合。

```TypeScript
    interface iBookmarkOptions {
        bookmarkOver: string;
        tag: string;
        author: string;
    }

    type iCommandProp = {
        describe: string;
        demandOption: boolean;
        type: string;
    };

    type iCommandBuild<T> = {
        [Property in keyof T]: iCommandProp;
    };

    const bookmarkCommandBuilder: iCommandBuild<iBookmarkOptions> = {
        bookmarkOver: {
            describe: "Specify artwork number of Bookmark",
            demandOption: false,
            type: "number"
        },
        tag: {
            describe: "Specify tag name must be included",
            demandOption: false,
            type: "string"
        },
        author: {
            describe: "Specify author name that msut be included",
            demandOption: false,
            type: "string"
        },
        // 誤ったキーはちゃんとエラーになる
        // incorrectKey: {
        //     describe: "Specify author name that msut be included",
        //     demandOption: false,
        //     type: "string"
        // }
    };
```

`iCommandBuild`に渡す型が他でも使われるときに便利。

#### オブジェクト宣言時に空オブジェクトで初期化しておきたいとき

*Variable 'obj' is used before being assigned.*のようなエラーが出る。

```TypeScript

interface Person {
    name: string;
    age: number;
};

// Error: 型{}には型Personから次のプロパティがありません。name, age...
const obj: Person = {};
// これなら空オブジェクトでも初期化してくれる。
const obj: Person = <Person>{};
const obj: Person = {} as Person;
```

## 関数のthis指定

class外部関数をクラス内部でbind呼び出ししたら、その関数はclass内部にアクセスできるのか？

結論：出来る。

class内部にアクセスできるというか、予め関数のコンテキストを特定のクラスに指定しておくことができる。

```TypeScript
type iCustom = () => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
	};

	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


function customIntroduce(this: Person) {
  if(this !== undefined)
    return `Hi, this is ${this!.name} and I am ${this!.age} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());
```

TypeScriptで関数のthisを指定する方法:

参考：https://www.gesource.jp/weblog/?p=7703

こうすると、上記コードはほぼエラーにならない。

ただし、

`customIntroduce()`の中で`this.name`等にはアクセスできない。

なぜなら`name`も`age`もプライベート変数だからである。

クラスメソッドでないcustomeIntroduceはそもそもアクセスできない。

なので、

```TypeScript

type iCustom = () => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
  };
  
  
//   プライベート変数ゲッターを用意した
	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


// thisをPersonにしている外部関数なので、
// パブリックメソッドにはアクセスできる
const customIntroduce: iCustome = function(this: Person) {
  if(this !== undefined)
    return `Hi, this is ${this!.getName()} and I am ${this!.getAge()} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());
```
これでエラーはなくなった。

こういう改善もできる。

```TypeScript

type iCustom = (this: Person) => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
  };
  
  
//   プライベート変数ゲッターを用意した
	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


// thisをPersonにしている外部関数なので、
// パブリックメソッドにはアクセスできる
const customIntroduce: iCustome = function(
	// this引数はもともとTypeScript用の仮引数である。
	// typeで型指定済なので、this引数の省略可能。
) {
  if(this !== undefined)
    return `Hi, this is ${this!.getName()} and I am ${this!.getAge()} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());      // No error.
```



## オーバーロード

https://www.typescriptlang.org/docs/handbook/functions.html#overloads

https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads


- オーバーロード・シグネチャと実装シグネチャの2つからなる。
- お作法として、実装シグネチャの直上にオーバーロードシグネチャを宣言すること。
- 実装シグネチャは直接呼び出すことができない。(?)
- 関数本体を記述するために使用される署名は、外部から「見る」ことはできません。
- 実装シグネチャはオーバーロードシグネチャと互換性を持たなくてはならない。

- **オーバーロード関数は静的な引数ならば呼び出すことができるが動的な引数の場合エラーになる**

    詳しくは`Writing good overload`と`実践`で。
 
#### 実装シグネチャとオーバーロードシグネチャの互換性について

実装シグネチャは引数も戻り値もオーバーロードシグネチャと互換性を持たなくてはならない。

なのでオーバーロードシグネチャがそれぞれ戻り値string, number, booleanなら
実装シグネチャの戻り値はいずれもとりうるように実装しなくてはならない。

#### 書き方

```TypeScript
// 1. オーバーロードを先に宣言だけする。
// この宣言だけの署名をオーバーロード・シグネチャと呼ぶ
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
// 2. 実装を最後に記述する
// この実装をした署名を実装シグネチャと呼ぶ
// NOTE: この関数を直接呼び出すことはできない！
function makeDate(
    // 実装シグネチャはオーバーロードシグネチャと互換性を持たなくてはならないので
    // その取る引数はすべてのオーバーロードの引数をとらなくてはならない。
    mOrTimestamp: number, d?: number, y?: number
    ): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);  // No overload expects 2 arguments, but overloads do exist that expect either 1 or 3 arguments.
```

#### Writing good overloads

```TypeScript
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
};

len(""); // OK
len([0]); // OK

// NOTE: 問題のある呼び出し方...1
len(Math.random() > 0.5 ? "hello" : [0]);
/*
No overload matches this call.
  Overload 1 of 2, '(s: string): number', gave the following error.
    Argument of type 'number[] | "hello"' is not assignable to parameter of type 'string'.
      Type 'number[]' is not assignable to type 'string'.
  Overload 2 of 2, '(arr: any[]): number', gave the following error.
    Argument of type 'number[] | "hello"' is not assignable to parameter of type 'any[]'.
      Type 'string' is not assignable to type 'any[]'.
*/
```

1について：

TypeScriptはオーバーロード関数を呼び出すときに、必ずいずれか一つの関数で解決するので、

「どちらかの可能性のある」呼び出し方はできないのである。

つまり、引数でどのオーバーロードなのかを判断しているといってもいいかも。

なので上記の三項演算子は実行時でないとstringなのか配列なのか判断できないためエラーになるのである。



#### 検証

codesandboxで確認したところ、以下のコードは正常である。

```TypeScript
type Options = 'op1' | 'op2' | 'op3'
type fn01 = (name: string) => string;
type fn02 = (age: string) => string;
type fn03 = (description: number) => number;

// here overloads - define output for every input
function test(a: 'op1'): fn01;
function test(a: 'op2'): fn02;
function test(a: 'op3'): fn03;

function test(options: Options) {
    switch(options) {
      case 'op1':
        return (name: string) => {return name;}
      case 'op2':
        return (age: string) => {return age;}
      case 'op3':
        return (description: number) => {return description;}
      default:
        throw new Error('no such value')  
      }
}

const f = test('op1') // it is fn01
console.log(f("tesst"));        // tesst
```

つまり、オーバーロードの条件として戻り値が共通である必要がない。

#### 実践

下記の通り、オーバーロード関数を呼び出すときは、引数が定数でなくてはならない。

そうでない場合、引数が実行時に決定される場合、

オーバーロード関数呼び出しはエラーになる。

ということで、もしもオーバーロード関数の呼び出しを動的な引数で呼び出す場合

オーバーロードを利用することは断念し、別の方法を模索するべきである。

(`Writing good overload`に既に書いてあったわ...)

```TypeScript
import type puppeteer from 'puppeteer';
import * as fs from 'fs';
import type http from 'http';
import { Downloader } from '../http/downloader';

// NOTE: `StreamOptions` fs.d.tsに定義されてあるのだけれど、
// なぜかインポートできないので
// しかたなくここに転記する。
import type * as promises from 'fs/promises';
interface StreamOptions {
    flags?: string | undefined;
    encoding?: BufferEncoding | undefined;
    fd?: number | promises.FileHandle | undefined;
    mode?: number | undefined;
    autoClose?: boolean | undefined;
    /**
     * @default false
     */
    emitClose?: boolean | undefined;
    start?: number | undefined;
    highWaterMark?: number | undefined;
};


export type iCommands = "collect" | "bookmark" | "download";
export type iActionDownload = (dest: fs.PathLike, requestOptions: http.RequestOptions, options: BufferEncoding | StreamOptions | undefined) => void;
export type iActionBookmark = (page: puppeteer.Page, selector: string) => Promise<void>;

export class Action {
    constructor(private command: iCommands){
        this.download = this.download.bind(this);
        this.bookmark = this.bookmark.bind(this);
        this.caller = this.caller.bind(this);
    };

    download(
        dest: fs.PathLike, 
        requestOptions: http.RequestOptions,
        options: BufferEncoding | StreamOptions | undefined,
        ) {
        const opt = options !== undefined ? options : {};
        const wfs: fs.WriteStream = fs.createWriteStream(dest, opt);
        return new Downloader(requestOptions, wfs).download();
    };

    /**
     * Clicks bookmark button on artwork page.
     * */ 
    bookmark(page: puppeteer.Page, selector: string): Promise<void> {
        return page.click(selector);
    };

    /**
     * NOTE: ボツ。JavaScriptでオーバーロードは使うべきではない。
     * オーバーロードは直接呼び出すときにのみ使うべきで、
     * 動的な引数によって呼び出されるときには使われるべきではない。
     * 
     * */ 
    caller(): iActionBookmark & iActionDownload {
        const self = this;
        function _caller(command: "bookmark"): iActionBookmark;
        function _caller(command: "download"): iActionDownload;
        function _caller(command: "collect"): () => void;
        function _caller(command: iCommands)
        // : iActionDownload | iActionBookmark 
        {
            switch(command) {
                case "download": return self.download;
                case "bookmark": return self.bookmark;
                case "collect": return function(){};
                default: throw new Error("No such a action method");
            }
        };

        // このように動的に呼び出される引数でオーバーロードを呼び出すと、
        // エラーになる。
        // 直接"bookmark"と呼び出すとエラーにはならない。
        return _caller(this.command);   // `this.command` is not assignable to ...のエラー
    };
};

const usage = function(command: iCommands, page: puppeteer.Page) {
    let executor = new Action("bookmark").caller();
    switch(command) {
        case "bookmark":
            return executor(page, "seelctor");  // エラー：iActionDownloadじゃないじゃんといわれる
        case "download":
            return executor("../dist/cat.png", {}, {});
        default:
            console.log("Error");
    }
};
```