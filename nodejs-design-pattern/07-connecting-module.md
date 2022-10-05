# 07: モジュールの接続

モジュール接続の様々な方法を分析して強みと弱みに光あて、

それによって実現したい単純さ、再利用可能性、拡張性の間のバランスを考慮しつつ、

合理的に選択するための指針を提供します。

重要なパターン：

- [依存関係のハードコーディング](#依存関係のハードコーディング)
- [依存性注入](#依存性注入)
- [サービスロケータ](#サービスロケータ)
- [依存性注入コンテナ](#依存性注入コンテナ)



## Node.jsにおける一般的な依存関係

モジュールはコードを組織化し構造を組み立てる際に利用できる基本的な仕組みである。

ただしアプリケーションの各機能を単にモジュールに切り出したらいいわけではない。

失敗例：

モジュールを取り出してしまうとアプリケーション構造の大部分が影響を受けてしまうような依存状態

コードをまとめる方法とモジュール同士をつなげる方法が重要である。

## 凝集度と結合度

凝集度が高く結合度が低ければ、簡単に理解でき、再利用しやすく、拡張性の高いモジュールになるのが普通である。

## 依存関係のハードコーディング

#### ステートを持つモジュール

*Node.jsにおいてSingletonはSingletonなりえない*

アプリケーションのさまざまなモジュールでただ一つのインスタンスを共有したいときに、

Node.jsでは`module.exports`を使ってインスタンスをエクスポートするだけでそれが実現できる。

しかし実際にはこれは実現できない。

理由は２章のところで見た通り、モジュールはいったんインポートされると内部的にキャッシュされて、過去にロード済のものはキャッシュから使われる。

このキャッシュを保存しておくときに、Node.jsは、

そのモジュールがパッケージモジュールである場合に検索キーとして「フルパス」を登録する。

このSingletonとしてインポートしたいインスタンスがnode_modulesのパッケージのなかでも生成している可能性があり、

それ等は区別されるのでインスタンスが一つだけという前提は簡単に崩れてしまう。

なのでSingletonではなくなってしまう。

これはアプリケーション全体にわたるグローバル変数が使えれば解決できるけれど、

グローバル変数を使うこと自体禁じ手なのでこれは何としても避けるべきである。

> 依存関係のハードコーディングに伴う問題のほとんどはインスタンスがステートを持つことに依存する。

#### 依存関係ハードコーディングの長所と短所

ステートを持ったインスタンスへの依存をハードコードしたモジュールからなるアプリケーション

長所：

- 直感的にすぐわかる構造で理解やデバッグが容易である。

短所：

- モジュールをほかのインスタンスと接続させる可能性が制限されてしまい再利用性が低下する。

- ユニットテストの困難さが増す。

## 依存性注入

dependency injection: DI

DIとは、

コンポーネントの依存関係を外部のエンティティから「入力として与える」（注入する)
こと。


DIを使うと、

- 各依存対象がモジュールにハードコードされずに外部から受け取られることになる
- そのおかげでモジュールはどのような依存対象でも使えるように作りこめる

下記の例を確認すると、DIとはなんとやらが見えてくる。

*依存関係を呼び出し側が注入するようなコンポーネント依存関係とすること*


#### 例：ファクトリ注入

例１：

```JavaScript
// db.js

// before

const level = require('level');
const sublevel = require('level-sublevel');

// 一つのインスタンスだけ公開している
module.exports = sublevel(
  level('example-db', {valueEncoding: 'json'})
);

// after

const level = require('level');
const sublevel = require('level-sublevel');

module.exports = function(dbName) {
    // 引数によって条件に応じたインスタンスを後から追加できる
  return sublevel(
    level(dbName, {valueEncoding: 'json'})
  );
};
```
dbインスタンス自体であるsublevel()を公開するのではなくて、

dbインスタンスの種類を示す引数を受け取ってから生成するファクトリ関数を公開するようにすることで、

- dbインスタンス自身を渡す場合だと一つのdbしか渡せない。なのでそれを利用する側もそれを前提としたハードコーディングが余儀なくされる

- ファクトリ関数にすれば用途に応じたdbインスタンス生成が呼び出し側の需要に応じて可能となるので、呼び出し側がインスタンスがどんなものであるかに依存しなくなる

結果ステートを持たなくなる。


例２：

```JavaScript
// authService.js

// before
"use strict";

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');

const db = require('./db');
const users = db.sublevel('users');

const tokenSecret = 'SHHH!';

exports.login = (username, password, callback) => {
    // ...
};

exports.checkToken = (token, callback) => {
    // ...
};

// after

"use strict";

const jwt = require('jwt-simple');
const bcrypt = require('bcrypt');

// dbのインポートがなくなって、代わりに引数として取得するようになった。

module.exports = (db, tokenSecret) => {
  const users = db.sublevel('users');
  const authService = {};
  
  authService.login = (username, password, callback) => {
    // ...
  };

  authService.checkToken = (token, callback) => {
    // ...
  };
  
  return authService;
};
```
authService.jsはステートを持たなくなった。

具体的には、

- どんなdbインスタンスにも対応できるようになった。

リファクタリングする前だとひとつのdbインスタンスに依存しハードコーディングしなくてはならなかったが、

代わりに引数として取得するようにしたことで、自身はdbをインポートする必要がなくなって依存が減り、

単なるファクトリ関数になることができた。

例３：同様に...

```JavaScript
// authController.js
// before
"use strict";

const authService = require('./authService');

exports.login = (req, res, next) => {
    // ...
};

exports.checkToken = (req, res, next) => {
    // ...
};

// after
"use strict";

module.exports = (authService) => {
  const authController = {};
  
  authController.login = (req, res, next) => {
    // ...
  };

  authController.checkToken = (req, res, next) => {
    // ...
  };
  
  return authController;
};

```

こちらも依存関係を引数として取得するファクトリ関数となったことで

ステートがなくなった。

例４：呼び出し側

```JavaScript
// app.js
// before
"use strict";

const Express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const http = require('http');

const authController = require('./lib/authController');

let app = module.exports = new Express();
app.use(bodyParser.json());

app.post('/login', authController.login);
app.get('/checkToken', authController.checkToken);

app.use(errorHandler());
http.createServer(app).listen(3000, () => {
  console.log('Express server started');
});


// after
"use strict";

const Express = require('express');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const http = require('http');

const app = module.exports = new Express();
app.use(bodyParser.json());

// 各サービスのファクトリ関数をインポート
const dbFactory = require('./lib/db');
const authServiceFactory = require('./lib/authService');
const authControllerFactory = require('./lib/authController');

// 各サービスのインスタンス化
// この時に必要な依存関係が生成される
const db = dbFactory('example-db');
const authService = authServiceFactory(db, 'SHHH!');
const authController = authControllerFactory(authService);

// あとはおなじ
app.post('/login', authController.login);
app.get('/checkToken', authController.checkToken);

app.use(errorHandler());
http.createServer(app).listen(3000, () => {
  console.log('Express server started');
});
```

DI化する前は呼び出し側は完全に丸投げで呼出す対象の依存関係がハードコーディングされているのが前提だったけど

DI化した後なら呼び出し側が完全に依存関係を制御していて、

呼び出される側はステートを持たない。

#### DI化の長所短所

まず、依存ハードコーディングからどう変わったか。

特定の依存対象インスタンスから分離することができた。

依存対象がなくなったモジュールの単体テストも容易にできるようになった。

**依存対象と結びつける責任を最下層から最上層へ移動させることができた。**

依存関係の実装の決定が上層のコンポーネントが行うようにさせることができるようになる。

デメリット：

システム内の依存関係の把握が困難になる。

依存関係を決定する上層コンポーネントは依存関係を特定の順番で作成しなくてはならず管理がだんだん困難になってくる。

DI化にともなう依存関係決定の集約に対する解決策：

依存関係決定のコンポーネントを1か所に集中させず分散させること。

アプリケーション全体をDI化するのではなくて、局所的に必要な時だけ用いるとか。

## サービスロケータ