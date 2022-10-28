# Note about yargs

http://yargs.js.org/docs/

https://www.npmjs.com/package/yargs

yargsのTypeScript導入手引き：

https://github.com/yargs/yargs/blob/HEAD/docs/typescript.md

## 目次

[基本](#基本)

[yargsできること](#yargsできること)

[必須コマンドの生成](#必須コマンドの生成)

[Advanced Topics](#Advanced-Topics)

実践：

[検証](#検証)

[マルチコマンドと必須オプションの実現](#マルチコマンドと必須オプションの実現)

参考：

https://github.com/yargs/yargs/issues/225

TypeScript:

[TypeScript](#TypeScript) TODO: 結局こいつと格闘することになる


## 基本

#### yargsってなに？

さぁ？

#### cliから取得できるもの

yargsを本格的に使う前に、CLIから取得できるものとは何か

```JavaScript
require(yargs)(process.argv.splice(2)).argv;
```
```bash
$ node ./dist/index.js
{ _: [], '$0': 'dist/index.js' }
$ node ./dist/index.js params
{ _: [ 'params' ], '$0': 'dist/index.js' }
$ node ./dist/index.js params hogehoge
{ _: [ 'params', 'hogehoge' ], '$0': 'dist/index.js' }
$ node ./dist/index.js params hogehoge --fuga
{ _: [ 'params', 'hogehoge' ], fuga: true, '$0': 'dist/index.js' }
$ node ./dist/index.js params hogehoge --fuga=FUGA --foo="FOO"
{ _: [ 'params', 'hogehoge' ], fuga: 'FUGA', foo: 'FOO', '$0': 'dist/index.js' }
```

つまり、

- `$0`: 対象ファイル
- `_`: 入力されたコマンドを配列で格納している
- 他のプロパティ：入力されたオプションはそれぞれプロパティで取得される

`node ./dist/index.js command-1 command-2 --option="OPTION"`と入力されると

`command-`は`_`へ格納される。


#### Node.js `process.argv`

https://nodejs.org/dist/latest-v16.x/docs/api/process.html#processargv

> process.argvプロパティは、Node.jsのプロセスが起動されたときに渡されたコマンドライン引数を含む配列を返します。最初の要素はprocess.execPathになります。argv[0]の元の値にアクセスする必要がある場合は、process.argv0を参照してください。2番目の要素は、実行されるJavaScriptファイルへのパスとなります。残りの要素は、任意の追加コマンドライン引数です。

#### process.argv.slice(2)の意味

Node.jsの`process.argv`はNode.jsのプロセスが起動されたときに渡されたコマンドライン引数を含む配列を返す。

この配列の第一要素と第二要素はコマンドライン引数ではない。第3要素からコマンドライン引数が含まれる。

なので`process.argv.slice(2)`で配列の第三要素から取得するのである。

#### `.argv`

yargsでコマンドラインを読み取ってJavaScriptオブジェクトとして返すものである。

似たもので`yargs.parse()`がある。

yargsではPromiseチェーンみたいにyargsのメソッドをつないでいくようにできている。

このチェーンの一番最後にこの`.argv`をつける。

これは関数名に`()`をつけるのとおんなじで、

要は実行コマンドである。

yargsは.argvをつけなければただの定義分で、argvをつけることで実行してくれる。


> 注意：**.argvはトップレベルでのみ使用し、コマンドのビルダー関数の中では使用しないでください。**


#### `.command()`

http://yargs.js.org/docs/#api-reference-commandcmd-desc-builder-handler

https://github.com/yargs/yargs/blob/main/docs/advanced.md

> アプリケーションによって公開されるコマンドを定義します。

どういうコマンド名か、どんなコマンドなのかの説明、

そのコマンドの受け取ることができるオプションの定義、

そのコマンドを受け取った時にすることのハンドラの定義

等ができる。

yargsで主に使うことになるメソッド。

index.d.tsを見たらわかるけどオーバーロードがたくさん。

とりあえず、

builderには関数かオブジェクトを渡すことができる。

これでオプションコマンドとかを定義できる。

処理順序：

1. コマンドを現在のコンテキストにプッシュする
2. グローバルでないコンフィギュレーションをリセットする
3. 与えられた場合、ビルダーを介してコマンドの設定を適用します。
4. コマンドラインからの引数（位置引数も含む）の解析と検証
5. 検証が成功した場合は、ハンドラ関数を実行します (指定された場合)。
6. 現在のコンテキストからコマンドをポップアップします。


#### .updateStrings()

https://yargs.js.org/docs/#api-reference-updatestringsobj

コマンドのヘルプとかの表示をオーバーライドする。

以下の場合、変数`argv`に影響はない。

```JavaScript
import yargs from 'yargs/yargs';

var argv = yargs(process.argv.slice(2))
  .command('run', 'the run command')
  .help('help')
  .updateStrings({
    'Commands:': 'My Commands -->\n'
  })
  .wrap(null)
  .argv;
```
```bash
# 通常のhelp()内容
$ node ./dist/index.js run --help
index.js run  # 使い方

the run command # description

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]

$ node ./dist/index.js --help
index.js [command]

My Commands -->

  index.js run  the run command

Options:
  --version  Show version number  [boolean]
  --help     Show help  [boolean]
```

#### .wrap()

https://yargs.js.org/docs/#api-reference-wrapcolumns

usage(使い方)の出力内容をどうやって表示するかどうかみたいなものを制御する。

1行表示にするのか、何文字までなら1行で表示するのかとか。

wrap(null)で行の文字数に制限をかけない。


## yargsできること

- コマンドのヘルプとかをカスタムできる
- オプションは必須か任意かを指定できる
- コマンドは必須か任意かは(yargsでは)指定できない

yargsわかったこと

- 通常マルチコマンドはコマンド引数オブジェクトの`_`に配列として取得される。
- ポジショナルコマンド引数は、マルチコマンドとして処理されず、オプションコマンド引数として処理される。
- 上記の場合において、同名のオプションを引き取ることになっていた場合、オプションの値は無視されてポジショナル引数を値として取得する。
- コマンドを「必須」にするのはyargsではできないけど工夫すればできる
- オプションコマンドはyargsで必須にすることができる



#### 必須コマンドを指定するには

今度はコマンドを必須にする方法。

ここでいうコマンドとはオプション特別するという意味。

```JavaScript
yargs.command('get <source> [proxy]', 'make a get HTTP request', (yargs) => {
  yargs.positional('source', {
    describe: 'URL to fetch content from',
    type: 'string',
    default: 'http://www.google.com'
  }).positional('proxy', {
    describe: 'optional proxy URL'
  })
})
.help()
.argv
```

上記の場合、

コマンド`get`に続くコマンド`<source>`は必須となる。`[proxy]`はオプショナルである。

さらに順番を守る必要がある。

## 入力コマンドの見直し

何を実装したいのか？

- 指定キーワードまたは条件に一致したartworkのブックマーク
- 指定キーワードまたは条件に一致したartworkの情報収集(いらないなぁ)
- 指定キーワードまたは条件に一致したartworkのダウンロード（これはしない方がいい）
- ブックマークartworkのダウンロード（同上）
- ログイン情報(promptを使って後から入力でもいいかも...めんどくさいけど)

大きな区別：

- 収集：情報の収集またはartworkのダウンロード
- ブックマーク：条件に一致する対象のブックマークの実施

両方したいときは？

これなんだわ。

。。。まぁしなくてもいいか。

```bash
$ node ./dist/index.js collect 
$ node ./dist/index.js collect [...options]
```

```bash
$ node ./dist/index.js collect <keyword>
$ node ./dist/index.js bookmark <bookmarkOver> [...options]
```

## Advanced Topics

https://github.com/yargs/yargs/blob/main/docs/advanced.md

位置引数（node <FILENAME> <COMMAND>という順番で来るときにその順番にあるべき引数のこと)に引数がないと、デフォルト引数`$0`等が使用される

```JavaScript
// Default Command
// 
const argv = require('yargs/yargs')(process.argv.slice(2))
  .command('$0', 'the default command', () => {}, (argv) => {
    console.log('this command will be run by default')
  })
  .argv
```

#### Positional Arguments

`.command()`はオプションまたは必須コマンド引数を指定できる。

```JavaScript
// オプションが自由
yargs.command('get', 'make a get HTTP request')
  .help()
  .argv

// オプション`source`が必須、`proxy`は非必須
yargs.command('get <source> [proxy]', 'make a get HTTP request')
  .help()
  .argv

// 説明とか詳しい情報の追加はbuilderで設定可能
yargs.command('get <source> [proxy]', 'make a get HTTP request', (yargs) => {
  yargs.positional('source', {
    describe: 'URL to fetch content from',
    type: 'string',
    default: 'http://www.google.com'
  }).positional('proxy', {
    describe: 'optional proxy URL'
  })
})
.help()
.argv
```

つまり、`.command()`の第一引数で渡す文字列で必須オプションと非必須オプションを指定できるわけだ。

しかしこの場合、コマンドの入力は順番通りでないといけない。

これを使えばマルチこまんどぉ実現できるのかも。

例えば、

```JavaScript
yargs(process.argv.slice(2))
.command(
  'collect [...options] <bookmark> [...bookmarkOptions]',
  "...",
)
.help().argv;
```
これならcollectとbookmarkの2つをコマンド引数として取得できるのかなぁ




## 検証

```TypeScript
// index.ts
import yargs from 'yargs/yargs';


const argument = yargs(process.argv.splice(2))
.command("collect <keyword|bookmark> [...options]", "collect",
  (yargs) => {
    return yargs
    .positional("keyword", {
      describe: "Collect by keyword searching.",
      type: "string"
    })
    .positional("bookmark", {
      describe: "Collect from bookmark collection",
      type: "string"
    })
    .option("keyword", {
      describe: "Specify artwork number of Bookmark",
      type: "string",
      // keywordの時なら必須だけど、bookmarkの時は必須じゃない...
      // この矛盾をどう解決したものか
      demand: true
    })
    .option("bookmarkOver", {
      describe: "Specify tag name must be included",
      type: "number",
      demand: false
    })
    .option("tag", {
      describe: "",
      type: "string",
      demand: false
    })
    .option("author", {
      describe: "Specify author name that msut be included",
      type: "string",
      demand: false
    })
  },
  (argv) => {
    console.log(argv);
  }
).help().argv;

console.log(argument);

```

検証：

- ポジションコマンド`<keyword|bookmark>`は上記定義で通用するか
- ポジションコマンドとオプションコマンドが同じ名前だった時にどうなるか
- `node ./dist/index.js collect keyword --keyword="" --author="sumiyao"`は期待通りに動作するか
- `node ./dist/index.js collect bookmark --author="sumiyao"`は期待通りに動作するか


1. 検証：ポジションコマンドとオプションコマンドが同じ名前だった時にどうなるか

```bash
$ node ./dist/index.js collect bookmark --keyword="aweosme-over1000users" --author="sumiyao"
{
  _: [ 'collect' ],
  keyword: 'bookmark',
  bookmark: 'bookmark',
  author: 'sumiyao',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect' ],
  keyword: 'bookmark',
  bookmark: 'bookmark',
  author: 'sumiyao',
  '$0': 'd
}
```

先の実験、[yargsの返すオブジェクトについ確認](#yargsの返すオブジェクトについ確認)とり、

yargsの返すオブジェクトの`_`の配列の中は入力されたコマンドが格納される。

なので今回の場合、

`collect keyword`とコマンドを2つ並べたので本来yargsのオブジェクトの`_`は...

`_: [ 'collect', 'keyword' ],`となるべきところ、`collect`しか格納されていなかった。

考えられる原因：

- positionlaのkeywordとoptionのkeywordがかぶっているから後から定義した方を処理している

検証：

positionalのコマンド名を変更してみる

```JavaScript
// ...
.command("collect <byKeyword|fromBookmark> [...options]", "collect",
// ...
```

```bash
$ node ./dist/index.js collect byKeyword --keyword="aweosme-over1000users" --author="sumiyao"
{
  _: [ 'collect' ],
  keyword: 'aweosme-over1000users',
  author: 'sumiyao',
  '$0': 'dist/index.js',
  byKeyword: 'byKeyword',
  fromBookmark: 'byKeyword',
  'from-bookmark': 'byKeyword',
  'by-keyword': 'byKeyword'
}
```

結果、変わらなかった...

ポジショナルのコマンドは`_`に含まれないみたい。

検証：何も処理しないで複数コマンドを打ち込んだらどうなるか

```JavaScript
const c = yargs(process.argv.splice(2)).help().argv;
console.log(c);
```

```bash
# マルチコマンド
$ node ./dist/index.js collect bookmark
{ _: [ 'collect', 'bookmark' ], '$0': 'dist/index.js' }
# マルチコマンドとオプション
$ node ./dist/index.js collect bookmark --over=1000
{ _: [ 'collect', 'bookmark' ], over: 1000, '$0': 'dist/index.js' }
# マルチコマンドとオプション名が同じだった時
$ node ./dist/index.js collect bookmark --bookmark="bkmk"
{
  _: [ 'collect', 'bookmark' ],
  bookmark: 'bkmk',
  '$0': 'dist/index.js'
}
$ node ./dist/index.js collect keyword --keyword="attention"
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  '$0': 'dist/index.js'
}
```

区別されとるやんけ！

ちなみに、

`_`: コマンドが格納される配列
`$0`: nodeの次に来る対象
他：オプション

ここからyargsの各メソッドを追加していってどう変化するのか観察する

.command()をシンプルに付ける:

```JavaScript
import yargs from 'yargs/yargs';

const a = yargs(process.argv.splice(2))
.command("collect", "collect something",
() => {}, (argv) => {console.log(argv)})
.help().argv;
console.log(a);
```
```bash
$ node ./dist/index.js collect bookmark
{ _: [ 'collect', 'bookmark' ], '$0': 'dist/index.js' }
{ _: [ 'collect', 'bookmark' ], '$0': 'dist/index.js' }
$ node ./dist/index.js collect bookmark --over=1000
{ _: [ 'collect', 'bookmark' ], over: 1000, '$0': 'dist/index.js' }
{ _: [ 'collect', 'bookmark' ], over: 1000, '$0': 'dist/index.js' }
$ node ./dist/index.js collect bookmark --bookmark="bkmk"
{
  _: [ 'collect', 'bookmark' ],
  bookmark: 'bkmk',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect', 'bookmark' ],
  bookmark: 'bkmk',
  '$0': 'dist/index.js'
}
$ node ./dist/index.js collect keyword --keyword="attention"
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  '$0': 'dist/index.js'
```

今のところ同じ。

.command()でビルダを追加する:


```JavaScript
import yargs from 'yargs/yargs';

const a = yargs(process.argv.splice(2))
.command("collect", "collect something",
(yargs) => {
  return yargs
      .option("keyword", {
        describe: "Specify artwork number of Bookmark",
        type: "string",
        demand: true
      })
      .option("bookmarkOver", {
        describe: "Specify tag name must be included",
        type: "number",
        demand: false
      })
      .option("tag", {
        describe: "",
        type: "string",
        demand: false
      })
      .option("author", {
        describe: "Specify author name that msut be included",
        type: "string",
        demand: false
      });
}, (argv) => {console.log(argv)})
.help().argv;
console.log(a);
```
```bash
# optional()を付けて、一部オプションをdemnad: trueにしたので、
# 必須オプションなしだからエラーになった。
$ node ./dist/index.js collect bookmark
index.js collect

collect something

Options:
  --version       Show version number                                  [boolean]
  --help          Show help                                            [boolean]
  --keyword       Specify artwork number of Bookmark         [string] [required]
  --bookmarkOver  Specify tag name must be included                     [number]
  --tag                                                                 [string]
  --author        Specify author name that msut be included             [string]

Missing required argument: keyword

$ node ./dist/index.js collect keyword --keyword="attention"
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  '$0': 'dist/index.js'
}
$ node ./dist/index.js collect keyword --keyword="attention" --bookmark="bkmk"
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  bookmark: 'bkmk',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect', 'keyword' ],
  keyword: 'attention',
  bookmark: 'bkmk',
  '$0': 'dist/index.js'
```

やはり同じというか期待通りの結果に。

.command()とポジションコマンド引数を指定する:

```JavaScript
import yargs from 'yargs/yargs';

const a = yargs(process.argv.splice(2))
.command("collect <bookmark>", "collect something",
(yargs) => {
  return yargs
      .option("keyword", {
        describe: "Specify artwork number of Bookmark",
        type: "string",
        demand: true
      })
      .option("bookmarkOver", {
        describe: "Specify tag name must be included",
        type: "number",
        demand: false
      })
      .option("tag", {
        describe: "",
        type: "string",
        demand: false
      })
      .option("author", {
        describe: "Specify author name that msut be included",
        type: "string",
        demand: false
      });
}, (argv) => {console.log(argv)})
.help().argv;
console.log(a);
```

```bash
$ node ./dist/index.js collect keyword --keyword="attention" --bookmark="bkmk"
# bookmark: 'bkmk'ではなく、
# bookmark: 'bookmark'と処理される。
{
  _: [ 'collect' ],
  keyword: 'attention',
  bookmark: 'keyword',
  '$0': 'dist/index.js'
}
{
  _: [ 'collect' ],
  keyword: 'attention',
  bookmark: 'keyword',
  '$0': 'dist/index.js'
}
```

どうやらポジショナルコマンド引数と、オプション引数が同名だった場合、オプション引数の方が無視され、`ポジショナルコマンド引数：ポジショナルコマンド引数`の組み合わせのオプション引数として処理される模様。

builder関数の中の定義の有無に関係なく。

ならばマルチコマンドを指定するにはポジショナルコマンドは使わない方がいいということになるなぁ

ここで以下のURLに舞い戻る。

https://github.com/yargs/yargs/issues/225

マルチコマンドを定義するときに、

```JavaScript
const a = yargs().command(
    "fist-command-1", "",
    (yargs) => {
      a = yargs   // ここでaに代入するのは必須なのか？
      // second-commandをここで定義できる
      .command(
        "second-command-1", "", 
        () => {
          // first-command-1 second-command-1 の時のオプションをここで定義できる
        }, () => {}
      )
      .command(
        "second-command-2", "", 
        () => {
          // first-command-1 second-command-2 の時のオプションをここで定義できる
        }, () => {}
      )
      .help()
      // .updateString()は必須なのか？
      .argv;
    }
  )
  .command(
    "fist-command-2", "",
  )
  .help()
  // .wrap(null)は必須なのか？
  .argv;
```

これなら、

```bash
$ node ./dist/index.js first-command-1 <second-commands>
$ node ./dist/index.js first-command-2 
```

上記が実現できるはず、とのことで要検証。

わからんところ：

- .wrap()の役目
- .updateString()の役目
- builderのなかでセカンドコマンド引数とか処理した結果をaへ返す意味

検証1：command()のbuilderのなかでひとまずbuilderしてみる

```TypeScript
import yargs from 'yargs/yargs';

// TODO: check this out.
let argu = yargs(process.argv.splice(2))
.command(
  "collect", "collect something",
  (yargs) => {
    return yargs
    .command(
      "keyword", "collect something by keyword",
      () => {}, () => {}
    )
    .command(
      "bookmark", "collect something from bookmark",
      () => {}, () => {}
    )
    .help('help')
    // .wrap(null)
    .argv;
  },
  () => {}
)
.command(
  "bookmarkIt", "bookmark something",
  () => {}, () => {}
)
.help().argv;

console.log(argu);
```

```bash
$ node ./dist/index.js collect keyword bookmarkIt
$ node ./dist/index.js bookmarkIt
$ node ./dist/index.js keyword
```

結果、どの入力も`_`のコマンド配列に格納された。

これは.command()の入れ子関係ない振る舞えである。

## マルチコマンドと必須オプションの実現

次のコマンドを受け付けるようにしたい。

```bash
# collectに続くコマンドbyKeywordとfromBookmarkは必須として、さらに必須オプションもつける
$ node ./dist/index.js collect byKeyword --keyword="awesome"
$ node ./dist/index.js collect fromBookmark --keyword="awesome" --author="sumiyao"
$ node ./dist/index.js bookmark --keyword="COWBOYBEBOP"
```

つまり、

一番目のコマンド：`collect`, `bookmark`の2種類。
マルチコマンドの時: `collect byKeyword`, `collect fromBookmark`

問題：

オプションはcommand()のbuilderにて`demand`プロパティをtrueにすることによって必須オプションかどうかを制御することができる

しかし、

コマンド（上記でいえば`collect`, `bookmark`, `byKeyword`, `fromBookmark`はyargsのAPIで必須にできない。

なので

builderで入力されたコマンドの数などを検査する関数を呼び出すようにする。

ひとまずで通ったコード：

```TypeScript
import yargs from 'yargs';
import type Yargs from 'yargs/yargs';

type iArgv = {
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
} | Promise<{
  [x: string]: unknown;
  _: (string | number)[];
  $0: string;
}>;

// こいつをbuilder内部で呼び出すことで
// 入力されたコマンドの数などを検査できる
const checkCommand = (yargs: yargs.Argv<{}>, argv: iArgv, requiredNumber: number) => {
  if(argv._.length < requiredNumber) {
    // show help
  }
  else {
    //...
  }
};

const collectBuilder = {
  // Login ID
  username: {
    describe: "username",
    demandOption: true,
    type: "string",
  },
  // Login Password
  password: {
    describe: "password",
    demandOption: true,
    type: "string",
  },
  // Search keyword
  keyword: {
    describe: "keyword",
    demandOption: false,
    type: "string",
  }
};

const bookmarkBuilder = {
  bookmarkOver: {
      describe: "Specify artwork number of Bookmark",
      demandOption: true,
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
  }
};

// TODO: check this out.
let argu = yargs(process.argv.splice(2))
.command(
  "collect", "collect something",
  (yargs) => {
    const collectArgv = yargs
    .command(
      "byKeyword", "collect something by keyword",
      collectBuilder
    )
    .command(
      "fromBookmark", "collect something from bookmark",
      collectBuilder
    )
    .help('help')
    .wrap(null)
    .argv;
    checkCommand(yargs, collectArgv, 2);
  },
  (a) => {
    // handler collect command...
  }
)
.command(
  "bookmarkIt", "bookmark something",
  bookmarkBuilder,
  (a) => {
    // handler bookmark command...
  }
)
.help().argv;

checkCommand(yargs, argu, 1);

console.log(argu);
```

ということで、

checkCommandを、適切なタイミングで呼び出すことでコマンドが正しいかどうかチェックできる。

いまのところ、