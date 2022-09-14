# Puppeteerでwebscrapingすっぞ

## 目次

[TODOS](#TODOS)
[セレクタ調査](#セレクタ調査)
[自習](#自習)


## TODOS

- collect動作確認
- （暇なら）collect収集件数上限の設定（うっかり大変な数にならないように）
- （暇なら）検索結果ページ複数の時の次ページ遷移方法の改善(HTTPつかえない？)
- どうもsearch()が返すHTTPResponseが空である件の修正
- artworkページにアクセスしてからの処理内容を詰める
- downloaderの実装
- Node.jsのデザインパターンの導入（逐次処理、並列処理。これがやりたかったことですわ）

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

## ページ遷移が成功したのかちゃんと調べる

https://medium.com/superluminar/how-to-wait-for-and-intercept-a-particular-http-request-in-puppeteer-66863a8403fe

https://github.com/puppeteer/puppeteer/issues/5066

以下の方法なら

responseを調べてstatus: 200なのかどうかで判断できる
urlも遷移後のURLなのかわかる

NOTE:この方法で取得できるresponse.url()はページ遷移後のURLである

```TypeScript
// Before
await Promise.all([
    page.waitForNavigation({ waitUntil: ["networkidle2"] }),
    page.click(selectors.loginButton),
    console.log('Form sending...')
]);

// After
const [response] = await Promise.all([
    page.waitForNavigation({ waitUntil: ["networkidle2"] }),
    page.click(selectors.loginButton)
]);
if(!response || response.url() !== urlLoggedIn && response.status() !== 200 || !response.ok())
throw new Error('Failed to login');

console.log("Logged in successfully");
```

よくみたら`page.waitForNavigation()`は戻り値`Promise<HTTPResponse>`だったのでそのまま戻り値取得すればよかった。

使えなかったけどどこかで役に立ちそうな方法：

https://github.com/puppeteer/puppeteer/issues/5066

を参考にして

```TypeScript
// URLはこれでいいみたい
const responsePromise = page.waitForResponse("https://www.pixiv.net/");
await page.click(selectors.loginButton);
const response = await responsePromise;
if(response.status() === 200 && response.ok()) return true; // true as succeeded to login.
```

サーバレスポンスからステータスを確認できた。

## ページ遷移とレスポンスの取得の両立

参考：

https://stackoverflow.com/a/71521550/13891684

https://pixeljets.com/blog/puppeteer-click-get-xhr-response/

`page.click`か`page.keyboard.press()`と、それに伴って発生するhttpResponseから任意のレスポンスを取得を両立する方法

うまくいかない例：

```TypeScript
const requiredResponseURL = "https://www.hogehoge.hoge/resource";

export const search = async (page: puppeteer.Page, keyword: string): Promise<void> => {
    try {
        await page.type(selectors.searchBox, keyword, { delay: 100 });

        page.on('response', _res => {
            if(_res.url() === requireResponseURL) console.log(_res)
        })
        const [res] = await Promise.all([
            page.waitForNavigation({ waitUntil: ["load", "domcontentloaded"] }),
            page.keyboard.press("Enter"),
        ]);
        if(!res || res.url() !== `https://www.pixiv.net/tags/${keyword}/artworks?s_mode=s_tag` && res.status() !== 200 || !res.ok()){
            throw new Error(/**/)
        }
        console.log('Result page');
    }
    catch(e) {
        // ....
    }
}
```

これだと、なぜか`waitForNavigation()`のほうがエラーを起こす。

あと、`page.on('response')`では本来取得するべきレスポンスのすべてを取得しない。

3つくらいで終わる。

うまくいく例：

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

これだと欲しいレスポンスが取得できる。

使っているテクニック：

```JavaScript
const waiter = page.waitForResponse();
await page.click("#awesomeButton");
await waiter;
```

なんかこのテクニックは多くのウェブサイトで確認できる。

これでHTTPレスポンスが取得できるし、

promise.all()で`page.click()`と`page.waitForNavigation()`を組み合わせる方法じゃないとページ遷移できない呪縛から解放される。

取得したJSON

```JavaScript
{
  data: [
    {
      id: '101116741',
      title: 'ヨルハ二号B型',
      illustType: 2,
      xRestrict: 1,
      restrict: 0,
      sl: 6,
      url: 'https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/10/02/42/45/101116741_square1200.jpg',
      description: '',
      tags: [Array],
      userId: '51217862',
      userName: 'ｍａｅｎｃｈｕ',
      width: 1920,
      height: 1080,
      pageCount: 1,
      isBookmarkable: true,
      bookmarkData: null,
      alt: '#ヨルハ二号B型 ヨルハ二号B型 - ｍａｅｎｃｈｕのうごイラ',
      titleCaptionTranslation: [Object],
      createDate: '2022-09-10T02:42:45+09:00',
      updateDate: '2022-09-10T02:42:45+09:00',
      isUnlisted: false,
      isMasked: false,
      profileImageUrl: 'https://i.pximg.net/user-profile/img/2021/06/02/06/20/17/20804853_03f8430c57fac290a28bbb6cfc46d494_50.png'
    },
    {
      id: '101116378',
      title: '2B切腹',
      illustType: 0,
      xRestrict: 2,
      restrict: 0,
      sl: 6,
      url: 'https://i.pximg.net/c/250x250_80_a2/custom-thumb/img/2022/09/10/02/15/53/101116378_p0_custom1200.jpg',
      description: '',
      tags: [Array],
      userId: '17499879',
      userName: 'GZZ',
      width: 2200,
      height: 1800,
      pageCount: 1,
      isBookmarkable: true,
      bookmarkData: null,
      alt: '#ニーアオートマタ 2B切腹 - GZZのイラスト',
      titleCaptionTranslation: [Object],
      createDate: '2022-09-10T02:15:53+09:00',
      updateDate: '2022-09-10T02:15:53+09:00',
      isUnlisted: false,
      isMasked: false,
      profileImageUrl: 'https://i.pximg.net/user-profile/img/2021/03/08/14/58/29/20322662_4296802f6f008b2b7add96b2ac2db369_50.jpg'
    },
    // ...
  ],
  total: 41255,
  bookmarkRanges: [
    { min: null, max: null },
    { min: 10000, max: null },
    { min: 5000, max: null },
    { min: 1000, max: null },
    { min: 500, max: null },
    { min: 300, max: null },
    { min: 100, max: null },
    { min: 50, max: null }
  ]
}
```

ほしい情報は、

- トータルヒット数
- サムネイルのid


注目してもいいところ

- `data[0].tags`:登録されているタグがここに格納されているかも
- `bookmarkRanges`はブックマークされている

## ページ遷移プロセスを再利用可能にする

頑張って。

## 検索結果ページ複数になる時の次のページへ行くトリガー

検索結果ページのページ数のとこの

```
< 1 2 3 4 5 6 7 >
```

`>`だけクリックしていけば1ページずつ移動してくれる

## 検索結果とかresponseから取得できない？

できるっぽい。ただし問題は、

- 検索結果ページへ行くのにpage.goto()じゃなくてpage.click()を使っているのでレスポンスを取得できるのか不明
- RESTAPIワカラナイ

検索キーワード:"西住まほ"

`GET`
`https://www.pixiv.net/ajax/search/artworks/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB?word=西住まほ&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja`

の、

`response.body.illustManga.data`に検索結果のデータ

`response.body.illustManga.total`に検索ヒット数

dataの各要素がサムネイルの情報と同じなので

```JSON
"data": [
    {"id": 123456, "title": "ARTWORK-TITLE", "userid": "987654"},
    {"id": 123456, "title": "ARTWORK-TITLE"},
    {"id": 123456, "title": "ARTWORK-TITLE"},
]
```

idはそのままartworkページへのURL末尾になる

`https://www.pixiv.net/artworks/12345678`


TODO: EventEmitterとRESTAPIスキルを習得する

`page.click()`する前に`page.once('response')`用意しておけばいいかな...

pageはEventEmitterを継承したクラスなのでいけるよね...

TODO: すべてのレスポンスを取得するヒント

https://stackoverflow.com/questions/52969381/how-can-i-capture-all-network-requests-and-full-response-data-when-loading-a-pag

## Node.js HTTP `http.ClientRequest`

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest

このオブジェクトは内部的に作られ、`http.request()`から返されます。



## オブジェクト validation

NOTE: 後回しでもいい

取得したオブジェクトが求めるプロパティを持っているのかの検査をしたい

```TypeScript
```

## ページ遷移とサムネイルIDの取得処理の分離と再利用可能化

ページ遷移処理

```TypeScript
const waitTransition = page.waitForNavigation({ waitUntil: ["load", "docontentloaded"]});
await page.click();
await waitTransition;
```

サムネイル取得処理

```TypeScript
const waitResponse: Promise<puppeteer.HTTPResponse | null> = page.waitForResponse(res =>
    res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${keyword}?word=${keyword}`)
    && res.status() === 200
);

await page.click();
// MUST BE PLACE JUST UNDER PAGE TRANSITION TRIGGER
const response: puppeteer.HTTPResponse | null = await waitResponse;
const data = await response.json();
// Validation process for the json object.
// 今のところはif分だけ。バリデーション実装大変。
if(data.body.illustManga.data) {
    // id取得処理
}
if(data.body.illustManga.total) {
    // 検索結果ページ数計算処理
}
```

ページ遷移のリクエストが受け入れられたのが確認できるのは、サムネイル取得処理の方のstatusコードの確認で行われている

なのでページ遷移処理の方でも確認するようにした方がいいかも

dataの...`data.body.illustManga.data`, `data.body.illustManga.total`が必要

`data.body.illustManga.data`:

```TypeScript
// data.body.illustManga.data[]の各要素のidだけ必要
const ids: string[] = data.body.illustManga.data.map(d => {
    if(d.id) return d.id;
})
```

`data.body.illustManga.total`:

検索開始したときだけ必要な処理

```TypeScript
let numberOfResultPages: number;

if(data.body.illustManga.total && numberOfResultPages === undefined) {
    numberOfResultPages = total/data.body.illustManga.data.length;
}
```

検索結果ページ数の取得>dataからid取得>ページ遷移>繰り返し...

```TypeScript
let numberOfResultPages: number;
let ids: number[];
let currentPage: number;

const collectIdsFromResultPages = async (page: puppeteer.Page, res: puppeteer.HTTPResponse): Promise<void> => {
    console.log(`Collecting ids. Page: ${currentPage + 1}`);
    // Collect ids of thumbnails
    if(res.body.illustManga.data) {
        ids = [...ids, ...res.body.illustManga.data.map(d => {if(d.id) return d.id;})];
    }
    // Transition and recursive call
    if(currentPage < numberOfResultPages){
        currentPage++;
        await page.click('#next-page-selector");
        const res: puppeteer.HTTPResponse = await waitJson;
        await loaded;
        await collectIdsFromResultPages(page, res);
    }
};


// 検索開始
const res: puppeteer.HTTPResponse = await search(/* omit */);
// 検索結果ページ数の計算
if(res.body.illustManga.total && numberOfResultPages === undefined) {
    numberOfResultPages = total/data.body.illustManga.data.length;
};
// 検索結果ページからはこの関数
await collectIdsFromResultPages(page, res);
// TODO: waitJsonとloadedをsearch()から分離すること
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

## artworkページへ片っ端からアクセスする

- artworkページへアクセスしたらオリジナルのURLを取得できてしまうのか？
- 逐次処理と並列処理するものの区別

artworkページの最終的なURL: `https://www.pixiv.net/artworks/87797602`

https://www.pixiv.net/artworks/84583402

```html
<!-- artwork表示部分 -->
<div class="sc-166cqri-1 IoIvg gtm-medium-work-expanded-view">
    <div role="presentation" class="sc-1qpw8k9-0 gTFqQV">
        <a href="https://i.pximg.net/img-original/img/2020/09/24/18/54/56/84583402_p0.jpg" class="sc-1qpw8k9-3 eFhoug gtm-expand-full-size-illust" target="_blank" rel="noopener">
            <img alt="#カウボーイビバップ 無題 - 水性ペンギンのイラスト" src="https://i.pximg.net/img-master/img/2020/09/24/18/54/56/84583402_p0_master1200.jpg" width="2066" height="3103" class="sc-1qpw8k9-1 jOmqKq" style="height: 767px;">
        </a>
    </div>
</div>
```

`a[href=""]`と`img[src=""]`は異なるURLである。

もしかしたらimgの方が表示中の画像のURLでaの方がクリックしたら表示される原寸大の方なのかも...

よくみたら、imgの方は`img-master`とあって、aの方は`img-original`とあるわ...

pixivダウンロード拡張機能は、`https://i.pximg.net/img-original/img/2020/09/24/18/54/56/84583402_p0.jpg`のGETリクエストを送信してダウンロードしていた。

artworkページにアクセスしたときのHTTPレスポンスのうち、GET `https://i.pximg.net/`かつ、Content-Type: image/jpeg, image/png, imageとかでやったら取得できるかも

#### illust

一番初めのリクエストからartworkページの情報を取得する: `puppeteer.waitForRequest()`要フィルタリング
オリジナルのURLを取得する：`res.json().body.urls.original`
pixivがartworkの画像リクエストを模倣できるところだけ模倣してリクエスト送信: `https.request()`
そのコールバック関数でストリームを設置してダウンロードする

- 一番初めのリクエスト

リクエスト：

```JSON
// GET https://www.pixiv.net/ajax/illust/101105423?ref=https://www.pixiv.net/&lang=ja
{
	"要求ヘッダー (1.796 KB)": {
		"headers": [
			{
				"name": "Accept",
				"value": "application/json"
			},
			{
				"name": "Accept-Encoding",
				"value": "gzip, deflate, br"
			},
			{
				"name": "Accept-Language",
				"value": "ja,en-US;q=0.7,en;q=0.3"
			},
			{
				"name": "Connection",
				"value": "keep-alive"
			},
			{
				"name": "Cookie",
				"value": "" // 省略
			},
			{
				"name": "DNT",
				"value": "1"
			},
			{
				"name": "Host",
				"value": "www.pixiv.net"
			},
			{
				"name": "Referer",
				"value": "https://www.pixiv.net/artworks/101105423"
			},
			{
				"name": "Sec-Fetch-Dest",
				"value": "empty"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "cors"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "same-origin"
			},
			{
				"name": "TE",
				"value": "trailers"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			},
			{
				"name": "x-user-id",
				"value": "8675089"
			}
		]
	}
}
```

レスポンスbody:

```JSON
{
    "error":false,
    "message":"",
    "body":{
        "illustId":"101105423","illustTitle":"\u6c34\u7740\u306e\u98df\u3044\u8fbc\u307f\u3092\u76f4\u3059\u6c34\u6cf3\u90e8\u54e1","illustComment":"\u304f\u3044\u3063\u304f\u3044\u3063\u30fb\u30fb\u30fb\u30d1\u30c1\u30f3\u30c3!!!","id":"101105423",
        "title":"\u6c34\u7740\u306e\u98df\u3044\u8fbc\u307f\u3092\u76f4\u3059\u6c34\u6cf3\u90e8\u54e1","description":"\u304f\u3044\u3063\u304f\u3044\u3063\u30fb\u30fb\u30fb\u30d1\u30c1\u30f3\u30c3!!!",
        "illustType":0,
        "createDate":"2022-09-09T10:00:02+00:00",
        "uploadDate":"2022-09-09T10:00:02+00:00",
        "restrict":0,
        "xRestrict":0,
        "sl":4,
        "urls":{
            "mini":"https:\/\/i.pximg.net\/c\/48x48\/img-master\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0_square1200.jpg",
            "thumb":"https:\/\/i.pximg.net\/c\/250x250_80_a2\/img-master\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0_square1200.jpg",
            "small":"https:\/\/i.pximg.net\/c\/540x540_70\/img-master\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0_master1200.jpg",
            "regular":"https:\/\/i.pximg.net\/img-master\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0_master1200.jpg",
            // 必要な情報
            "original":"https:\/\/i.pximg.net\/img-original\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0.jpg"
        },
        "tags":{"authorId":"14846","isLocked":false,"tags":[{"tag":"\u7af6\u6cf3\u6c34\u7740","locked":true,"deletable":false,
        "userId":"14846",
        "userName":"raikoh(\u5cf6\u6d25\u9244\u7532)"}]},
        // ページ数はたぶんだけど、画像枚数
        "pageCount": 3
        // 省略
    }}
```

- 画像を取得するリクエスト

```JSON
// GET https://i.pximg.net/img-master/img/2022/09/09/19/00/02/101105423_p0_master1200.jpg HTTP/2
{
	"要求ヘッダー (447 バイト)": {
		"headers": [
			{
				"name": "Accept",
				"value": "image/avif,image/webp,*/*"
			},
			{
				"name": "Accept-Encoding",
				"value": "gzip, deflate, br"
			},
			{
				"name": "Accept-Language",
				"value": "ja,en-US;q=0.7,en;q=0.3"
			},
			{
				"name": "Connection",
				"value": "keep-alive"
			},
			{
				"name": "DNT",
				"value": "1"
			},
			{
				"name": "Host",
				"value": "i.pximg.net"
			},
			{
				"name": "Referer",
				"value": "https://www.pixiv.net/"
			},
			{
				"name": "Sec-Fetch-Dest",
				"value": "image"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "no-cors"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "cross-site"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			}
		]
	}
}
```

レスポンスbody: その画像ファイル

#### Multiple illust

画像枚数が何枚であるのかと、各画像のパスの名前をどうやって取得するのか...

- 画像枚数：初めのリクエストに対するレスポンスボディの中に`body.pageCount`がある。その数値が画像枚数

- 各画像パス名：`https:\/\/i.pximg.net\/img-original\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0.jpg`の拡張子直前の、`artwork-id_p0`の部分の`_p0`が異なる。

画像枚数が3つなら

`https:\/\/i.pximg.net\/img-original\/img\/2022\/09\/09\/19\/00\/02\/101105423_p0.jpg`
`https:\/\/i.pximg.net\/img-original\/img\/2022\/09\/09\/19\/00\/02\/101105423_p1.jpg`
`https:\/\/i.pximg.net\/img-original\/img\/2022\/09\/09\/19\/00\/02\/101105423_p2.jpg`

となる。


```JSON
{
	"GET": {
		"scheme": "https",
		"host": "www.pixiv.net",
		"filename": "/ajax/illust/94411991",
		"query": {
			"ref": "https://www.pixiv.net/artworks/101105423",
			"lang": "ja"
		},
		"remote": {
			"アドレス": "104.18.36.166:443"
		}
	}
}
```
```JSON
{
	"要求ヘッダー (1.910 KB)": {
		"headers": [
			{
				"name": "Accept",
				"value": "application/json"
			},
			{
				"name": "Accept-Encoding",
				"value": "gzip, deflate, br"
			},
			{
				"name": "Accept-Language",
				"value": "ja,en-US;q=0.7,en;q=0.3"
			},
			{
				"name": "Connection",
				"value": "keep-alive"
			},
			{
				"name": "Cookie",
				"value": ""     // 省略
			},
			{
				"name": "DNT",
				"value": "1"
			},
			{
				"name": "Host",
				"value": "www.pixiv.net"
			},
			{
				"name": "Referer",
				"value": "https://www.pixiv.net/artworks/94411991"
			},
			{
				"name": "Sec-Fetch-Dest",
				"value": "empty"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "cors"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "same-origin"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			},
			{
				"name": "x-user-id",
				"value": "8675089"
			}
		]
	}
}
```

レスポンスbody: 画像が一つの時と変わらない

- 画像を取得するリクエスト

```JSON
{
	"GET": {
		"scheme": "https",
		"host": "i.pximg.net",
		"filename": "/img-master/img/2021/11/27/21/19/22/94411991_p1_master1200.jpg",
		"remote": {
			"アドレス": "210.140.92.149:443"
		}
	}
}
{
	"要求ヘッダー (446 バイト)": {
		"headers": [
			{
				"name": "Accept",
				"value": "image/avif,image/webp,*/*"
			},
			{
				"name": "Accept-Encoding",
				"value": "gzip, deflate, br"
			},
			{
				"name": "Accept-Language",
				"value": "ja,en-US;q=0.7,en;q=0.3"
			},
			{
				"name": "Connection",
				"value": "keep-alive"
			},
			{
				"name": "DNT",
				"value": "1"
			},
			{
				"name": "Host",
				"value": "i.pximg.net"
			},
			{
				"name": "Referer",
				"value": "https://www.pixiv.net/"
			},
			{
				"name": "Sec-Fetch-Dest",
				"value": "image"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "no-cors"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "cross-site"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			}
		]
	}
}
```

これを画像ごとに実施している。

#### ugoira

TODO: またこんど

どうやってうごイラだと認識する？あとから`ugoira_meta?`を含んだGETリクエストを送る模様。

どうやってgifにするかは後で考えるとにかくzipファイルを取得する

うごイラは表示上、artworkページ中のcanvas要素の、background-imageにてURLが指定されている

中身はzipファイル。

リクエスト：

```
GET ajax/illust/74904646/ugoira_meta?lang=ja HTTP/3
Host www.pixiv.net
Accept: application/json
Accept-Encoding: gzip, deflate, br
Referer: https://www.pixiv.net/artworks/74904646
Connection: keep-alive
Cookie: 省略
```

レスポンスbody

```JSON
{
	"error": false,
	"message": "",
	"body": {
		"illustId": "101158572",
		"illustTitle": "Hilda",
		"illustComment": "If you like my arts&#44; please consider support me on:<br /><a href=\"/jump.php?https%3A%2F%2Fwww.patreon.com%2Faztodio\" target=\"_blank\">https://www.patreon.com/aztodio</a><br /><a href=\"/jump.php?https%3A%2F%2Fgumroad.com%2Faztodio\" target=\"_blank\">https://gumroad.com/aztodio</a><br /><br /><a href=\"/jump.php?https%3A%2F%2Ftwitter.com%2FAztoDeus%2Fmedia\" target=\"_blank\">https://twitter.com/AztoDeus/media</a> (NSFW)<br /><a href=\"/jump.php?https%3A%2F%2Ftwitter.com%2FAztoDio%2Fmedia\" target=\"_blank\">https://twitter.com/AztoDio/media</a>",
		"id": "101158572",
		"title": "Hilda",
		"description": "If you like my arts&#44; please consider support me on:<br /><a href=\"/jump.php?https%3A%2F%2Fwww.patreon.com%2Faztodio\" target=\"_blank\">https://www.patreon.com/aztodio</a><br /><a href=\"/jump.php?https%3A%2F%2Fgumroad.com%2Faztodio\" target=\"_blank\">https://gumroad.com/aztodio</a><br /><br /><a href=\"/jump.php?https%3A%2F%2Ftwitter.com%2FAztoDeus%2Fmedia\" target=\"_blank\">https://twitter.com/AztoDeus/media</a> (NSFW)<br /><a href=\"/jump.php?https%3A%2F%2Ftwitter.com%2FAztoDio%2Fmedia\" target=\"_blank\">https://twitter.com/AztoDio/media</a>",
		"illustType": 2,
		"createDate": "2022-09-11T11:37:14+00:00",
		"uploadDate": "2022-09-11T11:37:14+00:00",
		"restrict": 0,
		"xRestrict": 1,
		"sl": 6,
		"urls": {
			"mini": "https://i.pximg.net/c/48x48/img-master/img/2022/09/11/20/37/14/101158572_square1200.jpg",
			"thumb": "https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/09/11/20/37/14/101158572_square1200.jpg",
			"small": "https://i.pximg.net/c/540x540_70/img-master/img/2022/09/11/20/37/14/101158572_master1200.jpg",
			"regular": "https://i.pximg.net/img-master/img/2022/09/11/20/37/14/101158572_master1200.jpg",
			"original": "https://i.pximg.net/img-original/img/2022/09/11/20/37/14/101158572_ugoira0.jpg"
		},
		"tags": {
			"authorId": "28638684",
			"isLocked": false,
			"tags": [/*タグ情報*/],
			"writable": true
		},
		"alt": "#Ugoira Hilda - AztoDioのうごイラ",
		"storableTags": [/*タグ情報*/],
		"userId": "28638684",
		"userName": "AztoDio",
		"userAccount": "aztodio",
        // 以下略
	}
}
```

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

じゃあBufferじゃなくてstreamでいいよね？