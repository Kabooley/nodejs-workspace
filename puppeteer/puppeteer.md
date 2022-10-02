# Puppeteer

https://github.com/puppeteer/puppeteer

https://pptr.dev/api/

https://developer.chrome.com/docs/puppeteer/debugging/

## puppeteerはメモリリークを起こすものである

https://devforth.io/blog/how-to-simply-workaround-ram-leaking-libraries-like-puppeteer-universal-way-to-fix-ram-leaks-once-and-forever/

https://stackoverflow.com/a/73098157/13891684

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

## お作法

##### finallyでbrowser.close()すること

エラー時にするのでもいいけど。

ブラウザプロセスは残してconnect, disconnectするのでもないのなら、

必ずbrowser.close()するようにしよう。

でないとゾンビchromiumが発生してしまうかも。

try...catch, finallyでのfinallyでやれば確実かも。

##### 新規のタブを生成するのを回避すること

実は`browser.launch()`したらすでにタブは開かれている！！

チュートリアルでよく見る`browser.newPage()`は、実はすでにタブがあるのに余計なタブを開く無駄をしていたのだった。

`browser.launch()`でオープンタブを取得するには

```JavaScript
const page = (await browser.pages())[0];
```

#### 他見つけた情報

https://docs.browserless.io/docs/best-practices.html


#### ログインフォームに対するアプローチ

ログインに限った話じゃないけれど、HTTPを使ったアプローチができればDOMいらずかも。

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



#### Puppeteerで画像をダウンロードする方法

の情報収集

ヒント：

- `HTTP.response`から画像のURLを取得してそのままダウンロードする
- `page.on('response')`でレスポンスがあったら反応するようにする
- `response.url()`が期待のURLと一致するかどうかでフィルタリングする
- `response.buffer()`の使い方の習得


https://stackoverflow.com/questions/52542149/how-can-i-download-images-on-a-page-using-puppeteer

https://www.bannerbear.com/blog/how-to-download-images-from-a-website-using-puppeteer/#step-3-write-the-code-for-downloading-images

ここなら信頼度高いかも：

https://github.com/puppeteer/puppeteer/issues/1937
