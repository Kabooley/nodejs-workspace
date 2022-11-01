# HTTP

Node.js v16.x

https://nodejs.org/dist/latest-v16.x/docs/api/http.html

## 目次

- [http.ClientRequest](#http.ClientRequest)
- [http.request()](#http.request())
- [](#)

## http.ClientRequest

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest
---

`http.ClientRequest`は内部的に生成されて、`http.request()`から返されることで取得することができる。

これは、HTTPヘッダーがすでにキューに入れられている進行中のリクエストを表します。

ヘッダーは`setHeader(name, value)`, `getHeader(name)`, `removeHeader(name)` APIでまだ変更可能である。

実際のヘッダーは、最初のデータ チャンクと一緒に、または request.end() の呼び出し時に送信されます。


レスポンスを取得するには`response`イベントリスナをリクエストオブジェクトに追加すること。

`response`は、レスポンスヘッダを受信したときにリクエストオブジェクトから発行される。

`response`イベントは`http.IncomingMessage`のインスタンスを引数として実行される。


`response`イベント中は、レスポンスオブジェクトにイベントリスナを登録できる。特に`data`イベントを登録できる。（するといい）


もしも一切`response`イベントハンドラが追加されていなかったら、レスポンスは完全に破棄される。

一方で、`response`イベントハンドラを追加しているならば、レスポンスからのデータは必ず消費しなくてはならない、

`response.read()`か、`data`イベントハンドラか、`response.resume()`の呼び出しによってかで。

データがすべて消費されない限り、`end`イベントは発行されない。

また、データが読み取られるまでメモリが消費され、最終的に「プロセスがメモリ不足」エラーにつながる可能性があります。


後方互換性のために、レスポンスは`error`イベントハンドラが登録されている場合`error`イベントだけ発行する。
---


ということで、

- `http.ClientRequest`は`http.request()`からのみ取得できる
- `response`が欲しかったら(`http.request()`から返される)リクエストオブジェクトに`response`イベントハンドラを付けろ
- そうしない限りレスポンスは破棄される
- `response`を取得したら必ずデータを消費すること
- データが完全に消費されない限り`end`イベントは発行されない
- `error`イベントが登録されてある場合に限り`error`イベントが発行される（もしもエラーが起こったら）

内容的に、`http.request()`も同時に調べておかないといかんなぁ。


#### `close`

> リクエストが完了したか、基になる接続が途中で (レスポンスが完了する前に) 終了したことを示します。

#### `connect`

> サーバーが`CONNECT`メソッドでリクエストに応答するたびに発行されます。

#### `continue`

サーバが`100 Continue`のHTTPレスポンスを返したときに発行される。

#### `finish`

リクエストが送信されたときに発行される。

厳密にいうと、ヘッダとボディの最後のセグメントがオペレーティングシステムへゆだねられたときに発行される。

finishとcloseの違いは何だろう。

finishはサーバへリクエストデータを送信したら発行されるイベントで、closeはサーバからのレスポンスが完全に受信しきったときに発行されるイベントである（と思う）。なのでfinishイベントが発生してもサーバから返事はまだ来ていない。

#### `response`

リクエストに対するレスポンスを受信したことを意味するイベント。**一度きりしか発行されない。**

`http.request()`のオプショナルのコールバック引数はそのままこの`response`イベントハンドラになる。


#### `request.end()`

リクエスト送信を完了させる。まだ未送信の部分がある場合、ストリームへフラッシュされる。

もしコールバック引数を指定したら、そのコールバック関数はリクエストストリームが終了してから呼び出される。

適切な呼び出し場所がわからん。

しかし、おそらく`http.request()`したらそのまま同じスコープで`request.end()`すればいいと思う。

#### `request.destory()`

> リクエストを破棄します。オプションで「エラー」イベントを発行し、「クローズ」イベントを発行します。これを呼び出すと、応答内の残りのデータがドロップされ、ソケットが破棄されます。

`Writable.destory`と同じかと。

## `http.ClientRequest` status properties

#### `request.destoryed`

`request.destroy()`呼び出し後ならば`true`。

`Writable.destoryed`とおなじかと。

#### `request.writableEnded`

`request.end()`が呼び出された後ならば`true`になる。このプロパティはストリームに残るデータがフラッシュされたことを示さない。

#### `request.writableFinished`

リクエストストリームにバッファされているすべてのデータがフラッシュされたら、`finish`イベントの直前に`true`になる。

#### まとめ

ところどころ`http.request()`の項目と`http.IncomingMessage`の項目を前提としている部分有。

すべてが成功した場合：

- `http.request()`
- リクエスト送信完了を示すため`request.end()`を明示的に呼び出す
- リクエストのストリームにデータがフラッシュされてリクエスト送信が完了となる また、`request.writableEnded`が`true`になる
- リクエストがフラッシュされたので`request.writableFinished`が`true`になる
- 直ちに`finish`イベントが発行されてリクエスト送信完了となる
- (サーバがリクエストを受信して返事を送信しだしたとする)
- サーバから返事を受信して`response`イベントが一度だけ発行される
- (on response)`data`イベントが、レスポンスbodyを取得しきるまで継続的に発行される 
- (on response)bodyを取得しきったら`end`イベントが発行される
- `close`イベントが発行されてリクエストが完了となる

エラーを考慮にいれると：

request.destroy()がどこかで呼び出される、request.abort()がどこかで呼び出される、接続が失敗した、無効なURLでサーバに接続しようとした、Ctrl + Cが入力されるなど。



## http.request()

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#httprequestoptions-callback

NOTE: まず`http.ClientRequest`を把握してから読んで。

Syntax:

```TypeScript
    // 2 override
    function request(
        options: RequestOptions | string | URL, 
        callback?: (res: http.IncomingMessage) => void): http.ClientRequest;
    function request(
        url: string | URL, 
        options: RequestOptions, 
        callback?: (res: http.IncomingMessage) => void): http.ClientRequest;

    class IncomingMessage extends stream.Readable {
        // ...
    }
```

`RequestOptions`はURLやhttpメソッド、ユーザエージェント、リクエストヘッダに関する情報を登録する。

> **オプション引数のコールバックは、`response`イベントの 1 回限りのリスナーとして追加されます。**

`http.ClientRequest`は`Writable`ストリームである。

`POST`したいときは`ClientRequest`オブジェクトへ書き込めばいい。

> **http.request() では、(リクエストの本文にデータが書き込まれていない場合でも、)リクエストの終了を示すために常に`req.end()`を呼び出す必要があります。**

リクエスト中にエラーが発生した場合 (DNS 解決、TCP レベルのエラー、または実際の HTTP 解析エラーなど)、

返された`http.ClientRequest`オブジェクトに対して「エラー」イベントが発行されます。

すべての「エラー」イベントと同様に、リスナーが登録されていない場合、エラーがスローされます。
---

ということで、

- `http.request()`は戻り値に`http.ClientRequest`オブジェクトを、コールバック関数に`response`オブジェクトを(`http.IncomingMessage`として)出力する。
- HTTPのレスポンスを生で受け取るのではなくて、`http.IncomingMessage`というストリームの派生クラスとして間接的に受け取る。
- `response`イベントハンドラを追加したらデータを消費することが最優先の責務となるので、**コールバック関数の中で必ず`data`イベントなりの消費実装を組み込む必要がある。**
- リクエスト中に発生したエラーは、`http.ClientRequest`に`error`イベントハンドラが追加されてあればエラーを発行し、そうでないなら例外としてスローされる
- `http.request()`を呼び出したら必ず本文の有無にかかわらず`ClientRequest.end()`を呼び出すこと

サンプル：

```TypeScript
import http = require('node:http');

const postData = JSON.stringify({
  'msg': 'Hello World!'
});

const options: http.RequestOptions = {
  hostname: 'www.google.com',
  port: 80,
  path: '/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// 
const req: http.ClientRequest = http.request(
    options, 
    // コールバックは一度きりの`response`イベントリスナ
    (res: http.IncomingMessage) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.setEncoding('utf8');
    //   
    // 
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

// `error`イベントハンドラを追加しておかない限りエラーが起こっていいたとしてもイベントが発行されない
// (からイベントリスナは必ず追加)
req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

// POSTするなら...
// Write data to request body
req.write(postData);

// 必ず呼び出す！
req.end();
```


#### ケース別発生イベント順序

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#httprequestoptions-callback

上記の記事の、`Example using a URL as options:`の文章以下に、

どんなときにどんなイベントがどんな順序で発生するのか書いてあった。

- リクエストが成功したとき:

`socket`, `response`, `data` on response object, `end` on response object, `close`

- connectionエラーが発生したとき:

`socket`, `error`, `close`

- レスポンス受信前に早期に接続が閉じられたとき

`socket`, `error` with `Error socket hang up` message & code `ECONNRESET`, `close`

- レスポンスを受信してから早期に接続が閉じられたとき

省略

- `request.destroy()`がソケット割り当て前に呼び出されたら

`error` with `Error socket hang up` & code `ECONNRESET`, `close`

- `request.destroy()`が接続が成功する前に呼び出されたら

省略

- 

とにかく...

- `close`にはなる
- `request.destroy()`されたら`error`発行される




## `request.end()`が必須だけど、いつ呼び出せばいいの？

結論：*リクエストの送信を完了したら*

`http.request()`APIの説明のところで`request.end()`呼び出しが必須と書いてあったので、

送信完了したことを確認してからendするようにする。

リクエストを送信したことを完了したということをサーバに知らせるだけで、

レスポンスをもう返さなくていいよということを知らせるわけではない。

公式は以下のように述べている。

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest

> The actual header will be sent along with the first data chunk or when calling request.end().

つまり`request.end()`を呼び出してからリクエストヘッダを送信するので

さっさとend()を呼び出してしまえばよい。

なので以下のようにして大丈夫

```TypeScript
  const req: http.ClientRequest = https.request(options ? options : this.options, (res: http.IncomingMessage)  => {
      if(res.statusCode !== 200) throw new Error(`Error: Server reapond ${res.statusCode}. ${res.statusMessage}`);
      this.res = res;
      this._setEventListener();
  });

  req.on('error', (e: Error) => { console.error(e);});
  req.on('finish', () => { console.log("req: finished."); });
  req.on('close', () => { console.log("req: closed."); });
  req.on('end', () => { console.log("req: end."); });
  req.end(() => {console.log("req: Request stream is finished"); });
```

つまり`http.request()`の戻り値が返ってきたらすぐ呼出していいのかも。

`POST`のときにめちゃおおきなデータを送信するとかなったらすぐに`end()`しない方がいいのかしら？

まぁそれは別の機会に。

## `http.request()`でエラー発生したときの適切な終了のさせ方は？

TODO: 要検証

fsの時みたいに、`writable.destroy()`、`readable.destroy()`していいの？

それとも`http.end()`を呼び出してちゃんとサーバに信号おくったほうがいいの？
