# Set up environment of Node.js + yarn + TypeScript

https://yarnpkg.com/getting-started/usage

## 新しいNode.jsプロジェクトディレクトリを作るときの手順まとめ

Node.jsやyarnはインストールされている環境は用意されているけど、

npmでいうところの`npm init`するディレクトリを用意する前の時で、

yarnをﾊﾟｯｹｰｼﾞﾏﾈｰｼﾞｬとして, TypeScriptの開発環境を用意する。

TypeScriptのローカル・インストールについては`TypeScript in Your Project`の`via npm`の説明通りに

`npm install typescript --save-dev`しろとのこと。

https://www.typescriptlang.org/download

```bash
$ cd project-directory
# npm initと同じだしやることも同じ
$ yarn init

# TypeScriptの導入
$ yarn add typescript --dev
# Node.jsの型定義をインストール
$ yarn add @types/node --dev

# tscコマンドが使えるか確認する
# tscコマンドが使えないといわれたら、npx tscと入力すること。
$ tsc --version
version 4.4.3

# tsconfig生成
$ tsc --init
message TS6071: Successfully created a tsconfig.json file.
# 
# NOTE: tsconfig.jsonの構成は`./tsconfig-note.md`を参考にすること
# 

# 使いたければts-nodeのインストール
$ yarn add ts-node --dev 


```

## 順番通りにnpm scriptを実行させたい

npx tscしてからnodeさせるという順番を守らせるには、

```json
// package.json
  "scripts": {
    "start:build": "npx tsc",
    "start:run": "node ./dist/index.js",
    "start": "concurrently npm:start:*"
  },
```

では駄目である。

なぜか`start:run`が先に実行されたりするのでまだコンパイルしていないだけなのにdist/index.jsないじゃんとか言うエラー吐く。

参考

https://stackoverflow.com/questions/39172536/running-npm-scripts-sequentially

```json
  "scripts": {
    "build_com": "npx tsc",
    "run_com": "node ./dist/index.js",
    "start": "npm run build_com && npm run run_com"
  },
```

`&&`を`npm run コマンド名`でつなげば順番通りにnpm コマンドが実行される。

いけた～～～

concurrentlyは消した。

## コードフォーマットができない

Remote VSCodeでは保存時にコードをフォーマットしてくれない

すっごくひどい。

prettierはリモートVSCodeでは使えないと明記されている。



## ts-node

https://github.com/TypeStrong/ts-node#installation

便利なTypeScriptコンパイルパッケージ。

TypeScript CLIの、

- `tsc index.ts`でコンパイル
- 出力ファイルの確認
- `node index.js`で実行

の少なくとも3つの工程を１コマンドで済ませてくれるパッケージ・モジュール

`ts-node index.ts`ですぐに結果がわかる。

ts-nodeはtsc同様tsconfig.jsonを勝手に探してそれに従ってくれる...のだと思う。

`--project`オプションを追加すると任意の`tsconfig.json`を指定できる。

tscと違うのは、ts-nodeコマンドは後に続けてファイルを指定しないといけない。


##### 余談：ts-nodeの便利な使い方

その場でTypeScriptコードを実行できる

```bash
# コマンドライン上でTypeScriptコードが打てる
# Ctrl + Dで離脱
ts-node

# Execute code with TypeScript.
ts-node -e 'console.log("Hello, world!")'

# Execute, and print, code with TypeScript.
ts-node -p -e '"Hello, world!"'

# ファイルを指定することでファイルがビルド・実行される
ts-node <file-path>
```


#### TypeScript build & run を一度にしてほしいとき

https://www.npmjs.com/package/concurrently

https://www.typescripttutorial.net/typescript-tutorial/nodejs-typescript/

以下の構成は編集中の変更を常に監視して変更をすぐさまコンパイルして実行する。

`nodemon`と`concurrently`を使う。

`nodemon`: 指定のディレクトリかファイルを監視して変化があったら実行する

`concurrently`: 2つのコマンドを一度に実行する

最終的には次の`script`が出来上がるはず

```JSON
{
    "script": {
        "start:build": "npx tsc -w",
        "start:run": "nodemon ./dist/index.js",
        "start": "concurrently npm:start:*",
        // "build:run": "ts-node"  // ts-nodeはもはや指定のファイルがどうなるかて鳥羽役確認するためのコマンドになっているのでいらないかも
    },
}
```

- `npx tsc -w`: rootDirでの変化を監視しながら自動的にコンパイルを実行してくれる
- `nodemon ./dist/index.js`: ビルドされたファイルがtsconfig.jsonのoutDirで指定した出力場所へ出力されるはずだから、ビルドのたびにnodemonが反応してくれるはず
- `concurrenlty npm:start:*`: `npm:start:`から始まるすべてのコマンドを一度に実行してくれる

ということでインストールする。

```bash
$ yarn add nodemon concurrently --dev 
```

```bash
$ npm start
# 問題なく実行できていればOK
```

ts-nodeは特定のファイルだけコンパイルしたいときに使えばいい。




