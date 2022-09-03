# Note about tsconfig.json

https://www.typescriptlang.org/docs/handbook/tsconfig-json.html

https://www.typescriptlang.org/tsconfig

## 目次

[About tsconfig](#About-tsconfig)
[作ってみたtsconfig](#作ってみたtsconfig)
[tsconfig options](#tsconfig-options)
[](#)

## About tsconfig

> ディレクトリに tsconfig.json ファイルが存在することは、そのディレクトリが TypeScript プロジェクトのルートであることを示します。 tsconfig.json ファイルは、プロジェクトのコンパイルに必要なルート ファイルとコンパイラ オプションを指定します。

> 入力ファイルを指定せずに tsc を呼び出す。この場合、コンパイラは現在のディレクトリから始まり、親ディレクトリ チェーンをたどって tsconfig.json ファイルを検索します。

> **コマンド ラインで入力ファイルを指定すると、tsconfig.json ファイルは無視されます。**

tsconig.jsonを元にコンパイルしたいなら`tsc`に入力ファイルを続けて追加しないこと。

なのでコンパイルするときは

```bash
# MyProject/tsconfig.jsonがあるとして
$ cd MyProject
$ tsc
```

とすること。

同じページで推奨されているのだけれど、コミュニティが推奨する設定済のtsconfigを使用することができる。

自身のプロジェクトが該当する環境ならばそのまま引っ張ってきてもいいかもしれない。

> コードを実行する予定の JavaScript ランタイム環境によっては、github.com/tsconfig/bases で使用できる基本構成がある場合があります。これらはプロジェクトが拡張する tsconfig.json ファイルであり、ランタイム サポートを処理することで tsconfig.json を簡素化します。

以下はNode.js@12を使う環境での推奨コンフィグを採用する場合。

```bash
$ npm i -D @tsconfig/node12/tsconfig.json
```
`extends`で導入する。

```json
{
  "extends": "@tsconfig/node12/tsconfig.json",
  "compilerOptions": {
    "preserveConstEnums": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.spec.ts"]
}
```

## 作ってみたtsconfig

```json
{
  "compilerOptions": {

    /* Language and Environment */
    "target": "es5",
    /* Modules */
    "module": "commonjs",
    "rootDir": "./src/",
    /* Emit */
    "outDir": "./dist/",
    /* Interop Constraints */
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    /* Type Checking */
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "extends": "@tsconfig/node16-strictest/tsconfig.json"
}
```

```bash
# tsconfig.jsonを生成したいディレクトリにて
$ tsc --init
# tsconfig.jsonが生成される

# 推奨設定を導入する
$ yarn add --dev @tsconfig/node16-strictest/tsconfig.json
```

次だけ編集する必要がある:

`rootDir`, `outDir`, `include`, `extends`

あとはコンパイル時に、tsconfig.jsonが存在するディレクトリで`tsc`コマンドを打つことと、

`tsc`コマンドにつづけて入力ファイルを指定しないことと、

`tsc`コマンドは単独ではそんなコマンドなんて知らんといわれるから`npx`をつけること。

以上を念頭にコンパイルする。

```bash
# MyProject/tsconfig.jsonがある
$ cd MyProject
$ npx tsc

# 実際に試してみたけど、正常に動作確認。
```

これをするだけ。あとは勝手にtsconfig.jsonを探し出してくれて、それに従ってコンパイルしてくれる。

## tsconfig options

基本的な奴についてまとめる。

#### "module"

https://www.typescriptlang.org/ja/tsconfig#module

コンパイル後に出力されるJavaScriptファイルが採用することになるモジュール規格。

`"module": "commonjs"`がデフォルトで推奨。

これが適用される場合、

```TypeScript
// @filename: index.ts
import { valueOfPi } from "./constants";
 
export const twoPi = valueOfPi * 2;
```
上記をコンパイルすると、以下が出力される。

```JavaScript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoPi = void 0;
const constants_1 = require("./constants");
exports.twoPi = constants_1.valueOfPi * 2;
```

つまりTypeScriptでECMAScriptモジュールで書いていても、出力ファイルはCommonJSに変換してくれる。

#### "target"

https://www.typescriptlang.org/tsconfig#target




#### "rootDir"

https://www.typescriptlang.org/tsconfig#rootDir

**コンパイル結果を`"outDir"`で出力する際に、どのディレクトリ配下のディレクトリ構造で出力するかを指定する。**

`"rootDir": "./src/"`と指定すれば、コンパイル時にその中のディレクトリ構造をまねるように`"outDir"`で指定したディレクトリへ出力される。

> TypeScriptはファイルをコンパイルするとき、入力ディレクトリに存在するのと同じディレクトリ構造を出力ディレクトリに保持する。

なので`"rootDir"`はコンパイル対象を決めるプロパティではない。

> Importantly, rootDir does not affect which files become part of the compilation. It has no interaction with the include, exclude, or files tsconfig.json settings.(重要なのは、rootDirはどのファイルがコンパイルの一部になるかに影響を与えないことです。また、include, exclude, files tsconfig.jsonの設定とも連動しません。)

デフォルト、つまり`"rootDir"`をtsconfigでコメントアウトしたままにするとtsconfig.jsonが存在するディレクトリの中で一番ファイルを抱えているディレクトリを勝手に`"rootDir"`の対象として扱うようである。

例：

ルートディレクトリ

```bash
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
│   ├── sub
│   │   ├── c.ts
├── types.d.ts
```

- `"rootDir":`がコメントアウトされているとき： `core/`をルートディレクトリとして判断される

```bash
# 出力結果("outDir": "dist/"の場合)
MyProj
├── dist
│   ├── a.js
│   ├── b.js
│   ├── sub
│   │   ├── c.js
```

これは`"rootDir": "./core/"`としても同様。

- `"rootDir": "."`とするとtsconfig.jsonのいる階層が対象となる。

```bash
# 出力結果("outDir": "dist/"の場合)
MyProj
├── dist
│   ├── core
│   │   ├── a.js
│   │   ├── b.js
│   │   ├── sub
│   │   │   ├── c.js
```

重要なこと：

- TypeScriptは出力ファイルをoutDirの外のディレクトリに書き出すことはなく、ファイルの生成をスキップすることもないことに注意してください。このため、rootDirは、出力する必要があるすべてのファイルがrootDirのパスの下にあることを強制する。

`"rootDir": "core/"`として`"include": ["*"]`とすると次のような矛盾が発生する。

ディレクトリ構造：rootDirによればcore/以下の構造

コンパイル対象：tsconfig.jsonが存在するディレクトリのファイルすべて

なので、

```bash
MyProj
├── tsconfig.json
├── core
│   ├── a.ts
│   ├── b.ts
├── helpers.ts
```

という構造だと、ディレクトリ構造はcoreを模倣したいのにコンパイル対象はdist/の外のファイルも含むから矛盾が生じるのである。

**includeとrootDirは矛盾がないように運用すること**

#### "outDir"

コンパイルされたファイル(.jsや.d.tsなど)が出力される先のディレクトリを指定する。

ディレクトリ構造はrootDirプロパティで指定されているディレクトリの構造を模倣する。

コンパイル対象はincludeで指定される。


#### "include"

https://www.typescriptlang.org/tsconfig#include

どのファイルがコンパイル対象なのかを指定する。

> プログラムに含めるファイル名またはパターンの配列を指定します。これらのファイル名は、tsconfig.json ファイルを含むディレクトリに対して相対的に解決されます。

```bash
{
  "include": ["src/**/*", "tests/**/*"]
}
```

rootDirと矛盾がないように指定すること。

逆に含めたくないものは"exclude"で指定すること。