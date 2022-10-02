# Note: puppeteer Request Interception

_Cooperative モードとレガシーモードがある。_

リクエスト傍受が有効になると、すべてのリクエストは、継続、応答、中止されない限り、傍受を停止する。

デフォルトでは、Puppeteer は、request.abort, request.continue, request.respond のいずれかが既に呼ばれた後に`request`イベントハンドラが呼ばれた場合、`Request is already handled！`例外を発生させます。

常に、未知のハンドラがすでに abort/continue/respond を呼んでいる可能性があることを想定してください。たとえあなたが登録したハンドラだけであっても、サードパーティのパッケージは独自のハンドラを登録することがあります。そのため、abort/continue/respond を呼ぶ前に request.isInterceptResolutionHandled を使って解決状況を常に確認することが重要です。

重要なのは、自分のハンドラが非同期処理を待っている間に、 インターセプトの解決は別のリスナーによって処理される可能性があるということです。

そのため、request.isInterceptResolutionHandled の返り値は、同期コードブロックの中だけでしか安全ではありません。

**request.isInterceptResolutionHandled と abort/continue/responding は常に同期的に実行するようにしましょう。**

この例では、2 つの同期ハンドラが一緒に動作している様子を示しています。

```JavaScript
/*
この最初のハンドラは、リクエストの傍受が一度も解決されていないので、request.continueの呼び出しに成功する。
*/
page.on('request', interceptedRequest => {
  if (interceptedRequest.isInterceptResolutionHandled()) return;
   // すでにcontinueが呼ばれているので...
  interceptedRequest.continue();
});

/*
この2番目のハンドラは、request.abortが呼び出される前に返される。
なぜならrequest.continueが初めのハンドラですでに呼び出し済みだからである。
*/
page.on('request', interceptedRequest => {
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  // この呼び出しは無効になる。
  interceptedRequest.abort();
});
```

この例では非同期処理と一緒につかう方法を実証している。

要は setTimeout()と someLongAsyncOperation がどっちが早く解決されるかは未知であるという話。

```JavaScript
/*
この最初のハンドラは、リクエストの傍受が一度も解決されていないので、request.continueの呼び出しに成功する。
*/
page.on('request', interceptedRequest => {
  // 傍受はまだ制御されていないなら、システムはこのガードを通過する。
  if (interceptedRequest.isInterceptResolutionHandled()) return;

  // It is not strictly necessary to return a promise, but doing so will allow Puppeteer to await this handler.
  return new Promise(resolve => {
    // Continue after 500ms
    setTimeout(() => {
      // Inside, check synchronously to verify that the intercept wasn't handled already.
      // It might have been handled during the 500ms while the other handler awaited an async op of its own.
      if (interceptedRequest.isInterceptResolutionHandled()) {
        resolve();
        return;
      }
      interceptedRequest.continue();
      resolve();
    }, 500);
  });
});

page.on('request', async interceptedRequest => {
  // The interception has not been handled yet. Control will pass through this guard.
  if (interceptedRequest.isInterceptResolutionHandled()) return;

  await someLongAsyncOperation();
  // The interception *MIGHT* have been handled by the first handler, we can't be sure.
  // Therefore, we must check again before calling continue() or we risk Puppeteer raising an exception.
  if (interceptedRequest.isInterceptResolutionHandled()) return;
  interceptedRequest.continue();
});
```

`request.interceptResolutionState`を使った場合：

```JavaScript
/*
This first handler will succeed in calling request.continue because the request interception has never been resolved.
*/
page.on('request', interceptedRequest => {
  // The interception has not been handled yet. Control will pass through this guard.
  const {action} = interceptedRequest.interceptResolutionState();
  if (action === InterceptResolutionAction.AlreadyHandled) return;

  // It is not strictly necessary to return a promise, but doing so will allow Puppeteer to await this handler.
  return new Promise(resolve => {
    // Continue after 500ms
    setTimeout(() => {
      // Inside, check synchronously to verify that the intercept wasn't handled already.
      // It might have been handled during the 500ms while the other handler awaited an async op of its own.
      const {action} = interceptedRequest.interceptResolutionState();
      if (action === InterceptResolutionAction.AlreadyHandled) {
        resolve();
        return;
      }
      interceptedRequest.continue();
      resolve();
    }, 500);
  });
});
page.on('request', async interceptedRequest => {
  // The interception has not been handled yet. Control will pass through this guard.
  if (
    interceptedRequest.interceptResolutionState().action ===
    InterceptResolutionAction.AlreadyHandled
  )
    return;

  await someLongAsyncOperation();
  // The interception *MIGHT* have been handled by the first handler, we can't be sure.
  // Therefore, we must check again before calling continue() or we risk Puppeteer raising an exception.
  if (
    interceptedRequest.interceptResolutionState().action ===
    InterceptResolutionAction.AlreadyHandled
  )
    return;
  interceptedRequest.continue();
});
```

## Coopertative Intercept Mode

解決の優先度を指定できるモード。

指定のしかたは、

HTTPRequest.abort(), HTTPRequest.continue(), HTTPResponse.respond()の引数に優先順位を表す number または指定子を指定することで解決優先度モードにすることができる。

基本的に`0`を指定する。

解決すべてに`0`を指定すると、continue < response < abort という優先度になるので全部`0`を指定したからと言って「登録順」で解決されるわけではない。

一番早く解決されるのは、優先度を指定していない request.abort、request.continue、request.response である（レガシーモード）

> request.abort、request.continue、request.response は、Cooperative Intercept Mode で動作するようにオプションの優先度を受け入れることができます。すべてのハンドラが Cooperative Intercept Mode を使用している場合、Puppeteer はすべてのインターセプトハンドラが登録順に実行され、待ち受けることを保証します。インターセプトは、最も優先度の高いものに解決されます。以下は、Cooperative Intercept Mode のルールです。

> - すべての解決は、中止/継続/対応するために、数値の優先順位の引数を与えなければならない。
> - どの解決方法でも優先順位を指定しない場合、レガシーモードがアクティブになり、協調インターセプトモードは非アクティブになります。
> - 非同期ハンドラは、インターセプトの解決が確定する前に終了する。
> - すなわち、どの解決が最も高い優先度を与えられたかに従って、最終的に傍受は中止/応答/継続される。
>   同点の場合は、中止＞応答＞継続となります。

> 標準化のために、Cooperative インタセプトモード優先度を指定するときは明確な最優先する理由がない限り`DEFAULT_INTERCEPT_RESOLUTION_PRIORITY`か`0`を使ってください。

> これは、continue よりも respond、respond よりも abort を優先させ、他のハンドラが協調して動作できるようにします。もし意図的に別の優先度を使いたい場合は、高い優先度の方が低い優先度よりも優先されます。負の優先順位も許されます。例えば、continue({}, 4) は continue({}, -2) に勝ります。

後方互換性を保つために、優先度を指定せずにインターセプトを解決するハンドラ (レガシーモード) は、即座に解決を引き起こします。Cooperative Intercept モードが動作するためには、すべての解決に優先度を使用する必要があります。実際には、request.isInterceptResolutionHandled をテストする必要があります。これは、あなたのコントロール外のハンドラが優先度なしで abort/continue/respond を呼び出した可能性があるためです (Legacy Mode)。

この例では、少なくともひとつのハンドラがインターセプトを解決する際に優先度を省略したため、レガシーモードが優先され、リクエストは直ちに中止されます。

```JavaScript
// Final outcome: immediate abort()
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Legacy Mode: interception is aborted immediately.
  request.abort('failed');
});
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;
  // Control will never reach this point because the request was already aborted in Legacy Mode

  // Cooperative Intercept Mode: votes for continue at priority 0.
  request.continue({}, 0);
});
```

以下の例では優先度を指定していないハンドラが少なくとも一つあるためレガシーモードが優先されて`continue`が実行されることになる

```JavaScript
// Final outcome: immediate continue()

// 優先度をしているけど
// 他が優先度を指定していないため
// continueが先に実行されるために
// 結局実行されないハンドラ
page.setRequestInterception(true);
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Cooperative Intercept Mode: votes to abort at priority 0.
  request.abort('failed', 0);
});

// 結果実行されることになるハンドラ
// 優先度を指定しないため
page.on('request', request => {
  if (request.isInterceptResolutionHandled()) return;

  // Control reaches this point because the request was cooperatively aborted which postpones resolution.

  // { action: InterceptResolutionAction.Abort, priority: 0 }, because abort @ 0 is the current winning resolution
  console.log(request.interceptResolutionState());

  // Legacy Mode: intercept continues immediately.
  request.continue({});
});

// 何もしないハンドラ
// 先のハンドラにてcontinue()が実行されたから
page.on('request', request => {
  // { action: InterceptResolutionAction.AlreadyHandled }, because continue in Legacy Mode was called
  console.log(request.interceptResolutionState());
});
```
