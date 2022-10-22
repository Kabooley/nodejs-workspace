# Dropbox API

自分のDropboxアカウントの無料ストレージにアプリケーションからファイルをアップロードできるようになりたい。

https://github.com/dropbox/dropbox-sdk-js

## 走り書き

いったんサンプル通りに作ってみて、ダメならGoogle Driveへ。


## links

- 開発者向けプラットフォームっぽい：https://www.dropbox.com/developers/reference
- Node.js + dropbox チュートリアル：  https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo
- HTTP API: https://www.dropbox.com/developers/documentation/http/documentation
- dropbox-sdk-js(dropbox npm): https://github.com/dropbox/dropbox-sdk-js


## nodegallerytutorial

https://github.com/dropbox/nodegallerytutorial?_tk=guides_lp&_ad=javascript_tutorial1&_camp=photo

大変なうえに肝心のdropboxapiがどのへんで活躍するのかさっぱり。

暇なときにやればいいかと。

## 参考

https://louisz.medium.com/sample-code-to-upload-files-into-dropbox-using-nodejs-both-single-upload-and-multi-part-upload-739318f17bf0

HTTP APIを使っている模様。

## 情報収集

https://www.dropboxforum.com/t5/Dropbox-API-Support-Feedback/Max-files-Upload-using-javascript-SDK/td-p/374617

> 貴方はファイル一つずつにつき`upload session`を生成しなくてはならないでしょう。各ファイルは複数のchunkの破片としてアップロードできます。ひとたびそれぞれのファイルのchunkをアップロードしたら、(HTTP APIの)https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-finish_batchを使って一気にファイルをコミットできる。これを使えば競合状態のロックを回避できます。

> ファイルのチャンクをアップロードする単一のリクエストごとに、技術的には最大 150 MB までアップロードできます。実際には、信頼性のためにそれより小さいサイズを使用することをお勧めします。さらに、小さいサイズを使用すると、特定のリクエストが失敗した場合に再アップロードする必要がなくなります。たとえば、実際には 12 MB のチャンク サイズを使用したい場合がありますが、ユース ケースに適したサイズを実験して確認できます。

https://louisz.medium.com/sample-code-to-upload-files-into-dropbox-using-nodejs-both-single-upload-and-multi-part-upload-739318f17bf0

https://www.dropboxforum.com/t5/Dropbox-API-Support-Feedback/Correct-way-of-uploading-files-in-session/td-p/214088

https://stackoverflow.com/a/45741106

https://github.com/dropbox/dropbox-sdk-js/issues/351


## HTTP API

#### file/upload

> リクエストで提供された内容で新しいファイルを作成します。これを使用して、150 MB を超えるファイルをアップロードしないでください。代わりに、upload_session/start でアップロード セッションを作成します。

#### files/upload_session/start

https://www.dropbox.com/developers/documentation/http/documentation#files-upload_session-start

> アップロード セッションを使用すると、ファイルのサイズが 150 MB を超える場合など、複数のリクエストに分けて 1 つのファイルをアップロードできます。この呼び出しは、指定されたデータで新しいアップロード セッションを開始します。

> 次に、upload_session/append:2 を使用してデータを追加し、upload_session/finish を使用してすべてのデータを Dropbox のファイルに保存します。 

> 1 回のリクエストで 150 MB を超えてアップロードしないでください。アップロード セッションにアップロードできるファイルの最大サイズは 350 GB です。

> アップロード セッションは最大 7 日間使用できます。 UploadSessionStartResult.session_id を作成後 7 日以上経過してから、upload_session/append:2 または upload_session/finish で使用しようとすると、UploadSessionLookupError.not_found が返されます。

> このエンドポイントへの通話は、1 か月あたりに許可されるデータ トランスポート コール数に制限がある Dropbox Business チームのデータ トランスポート コールとしてカウントされます。詳細については、データ転送制限ページを参照してください。デフォルトでは、アップロード セッションでは、upload_session/start、upload_session/append:2、upload_session/finish 呼び出しを連続して使用して、ファイルのコンテンツを順番に送信する必要があります。パフォーマンスを向上させるために、代わりに UploadSessionType.concurrent アップロード セッションをオプションで使用できます。新しい同時セッションを開始するには、UploadSessionStartArg.session_type を UploadSessionType.concurrent に設定します。その後、同時アップロード セッション/append:2 リクエストでファイル データを送信できます。最後に、upload_session/finish でセッションを終了します。同時セッションを機能させるには、いくつかの制約があります。 upload_session/start または upload_session/finish 呼び出しでデータを送信することはできません。upload_session/append:2 呼び出しでのみ送信できます。また、upload_session/append:2 呼び出しでアップロードされるデータは、4194304 バイトの倍数である必要があります (最後の upload_session/append:2 を除き、UploadSessionStartArg.close が true で、残りのデータが含まれる場合があります)。

ということで、

session_upload


#### files/upload_session
#### files/upload_session

#### examples



## 実践

つくるもの：150mbを超えるサイズのファイルをdropboxへアップロードするアプリケーション

送信方法はstream

150mb制限をクリアできるように、session何とかなる方法をとる

可能ならzipで圧縮して（もしくは圧縮しつつ？）アップロードしたい。

