# Puppeteerでwebscrapingすっぞ

## 目次

[TODOS](#TODOS)
[自習](#自習)


## TODOS

- 検索結果ページから各サムネイルのIDを取得する処理
- 次のページへ移動する処理

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

検索結果ページ

```html
<div class="sc-l7cibp-3 gCRmsl">
    <nav class="sc-xhhh7v-0 kYtoqc">
        <a aria-disabled="true" class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component Vhbyn" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?s_mode=s_tag" hidden=""><svg viewBox="0 0 10 8" width="16" height="16"><polyline class="_2PQx_mZ _3mXeVRO" stroke-width="2" points="1,2 5,6 9,2" transform="rotate(90 5 4)"></polyline></svg></a>
        <button type="button" aria-current="true" class="sc-xhhh7v-1 hqFKax"><span>1</span></button>
        <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=2&amp;s_mode=s_tag"><span>2</span></a>
        <a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=3&amp;s_mode=s_tag"><span>3</span></a><a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=4&amp;s_mode=s_tag"><span>4</span></a><a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=5&amp;s_mode=s_tag"><span>5</span></a><a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=6&amp;s_mode=s_tag"><span>6</span></a><a class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component QiMtm" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=7&amp;s_mode=s_tag"><span>7</span></a><a aria-disabled="false" class="sc-d98f2c-0 sc-xhhh7v-2 cCkJiq sc-xhhh7v-1-filterProps-Styled-Component Vhbyn" href="/tags/%E8%A5%BF%E4%BD%8F%E3%81%BE%E3%81%BB/artworks?p=2&amp;s_mode=s_tag"><svg viewBox="0 0 10 8" width="16" height="16"><polyline class="_2PQx_mZ _3mXeVRO" stroke-width="2" points="1,2 5,6 9,2" transform="rotate(-90 5 4)"></polyline></svg></a></nav>
</div>
```

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
