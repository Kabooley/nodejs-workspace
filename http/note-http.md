# HTTP

Node.js v16.x

https://nodejs.org/dist/latest-v16.x/docs/api/http.html

## http.ClientRequest

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest
---

`http.ClientRequest`は内部的に生成されて、`http.request()`から返されることで取得することができる。

これは、ヘッダーがすでにキューに入れられている進行中のリクエストを表します。

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

## `http.ClientRequest` Events

#### `close`

> リクエストが完了したか、基になる接続が途中で (レスポンスが完了する前に) 終了したことを示します。

#### `connect`

> サーバーが`CONNECT`メソッドでリクエストに応答するたびに発行されます。

#### `continue`

サーバが`100 Continue`のHTTPレスポンスを返したときに発行される。

#### `finish`

リクエストが送信されたときに発行される。

#### `response`

リクエストに対するレスポンスを受信したことを意味するイベント。**一度きりしか発行されない。**


## `request` methods

HTTPメソッドのことではなくて、`http.ClientRequest`APIのメソッド。

#### `request.end()`

リクエスト送信を完了させる。まだ未送信の部分がある場合、ストリームへフラッシュされる。

もしコールバック引数を指定したら、そのコールバック関数はリクエストストリームが終了してから呼び出される。

#### `request.destory()`

> リクエストを破棄します。オプションで「エラー」イベントを発行し、「クローズ」イベントを発行します。これを呼び出すと、応答内の残りのデータがドロップされ、ソケットが破棄されます。

`Writable.destory`と同じかと。

## `http.ClientRequest` status properties

#### `request.destoryed`

`request.destroy()`呼び出し後ならば`true`。

`Writable.destoryed`とおなじかと。

#### `request.writableEnded`

> request.end() が呼び出された場合、request.finished プロパティは true になります。リクエストが http.get() 経由で開始された場合、request.end() が自動的に呼び出されます。

## ケース別発生イベント順序

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

...もろもろのケースでは`close`には最終的にはなるけどエラーが起こったのかどうかは`error`にて、エラーコードやメッセージの確認が必要で、



## `request.end()`が必須だけど、いつ呼び出せばいいの？

`http.request()`APIの説明のところで`request.end()`呼び出しが必須と書いてあったので、

送信完了したことを確認してからendするようにする。

問題は、「リクエストの完了」が、サーバにもうレスポンス返さなくていいよのサインになるかもしれないということ。

レスポンスおくっている途中で、リクエスト完了信号を受信してサーバが途中だけどレスポンス返すのやめるかもしれない...

それを検証しないとわからない。（公式には載っていない...クソ）

## `http.request()`でエラー発生したときの適切な終了のさせ方は？

fsの時みたいに、`writable.destroy()`、`readable.destroy()`していいの？

それとも`http.end()`を呼び出してちゃんとサーバに信号おくったほうがいいの？

それとも