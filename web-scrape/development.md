# Puppeteerでwebscrapingすっぞ

pix*vで画像収集...はまずいので、せめて人気なイラストURLを独自収集するスクレイピングアプリを制作する。

## 目次

[TODOS](#TODOS)
[メモリリーク監視](#メモリリーク監視)
[パフォーマンス](#パフォーマンス)
[決定版：ページ遷移とレスポンス取得の両立](#決定版：ページ遷移とレスポンス取得の両立)
[セッションの維持](#セッションの維持)
[キーワード検索結果を収集する方法の模索]](#キーワード検索結果を収集する方法の模索)
[artworkページでの収集](#artworkページでの収集)
[ダウンロードロジックの実装](#ダウンロードロジックの実装)
[デザインパターンの導入](#デザインパターンの導入)
[puppeteerマルチpageインスタンス](#puppeteerマルチpageインスタンス)
[セレクタ調査](#セレクタ調査)
[自習](#自習)
[ログインすべきかしなくていいか区別する](#ログインすべきかしなくていいか区別する)
[機能：ブックマーク機能の追加](#機能：ブックマーク機能の追加)
[設計の考察](#設計の考察)
[コマンドラインからの命令に従って実行処理をセットアップする](#コマンドラインからの命令に従って実行処理をセットアップする)
[検証:検索結果ページはpage.goto(url)で移動・取得できるか](#検証:検索結果ページはpage.goto(url)で移動・取得できるか)
[](#)

## TODOS

- TODO: artworkページからの収集ロジックの実装
- TODO: メモリリーク対策項目の続きをしてchild processを理解する
- TODO: (低優先)puppeteerマルチpageインスタンス

## chromium起動できない問題

puppeteerインストール直後、サンプルプログラムを動かして正常動作するか確認しようとしたところ...

```bash
$ ts-node src/index.ts
Error: Failed to launch the browser process!
/home/teddy/nodejs/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome: error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file: No such file or directory


TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

    at onClose (/home/teddy/nodejs/web-scrape/node_modules/puppeteer/src/node/BrowserRunner.ts:306:9)
    at Interface.<anonymous> (/home/teddy/nodejs/web-scrape/node_modules/puppeteer/src/node/BrowserRunner.ts:292:16)
    at Interface.emit (node:events:539:35)
    at Interface.emit (node:domain:475:12)
    at Interface.close (node:readline:586:8)
    at Socket.onend (node:readline:277:10)
    at Socket.emit (node:events:539:35)
    at Socket.emit (node:domain:475:12)
    at endReadableNT (node:internal/streams/readable:1345:12)
    at processTicksAndRejections (node:internal/process/task_queues:83:21)
```

ということで、

`/home/teddy/nodejs/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome`が存在するのは確認した。

`libatk-1.0.so.0`というファイルだかが存在するのか調査に間れしてみてググってみたら

https://dev.to/chis0m/installing-puppeteer-on-an-ubuntu-aws-ec2-instance-5o7

とりあえず以下のライブラリが必要になるからインストールするといい。

```bash
sudo apt update && sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

```

結果サンプルプログラムは正常に実行できた。

## yargsの使い方まとめと導入

`../yargs.md`に詳細

実行コマンド

```bash
$ node ./dist/index.js COMMAND --option1 STRING --option2 STRING
```

## メモリリーク監視

puppeteerにおけるメモリリーク対策

`./memory-leak.md`に詳しく。

https://github.com/puppeteer/puppeteer/issues/594

https://www.toptal.com/nodejs/debugging-memory-leaks-node-js-applications

https://stackoverflow.com/a/31015360

#### 実践

キーワード検索させてから検索結果ページから情報収集、各artworkページへはpage.goto()でアクセスする方法をとったとき。

結果：`./performance/20221010_collect-artwork-datas_RAMChart_tagprocess`

ほんのり上り調子な気がしないでもないけど130mbくらいで推移している。

さらに繰り返しpuppeteerインスタンスを操作する処理をするときにもう一度調査してもよさそうだけど、

今のところは問題なさそう。


## パフォーマンス

#### pageインスタンスを複数生成して並列処理させる

もちろんRAMを監視してメモリがあほほど使われないか見張るよ。

pageインスタンスを増やす場面：

- 検索結果情報収集時
- artworkページ情報収集時

導入してみた:

`components/collectArtworkFromPage.ts`

受け取ったデータ量に応じてsequencesという逐次処理の数を増やして、

sequencesをPromise.all()させることで並列処理させる。

TODO: 要動作確認。

```TypeScript
 export const collectArtworkData = async (
    browser: puppeteer.Browser, 
    page: puppeteer.Page, 
    ids: string[], 
    requirement?: (keyof iIllustData)[])
    : Promise<iIllustData[]> => {

    let pageInstances: puppeteer.Page[] = [];
    let collected: iIllustData[] = [];
    let sequences: Promise<void>[] = [];
    let concurrency: number = 1;
        
    try {
         // データ量が50以下なら処理プロセス２つを並列処理
         if(ids.length > 10 && ids.length <= 50) {
             concurrency = 2;
         }
         // データ量が50を超えるなら処理プロセス４つを並列処理
         else if(ids.length > 50) {
             concurrency = 4;
         }

         // DEBUG:
         console.log(`concurrency: ${concurrency}`);
 
         pageInstances.push(page);
         for(let i = 1; i < concurrency; i++) {
			// DEBUG:
			console.log("Create Page instance and new sequence Promise.");

             pageInstances.push(await browser.newPage());
             sequences.push(Promise.resolve());
         };
         ids.forEach((id: string, index: number) => {
            // 順番にidsの添え字を生成する
            // 0~(concurrency-1)の範囲でcirculatorは循環する
            // なので添え字アクセスは範囲内に収まる
             const circulator: number = index % concurrency;

             // DEBUG:
             console.log(`circulator: ${circulator}`);

             if(sequences[circulator] !== undefined && pageInstances[circulator] !== undefined) {

                // DEBUG:
                console.log("sequence");
                
                sequences[circulator] = sequences[circulator]!.then(() => executor(pageInstances[circulator]!, id, collected, requirement));
             }
         });
 
         await Promise.all([...sequences]);
         return collected;
     }
     catch(e) {
         await page.screenshot({type: 'png', path: './dist/errorWhileCollectingArtworkData.png'});
         throw e;
     }
     finally {
         // Close all generated instances in this function except those passed as argument.
         if(pageInstances.length > 1) {
            pageInstances.forEach((p: puppeteer.Page, index: number) => {
                if(index > 0) p.close();
            });
         };
     }
 };

```

## セレクタ調査

username:

```html
<!-- username -->
<input type="text" autocomplete="username" placeholder="メールアドレスまたはpixiv ID" autocapitalize="none" class="sc-bn9ph6-6 degQSE" value="contradiction.losing@gmail.com">

<!-- password -->
<input type="password" autocomplete="current-password" placeholder="パスワード" autocapitalize="none" class="sc-bn9ph6-6 hfoSmp" value="dentalhealth1111">
<!-- login button -->
<button type="submit" class="sc-bdnxRM jvCTkj sc-dlnjwi pKCsX sc-2o1uwj-7 fguACh sc-2o1uwj-7 fguACh" height="40">ログイン</button>
```

`input[autocomplete="username"].sc-bn9ph6-6.degQSE`
`input[autocomplete="current-password"].sc-bn9ph6-6.hfoSmp`
`button[type="submit"].sc-bdnxRM.jvCTkj.sc-dlnjwi.pKCsX.sc-2o1uwj-7.fguACh.sc-2o1uwj-7.fguACh`


次のページセレクタ:

```html
<div class="sc-l7cibp-3 gCRmsl">
<nav class="sc-xhhh7v-0 kYtoqc">
    <a aria-disabled="false" class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component Vhbyn" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=6&amp;s_mode=s_tag"><svg viewBox="0 0 10 8" width="16" height="16"><polyline class="_2PQx_mZ _3mXeVRO" stroke-width="2" points="1,2 5,6 9,2" transform="rotate(90 5 4)"></polyline></svg></a>
    <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?s_mode=s_tag"><span>1</span></a><button type="button" disabled="" class="sc-xhhh7v-1 sc-xhhh7v-3 hqFKax iiDpnk"><svg viewBox="0 0 24 24" size="24" class="sc-11csm01-0 fivNSm"><path d="M5 14C6.10457 14 7 13.1046 7 12C7 10.8954 6.10457 10 5 10C3.89543 10 3 10.8954 3 12C3 13.1046 3.89543 14 5 14ZM12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14ZM21 12C21 13.1046 20.1046 14 19 14C17.8954 14 17 13.1046 17 12C17 10.8954 17.8954 10 19 10C20.1046 10 21 10.8954 21 12Z"></path></svg></button>
    <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=6&amp;s_mode=s_tag"><span>6</span></a><button type="button" aria-current="true" class="sc-xhhh7v-1 hqFKax"><span>7</span></button>
    <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=8&amp;s_mode=s_tag"><span>8</span></a>
    <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=9&amp;s_mode=s_tag"><span>9</span></a>
    <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=10&amp;s_mode=s_tag"><span>10</span></a>
    <a aria-disabled="false" class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component Vhbyn" href="/tags/%E5%A4%95%E7%84%BC%E3%81%91/artworks?p=8&amp;s_mode=s_tag"><svg viewBox="0 0 10 8" width="16" height="16"><polyline class="_2PQx_mZ _3mXeVRO" stroke-width="2" points="1,2 5,6 9,2" transform="rotate(-90 5 4)"></polyline></svg></a></nav>

</div>
```

- sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm
- div.sc-l7cibp-3.gCRmsl nav.sc-xhhh7v-0.kYtoqc a:last-child

## ページ遷移が成功したのか調べる

`page.waitForNavigation()`の戻り値のHTTPResponseのステータスをチェックすればいい。

```TypeScript
const [navigationRes] = await Promise.all([
    page.waitForNavigation(options),
    page.click(selector)
]);
if(!navigationRes) throw new Error('Navigation due to History API');
if(navigationRes.status() !== 200) throw new Error('Server response status code was not 200');
```

## 検索結果ページ複数になる時の次のページへ行くトリガー

検索結果ページのページ数のとこの

```
< 1 2 3 4 5 6 7 >
```

`>`だけクリックしていけば1ページずつ移動してくれる


## オブジェクト validation

取得した`puppeteer.HTTPResponse`を`.json()`したときに欲しいデータを持っているか検査したい。

そんなとき。



## 決定版：ページ遷移とレスポンス取得の両立

puppeteerにおいて`navigation`という単語が意味するところは詰まるところ「ページ遷移」である。

puppetterのPageクラスには`Page.waitForNavigation()`というナビゲーションが発生したら指定のイベントが起こるまで「待つ（プロミスが待機される）」メソッドがある。

なのでページ遷移がトリガーされたらこの`Page.waitForNavigation()`でページ遷移が完了するまで待機することで

次のページが完全にロードされたことを確認でき、作業を再開できる。

ということで、ページ遷移がトリガーされたら`Page.waitForNavigation()`が発動するようにしておけば

安全に次のページにたどり着くまで待ってくれるということになる。

一方、

実はpuppeteerのPageクラスにおいてこのページ遷移を待つ機能を標準搭載するメソッドがあったりする。

なので標準搭載メソッドを使うときと非搭載メソッドを使うときとで、

それぞれ別々にページ遷移完了を定義しなくてはならない。

で、

puppeteerの主なページ遷移をトリガーするメソッドが以下の3つ（独断と偏見）。

- `page.goto`: 標準でnavigation機能が備わっている。
- `page.click`: navigation機能はない。
- `page.keyboard.press`: navigation機能はない。

navigation機能が搭載されているか否かでページ遷移定義方法が異なるので、二通りとなる。

#### `page.goto()`とページ遷移

これは簡単。

```TypeScript
const res: puppeteer.HTTPResponse | null = await page.goto(url, { waitUntil: ["load", "networkidle2"]});
```

戻り値はメインリソースの最後のリダイレクトのHTTPレスポンスによって解決されたプロミスを返す。

これでwaintUntilオプションで指定したページ遷移イベントの発生を待つ。

ということでpage.gotoはpage.waitForNavigationいらずである。

`page.goto()`と任意のHTTPレスポンスの取得の両立となると、

結局`page.click`のページ遷移の方法と同じになる。

```TypeScript
const [requiredRes, mainRes] = await Promise.all([
    page.waitForResponse(filter),
    page.goto(url, { waitUntil: ["load", "networkidle2"]})
]);
```

要は`page.waitForNavigation()`がいらないだけである。

注意：

`page.goto`はレスポンスが400系や500系のステータスコードが返されても別にエラー出さないのでステータスコードのチェックを欠かしてはならない。

#### `page.waitForNavigation()`ありでのページ遷移と任意のHTTPレスポンス取得

`page.click()`のページで示されている通り、

navigationをトリガーするメソッドと一緒にpage.waitFornavigation()を呼び出す場合、

常に正しい方法はPromise.allでプロミスの非同期実行とすべての解決を待つことである。

これはnavigationのトリガーが`page.click`でも`page.keyboard.press`でも同じである（検証した限りは）。

でPromise.all()に渡すプロミスの順番が重要。

トリガー関数は一番最後である。

```TypeScript
const [res] = await Promise.all([
    page.waitForNavigation(options),
    // トリガーメソッドは最後！
    page.click(selector)
]);
```

公式そのまんまだけど、page.keyboard.pressも同じ。


```TypeScript
const [res] = await Promise.all([
    page.waitForNavigation(options),
    // トリガーメソッドは最後！
    page.keyboard.press('Enter');
]);
```

で、このルールを守れば任意のpage.wait...()メソッドを追加できる。


```TypeScript
const [res, waitForNavRes] = await Promise.all([
    page.waitForResponse(filter),
    page.waitForNavigation(options),
    page.click(selector)
]);
```

これで任意のHTTPレスポンスの取得とページ遷移を両立できる。


#### それ以外の方法

参考：

https://stackoverflow.com/a/71521550/13891684

https://pixeljets.com/blog/puppeteer-click-get-xhr-response/

```TypeScript
const requiredResponseURL = "https://www.hogehoge.hoge/resource";

export const search = async (page: puppeteer.Page, keyword: string): Promise<void> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });
        const waitJson = page.waitForResponse(res =>
            res.url() === requireResponseURL && res.status() === 200
        );
        page.keyboard.press('Enter');
        const json: puppeteer.HTTPResponse = await waitJson;
        console.log(await json.json());
        console.log('Result page');
    }
    catch(e) {
        // ...
    }
}
```

使っているテクニック：

```JavaScript
const waiter = page.waitForResponse();
await page.click("#awesomeButton");
await waiter;
```

なんかこのテクニックは多くのウェブサイトで確認できる。

#### うまくいきそうでうまくいかない方法

`page.on('response')`で取得するとき。なぜかうまくいかない。

#### クラスにしてみた

正常動作確認済。

```TypeScript
import type puppeteer from 'puppeteer';

// Default settings for page.waitFor methods
const defaultOptions: puppeteer.WaitForOptions = { waitUntil: ["load", "domcontentloaded"]};
const defaultWaitForResponseCallback = function(res: puppeteer.HTTPResponse) { return res.status() === 200;};

/****
 * Navigation class
 * 
 * @constructor
 * @param {puppeteer.Page} page - puppeteer page instance.
 * @param {() => Promise<any>} trigger - Asychronous function taht triggers navigation.
 * @param {puppeteer.WaitForOptions} [options] - Options for page.waitForNavigation.
 * 
 * 
 * Usage:
 * ```
 * navigate.resetWaitForResponse(page.waitForResponse(...));
 * navigate.resetWaitForNavigation(page.waitForNavigation(...));
 * navigate.push([...taskPromises]);
 * const [responses] = await navigate(function() {return page.click(".button");});
 * const [responses] = await navigateBy(function() {return page.click(".button");});
 * const [responses] = await navigateBy(function() {return page.keyboard.press("Enter");});
 * // Page transition has been completed...
 * ```
 * 
 * */ 
export class Navigation {
    private tasks: Promise<any>[];
    private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
    private waitForResponse: Promise<puppeteer.HTTPResponse>;
    constructor(
        page: puppeteer.Page
        ) {
            this.waitForNavigation = page.waitForNavigation(defaultOptions);
            this.waitForResponse = page.waitForResponse(defaultWaitForResponseCallback);
            this.tasks = [];
            this.push = this.push.bind(this);
            this.navigateBy = this.navigateBy.bind(this);
            this.navigate = this.navigate.bind(this);
    };

    push(task: Promise<any>): void {
        this.tasks.push(task);
    };

    resetWaitForResponseCallback(cb: Promise<puppeteer.HTTPResponse>): void {
        this.waitForResponse = cb;
    };

    resetWaitForNavigation(p: Promise<puppeteer.HTTPResponse | null>): void {
        this.waitForNavigation = p;
    };

    /******
     * Navigate by trigger and execute tasks.
     * 
     * 
     * */ 
    async navigate(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            ...this.tasks,
            this.waitForResponse,
            this.waitForNavigation,
            trigger()
        ]);
    };

    /***
     * Bit faster than navigate()
     * navigate()とほぼ変わらないし影響もしないからいらないかも。
     * */ 
    async navigateBy(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
        return await Promise.all([
            this.waitForResponse,
            this.waitForNavigation,
            trigger()
        ]);
    };
};
```

## セッションの維持

recaptcha対策。

一度ログインしたらしばらくログイン状態を保ちたい。

デバグのたびにログインしたくない。すぐにbot判定される。

なのでセッションを活用できないか模索する。

#### 検証：`userDataDir`を指定する。

https://stackoverflow.com/questions/48608971/how-to-manage-log-in-session-through-headless-chrome

https://stackoverflow.com/questions/57987585/puppeteer-how-to-store-a-session-including-cookies-page-state-local-storage#57995750

ユーザディレクトリとは？履歴、ブックマーク、クッキーなどの情報をユーザごとに保存していあるディレクトリである。

こいつを指定すれば、そのユーザがもしもあるウェブサイトにおいて「ログイン済」という情報がセッションに記録されてあれば、

次回以降はログイン済ということでログインページをパスできる。

ログインページがパスできるならちょっと時間短縮だしbot判定が軽減されるだろう。

指定方法は、

`PuppeteerLaunchOptions.BrowserLaunchArgumentOptions.userDataDir`にユーザデータディレクトリを指定する

```TypeScript
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
	// nodeコマンドを実行したときのカレントディレクトリが起点になる
    userDataDir: "./userdata/"
};

const browser = await puppeteer.launch(options);
```

やってみた。ログインページすっ飛ばしてR-18検索してみる。

通常アダルトコンテンツは表示できないから、ログインを促されるが...

```TypeScript
const options: puppeteer.PuppeteerLaunchOptions = {
    headless: true,
    args: ['--disable-infobars', ],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};

// 
// -- MAIN PROCESS --
// 
(async function() {
    try {
        browser = await puppeteer.launch(options);
        const page: puppeteer.Page | undefined = (await browser.pages())[0];
        if(!page) throw new Error("Open tab was not exist!!");

        await page.setViewport({
            width: 1920,
            height: 1080
        });

        // await login(page, {username: username, password: password});

        await page.goto("https://www.pixiv.net/");
        await page.waitForNetworkIdle();

        console.log(page.url());

        await page.screenshot({type: "png", path: "./dist/isSessionValid.png"});

        const res: puppeteer.HTTPResponse = await search(page, keyword);

        console.log(page.url());
        await page.screenshot({type: "png", path: "./dist/isSearchResult.png"});
    }
    catch(e) {
        console.error(e);
    }
    finally{
        console.log("browser closed explicitly");
        if(browser !== undefined) await browser.close();
    }
})();
```

スクリーンショットを確認したところ、

R-18コンテンツが表示されているから多分成功しているのだと思う。

HTTPレスポンスを確認すれば確実に成功しているかどうかわかると思う。要確認。

ちなみに

`./userdata/には確かにいろんな情報が保存された。

CacheやSession Storageなどのディレクトリが追加されていた。

今後セッションに関して追加するべきとしたら、

- セッションが切れたとき移動させられるページからログインできるように検知機能をつける
- 毎回セッションが生きているのか確認する機能をつける

暇ならね...そこはメインじゃないから...

## キーワード検索結果を収集する方法の模索

search()で次のリクエストが成功したら、

```JSON
{
	"GET": {
		"scheme": "https",
		"host": "www.pixiv.net",
		"filename": "/ajax/search/artworks/%E5%B0%84%E5%91%BD%E4%B8%B8%E6%96%87",
		"query": {
			"word": "射命丸文",
			"order": "date_d",
			"mode": "all",
			"p": "1",
			"s_mode": "s_tag",
			"type": "all",
			"lang": "ja"
		},
		"remote": {
			"アドレス": "104.18.36.166:443"
		}
	}
}
```

レスポンスに次のようなbodyがつく。

```JSON
{
	"error": false,
	"body": {
        // この中の`data`配列の中に検索結果（の1ページ目のサムネイル情報）が入っている
		"illustManga": {
			"data": [
				{
					"id": "101393474",
					"title": "彼岸の庭渡久１２０６",
					"illustType": 1,
					"xRestrict": 0,
					"restrict": 0,
					"sl": 2,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/22/00/05/55/101393474_p0_square1200.jpg",
					"description": "",
					"tags": [
						"東方",
						"彼岸の庭渡様",
						"庭渡久侘歌",
						"豪徳寺ミケ",
						"少名針妙丸",
						"射命丸文",
						"リリーホワイト",
						"リリーブラック"
					],
					"userId": "9824519",
					"userName": "人郷想幻（げんそうきょうじん）",
					"width": 287,
					"height": 821,
					"pageCount": 1,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#東方 彼岸の庭渡久１２０６ - 人郷想幻（げんそうきょうじん）のマンガ",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2022-09-22T00:05:55+09:00",
					"updateDate": "2022-09-22T00:05:55+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://i.pximg.net/user-profile/img/2022/06/17/10/08/33/22889909_0d5609f386476846aa404ad4c634e38f_50.jpg"
				},
				{
					"id": "101381167",
					"title": "落書き11",
					"illustType": 0,
					"xRestrict": 1,
					"restrict": 0,
					"sl": 6,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/12/18/49/101381167_p0_square1200.jpg",
					"description": "",
					"tags": [
						"R-18",
						"東方Project",
						"犬走椛",
						"射命丸文"
					],
					"userId": "4472917",
					"userName": "kjo",
					"width": 960,
					"height": 1280,
					"pageCount": 20,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#東方Project 落書き11 - kjoのイラスト",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2022-09-21T12:18:49+09:00",
					"updateDate": "2022-09-21T12:18:49+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://i.pximg.net/user-profile/img/2020/02/22/02/55/14/17967117_9033a06b5f70d391c5cf66d4e248d847_50.jpg"
				},
				{
					"id": "101380663",
					"title": "東方二次小説（第13話）「アイドル天狗はたて」（2）～（7）",
					"illustType": 0,
					"xRestrict": 1,
					"restrict": 0,
					"sl": 6,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/21/11/33/07/101380663_p0_square1200.jpg",
					"description": "",
					"tags": [
						"R-18",
						"姫海棠はたて",
						"東方project",
						"射命丸文",
						"管牧典",
						"二ツ岩マミゾウ",
						"封獣ぬえ",
						"ちんぽ",
						"パンチラ"
					],
					"userId": "52941975",
					"userName": "美少女帝国",
					"width": 1280,
					"height": 720,
					"pageCount": 6,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#姫海棠はたて 東方二次小説（第13話）「アイドル天狗はたて」（2）～（7） - 美少女帝国のイラスト",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2022-09-21T11:33:07+09:00",
					"updateDate": "2022-09-21T11:33:07+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://s.pximg.net/common/images/no_profile_s.png"
				},
                // ...
			],
			"total": 49561,
			"bookmarkRanges": [
				{
					"min": null,
					"max": null
				},
				{
					"min": 10000,
					"max": null
				},
				{
					"min": 5000,
					"max": null
				},
				{
					"min": 1000,
					"max": null
				},
				{
					"min": 500,
					"max": null
				},
				{
					"min": 300,
					"max": null
				},
				{
					"min": 100,
					"max": null
				},
				{
					"min": 50,
					"max": null
				}
			]
		},
        // 人気順情報
		"popular": {
			"recent": [
				{
					"id": "101263412",
					"title": "ルポライター文ちゃん",
					"illustType": 0,
					"xRestrict": 0,
					"restrict": 0,
					"sl": 2,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/16/18/05/12/101263412_p0_square1200.jpg",
					"description": "",
					"tags": [
						"東方Project",
						"射命丸文",
						"清く正しい射命丸",
						"東方鈴奈庵",
						"キャスケット文",
						"文ちゃんマジ天使",
						"稗田阿求",
						"笑顔",
						"東方Project1000users入り",
						"社会派ルポライターあや"
					],
					"userId": "2520952",
					"userName": "カンパ",
					"width": 1433,
					"height": 1013,
					"pageCount": 1,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#東方Project ルポライター文ちゃん - カンパのイラスト",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2022-09-16T18:05:12+09:00",
					"updateDate": "2022-09-16T18:05:12+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://i.pximg.net/user-profile/img/2017/02/14/22/11/58/12148643_e5fd596badc37b70db02a2b2c1c36e69_50.jpg"
				},
                // ...
			],
            // わからん
			"permanent": [
				{
					"id": "86142125",
					"title": "自機の人たち",
					"illustType": 0,
					"xRestrict": 0,
					"restrict": 0,
					"sl": 2,
					"url": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2020/12/07/00/03/57/86142125_p0_square1200.jpg",
					"description": "",
					"tags": [
						"東方",
						"博麗霊夢",
						"霧雨魔理沙",
						"十六夜咲夜",
						"魂魄妖夢",
						"鈴仙・優曇華院・イナバ",
						"東風谷早苗",
						"チルノ",
						"射命丸文",
						"東方Project50000users入り"
					],
					"userId": "2179695",
					"userName": "羽々斬＠秋季例大祭あ05a",
					"width": 3000,
					"height": 1000,
					"pageCount": 10,
					"isBookmarkable": true,
					"bookmarkData": null,
					"alt": "#東方 自機の人たち - 羽々斬＠秋季例大祭あ05aのイラスト",
					"titleCaptionTranslation": {
						"workTitle": null,
						"workCaption": null
					},
					"createDate": "2020-12-07T00:03:57+09:00",
					"updateDate": "2020-12-07T00:03:57+09:00",
					"isUnlisted": false,
					"isMasked": false,
					"profileImageUrl": "https://i.pximg.net/user-profile/img/2020/02/23/20/48/12/17978154_7be0feb98ff0948344e60b93dacf067e_50.png"
				},
                // ...
			]
		},
		"relatedTags": [
			"姫海棠はたて",
			"射命丸",
			"犬走椛",
			"東方",
			"東風谷早苗",
			"鈴仙・優曇華院・イナバ",
			"文",
			"霊烏路空",
			"博麗霊夢",
			"河城にとり",
			"魂魄妖夢",
			"十六夜咲夜",
			"アリス・マーガトロイド",
			"比那名居天子",
			"茨木華扇",
			"多々良小傘",
			"四季映姫・ヤマザナドゥ",
			"西行寺幽々子",
			"八雲紫",
			"風見幽香",
			"東方Project",
			"東方project",
			"犬走椛",
			"庭渡久侘歌",
			"豪徳寺ミケ",
			"きょぬーまる",
			"彼岸の庭渡様",
			"アナログ",
			"博麗霊夢",
			"姫海棠はたて",
			"少名針妙丸",
			"toho_vote18",
			"週末天狗",
			"おっぱい",
			"あやれいむ",
			"第18回東方Project人気投票"
		],
		"tagTranslation": [],
		"zoneConfig": {
			"header": {
				"url": "https://pixon.ads-pixiv.net/show?zone_id=header&format=js&s=1&up=0&a=32&ng=g&l=ja&uri=%2Fajax%2Fsearch%2Fartworks%2F_PARAM_&ref=www.pixiv.net%2Ftags%2F%25E5%25B0%2584%25E5%2591%25BD%25E4%25B8%25B8%25E6%2596%2587%2Fartworks%3Fs_mode%3Ds_tag&is_spa=1&K=12e90252bb6aa&ab_test_digits_first=0&uab=10&yuid=KDBDFFM&suid=Ph6esy7s20qgoyz8y&num=632b5bf4682"
			},
			"footer": {
				"url": "https://pixon.ads-pixiv.net/show?zone_id=footer&format=js&s=1&up=0&a=32&ng=g&l=ja&uri=%2Fajax%2Fsearch%2Fartworks%2F_PARAM_&ref=www.pixiv.net%2Ftags%2F%25E5%25B0%2584%25E5%2591%25BD%25E4%25B8%25B8%25E6%2596%2587%2Fartworks%3Fs_mode%3Ds_tag&is_spa=1&K=12e90252bb6aa&ab_test_digits_first=0&uab=10&yuid=KDBDFFM&suid=Ph6esy7s24nj8nj11&num=632b5bf473"
			},
			"infeed": {
				"url": "https://pixon.ads-pixiv.net/show?zone_id=illust_search_grid&format=js&s=1&up=0&a=32&ng=g&l=ja&uri=%2Fajax%2Fsearch%2Fartworks%2F_PARAM_&ref=www.pixiv.net%2Ftags%2F%25E5%25B0%2584%25E5%2591%25BD%25E4%25B8%25B8%25E6%2596%2587%2Fartworks%3Fs_mode%3Ds_tag&is_spa=1&K=12e90252bb6aa&ab_test_digits_first=0&uab=10&yuid=KDBDFFM&suid=Ph6esy7s27vo8ycqk&num=632b5bf444"
			}
		},
		"extraData": {
			"meta": {
				"title": "#射命丸文のイラスト・マンガ作品（1万件超） - pixiv",
				"description": "pixiv",
				"canonical": "https://www.pixiv.net/tags/%E5%B0%84%E5%91%BD%E4%B8%B8%E6%96%87",
				"alternateLanguages": {
					"ja": "https://www.pixiv.net/tags/%E5%B0%84%E5%91%BD%E4%B8%B8%E6%96%87",
					"en": "https://www.pixiv.net/en/tags/%E5%B0%84%E5%91%BD%E4%B8%B8%E6%96%87"
				},
				"descriptionHeader": "pixiv"
			}
		}
	}
}
```

長いのでまとめると...

```JSON
{
    "error": false,
    "body" : {
        "illustManga": {
            "data": [
                {
                    // illust data
                },
            ],
            "total": 49514
        },
    "popular": {
        "recent": [],
        "permanent": []
    },
    "relatedTags": [],
    // 省略
    }
}
```

ここから取得したいのは...

- `illustManga.data[]`は検索結果サムネイル情報。artworkページidを取得するため
- `illustManga.total`は検索結果ヒット数。検索結果ページが何ページになるのか知るため
- `illustManga.data.length`は検索結果サムネイル一覧が一ページに何枚になるのか知るため

## illustManga.dataに挟まれる広告要素

```JSON
{
    {
        "isAdContainer": true
    },
}
```


## artworkページでの収集

#### artworkページへアクセスして取得できる情報整理

次のURLは`page.waitForResponse()`とかで取得できない。あとこのURLでpage.gotoはできない。

`https://www.pixiv.net/artworks/ajax/illust/39189162`

404サーバエラーが返される。

ということでHTTPResponseからJSON取得できない。

なので次のURLでgotoしてレスポンスのHTMLから欲しい情報を取得するようにする。

`https://www.pixiv.net/artworks/39189162`

レスポンスヘッダ：

```TypeScript
// page.waitForResponse()のコールバック
const httpResponseFilter = (r: puppeteer.HTTPResponse): boolean => {
    const headers = r.headers();
    let result: boolean = false;
    if(headers.hasOwnProperty("content-type")){
        const contentType = headers["content-type"];
        result = contentType !== undefined ? contentType.includes("text/html") : false;
    }
    return r.status() === 200 && result;
};
```

```JSON
{
  'alt-svc': 'h3=":443"; ma=86400, h3-29=":443"; ma=86400',
  'cache-control': 'private, max-age=10\nprivate, max-age=10',
  'cf-cache-status': 'DYNAMIC',
  'cf-ray': '7557946049e98096-NRT',
  'content-encoding': 'gzip',
  'content-type': 'text/html; charset=UTF-8',
  date: 'Wed, 05 Oct 2022 16:37:02 GMT',
  server: 'cloudflare',
  'strict-transport-security': 'max-age=31536000',
  vary: 'x-user-id,Accept-Encoding',
  'x-frame-options': 'SAMEORIGIN',
  'x-host-time': '27',
  'x-userid': '64922426',
  'x-xss-protection': '1; mode=block'
}
```

で、そのtext/htmlのbodyは...長いので簡潔に次のmetaタグが含まれる

contentにほしい情報が載ったJSONオブジェクトが含まれている

```HTML
<!-- idは確かにHTMLのなかでユニークだった -->
<meta name="preload-data" id="meta-preload-data" content='
    <!-- 欲しい情報がJSON形式で載っている -->
'>
```

で、そのJSON情報が次

```JSON
{
    "timestamp":"2022-10-06T01:37:02+09:00",
    "illust":{
        "39189162":{
            "illustId":"39189162",
            "illustTitle":"Bebop Doo-wop",
            "illustComment":":P",
            "id":"39189162",
            "title":"Bebop Doo-wop",
            "description":":P",
            "illustType":0,
            "createDate":"2013-10-18T10:11:03+00:00",
            "uploadDate":"2013-10-18T10:11:03+00:00",
            "restrict":0,"xRestrict":0,"sl":2,
            "urls":{
                "mini":"https://i.pximg.net/c/48x48/img-master/img/2013/10/18/19/11/03/39189162_p0_square1200.jpg",
                "thumb":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2013/10/18/19/11/03/39189162_p0_square1200.jpg",
                "small":"https://i.pximg.net/c/540x540_70/img-master/img/2013/10/18/19/11/03/39189162_p0_master1200.jpg",
                "regular":"https://i.pximg.net/img-master/img/2013/10/18/19/11/03/39189162_p0_master1200.jpg",
                "original":"https://i.pximg.net/img-original/img/2013/10/18/19/11/03/39189162_p0.png"
            },
            "tags":{
                "authorId":"7388304","isLocked":false,"tags":[{"tag":"カウボーイビバップ","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"アイン","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Original","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"スパイク・スピーゲル","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Sethard","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Cowboy","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Bebop","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Spike","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"Ein","locked":true,"deletable":false,"userId":"7388304","userName":"Sethard"},{"tag":"COWBOYBEBOP","locked":false,"deletable":true}],"writable":true
            },
            "alt":"#カウボーイビバップ Bebop Doo-wop - Sethardのイラスト","storableTags":["sJYipl1Q5l","AXxyHHAUSC","ClLaegOm3j","8BNdRI_2mN","_DqSjOhLv_","_TeM2_kbKl","92IQginaoK","AdAuZzdCc6","hu9qtav100","ZrUawOPQtj"],
            "userId":"7388304",
            "userName":"Sethard",
            "userAccount":"sethard",
            "userIllusts":{
                // 省略
            },
            "likeData":false,"width":400,"height":634,"pageCount":1,
            "bookmarkCount":209,
            "likeCount":156,
            "commentCount":0,
            "responseCount":0,"viewCount":2200,"bookStyle":0,"isHowto":false,"isOriginal":false,"imageResponseOutData":[],"imageResponseData":[],"imageResponseCount":0,"pollData":null,"seriesNavData":null,"descriptionBoothId":null,"descriptionYoutubeId":null,"comicPromotion":null,"fanboxPromotion":null,"contestBanners":[],"isBookmarkable":true,"bookmarkData":null,"contestData":null,
            "zoneConfig":{
                // 省略
            },
            "extraData":{
                // 省略
            },
            "titleCaptionTranslation":{"workTitle":null,"workCaption":null},"isUnlisted":false,"request":null,"commentOff":0}},"user":{"7388304":{"userId":"7388304","name":"Sethard","image":"https://i.pximg.net/user-profile/img/2013/10/18/06/03/29/6951029_7f2bf5e92a36a1a551c8bbac0170362b_50.png","imageBig":"https://i.pximg.net/user-profile/img/2013/10/18/06/03/29/6951029_7f2bf5e92a36a1a551c8bbac0170362b_170.png","premium":false,"isFollowed":false,"isMypixiv":false,"isBlocking":false,"background":null,"sketchLiveId":null,"partial":0,"acceptRequest":false,"sketchLives":[]}}
}
```

こいつをinterfaceにすると...


```TypeScript 
interface iMetaPreloadData {
    timestamp: string;
    illust: iIllustData;
};

interface iIllustData {
    [key: string]: {
        illustId:string;
        illustTitle: string;
        illustComment: string;
        id: string;
        title: string;
        description: string;
        illustType: number;
        createDate: string;
        uploadDate: string;
        sl: number;
        urls: {
            mini: string;
            thumb: string;
            small: string;
            regular: string;
            original: string;
        },
        tags: {};
        pageCount: number;
        bookmarkCount: number;
        likeCount:number;
    };
};
```

ということで、

あとはHTMLをパースする方法。

#### HTML文字列をDOMとして扱う方法 in Node.js

参考： 

https://stackoverflow.com/questions/7977945/html-parser-on-node-js

https://stackoverflow.com/a/10585079/13891684

結論： Node.jsはDOM操作できない。

じゃぁ文字列のまま特定の文字列を取得しよう！としても

取得したい文字列が大きすぎる場合、正規表現を作るしかない。

そうなると非常に困難になる。

素直にサードパーティパッケージ使え。

jsdomが人気みたい。




```TypeScript
const response: puppeteer.HTMLResponse
const htmlString: string = await response.text();

const html = document.createElement('html');
html.innerHTML = body;
const metaPreloadData: iMetaPrelaodData = JSON.parse(document.getElementById('meta-preload-data').getAttribute('content'));

```




#### どうやってダウンロードする？

`requirement`は、`iArtworkData`のプロパティが指定の値を持つかどうかのフィルタである

このタグが含まれているとか、ブックマーク数とか。

ほしい情報をinterfaceにすると...

```TypeScript
interface iArtworks{
	url: string;	// そのページのURL
	title: string;	// そのartworkページのタイトル
	author: string;	// 作者
	type: string;	// artworkのタイプ　画像なのかうごイラなのか
	bookmarks: number;	// ブックマーク数
	origin: string;		// オリジナルURL(拡張子含む)
	amount: number;		// 画像枚数	
}
```

ベース：

```TypeScript

const artworkUrl: string = `https://www.pixiv.net/artworks/`;

const cb = (res: puppeteer.HTTPResponse): boolean => {
	return res.status() === 200 && res.url().inlcudes(/* specify url */)
}

const removeFromResponse = async <T>(res: puppeteer.HTTPResponse): Promise<T> => {
	// とにかく指定のHTTPResponseのbodyを返す。.json()までする。
};

const isFulfillRequirement = (body: iArtworkData, requirement): boolean => {
	// とにかくrequirementを満たすかどうかチェックする
	// 満たすならtrue、そうじゃないならfalse
	return result;
};

function collectArtworksData = async(page, passedIds, requirement?) {

	// Set up navigation.
	const navigate = new Navigation(page);
	navigate.resetWaitForResponseCallback(cb);

	let res: (puppeteer.HTTPResponse | any)[] = [];
	let collected: iArtworkData[] = [];
	let pushBodyQueue: Promise<void> = Promise.resolve();

	for(const id of passedIds) {
		// -- ここの囲った部分は終わるまで ---------------------
		// 次のナビゲーション(ループ)に行くことは許されない
		res = await navigate.navigationBy(page.goto(artworkUrl + id));
		// bodyとはHTTPResponse.body.bodyである
		const body: iArtworkData = await removeFromResponse<iArtworkData>(res);
		// --------------------------------

		// -- ここの条件分岐は非同期にして次のページ遷移に行っちゃっていい --
		// なのでプロミスで囲ってあとで終わればOKにすればいいかも。
		// 
		// !requirement.length --> bodyをそのまま納める
		// requirement.length --> 次を検査する
		// isFullfillRequirement() --> bodyを納める
		// !isFullfillRequirement() --> bodyは納めない
		promise = promise.then(() => {
			if(requirement.length) {
				if(!isFulfillRequirement(body)) collected.push(body);
			}
			else {
				collected.push(body);
			}
		});
		// ---------------------------------------------------
	};

	await promise;
	return data;
};

```

case１：アートワークページからそのままダウンロードを実行する場合

`collected.push(body)`のところがダウンロードプロセスに代わる。

ダウンロードプロセス中に他のartworkページへ移動すると困るので、

`promise = promise.then()`のラップを解除してpeageがそのURLにいるときにhttp.request()を送る



- HTTPS requestを送って、ストリーム処理させる。
- 画像枚数をチェック
- fsとの連携（名前の付け方、保存ディレクトリの確認）
- 保存先がWSL上のUbuntu環境だと保存しても困るだけなので、ストレージサービスを利用する

```TypeScript

const artworkUrl: string = `https://www.pixiv.net/artworks/`;

const cb = (res: puppeteer.HTTPResponse): boolean => {
	return res.status() === 200 && res.url().inlcudes(/* specify url */)
}

const removeFromResponse = async <T>(res: puppeteer.HTTPResponse): Promise<T> => {
	// とにかく指定のHTTPResponseのbodyを返す。.json()までする。
};

const isFulfillRequirement = (body: iArtworkData, requirement): boolean => {
	// とにかくrequirementを満たすかどうかチェックする
	// 満たすならtrue、そうじゃないならfalse
	return result;
};

function collectArtworksData = async(page, passedIds, requirement?) {

	// Set up navigation.
	const navigate = new Navigation(page);
	navigate.resetWaitForResponseCallback(cb);

	let res: (puppeteer.HTTPResponse | any)[] = [];
	let collected: iArtworkData[] = [];
	let pushBodyQueue: Promise<void> = Promise.resolve();

	for(const id of passedIds) {
		res = await navigate.navigationBy(page.goto(artworkUrl + id));
		const body: iArtworkData = await removeFromResponse<iArtworkData>(res);
		promise = promise.then(() => {
			if(requirement.length) {
				if(!isFulfillRequirement(body)) collected.push(body);
			}
			else {
				collected.push(body);
			}
		});
	};

	await promise;
	return data;
};
```

iArtworkdataにはbookmark数が載っていない可能性？

並列処理は可能なの？

Pageインスタンスを増やす方法。

#### 必要なHTTPResponse 

```JSON
{
	"GET": {
		"scheme": "https",
		"host": "www.pixiv.net",
		"filename": "/ajax/illust/101589247",
		"query": {
			"ref": "https://www.pixiv.net/",
			"lang": "ja"
		},
		"remote": {
			"アドレス": "172.64.151.90:443"
		}
	}
}
```

## ダウンロードロジックの実装

ダウンロードロジックのインターフェイスはどう定義するべき？
画像枚数が複数の時何をすればいい？
ダウンロードロジックには何を渡せばいい？
書き込む先の情報は何が必要で何をすればいい？

まず、puppeteerではリクエストを送信する手段がない(と思ったけど)

TODO: check `page.setRequestInterception`と入力して出力されるインテリセンスを調査すること。


- case1: artworkページにアクセスして、GETリクエストを傍受してレスポンスを取得してダウンロードする場合

```TypeScript
const responseWhatYOuGot: puppeteer.HTTPResponse = {/* ... */};


```

## デザインパターンの導入

#### 逐次処理と並列処理の導入検討

どこで逐次処理と並列処理が導入できそうか？

1. 検索結果ページからartwork情報を収集するとき
2. artworkページから情報を収集するとき
3. 画像ダウンロードするとき

検索結果ページからartwork情報を収集するとき

収集プロセス：

- HTTPResponseから情報取得
- ページ遷移トリガー
- HTTPResponseの取得
- ページ遷移完了

例えば検索結果が膨大な数になった時に、pageインスタンスを複数作ると効率的になる場合があるかも。

そうなったら各page毎に同時実行数を制限しつつ収集プロセスを並列処理してもいいかも。

なので、

収集プロセスは逐次処理で、

page毎は同時実行数制限の並列処理で収集する。

理解が及んでいないため、pageを複数作ることはタブが増える程度にしか考えていないけれど、

もしも「タブが増えるだけ」ならこの方法をとれば膨大なデータを効率的に収集できるかも。


## puppeteerでダウンロードするには？Github Issue

明快な回答はない模様。

https://github.com/puppeteer/puppeteer/issues/299

> Question: How do I get puppeteer to download a file or make additional http requests and save the response?

Nice, ハートの多かった回答

> 少し詳しく説明しましょう。私のユースケースでは、ファイルのリストを含む Web サイトにアクセスしたいと考えています。次に、各ファイルに対して HTTP 要求をトリガーし、応答をディスクに保存します。リストは、ファイルへのハイパーリンクではなく、プレーン テキストのファイル名である可能性がありますが、そこから、ダウンロードするファイルの実際の URL を導き出すことができます。

> はい、Chromium はサポートしていません。ただし、リクエストをトリガーできる場合は、少なくともバッファーの内容を取得し、Node.js のファイルシステム API を使用してディスクに書き込むことができるはずです。または、URL を取得して手動リクエストを開始します。**ダウンロードが完全に禁止されている場合は、バッファを使用して同じことを行います。** Chromium ではサポートされていない可能性がありますが、回避できるはずです。

> Support for downloads is on the way. It needs changes to Chromium that are under review.

https://chromium-review.googlesource.com/c/chromium/src/+/590913/

https://www.chromium.org/developers/design-documents/downloadmanagersequences/

> https://github.com/puppeteer/puppeteer/issues/299#issuecomment-668087154

疑問：streamを使うのとBufferを使うことの違いって何？

参考

https://stackoverflow.com/questions/55408302/how-to-get-the-download-stream-buffer-using-puppeteer

> 問題は、何らかのナビゲーション要求が発生するとすぐにBufferがクリアされることです。あなたの場合、これはリダイレクトまたはページのリロードである可能性があります。 この問題を解決するには、リソースのダウンロードが完了していない限り、ページがナビゲーション リクエストを行わないようにする必要があります。これを行うには、page.setRequestInterception を使用できます。 この問題には、簡単な解決策がありますが、これは常に機能するとは限りません。また、この問題に対するより複雑な解決策もあります。


## 自習

1. ページ遷移トリガーまとめ

#### page.goto()

URLを指定して遷移させる場合。

page.goto()はPromise<HTTP.Response|null>を返す。

複数リダイレクトが発生した場合、最後のレスポンスでプロミスは解決することになる。

goto()のオプショナル引数`waitUntil`はデフォルトで`load`に設定されている。

`waitUntil`は何かというと、そのURLへの遷移がどのタイミングで成功したと判断するのかのタイミングを指定するのである。

なので`load`と設定すれば、ロードイベントが発生したらこのページ遷移は成功したと判断される（それでプロミスが満たされる）

`referer`はリクエスト・ヘッダにリファラを追加する。

例外をスローする場合：

SSLエラー、無効なＵＲＬ、ナビゲーションがタイムアウトになった、リソースがロード不可能などなど。

例外をスローしない場合：

有効なHTTPステータスコードが返される限り例外は発生しない。

404も500も対象である。

ということで、ステータスコードは自前で検査しなくてなならない。

#### page.click()

引数で渡された要素の中央をクリックする。

指定要素が成功裏にクリックされたらプロミスが解決される。

click()がナビゲーションイベントをトリガーする場合（ページ遷移イベントなどのこと）、

その時は`page.waitForNavigation()`と一緒に使うことでプロミスが解決される。


#### page.keyboard.press()

#### リクエストを送信する

https://stackoverflow.com/a/49385769

puppeteerにはリクエストを送信する機能はなくて、リクエストを送信されたことをインターセプトすることならできる。


## 機能実装

#### ブックマーク機能の追加

bookmarkを自動で行ってくれる機能の追加

- yargsで新たなコマンドを受け付けるようにする
- コマンドが複数だった時のアプリケーションの挙動を変更できるようにする
- 処理を追加する機能の追加

## 設計の考察

設計について学ばないといけない？

DomainDD, EventDD


## コマンドラインからの命令に従って実行処理をセットアップする

- yargsからコマンドとオプションのオブジェクトを取得する
- コマンド内容から、taskQueueに実行する処理単位をプッシュする
- taskQueueを実行する

ということで各処理単位を細かく単一の実行単位に砕く

各処理単位をpromisifyでラップしてつなげることができるようにする

```TypeScript
import { orders } from './commandModules/index';

interface iOrders {
    commands: string[];
    options: object;
};


const setupTaskQueue = (orders: iOrders) => {
    const { commands, options } = orders;
    switch(commands.join()) {
        case 'collectbyKeyword':
            break;
        default:
    }
}
```
- キーワード検索処理

```TypeScript
// SEQUENTIAL

const tasksPromise = Promise.resolve();

// Core task
const letKeywordSearch = (page: puppeteer.Page, keyword: string) => {
	return page.type(selectors.searchBox, keyword, { delay: 100 });
};

tasksPromise = tasksPromise
// do keyword search part
.then(() => {
	return letKeywordSearch(page, "keyword")
		.catch(err => {
			// handling for letKeywordSearch() error
		})
})
// trigger navigation part 
.then(() => {
	const navigation = new Navigation();
	setupNavigation(); // setup navigation class

	// これでnavigateBy()の戻り値を次のthenで取得できたっけ？
	return navigation.navigateBy(page, page.keyoard.press('Enter'))
		.catch(err => {
			// error handling for navigation.navigateBy()
		});
})
// check res is valid part
// res is returned value of navigation.navigateBy()
.then((res: (puppeteer.HTTPResponse | any)[]) => {
	// resを検査するパート
	
    const response: puppeteer.HTTPResponse = res.shift();
	return response.json()
		.catch(err => {
			// error handling for response.json()
		});
})
.catch(err => {
})
.finally(() => {
	// もしもエラーフラグなどが立っていれば終了処理を実施するとか
});

return tasksPromise;
```

上記のプロミスチェーが実現できるならば、

チェーンの各プロミスはいったん配列に突っ込んで

forループとかでpromiseのthenへpushし続ければいいのかも

- resultページで情報収集する処理

```TypeScript
// PARALLELPOSSIBLE 

// global variable
const page: puppeteer.Page;
const browser: puppeteer.Browser;

// from previous process
const jsonData = {/* got from previous process */};

const tasksPromise = Promise.resolve();
// Contains result id
let resultIds: string[] = [];
// Result pages
let lastPage: number = 1;
// Current page of result pages
let currentPage: number = 1; 

// Relatives of parallel process.
let concurrency: number = 1;
let pageInstances: puppeteer.Page[] = [];
let sequences: Promise<void>[] = [];


const setupParallelExecution = (processUpTo: number) => {
	pageInstances.push(page);
	concurrency = processUpTo;

	for(let i = 1; i < concurrency; i++) {
		pageInstances.push(await browser.newPage());
		sequences.push(Promise.resolve());
	};

	// NOTE: そういえば検索結果ページだとURLへgotoしているわけではなく、>をクリックして移動しているだけだから...この並行処理は通用しないかも
	// 
	// TODO: 検索結果ページでもURLのGOTOで通用するのかチェック
	for(let i = 1; i < lastPage; i++) {
		const circulator: number = i % concurrency;
		if(sequences[circulator] !== undefined && pageInstances[circulator] !== undefined) {
			sequences[circulator] = sequences[circulator]!.then(() => {
				// NOTE: executor未定義。上記のTODOの検証結果次第。
				executor(pageInstances[circulator]!);
			});
		}
	};

	return Promise.all(sequences);
}


// SETUP: 検索結果が多かったら並行処理を準備する
// HTTPResponseを解釈する
// HTTPResponseから情報を取得する
// 次のページへ移動する
tasksPromise = tasksPromise
// Retrieve data from http response json data part.
.then(() => {
	return retrieveDeepProp<iIllustManga>(["body", "illustManga"], jsonData);
})
// Set up parallel process according to number of total result part.
// 
// この部分はのちに再利用できるかも
.then((props) => {
	const { data, total } = props;
	lastPage = Math.floor(total / data.length);
	let numberOfProcess: number = 1;
	
	if(lastPage >= 20 && lastPage < 50) {
		numberOfProcess = 2;
	}
	else if(lastPage >= 50 && lastPage < 100) {
		numberOfProcess = 5;	
	}
	else if(lastPage >= 100) {
		numberOfProcess = 10;
	}
	else {
		numberOfProcess = 1;
	};

	return {
		data: data,
		total: total,
		numberOfProcess: numberOfProcess
	};
})
.then((props) => {
	const { numberOfProcess } = props;
	return setupParallelExecution(numberOfProcess)
		.catch(err => {
			// handle 
		});
})
.then(collected => {
	// handle collected informantion.
})
.catch(() => {
	// 
})
.finally(() => {
	// Delete all extra page instances.
});

return tasksPromise;
```

検索結果ページの移動はpage.goto()でイケるのか検証
executorの定義

- artworkページで何かする

```TypeScript
// NOTE: ここの処理が今回の変更を適用する部分
// artworkページでブックマークするのか等の処理を追加できるようにする
// tasksPromiseへ追加することにはならず、setupParallelExecutionを変更することになる

// data from previous process
const ids: string[];
const browser: puppeteer.Browser;
const page: puppeteer.Page;


const tasksPromise = Promise.resolve();
let pageInstances: puppeteer.Page[] = [];
let collected: iIllustData[] = [];
let sequences: Promise<void>[] = [];
let concurrency: number = 1;


tasksPromise = tasksPromise
.then(() => {
	if(ids.length >= 20 && ids.length < 50) {
		numberOfProcess = 2;
	}
	else if(ids.length >= 50 && ids.length < 100) {
		numberOfProcess = 5;	
	}
	else if(ids.length >= 100) {
		numberOfProcess = 10;
	}
	else {
		numberOfProcess = 1;
	};
	return numberOfProcess;
})
.then(numberOfProcess => {
	return setupParallelExecution(numberOfProcess)
		.catch(err => {
			// handler
		})
})
.then(collected => {

})
.catch(err => {

})
.finally(() => {

});

return tasksPromise;
```

## 検証:検索結果ページはpage.goto(url)で移動・取得できるか

URL: https://www.pixiv.net/tags/%E5%8E%9F%E7%A5%9E/artworks?p=7&s_mode=s_tag

`artworks?p=${pagenumber}`でいけそう

pagenumberは1でも通用するみたい

あとは欲しい情報がHTTPResponseで取得できるのかである


取得できた時のリクエストURL

https://www.pixiv.net/ajax/search/artworks/%E5%8E%9F%E7%A5%9E?word=%E5%8E%9F%E7%A5%9E&order=date_d&mode=all&p=2&s_mode=s_tag&type=all&lang=ja

https://www.pixiv.net/ajax/search/artworks/%E5%8E%9F%E7%A5%9E?word=%E5%8E%9F%E7%A5%9E&order=date_d&mode=all&p=10&s_mode=s_tag&type=all&lang=ja

https://www.pixiv.net/ajax/search/artworks/%E5%8E%9F%E7%A5%9E?word=%E5%8E%9F%E7%A5%9E&order=date_d&mode=all&p=100&s_mode=s_tag&type=all&lang=ja

ということで、

`https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}&order=date_d&mode=all&p={pagenumber}&s_mode=s_tag&type=all&lang=ja`

で取得している

あとはこれがwaitForResponse()で取得できるかどうかである