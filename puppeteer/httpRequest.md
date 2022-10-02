# Note: puppeteer.HTTPRequest

https://pptr.dev/api/puppeteer.httprequest/

## Remarks

webページがリクエストを、ネットワークリソースのようなリクエストを、送信するときはいつも以下のようなイベントがPuppeteerから発行される。

- `request`: webページがリクエストを発行したときに発行される
- `requestfinished`: レスポンスボディがダウンロードされてリクエストが完了されたときに発行される
- `requestFailed`: ある時点でリクエストが失敗すると、 requestfinished イベントの代わりに requestfailed イベントが発行されます。

HTTPのエラーを表すステータスコードを含むレスポンスが返されても、それは成功判定として`requestfinished`イベントが返される。

リダイレクトが発生してもこれも成功判定として`requestfinished`イベントが発行されて、新しいリクエストがリダイレクトURLに対して発行される。

`puppeteer.HTTPRequest`は内部的に生成される（コンストラクタは公開されない）。

`puppeteer.HTTPRequest`classは継承してはならない。

```JavaScript
page.on('request', request => ...);
```

## `abort()`

https://pptr.dev/api/puppeteer.httprequest.abort

リクエストを中止する。

> これを使用するには、Page.setRequestInterception() でリクエスト インターセプトを有効にする必要があります。有効になっていない場合、このメソッドはすぐに例外をスローします。

ということで`Page.setRequestInterception()`内部でだけ使用することができる。

## `continue()`

任意にリクエストをオーバーライドしてからリクエストを送信させる。

> これを使用するには、Page.setRequestInterception() でリクエスト インターセプトを有効にする必要があります。有効になっていない場合、このメソッドはすぐに例外をスローします。

同様。

オーバーライドの様子：

```JavaScript
await page.setRequestInterception(true);
page.on('request', request => {
  // Override headers
  const headers = Object.assign({}, request.headers(), {
    foo: 'bar', // set "foo" header
    origin: undefined, // remove "origin" header
  });
  request.continue({headers});
});
```

## `respond()`

リクエストに対して返事を出してしまう。

> これを使用するには、Page.setRequestInterception() でリクエスト インターセプトを有効にする必要があります。有効になっていない場合、このメソッドはすぐに例外をスローします。

同様。