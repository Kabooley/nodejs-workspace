## yargs 格闘記

#### コマンドを必須にさせる

#### マルチコマンドにさせる

```JavaScript
const argv = yargs(process.argv.splice(2))
  .command('ask', 'use inquirer to prompt for your name', () => {}, askName)
  .command('sing', 'a classic yargs command without prompting', () => {}, sing)
  .demandCommand(1, 1, 'choose a command: ask or sing')
  .strict()
  .help('h').argv;
```

以上の使い方は、`ask`, `sing`両方入力しても受け付けてくれるのか？

```bash
# こんな感じ
$ node ./index.js ask sing
```

TODO: 上の件要検証

TODO: マルチコマンド検証１

キーワード検索で収集させる： `node ./dist/index.js collect keyword --keyword="awesome"`

ブックマークから収集させる： `node ./dist/index.js collect bookmark --author="sumiyao`

上記が実現できるように...

- `collect`を必須にしたい
- `collect`につづくコマンドを必須にしたい
- オプションを、`collect`につづくコマンドに応じて付与したい
  と思ったけど、オプションは共通でいいか

```TypeScript
yargs(process.argv.splice(2))
.comamnd("collect <keyword|bookmark> [...options]", "collect",
  // このコマンド指定方法だと、オプションとかがkeyword、bookmarkで共通になる
  {
    // build...
  },
  (argv) => {
    // handle...
  }
).help().argv;
```

TODO: マルチコマンド検証２

キーワード検索して条件に一致する作品をブックマークする:
`node ./dist/index.js bookmark <keyword> [...options]`

キーワードは必須
ほかの条件は任意

```TypeScript
yargs(process.argv.splice(2))
.comamnd("bookmark <keyword> [...options]", "bookmark",
  {
    // build...
  },
  (argv) => {
    // handle...
  }
).help().argv;
```

#### prompt は`inquire`が一番アップデートしているし人気である

https://npmtrends.com/enquirer-vs-inquirer-vs-prompt-vs-prompts

#### yargs はアプリケーション実行中に入力されたコマンドを受け付ける

https://github.com/yargs/yargs/blob/main/docs/examples.md#using-inquirer-for-prompting

以下はアプリケーション実行してから、

実行中にコマンドを受け付ける状態になる。

yargs は、

多分`yargs.argv`というように、

最後に`.argv`を付けないと実行されない。

```JavaScript
const yargs = require('yargs');
const inquirer = require('inquirer');

const sing = () => console.log('🎵 Oy oy oy');

const askName = async () => {
  const answers = await inquirer.prompt([
    {
      message: 'What is your name?',
      name: 'name',
      type: 'string'
    }
  ]);

  console.log(`Hello, ${answers.name}!`);
};

const argv = yargs(process.argv.splice(2))
  .command('ask', 'use inquirer to prompt for your name', () => {}, askName)
  .command('sing', 'a classic yargs command without prompting', () => {}, sing)
  .demandCommand(1, 1, 'choose a command: ask or sing')
  .strict()
  .help('h').argv;
```

# web セキュリティ

https://gihyo.jp/dev/serial/01/javascript-security/0001

## 能動的攻撃・受動的攻撃

> 能動的攻撃とは、攻撃者がサーバ自体を対象として直接的に攻撃・侵害し、サーバ自身に被害が及ぶ攻撃手法を指します。

> 受動的攻撃とは、攻撃者があらかじめ罠サイトや罠ページを用意しておき、ユーザーがその罠サイトを訪れた際に何らかの被害が発生するような、ユーザー自身の行動をトリガーとして被害が発生するような攻撃手法です。

## 代表敵 4 つの受動的攻撃

- XSS
- CSRF
- オープンリダイレクト
- クリックジャッキング

## XSS

https://gihyo.jp/dev/serial/01/javascript-security/0002?summary

XSS はどのようにして引き起こされるのか

> XSS とは、動的に HTML を生成する Web アプリケーションにおいて、データをエスケープせずに出力しているために、生成される HTML に攻撃者の作成した HTML 断片や JavaScript コードが埋め込まれてしまう脆弱性です。

入力フォームに入力できる箇所があったとして、そこに<script>タグなど突っ込んで JS を実行させること。

これが起こるのは入力フォームに突っ込まれる文字をエスケープしていないから。

#### XSS 原因と対策

主な原因：

- テキストノードでのエスケープ漏れ
- 属性値への出力でのエスケープ漏れ
- 属性値への出力を引用符で囲っていない
- リンク先 URL に http や https 以外のスキームが入力可能

1. エスケープ漏れ

HTML 上では本来テキストノードあるいは属性値として出力されるべきデータを適切にエスケープせずにそのまま出力していることで引き起こされる例。

要は、HTML として埋め込まれるような文字列または属性値はエスケープさせない限り、攻撃対象になるということ。

例：

```html
<!-- 本来こうなるべきところ... -->
<span class="keyword">&lt;script&gt;alert(1)&lt;script&gt;</span>

<!-- エスケープしないで埋め込むとscript内の内容が実行されてしまう -->
<span class="keyword"
  ><script>
    alert(1);
  </script></span
>
```

2. 属性値の出力を引用符で囲っていない

```html
<!-- 属性値を出力するときに引用符で囲っていないと... -->
<input type="text" value="HTML5" />

<!-- 
  「x onmouseover=alert(1)」と入力することで 新たに
  悪意のある属性を含めることを可能としてしまう
-->
<input type="text" value="x" onmouseover="alert(1)" />

<!-- 
  引用符で囲んでも、
  「"onmouseover=alert(1)//」のような文字列を指定すると、以下のようなHTMLが生成され、onmouseover以降がvalue属性の値ではなくイベントハンドラとして有効になってしまうためにXSSが発生してしまいます。
 -->
<input type="text" value=""onmouseover=alert(1)//">
```

対策：

（1）文字列を出力する際には、テキストノードあるいは属性値としてのみ解釈されるように適切にエスケープを施す
（2）属性値を出力する際には、引用符で囲む

エスケープが必要な文字は、通常は以下の 5 種類です。

文字 エスケープした表現
& &amp;
< &lt;

>     &gt;
>
> " &quot;
> ' &#x27;

他：

##### リンクを生成する際には URL を http あるいは https スキームのみに限定する

文字列を URL とみなしてリンクを生成する(a タグの href に文字列を埋め込むときとか)際には、

URL は`http://`または`https://`からはじまる URL なのかをチェックするようにすること

攻撃者が`javascript:alert(1)`のような URL を与えうるから。

##### Cookie には必ず httponly 属性を付ける

仮に XSS が発生した場合であっても可能な限り被害を軽減させるために、Cookie には必ず httponly 属性をつけるようにしましょう。

`Set-Cookie: sessionid=25283FB24C9DEE32; httponly`

httponly がつけられた Cookie は、JavaScript から document.cookie を使って参照することができないので、仮に XSS が存在したとしても、Cookie 内のセッション情報の漏洩といった被害を抑えることができます。

## CSRF、オープンリダイレクト、クリックジャッキング

https://gihyo.jp/dev/serial/01/javascript-security/0003?summary

#### CSRF

Cross Site Request Forgeries
