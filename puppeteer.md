# Puppeteer

https://github.com/puppeteer/puppeteer

https://pptr.dev/api/

https://developer.chrome.com/docs/puppeteer/debugging/

## Puppeteer class

https://pptr.dev/api/puppeteer.puppeteer/

Node.js環境では`import puppeteer`すると`PuppeteerNode`インスタンスを使うことになります。

> If you're using Puppeteer in a Node environment, this is the class you'll get when you run require('puppeteer') (or the equivalent ES import).

なので、Node.js環境で

```JavaScript
import * as puppeteer from 'puppeteer';
```

したら実は`PuppeteerNode`クラスをインポートしていることになる。

```TypeScript
export declare class PuppeteerNode extends Puppeteer
```

ということで継承クラスである。

#### `PuppeteerNode.launch()`

> puppeteer を起動し、指定された引数とオプションを指定してブラウザー インスタンスを起動します。

`PuppeteerNode.launch()`で`browser`インスタンスが生成される。

```TypeScript
class PuppeteerNode {
  launch(options?: PuppeteerLaunchOptions): Promise<Browser>;
}

export declare interface PuppeteerLaunchOptions extends LaunchOptions, BrowserLaunchArgumentOptions, BrowserConnectOptions {
    product?: Product;
    extraPrefsFirefox?: Record<string, unknown>;
}

export declare interface BrowserLaunchArgumentOptions {
    /**
     * Whether to run the browser in headless mode.
     * @defaultValue true
     */
    headless?: boolean | 'chrome';
    /**
     * Path to a user data directory.
     * {@link https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/user_data_dir.md | see the Chromium docs}
     * for more info.
     */
    userDataDir?: string;
    /**
     * Whether to auto-open a DevTools panel for each tab. If this is set to
     * `true`, then `headless` will be forced to `false`.
     * @defaultValue `false`
     */
    devtools?: boolean;
    /**
     *
     */
    debuggingPort?: number;
    /**
     * Additional command line arguments to pass to the browser instance.
     */
    args?: string[];
}
```

この`BrowserLaunchArgumentOptions.args`に渡すのはブラウザインスタンスの起動時に追加で渡すオプションである。

つまりchromiumブラウザ軌道に関するオプションで

ここにリストが...

https://peter.sh/experiments/chromium-command-line-switches/




#### `PuppeteerNode.launch()`オプション




## Browser class

https://pptr.dev/api/puppeteer.browser/

Puppeteer独自の(たぶｎNode.jsのEventEmitterを継承した)EventEmitterクラスを継承するクラス。

インスタンスはヘッドレスブラウザへ接続するとき、つまり`PuppeteerNode.launch()`か`Puppeteer.connect()`どちらかで接続すると生成される。

ブラウザとアプリケーションの橋渡しのような存在


#### `browser.newPage()`

> 新しい Page オブジェクトに解決される Promise。ページは、デフォルトのブラウザー コンテキストで作成されます。

デフォルトのブラウザーコンテキストで作成されるとあるので、そのブラウザでしか使えないページだよってことですね。

他のブラウザコンテキストでは使えないのかも。

#### `browser.close()`

> Chromium とそのすべてのページ (開いている場合) を閉じます。 Browser オブジェクト自体は破棄されたと見なされ、使用できなくなります。

close()もdisconnect()も両方もはや`browser`インスタンスが破棄されるけど、

前者はpageもchromiumも閉じるが、後者はchromiumプロセスはそのままにしておける。

## Page

https://pptr.dev/api/puppeteer.page/

`Page`はブラウザの単一タブまたは拡張機能のバックグラウンドページへインタラクトするメソッドを提供する。

#### `Page.evaluate()`

> ページのコンテキストで関数を評価し、結果を返します。 page.evaluteHandle に渡された関数が Promise を返す場合、関数は Promise が解決されるまで待機し、その値を返します。

https://pptr.dev/api/puppeteer.page.evaluate

> The function argument of page.evaluate() is executed in the document (browser) context and has no access to the variables of the Node.js script. You need to transfer these variables by values:

ということでpage.evaluate()はNode.jsのコンテキストとは異なるコンテキストで実行されるから、
スコープがNode.jsとことなるからevaluate()にアクセスされたい変数などは、evaluate()のコールバック引数の次にその変数を渡す必要がある。

```TypeScript
await page.evaluate((selectors) => {
    const $username: HTMLInputElement | null = document.querySelector<HTMLInputElement>(selectors.usernameForm);
    const $password: HTMLInputElement | null = document.querySelector<HTMLInputElement>(selectors.passwordForm);
    const $login: HTMLElement | null = document.querySelector<HTMLElement>(selectors.loginButton);
    if(!$username || !$login || !$password) throw new Error('DOM: username or password or login-button were not found');
},
// pass params 
selectors);
```

## consdiering

#### bot判定やrecapthcaを回避するために

参考：

https://stackoverflow.com/questions/51731848/how-to-avoid-being-detected-as-bot-on-puppeteer-and-phantomjs

https://scrapingant.com/blog/puppeteer-tricks-to-avoid-detection-and-make-web-scraping-easier

https://gist.github.com/tegansnyder/c3aeae4d57768c58247ae6c4e5acd3d1

1. Headless modeで実行すること
2. 新規のタブを生成するのを回避すること
3. Proxyを使いこなすこと
4. Cookieとローカルストレージデータを使いこなすこと
5. `puppeteer-extra-plugin-stealth`を使う
5. Cloud APIを使う

##### 新規のタブを生成するのを回避すること

実は`browser.launch()`したらすでにタブは開かれている！！

チュートリアルでよく見る`browser.newPage()`は、実はすでにタブがあるのに余計なタブを開く無駄をしていたのだった。

`browser.launch()`でオープンタブを取得するには

```JavaScript
const page = (await browser.pages())[0];
```

#### ログインフォームに対するアプローチ

- DOM取得>ログイン情報を値としてDOMへ入力>ログインボタンDOMのクリック
- Basic認証

https://ja.wikipedia.org/wiki/Basic%E8%AA%8D%E8%A8%BC

> Basic認証（ベーシックにんしょう、Basic Authentication）とは、HTTPで定義される認証方式（HTTP認証）の一つ。基本認証と呼ばれることも。

> Basic認証では、ユーザ名とパスワードの組みをコロン ":" でつなぎ、Base64でエンコードして送信する。このため、盗聴や改竄が簡単であるという欠点を持つが、ほぼ全てのWebサーバおよびブラウザで対応しているため、広く使われている。

ということで`{username:password}`を送信するとそのままログインページを突破できるみたいなこと。

Puppeteerでの実現：

```JavaScript
    //pageを定義
    const page = await browser.newPage()
    const navigationPromise = page.waitForNavigation()

    //Basic認証を突破してログイン
    await page.authenticate({username: userid, password: pw});
    await page.goto(url, {waitUntil: "domcontentloaded"});
    await page.setViewport({ width: 1300, height: 900 })
    await navigationPromise
```

#### web scrapingするときに気を付けることなど

https://docs.browserless.io/docs/best-practices.html

- `await`を可能な限り減らす


## (自習)プロキシって何？

> プロキシ（proxy; [ˈprɒksɪ]）とは「代理」の意味である。インターネット関連で用いられる場合は、特に内部ネットワークからインターネット接続を行う際、高速なアクセスや安全な通信などを確保するための中継サーバ「プロキシサーバ」を指す。

> プロキシはクライアントとサーバの間に存在し、情報元のサーバに対してはクライアントの情報を受け取る、クライアントに対してはサーバの働きをする（HTTPプロキシの場合）。

へぇ。

https://scrapingant.com/blog/puppeteer-tricks-to-avoid-detection-and-make-web-scraping-easier#proxy-setup

より、proxyを使うメリットは？

> 大規模なスクレイピングでは、プロキシを使用することが重要です。 Web サイトをスクレイピングして一定数のページにアクセスしようとすると、レート制限防御メカニズムによってアクセスがブロックされます。一部のサイトでは、スクレイピングの試みを認識すると 4** のステータス コード範囲が返されるか、キャプチャ チェックで空のページが返されます。

> プロキシを使用すると、ターゲット サイトへのアクセス中に IP 禁止を回避し、レート制限を超えることができます。 Puppeteer プロキシ設定記事の拡張版を確認するか、以下の有用なスニペットに従うことができます。 Puppeteer を起動するとき、指定されたアドレスをフィールド --proxy-server=<address> を使用して配列オブジェクトとして指定する必要があります。これにより、このパラメーターがヘッドレス Chrome インスタンスに直接送信されます。

ということで直接アプリケーションとスクレイピング対象のwebサイトへアクセスするとそのうち制限かかってアクセスできなくされちゃうけど、

プロキシサーバーを間に立てるとそのアクセス制限を回避できるようになると

というのがメリット。

puppeteerでプロキシサーバを使うなら

```JavaScript
const puppeteer = require('puppeteer');

(async() => {
    
  const browser = await puppeteer.launch({
    // NOTE: ここに以下のようなオプションを渡す
    // URLがプロキシサーバのURL
     args: [ '--proxy-server=http://10.10.10.10:8080' ]
  });

  const page = await browser.newPage();
  await page.authenticate({
      username: 'USERNAME',
      password: 'PASSWORD'
  });
  await page.goto('https://httpbin.org/ip');
  await browser.close();
})();
```

ということでプロキシサーバは自前で用意しないといけない。

以下のサービスなら無料で使えるかもね。

#### scrapingAnt API

プロキシサーバを使わせてくれるサービス。

https://scrapingant.com/free-proxies/

https://scrapingant.com/blog/free-proxy-web-scraping

プロキシを使うメリット：

プロキシを使用すると、Web サイトを確実に遮断できます。禁止またはブロックされる可能性を減らす プロキシを使用すると、特定の地理的な場所を使用できます。これは、特にオンライン小売業者からのデータをスカーピングする場合に非常に重要です プロキシを使用すると、ブロックまたは禁止されることなく、Web サイトに複数のリクエストを行うことができます プロキシを使用すると、同じ Web サイトまたは別の Web サイトに対して無制限の並行セッションを作成できます

https://scrapingant.com/#pricing

フリートライアルなら月間10000回の使用までならAPIを使うことができる。クレカ登録不要とのこと。

あとで使ってみてもいいかもね。

#### chromium プロセスがゾンビになってない？

```bash
<ref *1> ChildProcess {
  _events: [Object: null prototype] {
    exit: [Function: bound onceWrapper] {
      listener: [AsyncFunction (anonymous)]
    }
  },
  _eventsCount: 1,
  _maxListeners: undefined,
  _closesNeeded: 2,
  _closesGot: 0,
  connected: false,
  signalCode: null,
  exitCode: null,
  killed: false,
  spawnfile: '/home/teddy/nodejs-workspace/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome',
  _handle: Process {
    onexit: [Function (anonymous)],
    pid: 3970,
    [Symbol(owner_symbol)]: [Circular *1]
  },
  spawnargs: [
    '/home/teddy/nodejs-workspace/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome',
    '--allow-pre-commit-input',
    '--disable-background-networking',
    '--enable-features=NetworkServiceInProcess2',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-breakpad',
    '--disable-client-side-phishing-detection',
    '--disable-component-extensions-with-background-pages',
    '--disable-default-apps',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--disable-features=Translate,BackForwardCache,AcceptCHFrame,AvoidUnnecessaryBeforeUnloadCheckSync',
    '--disable-hang-monitor',
    '--disable-ipc-flooding-protection',
    '--disable-popup-blocking',
    '--disable-prompt-on-repost',
    '--disable-renderer-backgrounding',
    '--disable-sync',
    '--force-color-profile=srgb',
    '--metrics-recording-only',
    '--no-first-run',
    '--enable-automation',
    '--password-store=basic',
    '--use-mock-keychain',
    '--enable-blink-features=IdleDetection',
    '--export-tagged-pdf',
    '--headless',
    '--hide-scrollbars',
    '--mute-audio',
    'about:blank',
    '--remote-debugging-port=0',
    '--user-data-dir=/tmp/puppeteer_dev_chrome_profile-oX2G2c'
  ],
  pid: 3970,
  stdin: <ref *2> Socket {
    connecting: false,
    _hadError: false,
    _parent: null,
    _host: null,
    _readableState: ReadableState {
      objectMode: false,
      highWaterMark: 16384,
      buffer: BufferList { head: null, tail: null, length: 0 },
      length: 0,
      pipes: [],
      flowing: null,
      ended: false,
      endEmitted: false,
      reading: false,
      constructed: true,
      sync: true,
      needReadable: false,
      emittedReadable: false,
      readableListening: false,
      resumeScheduled: false,
      errorEmitted: false,
      emitClose: false,
      autoDestroy: true,
      destroyed: false,
      errored: null,
      closed: false,
      closeEmitted: false,
      defaultEncoding: 'utf8',
      awaitDrainWriters: null,
      multiAwaitDrain: false,
      readingMore: false,
      dataEmitted: false,
      decoder: null,
      encoding: null,
      readable: false,
      [Symbol(kPaused)]: null
    },
    _events: [Object: null prototype] { end: [Function: onReadableStreamEnd] },
    _eventsCount: 1,
    _maxListeners: undefined,
    _writableState: WritableState {
      objectMode: false,
      highWaterMark: 16384,
      finalCalled: false,
      needDrain: false,
      ending: false,
      ended: false,
      finished: false,
      destroyed: false,
      decodeStrings: false,
      defaultEncoding: 'utf8',
      length: 0,
      writing: false,
      corked: 0,
      sync: true,
      bufferProcessing: false,
      onwrite: [Function: bound onwrite],
      writecb: null,
      writelen: 0,
      afterWriteTickInfo: null,
      buffered: [],
      bufferedIndex: 0,
      allBuffers: true,
      allNoop: true,
      pendingcb: 0,
      constructed: true,
      prefinished: false,
      errorEmitted: false,
      emitClose: false,
      autoDestroy: true,
      errored: null,
      closed: false,
      closeEmitted: false,
      [Symbol(kOnFinished)]: []
    },
    allowHalfOpen: false,
    _sockname: null,
    _pendingData: null,
    _pendingEncoding: '',
    server: null,
    _server: null,
    [Symbol(async_id_symbol)]: 8,
    [Symbol(kHandle)]: Pipe { [Symbol(owner_symbol)]: [Circular *2] },
    [Symbol(lastWriteQueueSize)]: 0,
    [Symbol(timeout)]: null,
    [Symbol(kBuffer)]: null,
    [Symbol(kBufferCb)]: null,
    [Symbol(kBufferGen)]: null,
    [Symbol(kCapture)]: false,
    [Symbol(kSetNoDelay)]: false,
    [Symbol(kSetKeepAlive)]: false,
    [Symbol(kSetKeepAliveInitialDelay)]: 0,
    [Symbol(kBytesRead)]: 0,
    [Symbol(kBytesWritten)]: 0
  },
  stdout: null,
  stderr: <ref *3> Socket {
    connecting: false,
    _hadError: false,
    _parent: null,
    _host: null,
    _readableState: ReadableState {
      objectMode: false,
      highWaterMark: 16384,
      buffer: BufferList { head: null, tail: null, length: 0 },
      length: 0,
      pipes: [],
      flowing: true,
      ended: false,
      endEmitted: false,
      reading: true,
      constructed: true,
      sync: false,
      needReadable: true,
      emittedReadable: false,
      readableListening: false,
      resumeScheduled: false,
      errorEmitted: false,
      emitClose: false,
      autoDestroy: true,
      destroyed: false,
      errored: null,
      closed: false,
      closeEmitted: false,
      defaultEncoding: 'utf8',
      awaitDrainWriters: null,
      multiAwaitDrain: false,
      readingMore: false,
      dataEmitted: true,
      decoder: null,
      encoding: null,
      [Symbol(kPaused)]: false
    },
    _events: [Object: null prototype] {
      end: [Array],
      close: [Function (anonymous)],
      error: [Function: onerror],
      data: [Function: ondata]
    },
    _eventsCount: 4,
    _maxListeners: undefined,
    _writableState: WritableState {
      objectMode: false,
      highWaterMark: 16384,
      finalCalled: false,
      needDrain: false,
      ending: false,
      ended: false,
      finished: false,
      destroyed: false,
      decodeStrings: false,
      defaultEncoding: 'utf8',
      length: 0,
      writing: false,
      corked: 0,
      sync: true,
      bufferProcessing: false,
      onwrite: [Function: bound onwrite],
      writecb: null,
      writelen: 0,
      afterWriteTickInfo: null,
      buffered: [],
      bufferedIndex: 0,
      allBuffers: true,
      allNoop: true,
      pendingcb: 0,
      constructed: true,
      prefinished: false,
      errorEmitted: false,
      emitClose: false,
      autoDestroy: true,
      errored: null,
      closed: false,
      closeEmitted: false,
      writable: false,
      [Symbol(kOnFinished)]: []
    },
    allowHalfOpen: false,
    _sockname: null,
    _pendingData: null,
    _pendingEncoding: '',
    server: null,
    _server: null,
    [Symbol(async_id_symbol)]: 9,
    [Symbol(kHandle)]: Pipe { reading: true, [Symbol(owner_symbol)]: [Circular *3] },
    [Symbol(lastWriteQueueSize)]: 0,
    [Symbol(timeout)]: null,
    [Symbol(kBuffer)]: null,
    [Symbol(kBufferCb)]: null,
    [Symbol(kBufferGen)]: null,
    [Symbol(kCapture)]: false,
    [Symbol(kSetNoDelay)]: false,
    [Symbol(kSetKeepAlive)]: false,
    [Symbol(kSetKeepAliveInitialDelay)]: 0,
    [Symbol(kBytesRead)]: 0,
    [Symbol(kBytesWritten)]: 0
  },
  stdio: [
    <ref *2> Socket {
      connecting: false,
      _hadError: false,
      _parent: null,
      _host: null,
      _readableState: [ReadableState],
      _events: [Object: null prototype],
      _eventsCount: 1,
      _maxListeners: undefined,
      _writableState: [WritableState],
      allowHalfOpen: false,
      _sockname: null,
      _pendingData: null,
      _pendingEncoding: '',
      server: null,
      _server: null,
      [Symbol(async_id_symbol)]: 8,
      [Symbol(kHandle)]: [Pipe],
      [Symbol(lastWriteQueueSize)]: 0,
      [Symbol(timeout)]: null,
      [Symbol(kBuffer)]: null,
      [Symbol(kBufferCb)]: null,
      [Symbol(kBufferGen)]: null,
      [Symbol(kCapture)]: false,
      [Symbol(kSetNoDelay)]: false,
      [Symbol(kSetKeepAlive)]: false,
      [Symbol(kSetKeepAliveInitialDelay)]: 0,
      [Symbol(kBytesRead)]: 0,
      [Symbol(kBytesWritten)]: 0
    },
    null,
    <ref *3> Socket {
      connecting: false,
      _hadError: false,
      _parent: null,
      _host: null,
      _readableState: [ReadableState],
      _events: [Object: null prototype],
      _eventsCount: 4,
      _maxListeners: undefined,
      _writableState: [WritableState],
      allowHalfOpen: false,
      _sockname: null,
      _pendingData: null,
      _pendingEncoding: '',
      server: null,
      _server: null,
      [Symbol(async_id_symbol)]: 9,
      [Symbol(kHandle)]: [Pipe],
      [Symbol(lastWriteQueueSize)]: 0,
      [Symbol(timeout)]: null,
      [Symbol(kBuffer)]: null,
      [Symbol(kBufferCb)]: null,
      [Symbol(kBufferGen)]: null,
      [Symbol(kCapture)]: false,
      [Symbol(kSetNoDelay)]: false,
      [Symbol(kSetKeepAlive)]: false,
      [Symbol(kSetKeepAliveInitialDelay)]: 0,
      [Symbol(kBytesRead)]: 0,
      [Symbol(kBytesWritten)]: 0
    }
  ],
  [Symbol(kCapture)]: false
}
browser closed explicitly
```