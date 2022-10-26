# Note about yargs

http://yargs.js.org/docs/

https://www.npmjs.com/package/yargs

yargsのTypeScript導入手引き：

https://github.com/yargs/yargs/blob/HEAD/docs/typescript.md

## 目次

[必須コマンドの生成](#必須コマンドの生成)

[Advanced Topics](#Advanced-Topics)

[入力コマンドの見直し](#入力コマンドの見直し)

[](#)
[](#)

## API REFERENCE

yargsは、`yargs()`で実行される。

```JavaScript
// 例：
require('yargs/yargs')(process.argv.slice(2)).argv;

require('yargs/yargs')([ '-x', '1', '-y', '2' ]).argv;

require('yargs/yargs')().parse([ '-x', '1', '-y', '2' ]);

require('yargs/yargs')(process.argv.slice(2)).parse();
```

`require('yargs/yargs')`で取得しているのは下記：

```TypeScript
declare function Yargs(
    processArgs?: ReadonlyArray<string> | string,
    cwd?: string,
    parentRequire?: NodeRequire,
): Argv;
```

つまり`Argv`なるものを返す関数である。

関数なので、

```JavaScript
require('yargs/yargs')(process.argv.slice(2));

// 上記の呼び出しは下記と同義であり、Argvなるものを返す。
Yargs(process.argv.slice(2));
```

`process.argv.slice(2)`している理由：

Node.jsの`process.argv`はNode.jsのプロセスが起動されたときに渡されたコマンドライン引数を含む配列を返す。

この配列の第一要素と第二要素はコマンドライン引数ではない。第3要素からコマンドライン引数が含まれる。

なので`process.argv.slice(2)`で配列の第三要素から取得するのである。


#### .argv

先の`require('yargs/yargs')(process.argv.slice(2)).argv`の`.argv`とは？

> 引数を単なる古いオブジェクトとして取得します。

> 対応するフラグを持たない引数はargv._の配列に表示されます。argv._の要素はデフォルトで数値に変換される可能性があることに注意してください。

> スクリプト名やノードコマンドは、bashやperlの$0と同じようにargv.0に格納することができます。

> yargs が node を組み込んだ環境で実行され、スクリプト名がない場合 (例: Electron や nw.js) は、最初のパラメータをスクリプト名と見なし、無視します。この動作を上書きするには、.argvの代わりに.parse(process.argv.slice(1))を使用すると、最初のパラメータは無視されなくなります。

> 注意：**.argvはトップレベルでのみ使用し、コマンドのビルダー関数の中では使用しないでください。**

ワカラン

実験してみる。

#### yargsの返すオブジェクトについ確認

```TypeScript
// index.ts
const argv = require('yargs/yargs')(process.argv.slice(2)).argv;

console.log(argv);  // { _: [], '$0': 'dist/index.js' }
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
$ node ./dist/index.js params hogehoge --fuga=FUGA
{ _: [ 'params', 'hogehoge' ], fuga: 'FUGA', '$0': 'dist/index.js' }
```

ということで、`yargs`の戻り値に対して`.argv`を追加すると確かにオブジェクトが返されることが確認できる。

`_: []`にはコマンドライン引数が配列で格納され、

`--OPTION=VALUE`をコマンドライン引数に追加すると、オブジェクトのkey-to-valueのペアとして追加される。

そんなオブジェクトを返すようだ。

.argvを付けるとコマンドライン引数に関するオブジェクトが返されるので、こいつを使ってJavaScriptで処理をするというわけだ。

#### .command

http://yargs.js.org/docs/#api-reference-commandcmd-desc-builder-handler

https://github.com/yargs/yargs/blob/main/docs/advanced.md#command-execution

> アプリケーションによって公開されるコマンドを定義します。

```bash
$ node ./dist/index.js get-image --keyword=DONALD
```
たとえば上記のようなコマンドを実行するとしたら、

`get-image`がコマンド名として、そのコマンドに関するあらゆる定義を指定するのが`.command`である。

```TypeScript
// yargs/index.d.ts
// 
// オーバーロードがほかにもたくさんあるけどね
command<O extends { [key: string]: Options }>(
    command: string | ReadonlyArray<string>,    // コマンド名
    description: string,                        // コマンドの説明
    builder?: O,                                // コマンドが受け付けるオプションについての定義
    // コマンドの解析が終了したら実行される、argsオブジェクトを受け取る関数
    handler?: (args: ArgumentsCamelCase<InferredOptionTypes<O>>) => void | Promise<void>,
    middlewares?: MiddlewareFunction[],
    deprecated?: boolean | string,
): Argv<T>;
```

処理順序：

1. コマンドを現在のコンテキストにプッシュする
2. グローバルでないコンフィギュレーションをリセットする
3. 与えられた場合、ビルダーを介してコマンドの設定を適用します。
4. コマンドラインからの引数（位置引数も含む）の解析と検証
5. 検証が成功した場合は、ハンドラ関数を実行します (指定された場合)。
6. 現在のコンテキストからコマンドをポップアップします。



#### TypeScript Usage

https://github.com/yargs/yargs/blob/HEAD/docs/typescript.md

インポート方法は次の通りでいいらしい。

```TypeScript
import yargs from 'yargs/yargs';
```

#### Node.js `process.argv`

https://nodejs.org/dist/latest-v16.x/docs/api/process.html#processargv

> process.argvプロパティは、Node.jsのプロセスが起動されたときに渡されたコマンドライン引数を含む配列を返します。最初の要素はprocess.execPathになります。argv[0]の元の値にアクセスする必要がある場合は、process.argv0を参照してください。2番目の要素は、実行されるJavaScriptファイルへのパスとなります。残りの要素は、任意の追加コマンドライン引数です。

## 作ってみた

```TypeScript
import yargs from 'yargs/yargs';

interface iCommand {
    [key: string]: string | undefined;
}

const argv = yargs(process.argv.slice(2));
export const commands: iCommand = {};

export const commandArgv = argv.command(
    "collect-image", "Collects images which matches with specified keyword",
    // Provide a builderobject but builder can be a function. 
    // 
    // ビルダーはオブジェクトでも関数でもどちらでもOK
    {
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
    // You can provide a handler function which will be executed with the parsed argv object:
    (argv): void => {
        console.log(`username: ${argv.username}. password: ${argv.password}. keyword: ${argv.keyword}`);
        commands['username'] =argv.username;
        commands['password'] =argv.password;
        commands['keyword'] =argv.keyword;
    }
)
```

## yargsをモジュール化する

上記の`commandArgv`ではハンドラ関数で使用しているオブジェクト`commands`がスコープされる環境でしか使えない。

これだとindex.jsへyargsの定義を追加しないといけないし、再利用性が低いのでモジュール化させる。

参考：

https://github.com/yargs/yargs/blob/main/docs/advanced.md#providing-a-command-module

```TypeScript
// cliParser.ts
export interface iCollectCommand {
    username: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
    //   Login Password
      password: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
    //   Search keyword
      keyword: {
        describe: string;
        demandOption: boolean;
        type: "string";
      };
};
export const commandName = "collect-image";
export const commandDesc = "Collects images which matches with specified keyword";
export const builder: iCollectCommand = {
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
}

// index.ts
import yargs from 'yargs/yargs';
import { commandName, commandDesc, builder } from './cliParser';

interface iCommand {
    [key: string]: string | undefined;
}
export const commands: iCommand = {};

yargs(process.argv.slice(2)).command(commandName, commandDesc, 
    {...builder},   // NOTE
    (args) => {
        console.log(`username: ${args.username}. password: ${args.password}. keyword: ${args.keyword}`);
        commands['username'] =args.username;
        commands['password'] =args.password;
        commands['keyword'] =args.keyword;
}).argv;

console.log(commands);
```

NOTE: builder引数へ渡す方法として{...builder}とするのと、buidlerに一致するinterfaceが必須となっている...

```bash
$ node ./dist/index.js collect-image --username=donald --password=don
aldkillskernel --keyword=donaldnsfw
username: donald. password: donaldkillskernel. keyword: donaldnsfw
{
  username: 'donald',
  password: 'donaldkillskernel',
  keyword: 'donaldnsfw'
}
```

期待通りに動作しているのが確認できた。

これなら先のコードよりもindex.tsがすっきりする。

.commandの引数のハンドラ関数だけ、index.tsのcommandsオブジェクトにアクセスする必要があるため

index.ts内で関数を定義した。

## フレキシブルにするには

`yargs(process.argv.splice(2))`の後に、Promiseチェーンみたいに`.command`をつけていけばいい


## コマンドを必須にする

#### .command()のbuilderで必須オプションを指定する

`demandOption`で必須かどうかを指定できる

```JavaScript
yargs(process.argv.slice(2))
.command(
  "bookmark", "...",
  {
    bookmarkOver: {
         describe: "Specify artwork number of Bookmark",
         demandOption: true,
         type: "number"
     },
     tag: {
         describe: "Specify tag name must be included",
         demandOption: false,
         type: "string"
     }
  },
  () => {/*...*/}
).argv;
```

```bash
$ node index.js bookmark --tag="awesome"
index.js bookmark

Bookmark artwork if it satifies given command options.

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --bookmarkOver  Specify artwork number of Bookmark         [number] [required]
  --tag           Specify tag name must be included                     [string]
  --author        Specify author name that msut be included             [string]

Missing required argument: bookmarkOver
```
ということで、

`demandOption: true`としていあるオプションがコマンド引数になかった時

ちゃんとエラーになる。

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
#### アカウント情報が必要になったら...

promptで入力させる or コマンドで常に必須オプションとする

前者ならいつもコマンド情報が少なくて済むけど

後者は実行のたびにアカウント情報を入力する手間が減る

まぁprompt導入してみますか。

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

#### `.command()`の実行順序

1. コマンドを現在のコンテキストへ追加する
2. グローバルじゃない構成をリセットする
3. `builder`を通してコマンド構成を適用する
4. 位置コマンド引数含めてコマンドラインをパース、検証する
5. 検証で合格したら`handler`が実行される
6. 現在のコンテキストからコマンドをポップする（追い出す）


## github issue: multiiple commands

https://github.com/yargs/yargs/issues/225


## 実践：20221026

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
# 以下はどうなる？
$ node ./dist/index.js collect keyword --keyword="aweosme-over1000users" --author="sumiyao"
$ node ./dist/index.js collect bookmark --keyword="aweosme-over1000users" --author="sumiyao"
```

わかったこと：ポジショナルのコマンドは`_`に含まれず、オプションコマンドと同じ扱いになる

