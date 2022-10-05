# Note about Node.js Tips

## 目次

[ファイルやディレクトリが存在するのか調べる方法](#ファイルやディレクトリが存在するのか調べる方法)
[Node.jsでDOM操作したいとき](#Node.jsでDOM操作したいとき)
[](#)
[](#)
[](#)

## ファイルやディレクトリが存在するのか調べる方法

https://stackoverflow.com/a/4482701

`Histtorical Answers`のところにあるのが実現可能なアプローチ方法。

`fs.existsSync()`がその中でも同期処理で使える模様。

(非同期バージョンの`fs.exists()`は非推奨である)

すっごく簡単に調べられる。


## Node.jsでDOM操作したいとき

https://stackoverflow.com/questions/7977945/html-parser-on-node-js

結論：npmパッケージを使え。

Node.jsはサーバ環境（ブラウザ環境じゃない環境）で動作するJavaScriptなので

DOMはブラウザの専売特許ゆえにコード中に`document`と書いてエラーにならなくても

コンパイルするときにエラーになる。

なので厳密にはNode.jsからDOMにアクセスできない。

webpackなどを使ってトランスパイルするなら使える？（未確認）
