# Puppeteer

https://github.com/puppeteer/puppeteer

https://pptr.dev/api/

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

```TypeScript
class PuppeteerNode {
  launch(options?: PuppeteerLaunchOptions): Promise<Browser>;
}
```

`PuppeteerNode.launch()`で`browser`インスタンスが生成される。

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