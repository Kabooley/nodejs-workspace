# Puppeteerでwebscrapingすっぞ

pix*vで画像収集...はまずいので、せめて人気なイラストURLを独自収集するスクレイピングアプリを制作する。

## 目次

- [Chromium](#Chromium)
- [メモリリーク監視](#メモリリーク監視)
- [パフォーマンス](#パフォーマンス)
- [CLIとの連携](#CLIとの連携)
- [ナビゲーション](#ナビゲーション)
- [セッションの維持](#セッションの維持)
- [キーワード検索]](#キーワード検索)
- [artworkページでの収集](#artworkページでの収集)
- [ダウンロードロジック](#ダウンロードロジック)
- [デザインパターンの導入](#デザインパターンの導入)
- [puppeteerマルチpageインスタンス](#puppeteerマルチpageインスタンス)
- [セレクタ調査](#セレクタ調査)
- [自習](#自習)


## Chromium

#### chromium起動できないとき

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

## CLIとの連携

アプリケーションは実行時のコマンドとオプションを読み取って実行する処理を決定するという仕組みとする。

#### yargsの使い方まとめと導入

`../yargs.md`に詳細


#### 実装予定のコマンド

コマンド: 動作を指定する。マルチコマンドを受け付ける。

オプション：条件を指定する



動作:

- `collect byKeyword`: キーワード検索をしてオプションの条件指定を満たす作品のメタデータを収集する(JSONファイルで保存する)
- `collect fromBookmark`: ブックマークからオプションの条件指定を満たす作品のメタデータを収集する(JSONファイルで保存する)
- `bookmark`: (キーワード検索をして)オプションの条件指定を満たす作品をブックマークする
- `download fromBookmark`: ブックマークから条件指定に一致する作品をダウンロードする
- `download byKeyword`: キーワード検索から条件指定に一致する作品をダウンロードする

オプション:

条件指定
    検索条件
    - keyword: 検索キーワード
    収集条件
    - tags: 指定のタグがすべて含まれていること
    - userName: 指定の作者であること
    - bookmarkOver: 指定のブックマーク数を誇ること


#### `collect byKeyword`

処理の流れ：

1. キーワード検索で指定キーワード検索
2. 検索結果ページでの収集
	> page.goto(各検索結果ページのURL)
	> 収集時に条件指定に一致するartworkのURLのIDだけ収集させる ... 1
3. artworkページでの収集
	> page.goto(各artwork作品id)
	> 収集時に条件指定に一致する作品だけメタデータを収集させる ... 2


取得できる情報は...

1:
- tags: 可
- userName: 可
- bookmarkOver: 不可

2: 
全て可

#### `collect fromBookmark`

処理の流れ：

1. アカウントのブックマークページへ移動(URL or puppeteerの操作によって)
2. あとは`collect byKeyword`と同じになる


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

たとえばキーワード検索してヒットした作品が1000件あるとして、
検索結果ページが200ページとかだった場合、
puppeteer.Pageインスタンスが一つだと大変な時間がかかる。

そんな時にPageインスタンスが複数あって分担すればかかる時間が減るはず。

ということで並列処理を導入する。

#### 並列処理と逐次処理

`src/components/AssemblerParallelPageSequences.ts`

マルチPageインスタンス、
逐次処理を実行するPromiseチェーンからなるマルチPromiseチェーン、
収集するデータを処理するCollectインスタンス
ナビゲーションを担当するNavigationインスタンス
これらのセットであるclass。

一つのPromiseチェーンが実行する逐次処理の内容を定義すれば、

並列処理して集めるデータを格納してくれる。

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


## ナビゲーション

#### ページ遷移とレスポンス取得の両立

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


#### ページ遷移が成功したのか調べる

`page.waitForNavigation()`の戻り値のHTTPResponseのステータスをチェックすればいい。

```TypeScript
const [navigationRes] = await Promise.all([
    page.waitForNavigation(options),
    page.click(selector)
]);
if(!navigationRes) throw new Error('Navigation due to History API');
if(navigationRes.status() !== 200) throw new Error('Server response status code was not 200');
```


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

`src/components/Navigation.ts`

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

## キーワード検索

検索フォームのDOMにキーワードを入力して、

`page.keyboard.press('Enter')`する。

または検索結果ページで次のページへ行くために

`page.goto(URL)`する。(URLは次のページを反映したURL)

次のリクエストのレスポンスを取得することで検索結果情報を収集する。

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

レスポンスには次のようなbodyがつく。

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

この型情報の定義は`src/constants/illustManga.ts`。

ということで、

page.waitForResponse()で指定のURLのレスポンスを取得する
レスポンスを解決する

```TypeScript
const specifiedUrl: string = "/* specified url */";
const response: puppeteer.HTTPResponse = page.waitForResponse((r: puppeteer.HTTPResponse) => r.status() === 200 && r.url() === specifiedUrl);
const body = await response.json();
// 以降、bodyを分解して指定データが入っていることを調べる
```

#### illustManga.dataに挟まれる広告要素

```JSON
{
    {
        "isAdContainer": true
    },
}
```
これは排除することを忘れないように。


#### 検証:検索結果ページはpage.goto(url)で移動・取得できるか

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


#### HTML文字列をDOMとして扱う方法 in Node.js

参考： 

https://stackoverflow.com/questions/7977945/html-parser-on-node-js

https://stackoverflow.com/a/10585079/13891684

結論： **Node.jsはDOM操作できない**

じゃぁ文字列のまま特定の文字列を取得しよう！としても

取得したい文字列が大きすぎる場合、正規表現を作るしかない。

そうなると非常に困難になる。

素直にサードパーティパッケージ使え。

jsdomが人気みたい。

```TypeScript
// これはNode.jsではできない
const response: puppeteer.HTMLResponse
const htmlString: string = await response.text();

const html = document.createElement('html');
html.innerHTML = body;
const metaPreloadData: iMetaPrelaodData = JSON.parse(document.getElementById('meta-preload-data').getAttribute('content'));
```

```TypeScript
// JSDOMなら可能になる
import * as jsdom from 'jsdom';

const response: puppeteer.HTTPResponse;

const { JSDOM } = jsdom;
// puppeteer.HTTPResponse.text()から解決できるHTML文字列からDOMを取得する
// jsdomを使うとDOMが取得できる
const { document } = new JSDOM(await response.text()).window;
// あとはJavaScript同様DOMを操作すればよい
const json = document.querySelector('#meta-preload-data')!.getAttribute("content");
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

## ダウンロードロジック

#### puppeteerでダウンロードするには？Github Issue

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



