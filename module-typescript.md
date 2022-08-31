# Module and TypeScript

TODO: まとまったらTILに移すこと

## 目次

[Modules](#Modules)
[モジュール解決](#モジュール解決)
[ESM in Node.js](#ESM-in-Node.js)
[](#)
[](#)

## TypeScriptとNode.jsの併用がうまくいかない

たとえば、

importとrequireだと挙動が明らかに異なる。なぜ？

同じものをrequire()するファイルをrequire()すると、「再宣言しています」のエラーが出る。

こうした疑問が解決できないのはモジュールに関して無知だからと分かったのでいろいろまとめる。



## Modules

https://www.typescriptlang.org/docs/handbook/2/modules.html

#### JavaScriptモジュールはどのように定義されているのか

- TypeScriptエンジンは、import/export分を含むファイルはモジュールと判断する
- import/exportを含まないファイルはモジュールとして判断されないので、ｸﾞﾛｰﾊﾞﾙｽｺｰﾌﾟとして扱われる
- モジュールは独自のスコープを持ち外部からアクセスできない
- モジュール内で宣言されたあらゆる変数や関数やクラスは、明示的にエクスポートをしないと外部からアクセスされることはできない
- また、モジュールからエクスポートされているものを利用するには明示的にインポートしなくてはならない

#### Non-modules

- JavaScriptの仕様としてトップレベルのawaitを持たなかったり、export文を持たないjsファイルはモジュールとみなさない
scriptファイルとみなす
- script file(モジュールファイルと対比したJSファイルのこと)内の変数や型はグローバルスコープになる
- importもexportもしたくないけどモジュールとして認識させたいときは`export {};`をそのファイルに追加する

つまり`export {};`があればそれはモジュールとして認識してくれるというわけですね。

#### Modules in TypeScript

こっちも読めとのこと。

https://developer.mozilla.org/ja/docs/Web/JavaScript/Guide/Modules

TODO: 要まとめつづき。


## モジュール解決

https://www.typescriptlang.org/docs/handbook/module-resolution.html


`import { a } from 'moduleA';`としたときに、コンパイラは`moduleA`が何者なのか探し始める。

> まず、コンパイラはインポートされたモジュールを表すファイルを探そうとします。これを行うために、コンパイラは2つの異なる戦略のうちの1つに従います。クラシックとノードです。これらの戦略はコンパイラに moduleA を探す場所を教えます。

> もしそれがうまくいかず、モジュール名が非相対的であれば（「moduleA」の場合はそうです）、コンパイラは周囲のモジュール宣言の場所を探そうとします。非相対的なインポートについては、次に説明します。

relative import: 相対パスで指定するimportのこと。`/`, `./`, `../`とかつかって`import Entry from "./components/Entry";`でインポートする方法。

non-relative import: `import * as $ from "jquery";` `import { Component } from "@angular/core";`とかのようにnode_modules/から引っ張ってくるやつ

    > 相対インポートは、インポートするファイルに対して相対的に解決され、アンビエントモジュール宣言に解決することはできません。実行時に相対的な位置を維持することが保証されている独自のモジュールには、相対インポートを使用する必要があります。

    > 非相対的なimportはbaseUrlに対する相対的な解決と、以下で説明するパスマッピングによる解決が可能です。また、アンビエントモジュールの宣言に解決することもできます。外部の依存関係をインポートするときは、非相対的なパスを使用してください。

> 最後に、もしコンパイラがモジュールを解決できなかった場合、エラーを記録します。この場合、エラーはerror TS2307: Cannot find module 'moduleA' のようなものになるでしょう。

#### モジュール解決戦略

https://www.typescriptlang.org/docs/handbook/module-resolution.html#module-resolution-strategies

モジュール解決するための戦略（方法ではなく「戦略」）には2つの方法があって、

NodeとClassicの２つがある。



#### How Node.js resolves modules

https://www.typescriptlang.org/docs/handbook/module-resolution.html#how-nodejs-resolves-modules

> TSコンパイラがどのような手順を踏むかを理解するためには、Node.jsのモジュールについて少し光を当てることが重要である。伝統的に、Node.jsにおけるインポートは、requireという名前の関数を呼び出すことによって行われます。

> Node.jsが取る動作は、requireに相対パスが与えられるか、非相対パスが与えられるかによって異なります。

相対パスの場合の解決手順：

`var x = require("./moduleB");`の解決は...

1. `/root/src/moduleB.js`というファイル名が存在するのか調べる

2. `"main"`プロパティを指定しているpackage.jsonファイルが、`root/src/moduleB`というフォルダ内に存在するのか調べる

`/root/src/moduleB/package.json`が存在して、そのファイルの中に`{ "main": "lib/mainModule.js" }`という具合に`"main"`でファイル名が指定されてあれば、Node.jsはそのファイルを参照することになる。

3. `/root/src/moduleB`フォルダ以下に`index.js`があるのか調べる。

あればそのファイルをmainモジュールとして参照する。


非相対パスの場合の解決手順：

> (非相対パスの解決において) Node は `node_modules` という名前の特別なフォルダの中にあるモジュールを探します。node_modules フォルダは現在のファイルと同じ階層にあったり、 ディレクトリチェーンの上位にあったりします。Node はロードしようとしたモジュールが見つかるまで、ディレクトリチェーンの上を歩き、それぞれの `node_modules` を探します。

`var x = require("moduleB");`の解決は...

1. `/root/src/node_modules/moduleB.js`があるか
2. `/root/src/node_modules/moduleB/package.json`の`"main"`で指定されているファイルがあるか
3. `/root/src/node_modules/moduleB/index.js`があるか

呼出ししているファイルの階層のnode_modules/で見つからなかったら上の階層のnode_modulesを探し始める...

4. `/root/node_modules/moduleB.js`があるか
5. `/root/node_modules/moduleB/package.json`の`"main"`で指定されているファイルがあるか
6. `/root/node_modules/moduleB/index.js`があるか

さらに上の階層のnode_modules/へ..

繰り返し。

#### How TypeScript resolves modules

TypeScriptも、モジュール解決手順はNode.jの方法を模倣している。

ただしコンパイル時にモジュール解決を行う。

拡張子が`.ts`, `.tsx`, `.d.ts`のファイルの解決も、Node.jsの解決方法にのっとって行われるのである。

`root/src/moduleA.ts`に`import { b } from "./moduleB"`というインポート分があったとしたら...

`/root/src/moduleB.ts`
`/root/src/moduleB.tsx`
`/root/src/moduleB.d.ts`
`/root/src/moduleB/package.json` (if it specifies a types property)
`/root/src/moduleB/index.ts`
`/root/src/moduleB/index.tsx`
`/root/src/moduleB/index.d.ts`

という順序。

これはNode.jsと同じ手順を踏んでいるのがわかる。

なので非相対パスの解決もNode.jsの手順と同様で、拡張子が違うだけ。

TODO: 続きをまとめる

## ESM in Node.js

https://www.typescriptlang.org/docs/handbook/esm-node.html

require()とimportの使い分けの話。

Node.jsはCommonJSモジュールシステムの上に構築されている。

一方、TypeScriptはECMAScriptモジュールをサポートしてきた。

ESM(ECMAScript Modules)とCommonJSは異なるモジュールシステムなのだ。

> 2 つのモジュール システム間の相互運用には大きな課題があり、多くの新機能が必要です。ただし、Node.js での ESM のサポートが Node.js に実装されるようになり、ほこりが落ち着き始めました。 そのため、TypeScript は node16 と nodenext という 2 つの新しいモジュールと moduleResolution 設定を提供します。

#### `type` setting in package.json

Node.jsは`type`と呼ばれる新しい設定をサポートし始めた。

`type`には`"module"`か`"commonjs"`のどちらかを指定することができる。


TODO: ここをよんでrequire()とimportがTypeScriptでなぜ違うものなのかはっきりさせること


# Modules 

https://www.typescriptlang.org/docs/handbook/modules.html

> In TypeScript, just as in ECMAScript 2015, any file containing a top-level import or export is considered a module. Conversely, a file without any top-level import or export declarations is treated as a script whose contents are available in the global scope (and therefore to modules as well).

> TypeScriptでは、ECMAScript 2015と同様に、トップレベルのimportまたはexportを含むファイルはモジュールとみなされます。逆に、トップレベルのimportやexportの宣言がないファイルは、その内容がグローバルスコープで利用できる（つまりモジュールも利用できる）スクリプトとして扱われる。

ということで、

`import`と`export`分を含まなかったらそいつはモジュールじゃないと明言している。

つまり、

`export = {};`があったらモジュールだけど、`module.exports = {};`があってもモジュールじゃないってわけ。

明確に、ECMAScript Moduleを採用していて、CommonJS Moduleは標準じゃないことを言っている。

#### `export =` and `import = require()`

https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require

> CommonJSとAMDの両方は、一般的に、モジュールからのすべてのエクスポートを含むexportsオブジェクトの概念を持っています。

これのことですね。

```JavaScript
// このmodule.exportsは、moduleというグローバル変数のプロパティexportsに、
// すべてのモジュールのエクスポートしたものを集約するのである
module.exports = {
    // ...
}
```

> それらはまた、カスタムシングルオブジェクトでexportsオブジェクトを置き換えることをサポートしています。デフォルトのexportはこの動作の代わりとなるもので、しかしこの2つは互換性がない。TypeScriptは伝統的なCommonJSとAMDのワークフローをモデル化するためにexport =をサポートしている。

つまり、

ESModuleでは通常、エクスポートしたいときは...

```TypeScript
export function hoge(): void {
    // ...
} 

export class Foo {
    // ...
}

export default Fuga;
```

と書くのがESModuleの文法でこれに則る。

しかしCommonJS Moduleとかもサポートするために特別な書き方を用意したのが以下。

```TypeScript
let numberRegexp = /^[0-9]+$/;
class ZipCodeValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}

// これ！
export = ZipCodeValidator;
```

> export = の構文は、モジュールからエクスポートされる単一のオブジェクトを指定する。これはクラス、インターフェース、名前空間、関数、enumのいずれかになります。

> export = を使ってモジュールをエクスポートする場合、TypeScript 固有の import module = require("module") を使って、モジュールをインポートする必要がある。

ということで、

`export = `したモノをインポートするには`import **** = require("@@@");`という特別な構文を使わなくてはならない。

```TypeScript
import zip = require("./ZipCodeValidator");

// Some samples to try
let strings = ["Hello", "98052", "101"];
// Validators to use
let validator = new zip();
// Show whether each string passed each validator
strings.forEach((s) => {
  console.log(
    `"${s}" - ${validator.isAcceptable(s) ? "matches" : "does not match"}`
  );
});
```

#### CommonJS Moduleの.jsファイルを.tsにするときは

そんな場面ある？って感じですが。

おさらい：

- TypeScriptにおいて、トップレベルに`import`文がある、または`export`文が含まれるならそのファイルはモジュールとして扱われる
- そうじゃないやつはすべてモジュールではなくてグローバルスコープ上のスクリプトとして扱われる
- CommonJS ModuleをTypeScriptがサポートするために、`export =`と`import module = require()`という特別な構文を用意した
- `export = `でエクスポートしたものは`import module = require()`の構文でないとインポートできない

ということで、

CommonJS構文で書かれたjsファイルにTypeScritpを導入しようと思ったら上記のルールを守ればTypeScriptを導入できるはず。

疑問：そもそもCommonJSではモジュールはモジュール独自のスコープ、というルールは存在する？すべてグローバルスコープ？


```TypeScript
// 要インストール@types/slug, @types/mkdirp, @types/request

// index.ts

"use strict";
// const request = require('request');
// const fs = require('fs');
// const mkdirp = require('mkdirp');
// const path = require('path');
// const utilities = require('./utilities');

import request = require('request');
import fs = require('fs');
import mkdirp = require('mkdirp');
import path = require('path');
import urlToFilename = require('./utilities');

type spiderCallback = (error: Error | null, filename?: string, bool?: boolean) => void;

function spider(url: string, callback: spiderCallback) {
  
  // const filename = utilities.urlToFilename(url);
  const filename: string = urlToFilename(url);
  fs.exists(filename, exists => {        // ❶
    if(!exists) {
      console.log(`Downloading ${url}`);
      request(url, (err, response, body) => {      // ❷
        if(err) {
          callback(err);
        } else {
          /***
           * mkdirpのバージョン違いのせいか、最新バージョンではコールバックは使わないらしいのでpromiseチェーンに変更する
           * 
           * */ 
            mkdirp(path.dirname(filename)).then(() => {
              fs.writeFile(filename, body, err => { // ❹
                if(err) {
                  callback(err);
                } else {
                  callback(null, filename, true);
                }
              });
            }).catch(err => {
              callback(err);
            });
            }
          });
        } else {
      callback(null, filename, false);
    }
  });
}

spider(process.argv[2], (err, filename, downloaded) => {
  if(err) {
    console.log(err);
  } else if(downloaded){
    console.log(`Completed the download of "${filename}"`);
  } else {
    console.log(`"${filename}" was already downloaded`);
  }
});

// utilities.ts

"use strict";

// const urlParse = require('url').parse;
// const slug = require('slug');
// const path = require('path');

// これでモジュール解決ができるようになった
import url = require('url');
import slug = require('slug');
import path = require('path');

const urlParse = url.parse;

// module.exports.urlToFilename = function urlToFilename(url: string): string {

// これでこのutilities.tsはモジュールとして扱われる。
export = function urlToFilename(url: string): string {
  const parsedUrl: url.UrlWithStringQuery = urlParse(url);
  if(!parsedUrl) return "";
  /*****
   * "strict null check"によってタイプガードを設けても
   * 「それnullじゃない？」って言ってくる。
   * 
   * 間違いなくnullにもundefinedにもならないなら下記のように
   * !をつける
   * 
   * いまは厳密なnullチェックを学習する暇がないのでこのままで。
   * */ 
  const urlPath = parsedUrl!.path!.split('/')
    .filter(function(component) {
      return component !== '';
    })
    .map(function(component) {
      return slug(component, { remove: null });
    })
    .join('/');
      
  let filename = path.join(parsedUrl!.hostname!, urlPath);
  if(!path.extname(filename).match(/htm/)) {
    filename += '.html';
  }
  return filename;
};

```

エディタ上のエラー表はこれで亡くなった。