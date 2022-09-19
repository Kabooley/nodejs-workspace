# Reddit API 

https://www.reddit.com/dev/api/

https://github.com/reddit-archive/reddit/wiki/API

## Rules

- すべてのAPIはRedditの[API terms](#https://www.reddit.com/wiki/api/)に従うことを確認してください

- クライアントは`OAuth2`認証で認証しなくてはなりません

- `OAuth2`経由で接続するクライアントは分間最大60のリクエストを作成できます。

次の応答ヘッダーを監視して、制限を超えていないことを確認します。

X-Ratelimit-Used: この期間に使用されたリクエストのおおよその数 X-Ratelimit-Remaining: 残りのリクエスト数の概算 
X-Ratelimit-Reset: 期間終了までのおおよその秒数

- クライアントの User-Agent 文字列を、次の形式で、ターゲット プラットフォーム、一意のアプリケーション識別子、バージョン文字列、連絡先情報としてのユーザー名など、一意でわかりやすいものに変更します。こんな感じ：`<platform>:<app ID>:<version string> (by /u/<reddit username>)`

例えば：`User-Agent: android:com.example.myredditapp:v1.2.3 (by /u/kemitche)`

デフォルトのユーザー エージェント (「Python/urllib」や「Java」など) は、一意で説明的なユーザー エージェント文字列を奨励するために大幅に制限されています。 

アプリケーションのビルド時にバージョン番号を含めて更新することで、古いバグのあるバージョンや壊れたバージョンのアプリを安全にブロックできます。

ユーザーエージェントについて決して嘘をつかないでください。これには、一般的なブラウザのなりすましや、他のボットのなりすましが含まれます。極度の偏見を持った嘘つきを禁止します。

- 一度に複数のリソースをリクエストすることは、ループ内の単一のリソースをリクエストするよりも常に優れています。あなたがしようとしていることに対するバッチ API がない場合は、/r/redditdev でお問い合わせください。 

- robots.txt は検索エンジン用であり、API クライアント用ではありません。代わりに、API クライアントのこれらのルールに従ってください。

## OAuth2 認証

https://github.com/reddit-archive/reddit/wiki/OAuth2

#### Quick Start

https://github.com/reddit-archive/reddit/wiki/OAuth2-Quick-Start-Example

First Steps:

Appの種類の選択の仕方：ここの選択は重要な模様。

https://github.com/reddit-archive/reddit/wiki/OAuth2-App-Types

どのアプリケーションでredditにアクセスするの？

`Script`アプリケーションでいいのかも。

name: michiru-crawler
description: Collects medias that uploaded by joined communities.
