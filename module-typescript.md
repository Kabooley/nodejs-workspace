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