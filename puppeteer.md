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