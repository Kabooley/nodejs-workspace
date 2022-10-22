# Dropbox API

自分のDropboxアカウントの無料ストレージにアプリケーションからファイルをアップロードできるようになりたい。

## 目次

[links](#links)
[](#)
[](#)
[](#)

## links

- 開発者向けプラットフォームっぽい：https://www.dropbox.com/developers/reference
- Node.js + dropbox チュートリアル：  https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo

## nodegallerytutorial

https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo

まぁ習うよりということで。

今回のためにルートディレクトリにチュートリアル用のプロジェクトを作成した。

#### 準備

```bash
$ npm start
```

でサーバ起動

#### Front end and back end

https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo#2--front-end-and-back-end

フロントエンドとバックエンドをきれいに分割して責任も明確にするために。

backend:

バックエンドを構成するあらゆるものは`public`フォルダに入れない。

バックエンドへ変更を加えるたびに、変更を確認するためサーバをリスタートしなくてはならない。

主に変更するのは以下のファイル。

- app.js:   middlewareかrequestの処理を担当する
- routes/index.js:   サーバのすべてのエンドポイントを有する

加えて、プロジェクトのルートフォルダへ次の2つのファイルをバックエンドのために追加する

- config.js:
- controller.js:

## 実装してる人から習う

https://louisz.medium.com/sample-code-to-upload-files-into-dropbox-using-nodejs-both-single-upload-and-multi-part-upload-739318f17bf0

HTTP APIを使っている模様。


