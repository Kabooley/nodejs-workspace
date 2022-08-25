# Node.js 基本のパターン

『Node.js デザインパターン 第2版』（オライリージャパン）第2章のノートである。

Nodeの非同期プログラミングの土台となる3つのパターン、

すなわちコールバック、モジュール、EventEmitter(Observerパターン)について学習する。

## コールバック・パターン

#### コールバックの種類

- 同期的継続渡しスタイル(同期CPS)

- 非同期的継続渡しスタイル(非同期CPS)

継続渡しスタイルとは、return文を返す代わりに引数として受け取った関数（コールバック関数）を続けて実行するような処理をすることである。

一方でreturn文を返し処理を呼び出し側に戻すのはダイレクトスタイルという。

CPSの特徴：

同期的CPSはコールバック関数の処理が完了するまで呼び出し側は待つことになる。

非同期CPSはコールバック関数が非同期的に実行されるのでコールバック関数が完了するのを待たずに呼び出し側に戻る。



#### 同期処理と非同期処理が混在する関数を作ってはならない


「一貫性のないAPI」だと発見困難なバグの原因になる

たとえば、

上記の同期CPSと非同期CPSが混在した関数が存在し、条件によってどちらかの処理をすることになるとする。

呼び出し側は非同期関数と思って使ってみると同期処理になって処理完了までものすごい時間待たされた

...なんてことが起こりうる。

同期処理と非同期処理が混在せず同期処理のみはたまた非同期処理のみで実装された関数

同期処理と非同期処理が混在するような関数は非常に発見が困難なバグの温床になる

Node.jsでは同期的継続渡し、非同期的継続渡し、PromiseAPIなど同じ処理をするけど別バージョンである関数がたくさんあるので、

それらを混在させないように気を付けよう。

#### 同期処理と非同期処理が混在する関数の解決策

1. 同期APIの利用

同期的なAPIは常にダイレクトスタイルで実装したほうが単純でわかりやすい

例えばコールバックAPIの`fs.readaFile()`の代わりに`fs.readFileSync()`を使うといい。

呼び出し側もDSへ書き直す場合もあるので注意。

2. 遅延実行

混在関数を完全に非同期関数にしてしまう。

同期的なコールバックは`process.nextTick()`を使うと将来起動するようにスケジュールできる。


#### コールバックに関数慣習

従うべきお作法でございます。

1. callbaskを引数で渡すときは必ず引数リストの一番最後の引数とすること

> 関数のコールバックを指定する場合には必ず最後の引数とします。これはNodeのコアメソッドすべてに当てはまります。

2. エラーオブジェクトは第一引数として取得し、必ずエラーチェック

継続渡しスタイルではエラーはコールバック関数に渡される。

エラーオブジェクトは必ずコールバック関数の第一引数で取得する。

そして必ずコールバックではエラーオブジェクトを取得していないかチェックしよう

3. ダイレクトスタイルにおけるエラー検知はtry...catchで

もしもtry...catchで囲わなかったら、

例外がコールバック関数内で発生すると、イベントループまで伝番し、

どこにもキャッチされない。

つまりえラーが発生しない。

イベントループまでエラーが伝番したらアプリケーションが停止するらしい。

それ自体はイベントリスナを設定できる。

`process.on('uncaughtException', ()=> {})`


## モジュールシステムとパターン

JavaScriptには`namespace`が存在しないから名前衝突が容易に起こってしまう。

これは回避する方法が、JavaScriptの関数はプライベートなスコープを生成するという特性を利用した、

モジュールパターンである。

Nodejsのモジュールシステムは、

如何に依存関係を解決しロードするのかという役割と、

モジュールAPIのカプセル化をするという役割があり

それぞれの特徴やパターンを学ぶ。

#### モジュールと`module.exports`

モジュールとは`const mod = (function(){})()`の`mod`のことであり、`module.exports`はこの即時関数内部でreturnされたものと同じである。

つまり非公開スコープと公開スコープを持つ特殊な環境である。

```JavaScript
// モジュールパターン
const mod = (function() {
    const privateFoo = () => {/**/};
    const privateBar = [];

    const exported = {
        publicFoo: () => {/**/},
        publicBar: () => {/**/}
    };

    return exported;
})();
```

```JavaScript
// 抽象的なモジュール

// 依存関係の取得
const dependency = require("./anotherModule");

// 非公開API
function log() {
    console.log(`Well done ${dependency.username}`);
}

// 公開APIの登録
// モジュールパターンで言えばreturnで返されるオブジェクトexportedに該当する
module.exports.run = () => {
    log();
}
```

重要なことは、`module.exports`へ登録しない限りモジュールのすべては外へ公開されないということである。

#### `require()`は何をするのか

引数として指定されたモジュールを探して、そのモジュールの公開APIを返すことである。

```JavaScript
function loadModule(
    filename,   // モジュールファイルのpath
    module,     // moduleという名前のメタデータ。ここにもじゅ
    require
    ) {
  const wrappedSrc =
    `(function(module, exports, require) {
      ${fs.readFileSync(filename, 'utf8')}
    })(module, module.exports, require);`;
    // eval()を使っているのは何をしているのか理解しやすくするため便宜上使っているに過ぎない
  eval(wrappedSrc);
}

const module = {
    exports: {},
    id: id
};

loadModule(path, mod, )
```

とにかく言いたいことは、

- モジュールはロードされたらプライベートなスコープで囲われる(wrappedSrc)
- eval(module内容)することで、loadModule()でインポートするモジュールの公開APIが、moduleオブジェクトのexportsプロパティに追加される
- 上記のmoduleオブジェクトを返せばロードしたモジュール（の公開API）を返せる

ということ。

#### 依存解決順序

複数のソフトウェアが同一モジュールだけど異なるバージョンに依存している状態は依存地獄と呼ばれ忌避される。

Nodeではこの問題を解決する機能が備わっており、次のような3段階のアルゴリズムで解決される。

1. Nodeのコアモジュールか？
2. `/`や`./`や`../`などのパスを指定しているか
3. それ以外の場合

たとえば

```JavaScript
const fs = require('fs');   // Node.jsのFile Systemモジュール
const utils = require('../utils/index.js'); // ファイルモジュール
const axios = require('axios');  // パッケージモジュール
```

1 --> 2 --> 3の順番で解決される。

1や2に関してはおなじみだと思う。

3に関して:

1や2でもないなら、まずnode_modules/以下に該当のパッケージがないか捜索する。

なかったら親ディレクトリを探し始める。

そこでもなかったらさらに上へ上へと探し回る。

最終的にローカルファイルシステムのルートディレクトリに到達するまで探し回る。

こうして見つかったパッケージモジュールから、

さらにロードすべきファイルに関して次のルールに従う。

- 同一ファイル名があればそのファイルをロードする。
- 同一名ディレクトリのpackage.jsonのmainプロパティに記されたファイルをロードする。
- 同一名ディレクトリの配下にindex.jsがあればそれをロードする。

...以上のアルゴリズムをrequire()が内部的に実行することで依存関係が解決できるらしい。

#### キャッシュのもたらすメリットデメリット

毎回require()が呼ばれるたびに律儀にアルゴリズムに従って導き出したファイルからロードはしない。

一度呼び出されたらnpm cacheへ保存され次回以降の呼び出しはそこから行われる。

キャッシュによって循環参照が可能となってしまう。

循環参照の問題の解決はテキストの後のほうで取り扱うかも...という期待を込めて後回し。

##### 循環参照

あるファイルにてrequire(a), require(b)してみたら、モジュールa,bは各々の内部でお互いをrequire()しあっていた

という状態のこと。

#### モジュール定義のパターン

自分でモジュールを定義するときに従うパターンはこうなるねって話。

##### Named exports

公開したいプロパティや関数をexportsオブジェクトとして定義する方法。

この場合、exportsがnamespaceの役割を果たす。

最も一般的なAPI公開方法である。

```JavaScript
// module側 ./logger.js
exports.info = (message) => {
    console.log('Info' + message);
}
exports.verbose = (message) => {
    console.log('Verbose' + message);
}

// モジュール使用する側
const logger = require('./logger');
logger.info('info message');
logger.verbose('verbose message');
```

##### substack

単一の関数しかエクスポートしないパターン。

module.exportsオブジェクトを丸ごと関数で上書きする。

APIが単純明快になる。「露出部分最小化」というNode原則に合致する。

その関数の副次的な機能となるプロパティを追加できる。

##### コンストラクタのエクスポート

先のsubstackなんだけど、module.exportsをコンストラクタ関数で上書きする。

呼び出し側はnew モジュールでインスタンスを生成したり、コンストラクタ関数を拡張したりできる。

##### インスタンスのエクスポート

reuire()のキャッシュの仕組みを利用して、異なるモジュール間で状態を共有可能とするパターン。

インスタンスをmodule.exportsすると、そのインスタンスをrequire()するすべてのモジュールは同じインスタンスを参照する。

シングルトンパターンと似ているけれど、Node.js特有の問題がある。

Node.jsでは同一のモジュールの別バージョンをrequire()する場合があるから同一のインスタンスになるとは限らない。

その辺の解決はテキストの後のほうで扱うそうです。


## オブザーバ・パターン

Node.jsの基本のパターン3つの最後。

Nodeの非同期処理をうまくあつかうための機構であり、コールバックを補完するもの。

コールバックと異なるのはコールバックパターンは一つのリスナ（コールバック）のみに対して伝番されるけど

オブザーバパターンは複数のリスナに対して通知される。

オブザーバパターンはNodeのコアモジュールの機能としてサポートされている。

#### EventEmitter

EventEmitterの各メソッドは戻り値に自身のインスタンスを返すので、メソッドチェーンが可能である。

リスナはコールバックパターンと異なり、第一引数にエラーオブジェクトを取らない。

```JavaScript
// 基本的な使い方


"use strict";

const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

// 発行側
function findPattern(files, regex) {
  const emitter = new EventEmitter();
  files.forEach(function(file) {
    fs.readFile(file, 'utf8', (err, content) => {
      if(err)
    //   EventEmitterでエラーが発生したらerrorイベントを発行する
        return emitter.emit('error', err);
      
    //   エラーがなくファイルを読み取れたことの通知
      emitter.emit('fileread', file);
      let match;
      if(match = content.match(regex))
    //   正規表現に一致する表現を見つけたことの通知
        match.forEach(elem => emitter.emit('found', file, elem));
    });
  });
  return emitter;
}

// 受信側
findPattern(
    ['fileA.txt', 'fileB.json'],
    /hello \w+/g
  )
  .on('fileread', file => console.log(file + ' was read'))
  .on('found', (file, match) => console.log('Matched "' + match + '" in file ' + file))
  .on('error', err => console.log('Error emitted: ' + err.message))
;
```

#### EventEmitter内でのエラー伝番

非同期処理なのでエラーの呼び出し元はイベントループ内である。

例外がスローされてもアプリケーションがそれをキャッチすることはできない。

EventEmitterではそんな時は`error`イベントを発行することになっている。



#### EventEmitterの拡張

EeventEmitterを拡張してカスタマイズされたclassを定義するようなとき。

メソッドはthisを返すようにするなど標準メソッドのルールを守ること。

http APIもstream APIもEventEmitterを継承している。

#### 同期イベント非同期イベント

イベントが同期もしくは非同期のどちらで通知されるかは実はリスナーの登録方法によって決まる。

その登録方法とは、

EventEmitterのインスタンス生成後に登録されたイベントは非同期イベントで、

インスタンス生成前に登録されたイベント(コンストラクタで登録されたイベント)は同期イベントとして登録される。

なので同期イベントを実現するのは限定的であり、EventEmitterはほぼ非同期イベント向けといっていい。

#### コールバックとの使い分け

コールバックもEventEmitterもどちらも非同期処理ができる。どちらをつかえばいいの？

こうするといい。

EventEmitter: 

    一つのイベントに対して複数のリスナを登録できる

- 「何が起こったのか」を伝える必要があるとき
- イベント発生回数が予測できない、または1回だけ、またはまったく発生しない時
- 複数のイベントを扱うとき

コールバック：

- 非同期を実現したいだけのとき
- 発生回数が一度きりの時
- 結果が成功か失敗かだけのとき

一つの処理に対して一つのコールバックしか登録できない。

#### コールバックとEventEmitterの組み合わせ

二つをうまく組み合わせるとNodeの原則「露出最小化」に乗っ取ることができる、とのこと。

コールバックを引数として受け取り、戻り値にEventEmitterを返すようにすると、

簡潔なエントリポイントをメインの機能として提供して、より詳細なイベントをEventEmitterを使って通知できる。

