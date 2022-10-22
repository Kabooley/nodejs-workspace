# Dropbox API

自分のDropboxアカウントの無料ストレージにアプリケーションからファイルをアップロードできるようになりたい。

## 目次

[links](#links)
[](#)
[](#)
[関係ないメモ](#関係ないメモ)

## links

- 開発者向けプラットフォームっぽい：https://www.dropbox.com/developers/reference
- Node.js + dropbox チュートリアル：  https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo

## nodegallerytutorial

https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo

まぁ習うよりということで。

今回のためにルートディレクトリにチュートリアル用のプロジェクトを作成した。

#### サーバ起動方法

```bash
$ cd dbximgs
$ npm start
```

でサーバ起動

#### Dropbox app

https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo#3--dropbox-app

dropboxの開発者サイトからappを作成するところから。

https://www.dropbox.com/developers/apps

create app: `dbximgs-for-tutorial`

#### OAuth with authorization code grant flow

> このアプリケーションは、同意した Dropbox ユーザーの特定のアプリ フォルダーを読み取ることができる必要があります。このためには、ユーザーが Dropbox にリダイレクトされて資格情報を入力し、このアプリがユーザーの Dropbox を読み取ることを承認する認証フローを構築する必要があります。これが完了すると、Dropbox 内にこのアプリの名前でフォルダーが作成され、ミドルウェアはそのフォルダーの内容にのみアクセスできるようになります。

> これを行う最も安全な方法は、承認コード フローを使用することです。このフローでは、承認ステップの後に、Dropbox がトークンと交換されるコードをミドルウェアに発行します。ミドルウェアはトークンを保存し、Web ブラウザーには表示されません。トークンを要求しているユーザーを知るために、セッションを使用します。最初は、ハードコードされたセッション値を使用してキャッシュに保存しますが、後でそれを適切なライブラリに置き換えてセッションと Cookie を管理し、永続的なデータベースに保存します。

> コードを記述する前に、Dropbox で重要な構成手順を実行する必要があります。 Dropbox 管理コンソールでリダイレクト URL を事前登録します。一時的に、許可されている唯一の http URL である localhost エンドポイントを使用します。ホーム以外の場合は、https を使用する必要があります。 /oauthredirect エンドポイントを使用します。 URL http://localhost:3000/oauthredirect を入力し、[追加] ボタンを押します。 また、暗黙的な付与は使用しないため、無効にすることができます。

認証の流れ：

home `/` へユーザがアクセスしたらmiddlewareがセッションを取り出して特定のユーザなのかどうか調べる

middlewareはOAuthtokenがこのセッションに対して発行済であるかどうか調べる。

発行済みでない場合認証シーケンスが開始される

ミドルウェアは、Dropbox 経由で認証を実行するための URL を構築する /login エンドポイントにリダイレクトします。

URLの一部はstateで、ブラウザバーに表示されることになる、Dropboxへ渡される文字列である

stateはセッションと一緒に保存される

ユーザはDropboxの中の認証サーバへ、stateとmiddlewareによってリダイレクトされたときのURLと一緒にリダイレクトされる。今回のケースでは`/oauthredirect`エンドポイントへリダイレクトされる。

ユーザはDropboxが認証を行いアプリケーションの特定のフォルダへアクセスすることを認証される

...

長いから割愛。

認証のためのconfigを設定する



## 実装してる人から習う

https://louisz.medium.com/sample-code-to-upload-files-into-dropbox-using-nodejs-both-single-upload-and-multi-part-upload-739318f17bf0

HTTP APIを使っている模様。

とにかく、

dropbox apiを使ってdropbox内のファイルのリクエスト、アップロード、streamを使った両方の実施、150mbを超えないアップロード方法を使った150mbサイズ越えのファイルのアップロードを実施する



## 関係ないメモ

Ubuntuでzipファイルをダウンロードして任意のフォルダに回答するまで

```bash
$ cd <movetodirectorythatfilewillbedownloaded>
$ wget <URL>
$ unzip <ZIPFILE>
```