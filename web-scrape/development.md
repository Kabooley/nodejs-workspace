# Puppeteerでwebscrapingすっぞ

pix*vで画像収集...はまずいので、せめて人気なイラストURLを独自収集するスクレイピングアプリを制作する。

## 目次

[TODOS](#TODOS)
[ページ遷移とレスポンスの取得の両立](#ページ遷移とレスポンスの取得の両立)
[ページ遷移と特定のレスポンスを取得する方法](#ページ遷移と特定のレスポンスを取得する方法)
[セッションの維持](#セッションの維持)
[キーワード検索結果を収集する方法の模索]](#キーワード検索結果を収集する方法の模索)
[artworkページでbookmark数を取得する方法の模索](#artworkページでbookmark数を取得する方法の模索)
[デザインパターンの導入](#デザインパターンの導入)
[](#)
[セレクタ調査](#セレクタ調査)
[自習](#自習)
[ログインすべきかしなくていいか区別する](#ログインすべきかしなくていいか区別する)


## TODOS

- TODO: index.jsの挙動確認。ログインなしですむキーワードで。

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

https://github.com/puppeteer/puppeteer/issues/1205

`page.goto()`はその引数のURLに対する`HTTP.Response`を戻り値として返す。

なのでそのURLのレスポンスを取得するために`page.waitForResponse()`と一緒に使う必要はない。

だから、gotoのベストプラクティスはそのまま使える。

```JavaScript
const [response] = await Promise.all([
	page.goto('https://www.example.com/'),
	page.waitForNavigation({ waitUntil: ["load", "networkidle02"]})
]);

expect(response.status()).to.equal(200)
```

## ページ遷移と特定のレスポンスを取得する方法

先の例と異なり、page.goto()以外のメソッドがページ遷移をトリガーしたときに、

特定のレスポンスを取得したい。

そんなとき。

参考：

https://stackoverflow.com/a/71521550/13891684

https://pixeljets.com/blog/puppeteer-click-get-xhr-response/

`page.click`か`page.keyboard.press()`と、それに伴って発生するhttpResponseから任意のレスポンスを取得を両立する方法。

例：

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

これで取得できた。


## 検索結果ページ複数になる時の次のページへ行くトリガー

検索結果ページのページ数のとこの

```
< 1 2 3 4 5 6 7 >
```

`>`だけクリックしていけば1ページずつ移動してくれる


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
```

ここから取得したいのは...

- `illustManga.data[]`は検索結果サムネイル情報。artworkページidを取得するため
- `illustManga.total`は検索結果ヒット数。検索結果ページが何ページになるのか知るため
- `illustManga.data.length`は検索結果サムネイル一覧が一ページに何枚になるのか知るため

```TypeScript
const res: puppeteer.HTTPResponse = await search(page, keyword);
const ids: number[] = await collectIdsFromResultPages(page, keyword, res);
```

## illustManga.dataに挟まれる広告要素

```JSON
{
    {
        "isAdContainer": true
    },
}
```

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

## デザインパターンの導入

どこで逐次処理と並列処理が導入できそうか？

まずは機能を最小単位へ分解しよう。

1. 検索結果からartworkのidを取得する処理

- ページ遷移時のHTTP Responseを取得してそのbodyからid情報などを取得する
- 次のページへナビゲートする
- 次のページへ遷移する際のHTTP Responseをキャプチャして次の呼び出しへ渡す


```TypeScript
// navigateToNextPage()が汎用的な「ページ遷移」関数にできそう

interface iOptionNavigateToNextPage {
    waitForResponseCallback?: ((res: puppeteer.HTTPResponse) => boolean | Promise<boolean>);
    navigationOptions?: puppeteer.WaitForOptions;
};

const defaultWaitForResponseCallback = (res: puppeteer.HTTPResponse): boolean => {
    return res.status() === 200;
};

const defaultNavigationOption: puppeteer.WaitForOptions = {
    waitUntil: ["load", "domcontentloaded"]
};

/******
 * Navigate to next page and returns HTTP Response.
 * 
 * @param {() => Promise<void>} trigger - Function that triggers page transition.
 * @param {iOptionNavigateToNextPage} [options] - Optional parameters 
 * @return {Promise<puppeteer.HTTPResponse>} - HTTP Response waitForResponse() has been returned.
 * 
 * Trigger navigation by firing trigger(), get HTTP Response, wait for navigation has been done.
 * */ 
const navigateToNextPage = async (
        page: puppeteer.Page, 
        trigger: () => Promise<void>,
        options? : iOptionsNavigateToNextPage
    ): Promise<puppeteer.HTTPResponse> => {
    try {
        let cb = defaultWaitForResponseCallback;
        let navOption = defaultNavigationOption;
        if(options){
            const { waitForResponseCallback, navigationOptions } = options;
            cb = waitForResponseCallback ? waitForResponseCallback : cb;
            navOption = navigationOptions ? navigationOptions : navOption;
        }
		const waitForNextResultResponse = page.waitForResponse(cb);
		const waitForNextPageLoad = page.waitForNavigation(navigationOption);

        // Triggers navigation to next page.
        await trigger();
        // Capture response of next page request.
        const r: puppeteer.HTTPResponse = await waitForNextResultResponse;
        await waitForNextPageLoad;
        return r;
    }
    catch(e) {
        throw e;
    }
}

// USAGE
const nextResultPageTrigger = async (): Promise<void> => {
    await page.click(selectors.nextPage);
}

const keywordSearchTrigger = async (): Promise<void> => {
    await page.keyboard.press('Enter');
};

const cb = (res: puppeteer.HTTPResponse): boolean => {
    console.log(res.url());
    return res.url().includes(`https://www.pixiv.net/ajax/search/artworks/${escapedKeyword}?word=${escapedKeyword}`)
    && res.status() === 200
};

// while()で必須の変数
let currentPage: number = 0;    // 0にしておかないとwhile()が機能しない
let lastPage: number = 1;       // 1にしておかないとwhile()が機能しない
let data: string[] = [];        // stringを前提にしているよ

// 検索キーワードの入力
await page.type(selectors.searchBox, keyword, { delay: 100 });

// 検索結果ページすべてからartworkのid取得
while(currentPage < lastPage) {
    const res: puppeteer.HTTPResponse = await navigateToNextPage(page, nextResultPageTrigger, { waitForResponseCallback: cb });
    const { illustManga } = await res.json();
    if(!illustManga || !illustManga.data || !illustManga.data.total)
        throw new Error("Unexpected HTTP response has been received");
    data = [...data, ...collectElementsAsArray<iIllustMangaElement>(illustManga.data, 'id')];
    if(currentPage === 0) {
        // Update lastPage.
        lastPage = illustManga0.data.length ? illustManga0.data.total / illustManga0.data.length : 1;
        // これはよくないやりかたですな...
        currentPage++;
    }
    currentPage++;
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

## 処理の精査

逐次処理はどこで？並列処理はどこで？同時実行制限数はいくつ？など考察する。

1. 次のページへ遷移させるトリガーと、ページ遷移完了が噛み合わない。

検索結果から収集するとき、

```TypeScript
await page.type(keyword);
const waitJson = page.waitForRequest();		// 指定したURLに対するレスポンスを待つ
const loaded = page.waitForNavigation();	// loadとdocumentloadedを待つ
page.keyboard.press('Enter');				// 検索開始
await waitJson;				// リクエストまち
await loaded;				// ページ遷移完了
```

なんだけど...

## ログインすべきかしなくていいか区別する

プライベートモードで`https://www.pixiv.net/`へアクセスした：

`GET https://www.pixiv.net/ HTTP/2`

request

```JSON
{
	"要求ヘッダー (974 バイト)": {
		"headers": [
			{
				"name": "Accept",
				"value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
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
				"value": "first_visit_datetime_pc=2022-09-21+04%3A17%3A33; PHPSESSID=4kn6hup2mr8e0adnnvt5uabvfororsoo; 
                p_ab_id=7; 
                p_ab_id_2=6; 
                p_ab_d_id=318830242; 
                yuid_b=MnlkkRc; 
                __cf_bm=ZgrOVC3YMyfnybA9msHDDvBw.h7K4f6JeF20JbxNmH8-1663701454-0-AWDJQy0LQKnptETc6nLjGptqeV/xnMnBGcmnu/y0tdbrd0tz73VpfN6hA2b2VJQhH9LXqhZXo9nSBVNIeh+c2fW1F437koVIStoWL7HaBYrkjjKe+i4Fp1pfIewioxm3PDejpXO/mUsAVche/BOkCYiOmRwNopPNi3e2laoaFqL73D1i0msbYPzZWEYPVBwLtQ==;
                _ga_75BBYNYN9J=GS1.1.1663701455.1.0.1663701455.0.0.0; 
                _ga=GA1.1.1530619587.1663701456"
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
				"name": "Sec-Fetch-Dest",
				"value": "document"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "navigate"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "none"
			},
			{
				"name": "Sec-Fetch-User",
				"value": "?1"
			},
			{
				"name": "TE",
				"value": "trailers"
			},
			{
				"name": "Upgrade-Insecure-Requests",
				"value": "1"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			}
		]
	}
}
```

response

200 OK

```JSON
{
	"応答ヘッダー (540 バイト)": {
		"headers": [
			{
				"name": "alt-svc",
				"value": "h3=\":443\"; ma=86400, h3-29=\":443\"; ma=86400"
			},
			{
				"name": "cache-control",
				"value": "no-store, no-cache, must-revalidate"
			},
			{
				"name": "cf-cache-status",
				"value": "DYNAMIC"
			},
			{
				"name": "cf-ray",
				"value": "74dce783a8e1e086-NRT"
			},
			{
				"name": "content-encoding",
				"value": "gzip"
			},
			{
				"name": "content-length",
				"value": "10026"
			},
			{
				"name": "content-type",
				"value": "text/html; charset=UTF-8"
			},
			{
				"name": "date",
				"value": "Tue, 20 Sep 2022 19:17:59 GMT"
			},
			{
				"name": "expires",
				"value": "Thu, 19 Nov 1981 08:52:00 GMT"
			},
			{
				"name": "pragma",
				"value": "no-cache"
			},
			{
				"name": "server",
				"value": "cloudflare"
			},
			{
				"name": "strict-transport-security",
				"value": "max-age=31536000"
			},
			{
				"name": "vary",
				"value": "User-Agent,Accept-Encoding"
			},
			{
				"name": "x-frame-options",
				"value": "SAMEORIGIN"
			},
			{
				"name": "x-host-time",
				"value": "112"
			},
			{
				"name": "x-xss-protection",
				"value": "1; mode=block"
			}
		]
	}
}
```

ログイン認証済ませてからログイン後の`https://www.pixiv.net/`へ移動するとき

request

```JSON
{
	"要求ヘッダー (1.081 KB)": {
		"headers": [
			{
				"name": "Accept",
				"value": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
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
				"value": "first_visit_datetime_pc=2022-09-21+04%3A17%3A33; PHPSESSID=8675089_VqrR1iK0q5Wuh9zt9Ib5PLhGy9hax6xf; 
                p_ab_id=7; 
                p_ab_id_2=6; 
                p_ab_d_id=318830242; 
                yuid_b=MnlkkRc; 
                __cf_bm=ZgrOVC3YMyfnybA9msHDDvBw.h7K4f6JeF20JbxNmH8-1663701454-0-AWDJQy0LQKnptETc6nLjGptqeV/xnMnBGcmnu/y0tdbrd0tz73VpfN6hA2b2VJQhH9LXqhZXo9nSBVNIeh+c2fW1F437koVIStoWL7HaBYrkjjKe+i4Fp1pfIewioxm3PDejpXO/mUsAVche/BOkCYiOmRwNopPNi3e2laoaFqL73D1i0msbYPzZWEYPVBwLtQ==;
                _ga_75BBYNYN9J=GS1.1.1663701455.1.1.1663701640.0.0.0; 
                _ga=GA1.1.1530619587.1663701456; 
                _gcl_au=1.1.2079482580.1663701480; 
                device_token=526aca1e8bd83bac65072b3439d3e1e0"
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
				"value": "https://accounts.pixiv.net/"
			},
			{
				"name": "Sec-Fetch-Dest",
				"value": "document"
			},
			{
				"name": "Sec-Fetch-Mode",
				"value": "navigate"
			},
			{
				"name": "Sec-Fetch-Site",
				"value": "same-site"
			},
			{
				"name": "Sec-Fetch-User",
				"value": "?1"
			},
			{
				"name": "TE",
				"value": "trailers"
			},
			{
				"name": "Upgrade-Insecure-Requests",
				"value": "1"
			},
			{
				"name": "User-Agent",
				"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:104.0) Gecko/20100101 Firefox/104.0"
			}
		]
	}
}
```

response

```JSON
{
	"応答ヘッダー (1.256 KB)": {
		"headers": [
			{
				"name": "alt-svc",
				"value": "h3=\":443\"; ma=86400, h3-29=\":443\"; ma=86400"
			},
			{
				"name": "cache-control",
				"value": "no-store, no-cache, must-revalidate"
			},
			{
				"name": "cf-cache-status",
				"value": "DYNAMIC"
			},
			{
				"name": "cf-ray",
				"value": "74dcebd24bcbaf9f-NRT"
			},
			{
				"name": "content-encoding",
				"value": "gzip"
			},
			{
				"name": "content-length",
				"value": "3943"
			},
			{
				"name": "content-type",
				"value": "text/html; charset=UTF-8"
			},
			{
				"name": "date",
				"value": "Tue, 20 Sep 2022 19:20:55 GMT"
			},
			{
				"name": "expires",
				"value": "Thu, 19 Nov 1981 08:52:00 GMT"
			},
			{
				"name": "pragma",
				"value": "no-cache"
			},
			{
				"name": "server",
				"value": "cloudflare"
			},
			{
				"name": "set-cookie",
				"value": "c_type=32; expires=Thu, 19-Sep-2024 19:20:55 GMT; Max-Age=63072000; path=/; domain=.pixiv.net; secure"
			},
			{
				"name": "set-cookie",
				"value": "PHPSESSID=8675089_VqrR1iK0q5Wuh9zt9Ib5PLhGy9hax6xf; expires=Thu, 20-Oct-2022 19:20:55 GMT; Max-Age=2592000; path=/; domain=.pixiv.net; secure; HttpOnly"
			},
			{
				"name": "set-cookie",
				"value": "privacy_policy_agreement=0; expires=Thu, 19-Sep-2024 19:20:55 GMT; Max-Age=63072000; path=/; domain=.pixiv.net; secure; HttpOnly"
			},
			{
				"name": "set-cookie",
				"value": "privacy_policy_notification=0; expires=Thu, 19-Sep-2024 19:20:55 GMT; Max-Age=63072000; path=/; domain=.pixiv.net; secure; HttpOnly"
			},
			{
				"name": "set-cookie",
				"value": "a_type=0; expires=Thu, 19-Sep-2024 19:20:55 GMT; Max-Age=63072000; path=/; domain=.pixiv.net; secure"
			},
			{
				"name": "set-cookie",
				"value": "b_type=1; expires=Thu, 19-Sep-2024 19:20:55 GMT; Max-Age=63072000; path=/; domain=.pixiv.net; secure"
			},
			{
				"name": "strict-transport-security",
				"value": "max-age=31536000"
			},
			{
				"name": "vary",
				"value": "X-UserId,Accept-Encoding"
			},
			{
				"name": "x-frame-options",
				"value": "SAMEORIGIN"
			},
			{
				"name": "x-host-time",
				"value": "111"
			},
			{
				"name": "x-userid",
				"value": "8675089"
			},
			{
				"name": "x-xss-protection",
				"value": "1; mode=block"
			}
		]
	}
}
```

requestヘッダのPHPSESSIDに、pixivユーザID番号から始まる新しいセッションIDが付与されているのが確認できる。


TODO: page.goto()でピクシブのページへ移動したときのGET"https://www.pixiv.net/"リクエストのレスポンスを取得してログインパスできたのかどうかチェックするようにする

ログイン：

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


