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
- [コマンドの実行](#コマンドの実行)
- [検証：AssembleParallelPageSequencesの自動セットアップ](#検証：AssembleParallelPageSequencesの自動セットアップ)
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

#### コマンドとオプションの組み合わせ一覧

```bash
$ node ./dist/index.js collect byKeyword --keyword="" --tags="" --bookmarkOver=1000
$ 
$ 
$ 
$ 
```

最早オプションは共通である

```TypeScript
interface iOptions {
      bookmarkOver?: number;
      tags?: string[];
      userName?: string;
      keyword: string;
 };
 ```


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

#### TEST: 並列処理と逐次処理の導入

とにかく、

`assemblingResultPageCollectProcess.ts`のNavigationのところでタイムアウトエラーになる。



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

#### page.waitForREsponse()でfetchリクエストを傍受できなくなった

```TypeScript
    const navigator = new Navigation();
    navigator.resetFilter(
        // failed: フルURL
        // function filter(res: puppeteer.HTTPResponse) {
        //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A?word=%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja");
        // }
        // failed:
        // function filter(res: puppeteer.HTTPResponse) {
        //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
        // }
        // failed: short url ver and arrow function
        // (res: puppeteer.HTTPResponse) => {
        //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
        // }
        // これは通る
        (res: puppeteer.HTTPResponse) => {
            return res.status() === 200 && res.url().includes("https://www.pixiv.net/");
        }
    );
```

以前はできていたのに...

参考：

https://github.com/puppeteer/puppeteer/issues/4695

https://github.com/puppeteer/puppeteer/issues/4041#issuecomment-469496322

NOTE: **puppeteerはServiceWorkerやWebWorkerからのrequestを傍受することはできない**とのこと

なのでpage.on()しても`page.waitForResponse()`しても永遠に傍受できないfetch requestが存在するのである。

（そしてそのrequestが必要なのである）

追記：

次のやりかただと傍受できたとの報告

https://github.com/puppeteer/puppeteer/issues/4041#issuecomment-1267944025

#### ではどうやってキーワード検索結果を取得すべきか

DOMで取得
他のhttp request（response)を取得する



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

#### meta-preload-dataのJSON

```JSON
{
    "timestamp":"2022-12-26T00:47:20+09:00",
    "illust":{
        "97618246":{
            "illustId":"97618246",
            "illustTitle":"チャイナキャス狐",
            "illustComment":"初中華です",
            "id":"97618246",
            "title":"チャイナキャス狐",
            "description":"初中華です",
            "illustType":0,
            "createDate":"2022-04-14T05:53:00+00:00",
            "uploadDate":"2022-04-14T05:53:00+00:00",
            "restrict":0,
            "xRestrict":0,
            "sl":4,
            "urls":{"mini":"https://i.pximg.net/c/48x48/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","thumb":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","small":"https://i.pximg.net/c/540x540_70/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg","regular":"https://i.pximg.net/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg","original":"https://i.pximg.net/img-original/img/2022/04/14/14/53/51/97618246_p0.jpg"},
            "tags":{
                "authorId":"1047320","isLocked":false,
                "tags":[
                    {"tag":"玉藻の前","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"キャス狐","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"Fate/EXTRA","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"尻神様","locked":false,"deletable":true},{"tag":"玉藻の前(Fate)","locked":false,"deletable":true},
                    {"tag":"自称初中華兄貴","locked":false,"deletable":true},{"tag":"裸足","locked":false,"deletable":true},
                    {"tag":"パンチラ","locked":false,"deletable":true},{"tag":"Fate/EXTRA5000users入り","locked":false,"deletable":true},
                    {"tag":"斎藤千和","locked":false,"deletable":true}
                ],
                "writable":true
            },
            "alt":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト",
            "storableTags":["y68AFldGp7","aKAp3RlsBg","9kbEA1dZeA","KN7uxuR89w","3g8y5LDx4G","g7xjaRuu1p","HY55MqmzzQ","gVfGX_rH_Y","asHH1_jNXv","YblYjqLXb_"],
            "userId":"1047320",
            "userName":"ワイズスピーク@単行本発売中！",
            "userAccount":"hikomaro610",
            "userIllusts":{
                "103500457":null,"103169861":null,"102534269":null,"102502835":null,"102450012":null,"102012264":null,"101931343":null,"101239818":null,"101198029":null,"101175499":null,"101151531":null,"101125256":null,"101099521":null,"100706897":null,"100647997":null,"100297510":null,"100081531":null,"99325355":null,"99262920":null,"99243861":null,"99157120":null,"99105741":null,"98890873":null,"98816496":null,"98794515":null,"98682973":null,"98633132":null,"98546110":null,"98473308":null,"98356994":null,"98311176":null,"98289359":null,"98268342":null,"98246883":null,"98196634":null,"98168104":null,"98120346":null,"98095233":null,"97985337":null,"97933171":null,"97913373":null,"97892170":null,"97817082":null,"97732229":null,"97711776":null,"97658306":null,"97636602":{"id":"97636602","title":"おっぱいキャス狐","illustType":0,"xRestrict":1,"restrict":0,"sl":6,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/15/12/35/37/97636602_p0_square1200.jpg","description":"","tags":["R-18","玉藻の前","キャス狐","Fate/EXTRA","自称初絞り兄貴","おっぱい","背後から胸揉み","爆乳","男主狐","Fate/EXTRA10000users入り"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2046,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 おっぱいキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-15T12:35:37+09:00","updateDate":"2022-04-15T12:35:37+09:00","isUnlisted":false,"isMasked":false,"profileImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","aiType":0},"97618246":{"id":"97618246","title":"チャイナキャス狐","illustType":0,"xRestrict":0,"restrict":0,"sl":4,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","description":"初中華です","tags":["玉藻の前","キャス狐","Fate/EXTRA","尻神様","玉藻の前(Fate)","自称初中華兄貴","裸足","パンチラ","Fate/EXTRA5000users入り","斎藤千和"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2160,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-14T14:53:51+09:00","updateDate":"2022-04-14T14:53:51+09:00","isUnlisted":false,"isMasked":false,"aiType":0},"97596157":{"id":"97596157","title":"モーニングコーヒーキャス狐","illustType":0,"xRestrict":0,"restrict":0,"sl":6,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/13/11/30/17/97596157_p0_square1200.jpg","description":"","tags":["玉藻の前","キャス狐","Fate/EXTRA","モーニングコーヒー","裸ワイシャツ","玉藻の前(Fate)","部屋とYシャツと私","Fate/EXTRA5000users入り","爆乳","男主狐"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2046,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 モーニングコーヒーキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-13T11:30:17+09:00","updateDate":"2022-04-13T11:30:17+09:00","isUnlisted":false,"isMasked":false,"profileImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","aiType":0},"97577508":null,"97556355":null,"97540888":null,"97489394":null,"97469162":null,"97443023":null,"97424309":null,"97400965":null,"97298198":null,"96552049":null,"95084672":null,"94080396":null,"94060453":null,"94039565":null,"94014787":null,"93975093":null,"93636338":null,"93086138":null,"92772709":null,"92538000":null,"91915464":null,"91799441":null,"91794699":null,"91584240":null,"90602834":null,"90322727":null,"89908222":null,"89874622":null,"89829219":null,"89795822":null,"89537954":null,"89509642":null,"88840969":null,"86340855":null,"85664746":null,"85644548":null,"85625255":null,"85612377":null,"85543063":null,"85496777":null,"85477895":null,"85458141":null,"85430266":null,"85415521":null,"85392275":null,"85358822":null,"85310397":null,"85062767":null,"85027835":null,"84976769":null,"84815706":null,"84034078":null,"84004537":null,"83984622":null,"83945184":null,"83876882":null,"83862592":null,"83833156":null,"83812286":null,"83768865":null,"83695461":null,"83668146":null,"83645107":null,"83627511":null,"83482917":null,"82420100":null,"82401358":null,"81634656":null,"80692357":null,"79350890":null,"79278081":null,"78896991":null,"78834646":null,"78782749":null,"78745812":null,"78261149":null,"76761318":null,"76610280":null,"76530289":null,"76115779":null,"76091621":null,"74670111":null,"74287776":null,"74164948":null,"73643555":null,"72297142":null,"72287340":null,"72252737":null,"70892794":null,"70836676":null,"70538129":null,"70030260":null,"68896951":null,"68773660":null,"68694668":null,"68648309":null,"68305723":null,"68292550":null,"68227478":null,"68210187":null,"67747516":null,"66655321":null,"66472888":null,"66265204":null,"66226236":null,"65971793":null,"65570203":null,"65253227":null,"65038869":null,"65022153":null,"64848331":null,"64764617":null,"64690795":null,"64623609":null,"64473147":null,"64358222":null,"64356427":null,"64341384":null,"64322612":null,"63118729":null,"63052776":null,"63023403":null,"62987518":null,"62971726":null,"62957446":null,"62862058":null,"62848829":null,"62715698":null,"62696103":null,"62690095":null,"62647172":null,"62637780":null,"62629080":null,"62625039":null,"62612046":null,"61532915":null,"61521359":null,"61392523":null,"61377112":null,"61360820":null,"61340731":null,"61314924":null,"60450689":null,"60436500":null,"59495139":null,"59477096":null,"59463922":null,"59368360":null,"58337538":null,"58262201":null,"58246271":null,"57852597":null,"57578188":null,"57229708":null,"57225376":null,"57124060":null,"57044822":null,"57039414":null,"57014372":null,"56556057":null,"56253144":null,"56234931":null,"56145759":null,"56095491":null,"56090893":null,"56014865":null,"55877338":null,"55768714":null,"55543949":null,"55369122":null,"55286176":null,"55199457":null,"55146616":null,"55144137":null,"55106187":null,"55105006":null,"52559331":null,"51598217":null,"50665645":null,"50512279":null,"49435178":null,"49192001":null,"48426914":null,"48290443":null,"47026727":null,"46177936":null,"46082516":null,"45949913":null,"45932834":null,"44135894":null,"43907229":null,"43494986":null,"43413369":null,"42973907":null,"42899143":null,"42891595":null,"42791839":null,"42773574":null,"42772781":null,"42194880":null,"41372919":null,"41041525":null,"40492465":null,"40076624":null,"40036568":null,"39820051":null,"39819483":null,"39786542":null,"39786371":null,"39745608":null,"39743999":null,"39453469":null,"39117218":null,"37773453":null,"36489856":null,"36425377":null,"36352316":null,"36025531":null,"35980835":null,"35969952":null,"35372438":null,"35237081":null,"35192682":null,"35132421":null,"35124858":null,"34958240":null,"33761162":null,"33619542":null,"33532058":null,"33385095":null,"32124162":null,"32028232":null,"32004063":null,"31843050":null,"31571002":null,"31146362":null,"30884061":null,"30865013":null,"30864783":null,"30864572":null,"30435429":null,"30351490":null,"29332309":null,"29315803":null,"28784379":null,"28633672":null,"28633124":null,"28632937":null,"28254887":null,"28254327":null,"28151547":null,"28151182":null,"27973104":null,"27903697":null,"27835549":null,"26162288":null,"26146219":null,"26122154":null,"25698808":null,"25698235":null,"25609381":null,"25609253":null,"25559494":null,"25501573":null,"25501053":null,"25500704":null,"25498530":null,"25497279":null,"25495021":null,"25494367":null,"25484888":null,"25484431":null,"22764093":null,"22762611":null,"22758393":null,"21486264":null,"21485227":null,"20638783":null,"20638251":null,"20637434":null,"20635484":null,"5153047":null,"5141539":null},
            "likeData":false,
            "width":1447,
            "height":2160,
            "pageCount":1,
            "bookmarkCount":11681,
            "likeCount":6957,
            "commentCount":26,
            "responseCount":0,
            "viewCount":51179,
            "bookStyle":0,
            "isHowto":false,
            "isOriginal":false,
            "imageResponseOutData":[],
            "imageResponseData":[],
            "imageResponseCount":0,
            "pollData":null,
            "seriesNavData":null,
            "descriptionBoothId":null,
            "descriptionYoutubeId":null,
            "comicPromotion":null,
            "fanboxPromotion":{"userName":"ワイズスピーク@単行本発売中！","userImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg","contentUrl":"https://www.pixiv.net/fanbox/creator/1047320?utm_campaign=www_artwork&amp;utm_medium=site_flow&amp;utm_source=pixiv","description":"フリーのイラストレーター、漫画家のワイズスピークと申します。\n『ワイズスピーク』は、「こがさきゆいな」と「ようめい」の二人組のユニットです。\n同人活動はサークル『やみつき本舗』にて行っています。\n\n試行錯誤しながら運用していけたらいいなーと思っています！\n\n\n※どのプランでもすべての記事をお読み頂けます。\n\n\nお仕事履歴\n\n全年齢\nFate/Grand Order電撃コミックアンソロジー11\n同12\n同13\n同14\n同16\n\n成人向け\nコミックアンスリウム \n2018 4月号\n2018 9月号\n2019 2月号\n2019 5月号\n2019 10月号\n\n合同企画\n『おさななじみと。』\n『Melty H』\n『最終制服女史』\n\nイベント関係\nコスホリック23イメージイラスト\nメロンブックス　女身くじ第四弾【乳くじ】HAPPY NEW(乳) YEAR『中乳』","imageUrl":"https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg","imageUrlMobile":"https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg","hasAdultContent":true},
            "contestBanners":[],
            "isBookmarkable":true,
            "bookmarkData":null,
            "contestData":null,
            "zoneConfig":{"responsive":{"url":"https://pixon.ads-pixiv.net/show?zone_id=illust_responsive_side&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtnmldnlo5&amp;num=63a87088858"},"rectangle":{"url":"https://pixon.ads-pixiv.net/show?zone_id=illust_rectangle&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtqwvaxxnd&amp;num=63a87088433"},"500x500":{"url":"https://pixon.ads-pixiv.net/show?zone_id=bigbanner&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxttm3x5zq9&amp;num=63a87088692"},"header":{"url":"https://pixon.ads-pixiv.net/show?zone_id=header&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtwbwdwdnn&amp;num=63a87088212"},"footer":{"url":"https://pixon.ads-pixiv.net/show?zone_id=footer&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtyyuf1vpr&amp;num=63a87088149"},"expandedFooter":{"url":"https://pixon.ads-pixiv.net/show?zone_id=multiple_illust_viewer&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu1n56mx9j&amp;num=63a87088720"},"logo":{"url":"https://pixon.ads-pixiv.net/show?zone_id=logo_side&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu4imxpaj3&amp;num=63a87088407"},"relatedworks":{"url":"https://pixon.ads-pixiv.net/show?zone_id=relatedworks&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu7bimj0da&amp;num=63a8708856"}},
            "extraData":{"meta":{"title":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト - pixiv","description":"この作品 「チャイナキャス狐」 は 「玉藻の前」「キャス狐」 等のタグがつけられた「ワイズスピーク@単行本発売中！」さんのイラストです。 「初中華です」","canonical":"https://www.pixiv.net/artworks/97618246","alternateLanguages":{"ja":"https://www.pixiv.net/artworks/97618246","en":"https://www.pixiv.net/en/artworks/97618246"},"descriptionHeader":"この作品「チャイナキャス狐」は「玉藻の前」「キャス狐」等のタグがつけられたイラストです。","ogp":{"description":"初中華です","image":"https://embed.pixiv.net/artwork.php?illust_id=97618246","title":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト - pixiv","type":"article"},"twitter":{"description":"初中華です","image":"https://embed.pixiv.net/artwork.php?illust_id=97618246","title":"チャイナキャス狐","card":"summary_large_image"}}},
            "titleCaptionTranslation":{"workTitle":null,"workCaption":null},
            "isUnlisted":false,
            "request":null,
            "commentOff":0,
            "aiType":0
        }
    },
    "user":{"1047320":{"userId":"1047320","name":"ワイズスピーク@単行本発売中！","image":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","imageBig":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg","premium":true,"isFollowed":false,"isMypixiv":false,"isBlocking":false,"background":{"repeat":null,"color":null,"url":"https://i.pximg.net/c/1920x960_80_a2_g5/background/img/2018/12/27/21/55/56/1047320_e8ed59af4b916963ebb903b43e053ee5.jpg","isPrivate":false},"sketchLiveId":null,"partial":0,"acceptRequest":true,"sketchLives":[]}}
}
```
```JavaScript
{
    timestamp:"2022-12-26T00:47:20+09:00",
    illust:{
        97618246:{
            "illustId":"97618246",
            "illustTitle":"チャイナキャス狐",
            "illustComment":"初中華です",
            "id":"97618246",
            "title":"チャイナキャス狐",
            "description":"初中華です",
            "illustType":0,
            "createDate":"2022-04-14T05:53:00+00:00",
            "uploadDate":"2022-04-14T05:53:00+00:00",
            "restrict":0,
            "xRestrict":0,
            "sl":4,
            "urls":{"mini":"https://i.pximg.net/c/48x48/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","thumb":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","small":"https://i.pximg.net/c/540x540_70/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg","regular":"https://i.pximg.net/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg","original":"https://i.pximg.net/img-original/img/2022/04/14/14/53/51/97618246_p0.jpg"},
            "tags":{
                "authorId":"1047320","isLocked":false,
                "tags":[
                    {"tag":"玉藻の前","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"キャス狐","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"Fate/EXTRA","locked":true,"deletable":false,"userId":"1047320","userName":"ワイズスピーク@単行本発売中！"},
                    {"tag":"尻神様","locked":false,"deletable":true},{"tag":"玉藻の前(Fate)","locked":false,"deletable":true},
                    {"tag":"自称初中華兄貴","locked":false,"deletable":true},{"tag":"裸足","locked":false,"deletable":true},
                    {"tag":"パンチラ","locked":false,"deletable":true},{"tag":"Fate/EXTRA5000users入り","locked":false,"deletable":true},
                    {"tag":"斎藤千和","locked":false,"deletable":true}
                ],
                "writable":true
            },
            "alt":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト",
            "storableTags":["y68AFldGp7","aKAp3RlsBg","9kbEA1dZeA","KN7uxuR89w","3g8y5LDx4G","g7xjaRuu1p","HY55MqmzzQ","gVfGX_rH_Y","asHH1_jNXv","YblYjqLXb_"],
            "userId":"1047320",
            "userName":"ワイズスピーク@単行本発売中！",
            "userAccount":"hikomaro610",
            "userIllusts":{
                "103500457":null,"103169861":null,"102534269":null,"102502835":null,"102450012":null,"102012264":null,"101931343":null,"101239818":null,"101198029":null,"101175499":null,"101151531":null,"101125256":null,"101099521":null,"100706897":null,"100647997":null,"100297510":null,"100081531":null,"99325355":null,"99262920":null,"99243861":null,"99157120":null,"99105741":null,"98890873":null,"98816496":null,"98794515":null,"98682973":null,"98633132":null,"98546110":null,"98473308":null,"98356994":null,"98311176":null,"98289359":null,"98268342":null,"98246883":null,"98196634":null,"98168104":null,"98120346":null,"98095233":null,"97985337":null,"97933171":null,"97913373":null,"97892170":null,"97817082":null,"97732229":null,"97711776":null,"97658306":null,"97636602":{"id":"97636602","title":"おっぱいキャス狐","illustType":0,"xRestrict":1,"restrict":0,"sl":6,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/15/12/35/37/97636602_p0_square1200.jpg","description":"","tags":["R-18","玉藻の前","キャス狐","Fate/EXTRA","自称初絞り兄貴","おっぱい","背後から胸揉み","爆乳","男主狐","Fate/EXTRA10000users入り"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2046,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 おっぱいキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-15T12:35:37+09:00","updateDate":"2022-04-15T12:35:37+09:00","isUnlisted":false,"isMasked":false,"profileImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","aiType":0},"97618246":{"id":"97618246","title":"チャイナキャス狐","illustType":0,"xRestrict":0,"restrict":0,"sl":4,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg","description":"初中華です","tags":["玉藻の前","キャス狐","Fate/EXTRA","尻神様","玉藻の前(Fate)","自称初中華兄貴","裸足","パンチラ","Fate/EXTRA5000users入り","斎藤千和"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2160,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-14T14:53:51+09:00","updateDate":"2022-04-14T14:53:51+09:00","isUnlisted":false,"isMasked":false,"aiType":0},"97596157":{"id":"97596157","title":"モーニングコーヒーキャス狐","illustType":0,"xRestrict":0,"restrict":0,"sl":6,"url":"https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/13/11/30/17/97596157_p0_square1200.jpg","description":"","tags":["玉藻の前","キャス狐","Fate/EXTRA","モーニングコーヒー","裸ワイシャツ","玉藻の前(Fate)","部屋とYシャツと私","Fate/EXTRA5000users入り","爆乳","男主狐"],"userId":"1047320","userName":"ワイズスピーク@単行本発売中！","width":1447,"height":2046,"pageCount":1,"isBookmarkable":true,"bookmarkData":null,"alt":"#玉藻の前 モーニングコーヒーキャス狐 - ワイズスピーク@単行本発売中！のイラスト","titleCaptionTranslation":{"workTitle":null,"workCaption":null},"createDate":"2022-04-13T11:30:17+09:00","updateDate":"2022-04-13T11:30:17+09:00","isUnlisted":false,"isMasked":false,"profileImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","aiType":0},"97577508":null,"97556355":null,"97540888":null,"97489394":null,"97469162":null,"97443023":null,"97424309":null,"97400965":null,"97298198":null,"96552049":null,"95084672":null,"94080396":null,"94060453":null,"94039565":null,"94014787":null,"93975093":null,"93636338":null,"93086138":null,"92772709":null,"92538000":null,"91915464":null,"91799441":null,"91794699":null,"91584240":null,"90602834":null,"90322727":null,"89908222":null,"89874622":null,"89829219":null,"89795822":null,"89537954":null,"89509642":null,"88840969":null,"86340855":null,"85664746":null,"85644548":null,"85625255":null,"85612377":null,"85543063":null,"85496777":null,"85477895":null,"85458141":null,"85430266":null,"85415521":null,"85392275":null,"85358822":null,"85310397":null,"85062767":null,"85027835":null,"84976769":null,"84815706":null,"84034078":null,"84004537":null,"83984622":null,"83945184":null,"83876882":null,"83862592":null,"83833156":null,"83812286":null,"83768865":null,"83695461":null,"83668146":null,"83645107":null,"83627511":null,"83482917":null,"82420100":null,"82401358":null,"81634656":null,"80692357":null,"79350890":null,"79278081":null,"78896991":null,"78834646":null,"78782749":null,"78745812":null,"78261149":null,"76761318":null,"76610280":null,"76530289":null,"76115779":null,"76091621":null,"74670111":null,"74287776":null,"74164948":null,"73643555":null,"72297142":null,"72287340":null,"72252737":null,"70892794":null,"70836676":null,"70538129":null,"70030260":null,"68896951":null,"68773660":null,"68694668":null,"68648309":null,"68305723":null,"68292550":null,"68227478":null,"68210187":null,"67747516":null,"66655321":null,"66472888":null,"66265204":null,"66226236":null,"65971793":null,"65570203":null,"65253227":null,"65038869":null,"65022153":null,"64848331":null,"64764617":null,"64690795":null,"64623609":null,"64473147":null,"64358222":null,"64356427":null,"64341384":null,"64322612":null,"63118729":null,"63052776":null,"63023403":null,"62987518":null,"62971726":null,"62957446":null,"62862058":null,"62848829":null,"62715698":null,"62696103":null,"62690095":null,"62647172":null,"62637780":null,"62629080":null,"62625039":null,"62612046":null,"61532915":null,"61521359":null,"61392523":null,"61377112":null,"61360820":null,"61340731":null,"61314924":null,"60450689":null,"60436500":null,"59495139":null,"59477096":null,"59463922":null,"59368360":null,"58337538":null,"58262201":null,"58246271":null,"57852597":null,"57578188":null,"57229708":null,"57225376":null,"57124060":null,"57044822":null,"57039414":null,"57014372":null,"56556057":null,"56253144":null,"56234931":null,"56145759":null,"56095491":null,"56090893":null,"56014865":null,"55877338":null,"55768714":null,"55543949":null,"55369122":null,"55286176":null,"55199457":null,"55146616":null,"55144137":null,"55106187":null,"55105006":null,"52559331":null,"51598217":null,"50665645":null,"50512279":null,"49435178":null,"49192001":null,"48426914":null,"48290443":null,"47026727":null,"46177936":null,"46082516":null,"45949913":null,"45932834":null,"44135894":null,"43907229":null,"43494986":null,"43413369":null,"42973907":null,"42899143":null,"42891595":null,"42791839":null,"42773574":null,"42772781":null,"42194880":null,"41372919":null,"41041525":null,"40492465":null,"40076624":null,"40036568":null,"39820051":null,"39819483":null,"39786542":null,"39786371":null,"39745608":null,"39743999":null,"39453469":null,"39117218":null,"37773453":null,"36489856":null,"36425377":null,"36352316":null,"36025531":null,"35980835":null,"35969952":null,"35372438":null,"35237081":null,"35192682":null,"35132421":null,"35124858":null,"34958240":null,"33761162":null,"33619542":null,"33532058":null,"33385095":null,"32124162":null,"32028232":null,"32004063":null,"31843050":null,"31571002":null,"31146362":null,"30884061":null,"30865013":null,"30864783":null,"30864572":null,"30435429":null,"30351490":null,"29332309":null,"29315803":null,"28784379":null,"28633672":null,"28633124":null,"28632937":null,"28254887":null,"28254327":null,"28151547":null,"28151182":null,"27973104":null,"27903697":null,"27835549":null,"26162288":null,"26146219":null,"26122154":null,"25698808":null,"25698235":null,"25609381":null,"25609253":null,"25559494":null,"25501573":null,"25501053":null,"25500704":null,"25498530":null,"25497279":null,"25495021":null,"25494367":null,"25484888":null,"25484431":null,"22764093":null,"22762611":null,"22758393":null,"21486264":null,"21485227":null,"20638783":null,"20638251":null,"20637434":null,"20635484":null,"5153047":null,"5141539":null},
            "likeData":false,
            "width":1447,
            "height":2160,
            "pageCount":1,
            "bookmarkCount":11681,
            "likeCount":6957,
            "commentCount":26,
            "responseCount":0,
            "viewCount":51179,
            "bookStyle":0,
            "isHowto":false,
            "isOriginal":false,
            "imageResponseOutData":[],
            "imageResponseData":[],
            "imageResponseCount":0,
            "pollData":null,
            "seriesNavData":null,
            "descriptionBoothId":null,
            "descriptionYoutubeId":null,
            "comicPromotion":null,
            "fanboxPromotion":{"userName":"ワイズスピーク@単行本発売中！","userImageUrl":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg","contentUrl":"https://www.pixiv.net/fanbox/creator/1047320?utm_campaign=www_artwork&amp;utm_medium=site_flow&amp;utm_source=pixiv","description":"フリーのイラストレーター、漫画家のワイズスピークと申します。\n『ワイズスピーク』は、「こがさきゆいな」と「ようめい」の二人組のユニットです。\n同人活動はサークル『やみつき本舗』にて行っています。\n\n試行錯誤しながら運用していけたらいいなーと思っています！\n\n\n※どのプランでもすべての記事をお読み頂けます。\n\n\nお仕事履歴\n\n全年齢\nFate/Grand Order電撃コミックアンソロジー11\n同12\n同13\n同14\n同16\n\n成人向け\nコミックアンスリウム \n2018 4月号\n2018 9月号\n2019 2月号\n2019 5月号\n2019 10月号\n\n合同企画\n『おさななじみと。』\n『Melty H』\n『最終制服女史』\n\nイベント関係\nコスホリック23イメージイラスト\nメロンブックス　女身くじ第四弾【乳くじ】HAPPY NEW(乳) YEAR『中乳』","imageUrl":"https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg","imageUrlMobile":"https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg","hasAdultContent":true},
            "contestBanners":[],
            "isBookmarkable":true,
            "bookmarkData":null,
            "contestData":null,
            "zoneConfig":{"responsive":{"url":"https://pixon.ads-pixiv.net/show?zone_id=illust_responsive_side&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtnmldnlo5&amp;num=63a87088858"},"rectangle":{"url":"https://pixon.ads-pixiv.net/show?zone_id=illust_rectangle&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtqwvaxxnd&amp;num=63a87088433"},"500x500":{"url":"https://pixon.ads-pixiv.net/show?zone_id=bigbanner&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxttm3x5zq9&amp;num=63a87088692"},"header":{"url":"https://pixon.ads-pixiv.net/show?zone_id=header&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtwbwdwdnn&amp;num=63a87088212"},"footer":{"url":"https://pixon.ads-pixiv.net/show?zone_id=footer&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxtyyuf1vpr&amp;num=63a87088149"},"expandedFooter":{"url":"https://pixon.ads-pixiv.net/show?zone_id=multiple_illust_viewer&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu1n56mx9j&amp;num=63a87088720"},"logo":{"url":"https://pixon.ads-pixiv.net/show?zone_id=logo_side&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu4imxpaj3&amp;num=63a87088407"},"relatedworks":{"url":"https://pixon.ads-pixiv.net/show?zone_id=relatedworks&amp;format=js&amp;s=1&amp;up=0&amp;a=42&amp;ng=g&amp;l=ja&amp;uri=%2Fartworks%2F_PARAM_&amp;ref=www.pixiv.net%2Fartworks%2F97618246&amp;is_spa=1&amp;K=8d85081b167696&amp;ab_test_digits_first=27&amp;uab=22&amp;yuid=QIglcHI&amp;suid=Ph9ghndxu7bimj0da&amp;num=63a8708856"}},
            "extraData":{"meta":{"title":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト - pixiv","description":"この作品 「チャイナキャス狐」 は 「玉藻の前」「キャス狐」 等のタグがつけられた「ワイズスピーク@単行本発売中！」さんのイラストです。 「初中華です」","canonical":"https://www.pixiv.net/artworks/97618246","alternateLanguages":{"ja":"https://www.pixiv.net/artworks/97618246","en":"https://www.pixiv.net/en/artworks/97618246"},"descriptionHeader":"この作品「チャイナキャス狐」は「玉藻の前」「キャス狐」等のタグがつけられたイラストです。","ogp":{"description":"初中華です","image":"https://embed.pixiv.net/artwork.php?illust_id=97618246","title":"#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト - pixiv","type":"article"},"twitter":{"description":"初中華です","image":"https://embed.pixiv.net/artwork.php?illust_id=97618246","title":"チャイナキャス狐","card":"summary_large_image"}}},
            "titleCaptionTranslation":{"workTitle":null,"workCaption":null},
            "isUnlisted":false,
            "request":null,
            "commentOff":0,
            "aiType":0
        }
    },
    "user":{"1047320":{"userId":"1047320","name":"ワイズスピーク@単行本発売中！","image":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_50.jpg","imageBig":"https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg","premium":true,"isFollowed":false,"isMypixiv":false,"isBlocking":false,"background":{"repeat":null,"color":null,"url":"https://i.pximg.net/c/1920x960_80_a2_g5/background/img/2018/12/27/21/55/56/1047320_e8ed59af4b916963ebb903b43e053ee5.jpg","isPrivate":false},"sketchLiveId":null,"partial":0,"acceptRequest":true,"sketchLives":[]}}
}
```

```JavaScript
{
  '97618246': {
    illustId: '97618246',
    illustTitle: 'チャイナキャス狐',
    illustComment: '初中華です',
    id: '97618246',
    title: 'チャイナキャス狐',
    description: '初中華です',
    illustType: 0,
    createDate: '2022-04-14T05:53:00+00:00',
    uploadDate: '2022-04-14T05:53:00+00:00',
    restrict: 0,
    xRestrict: 0,
    sl: 4,
    urls: {
      mini: 'https://i.pximg.net/c/48x48/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg',
      thumb: 'https://i.pximg.net/c/250x250_80_a2/img-master/img/2022/04/14/14/53/51/97618246_p0_square1200.jpg',
      small: 'https://i.pximg.net/c/540x540_70/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg',
      regular: 'https://i.pximg.net/img-master/img/2022/04/14/14/53/51/97618246_p0_master1200.jpg',
      original: 'https://i.pximg.net/img-original/img/2022/04/14/14/53/51/97618246_p0.jpg'
    },
    tags: {
      authorId: '1047320',
      isLocked: false,
      tags: [Array],
      writable: true
    },
    alt: '#玉藻の前 チャイナキャス狐 - ワイズスピーク@単行本発売中！のイラスト',
    storableTags: [
      'y68AFldGp7', 'aKAp3RlsBg',
      '9kbEA1dZeA', 'KN7uxuR89w',
      '3g8y5LDx4G', 'g7xjaRuu1p',
      'HY55MqmzzQ', 'gVfGX_rH_Y',
      'asHH1_jNXv', 'YblYjqLXb_'
    ],
    userId: '1047320',
    userName: 'ワイズスピーク@単行本発売中！',
    userAccount: 'hikomaro610',
    userIllusts: {
      '5141539': null,
      '5153047': null,
      '20635484': null,
      '20637434': null,
      '20638251': null,
      '20638783': null,
      '21485227': null,
      '21486264': null,
      '22758393': null,
      '22762611': null,
      '22764093': null,
      '25484431': null,
      '25484888': null,
      '25494367': null,
      '25495021': null,
      '25497279': null,
      '25498530': null,
      '25500704': null,
      '25501053': null,
      '25501573': null,
      '25559494': null,
      '25609253': null,
      '25609381': null,
      '25698235': null,
      '25698808': null,
      '26122154': null,
      '26146219': null,
      '26162288': null,
      '27835549': null,
      '27903697': null,
      '27973104': null,
      '28151182': null,
      '28151547': null,
      '28254327': null,
      '28254887': null,
      '28632937': null,
      '28633124': null,
      '28633672': null,
      '28784379': null,
      '29315803': null,
      '29332309': null,
      '30351490': null,
      '30435429': null,
      '30864572': null,
      '30864783': null,
      '30865013': null,
      '30884061': null,
      '31146362': null,
      '31571002': null,
      '31843050': null,
      '32004063': null,
      '32028232': null,
      '32124162': null,
      '33385095': null,
      '33532058': null,
      '33619542': null,
      '33761162': null,
      '34958240': null,
      '35124858': null,
      '35132421': null,
      '35192682': null,
      '35237081': null,
      '35372438': null,
      '35969952': null,
      '35980835': null,
      '36025531': null,
      '36352316': null,
      '36425377': null,
      '36489856': null,
      '37773453': null,
      '39117218': null,
      '39453469': null,
      '39743999': null,
      '39745608': null,
      '39786371': null,
      '39786542': null,
      '39819483': null,
      '39820051': null,
      '40036568': null,
      '40076624': null,
      '40492465': null,
      '41041525': null,
      '41372919': null,
      '42194880': null,
      '42772781': null,
      '42773574': null,
      '42791839': null,
      '42891595': null,
      '42899143': null,
      '42973907': null,
      '43413369': null,
      '43494986': null,
      '43907229': null,
      '44135894': null,
      '45932834': null,
      '45949913': null,
      '46082516': null,
      '46177936': null,
      '47026727': null,
      '48290443': null,
      '48426914': null,
      '49192001': null,
      '49435178': null,
      '50512279': null,
      '50665645': null,
      '51598217': null,
      '52559331': null,
      '55105006': null,
      '55106187': null,
      '55144137': null,
      '55146616': null,
      '55199457': null,
      '55286176': null,
      '55369122': null,
      '55543949': null,
      '55768714': null,
      '55877338': null,
      '56014865': null,
      '56090893': null,
      '56095491': null,
      '56145759': null,
      '56234931': null,
      '56253144': null,
      '56556057': null,
      '57014372': null,
      '57039414': null,
      '57044822': null,
      '57124060': null,
      '57225376': null,
      '57229708': null,
      '57578188': null,
      '57852597': null,
      '58246271': null,
      '58262201': null,
      '58337538': null,
      '59368360': null,
      '59463922': null,
      '59477096': null,
      '59495139': null,
      '60436500': null,
      '60450689': null,
      '61314924': null,
      '61340731': null,
      '61360820': null,
      '61377112': null,
      '61392523': null,
      '61521359': null,
      '61532915': null,
      '62612046': null,
      '62625039': null,
      '62629080': null,
      '62637780': null,
      '62647172': null,
      '62690095': null,
      '62696103': null,
      '62715698': null,
      '62848829': null,
      '62862058': null,
      '62957446': null,
      '62971726': null,
      '62987518': null,
      '63023403': null,
      '63052776': null,
      '63118729': null,
      '64322612': null,
      '64341384': null,
      '64356427': null,
      '64358222': null,
      '64473147': null,
      '64623609': null,
      '64690795': null,
      '64764617': null,
      '64848331': null,
      '65022153': null,
      '65038869': null,
      '65253227': null,
      '65570203': null,
      '65971793': null,
      '66226236': null,
      '66265204': null,
      '66472888': null,
      '66655321': null,
      '67747516': null,
      '68210187': null,
      '68227478': null,
      '68292550': null,
      '68305723': null,
      '68648309': null,
      '68694668': null,
      '68773660': null,
      '68896951': null,
      '70030260': null,
      '70538129': null,
      '70836676': null,
      '70892794': null,
      '72252737': null,
      '72287340': null,
      '72297142': null,
      '73643555': null,
      '74164948': null,
      '74287776': null,
      '74670111': null,
      '76091621': null,
      '76115779': null,
      '76530289': null,
      '76610280': null,
      '76761318': null,
      '78261149': null,
      '78745812': null,
      '78782749': null,
      '78834646': null,
      '78896991': null,
      '79278081': null,
      '79350890': null,
      '80692357': null,
      '81634656': null,
      '82401358': null,
      '82420100': null,
      '83482917': null,
      '83627511': null,
      '83645107': null,
      '83668146': null,
      '83695461': null,
      '83768865': null,
      '83812286': null,
      '83833156': null,
      '83862592': null,
      '83876882': null,
      '83945184': null,
      '83984622': null,
      '84004537': null,
      '84034078': null,
      '84815706': null,
      '84976769': null,
      '85027835': null,
      '85062767': null,
      '85310397': null,
      '85358822': null,
      '85392275': null,
      '85415521': null,
      '85430266': null,
      '85458141': null,
      '85477895': null,
      '85496777': null,
      '85543063': null,
      '85612377': null,
      '85625255': null,
      '85644548': null,
      '85664746': null,
      '86340855': null,
      '88840969': null,
      '89509642': null,
      '89537954': null,
      '89795822': null,
      '89829219': null,
      '89874622': null,
      '89908222': null,
      '90322727': null,
      '90602834': null,
      '91584240': null,
      '91794699': null,
      '91799441': null,
      '91915464': null,
      '92538000': null,
      '92772709': null,
      '93086138': null,
      '93636338': null,
      '93975093': null,
      '94014787': null,
      '94039565': null,
      '94060453': null,
      '94080396': null,
      '95084672': null,
      '96552049': null,
      '97298198': null,
      '97400965': null,
      '97424309': null,
      '97443023': null,
      '97469162': null,
      '97489394': null,
      '97540888': null,
      '97556355': null,
      '97577508': null,
      '97596157': [Object],
      '97618246': [Object],
      '97636602': [Object],
      '97658306': null,
      '97711776': null,
      '97732229': null,
      '97817082': null,
      '97892170': null,
      '97913373': null,
      '97933171': null,
      '97985337': null,
      '98095233': null,
      '98120346': null,
      '98168104': null,
      '98196634': null,
      '98246883': null,
      '98268342': null,
      '98289359': null,
      '98311176': null,
      '98356994': null,
      '98473308': null,
      '98546110': null,
      '98633132': null,
      '98682973': null,
      '98794515': null,
      '98816496': null,
      '98890873': null,
      '99105741': null,
      '99157120': null,
      '99243861': null,
      '99262920': null,
      '99325355': null,
      '100081531': null,
      '100297510': null,
      '100647997': null,
      '100706897': null,
      '101099521': null,
      '101125256': null,
      '101151531': null,
      '101175499': null,
      '101198029': null,
      '101239818': null,
      '101931343': null,
      '102012264': null,
      '102450012': null,
      '102502835': null,
      '102534269': null,
      '103169861': null,
      '103500457': null
    },
    likeData: false,
    width: 1447,
    height: 2160,
    pageCount: 1,
    bookmarkCount: 11681,
    likeCount: 6957,
    commentCount: 26,
    responseCount: 0,
    viewCount: 51179,
    bookStyle: 0,
    isHowto: false,
    isOriginal: false,
    imageResponseOutData: [],
    imageResponseData: [],
    imageResponseCount: 0,
    pollData: null,
    seriesNavData: null,
    descriptionBoothId: null,
    descriptionYoutubeId: null,
    comicPromotion: null,
    fanboxPromotion: {
      userName: 'ワイズスピーク@単行本発売中！',
      userImageUrl: 'https://i.pximg.net/user-profile/img/2017/08/11/19/18/51/13020245_fdd8b7bacebcb472693c42084d417d5b_170.jpg',
      contentUrl: 'https://www.pixiv.net/fanbox/creator/1047320?utm_campaign=www_artwork&amp;utm_medium=site_flow&amp;utm_source=pixiv',
      description: 'フリーのイラストレーター、漫画家のワイズスピークと申します。\n' +
        '『ワイズスピーク』は、「こがさきゆいな」と「ようめい」の二人組のユニットです。\n' +
        '同人活動はサークル『やみつき本舗』にて行っています。\n' +
        '\n' +
        '試行錯誤しながら運用していけたらいいなーと思っています！\n' +
        '\n' +
        '\n' +
        '※どのプランでもすべての記事をお読み頂けます。\n' +
        '\n' +
        '\n' +
        'お仕事履歴\n' +
        '\n' +
        '全年齢\n' +
        'Fate/Grand Order電撃コミックアンソロジー11\n' +
        '同12\n' +
        '同13\n' +
        '同14\n' +
        '同16\n' +
        '\n' +
        '成人向け\n' +
        'コミックアンスリウム \n' +
        '2018 4月号\n' +
        '2018 9月号\n' +
        '2019 2月号\n' +
        '2019 5月号\n' +
        '2019 10月号\n' +
        '\n' +
        '合同企画\n' +
        '『おさななじみと。』\n' +
        '『Melty H』\n' +
        '『最終制服女史』\n' +
        '\n' +
        'イベント関係\n' +
        'コスホリック23イメージイラスト\n' +
        'メロンブックス　女身くじ第四弾【乳くじ】HAPPY NEW(乳) YEAR『中乳』',
      imageUrl: 'https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg',
      imageUrlMobile: 'https://pixiv.pximg.net/c/520x280_90_a2_g5/fanbox/public/images/creator/1047320/cover/TUfJ0UEoBDxN8knpQIXrHqu4.jpeg',
      hasAdultContent: true
    },
    contestBanners: [],
    isBookmarkable: true,
    bookmarkData: null,
    contestData: null,
    zoneConfig: {
      responsive: [Object],
      rectangle: [Object],
      '500x500': [Object],
      header: [Object],
      footer: [Object],
      expandedFooter: [Object],
      logo: [Object],
      relatedworks: [Object]
    },
    extraData: { meta: [Object] },
    titleCaptionTranslation: { workTitle: null, workCaption: null },
    isUnlisted: false,
    request: null,
    commentOff: 0,
    aiType: 0
  }
}
```


#### meta-preload-dataのinterface化


```TypeScript 
interface iMetaPreloadData {
    timestamp: string;
    illust: iIllustData;
    user: [key: string]: {
        userId: string;
        name: string;
    };
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

#### tags

artworkpageのcontentのjsonファイルのtagsの為のinterface

```TypeScript
interface iTgasList {
    tag: string;
    locked: boolean;
    deletable: boolean;
    userId: string;
};
interface iTgas {
    authorId: string;
    isLocked: boolean;
    tags: iTagList[];
    writable: boolean;
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




## コマンドの実行

```bash
# ひとまずなコマンドとオプションの組み合わせ一覧
collect byKeyword --keyword --tags		# 何もしない
collect fromBookmakr --keyword --tags	# 何もしない
bookmark --keyword --userName	# ブックマーク操作をする
download byKeyword --keyword --tags	# ダウンロード操作をする
download fromBookmakr --keyword --tags	# ダウンロード操作をする
```

actionの内容は次の通りになりそうだ

- ブックマーク操作
- ダウンロード操作

#### action実装の前に分析

resolvedとして取り出したHTTPResponseのbodyデータの一部が

検査に合格すればactionを実行する

検査はiFilterLogic型の関数

ただし現状は完全にこの検査関数がassembler.filter()に組み込まれているので

これを分離する必要がある。

前提：

- resolvedは必ずT型配列である。
- resolvedからどんなデータを取り出すのかは場合による。(T[]なのか、T[property][]なのか)
- filterLogicによってresolvedの検査を行う
- filterLogicは合否をbooleanで返すだけ

```TypeScript
	.then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses, id))
	.then((resolved: iIllustData[]) => 

		// ここで4つ行っているわけ
		// 1. resolvedにほしいデータがあるのかどうかの判定: filterLogic()
		// 2. resolvedがfilterLogicｎ合格したら配列に収めるassembler.filter()
		// 3. assembler.collect()でassembler.fitler()のデータの収集
		// 4. 収集結果の値のリターン(ただし実際には値を返していない)

		assembler.collect(
			assembler.filter(resolved, generateFilterLogic(optionsProxy.get()))
		)
	)
	.catch(e => assembler.errorHandler(e))
```

こんな感じに分離することになる

```TypeScript

const action = new Action();
assembler.setAction(/* define order according to command */)
// ....
	.then((resolved: iIllustData[]) => {
		// ここで3つ行っているわけ
		// 1. resolvedにほしいデータがあるのかどうかの判定: filterLogic()
		// 2. resolvedがfilterLogicｎ合格したら配列に収めるassembler.filter()
		// 3. assembler.collect()でassembler.fitler()のデータの収集

		for(const element of resolved) {
			// resolvedの要素が検査に合格しているかどうか
			if(filterLogic(element)) {
				// collect data
				this.collected.push(element)
				// or collect data property
				this.collected.push(element[key]);
				// execute action
				return assembler.executeAction();
			}
		}
	})
	.catch(e => assembler.errorHandler(e))
```
`assembler.setAction(...orders)`とあらかじめセットしておけば、

あとは`assembler.executeAction()`を実行すればいいだけ

という便利さにしたい。

問題：

- 実際に実行することになるaction関数へ引数が渡せない

そのままだとハードコーディングになる（別にいいのだけれど

```TypeScript
// 引数は、resolvedから導き出されるので、予め渡すようなことはできない
const download = (url: string, dest: fs.PathLike): void => {

};

// pageは渡せるけど、それはbookmarkだけ
const bookmark = (page: puppeteer.Page) => {
	return page.click(/* selector */);
};
```

なので、

```TypeScript
// 確実なこと：必ず配列Type[]を引数として取得する
.then((resolved: iIllustData[]) => {
	// resolvedは配列であり、filterLogicはその要素一つずつに対して呼び出されるので
	// actionは要素一つずつに対して実行しなくてはいけない
	for(const element of resolved) {
		// 確実なこと：filterLogic()は必ずresolvedを受け取り合否をbooleanで返す
		if(filterLogic(element)) {
			assembler.collected.push(element);

			// ここでactionを実行させたいのだけれど、
			// どんな引数を渡すべきなのかは実行させるactionの内容による
			// なのでハードコーディングになるのでは？
			// 
			// あと、実行内容が非同期だとそのまま実行できない。
			// return 非同期関数（）としないと逐次処理にならない

			download(resolved.urls.origin, "./dest/cat.png");
			bookmark(assembler.getPageInstances(circulator));
		}
	}
})
// ...

// 検討１: action関数をクロージャにする
// 
// しかし、donwload()は次のようにできるかも？
// これならelementだけ取得すればよい
const generateDownloader = <T>(element: T):  => {
	const dest = "";
	let url: string = "";
	if(element.hasOwnProperty('urls') && element.url.hasOwnProperty('origin')) url = element.url.origin;
	else return;
	return download(url, dest);
};


// ...
.then((resolved: iIllustData[]) => {
	for(const element of resolved) {
		if(filterLogic(element)) {
			assembler.collected.push(element);
			assembler.generateDownload(element);
			assembler.bookmark(assembler.getPageInstances(circulator));
		}
	}
})
```

まだ非同期関数を実行する場合を考慮していない
action関数は基本的に非同期という前提のもと検討する

promiseチェーンは、then()ハンドラが`return非同期関数`ならば問題ないので...

```TypeScript
.then((resolved: iIllustData[]) => {
	for(const element of resolved) {
		if(filterLogic(element)) {
			assembler.collected.push(element);
			return (async function actionExecutor() {
				await assembler.generateDownload(element);
				await assembler.bookmark(assembler.getPageInstances(circulator));
			})();
		}
	}
})
```

これなら予め`actionExecutor`を定義しておいて後はここのthen()ハンドラのreturnで呼出すだけにできる


```TypeScript
const page: puppeteer.Page;

const generateDownloader = <T>(element: T):  => {
	const dest = "";
	let url: string = "";
	if(element.hasOwnProperty('urls') && element.url.hasOwnProperty('origin')) url = element.url.origin;
	else return;
	return download(url, dest);
};

// action内容をハードコーディング
const executor = async (element: T): Promise<void> => {
	await generateDownloader(element);
	await bookmark(page);
}

// then()呼出の前にあらかじめセットしておく
assembler.setAction(
	executor
)

.then((resolved: iIllustData[]) => {
	// 各要素に対して
	for(const element of resolved) {
		// フィルタ検査
		if(filterLogic(element)) {
			assembler.collected.push(element);
			return executeAction(element);		// 必要な引数をここですべて取得しなくちゃいけないけれども
		}
	}
})
```

これならば、

```TypeScript
type iActionExecutor = <T>(element: T) => Promise<void>;

const dest: fs.PathLike = "../dist/cat.png";

const parseOriginUrlOfArtwork = (element: iIllustData): string | undefined => {
	// origin urlをelementから解析して取り出す
	return element.hasOwnProperty() && element.urls.hasOwnProperty() 
		? element.urls.origin
		: undefined;
}

const download = (url: string, dest: fs.PathLike): Promise<void> => {
	return new Downloader(url, dest).download();
}

const executor: iActionExecutor<iIllustData> = async (element) => {
	// TODO: page is not be scoped.
	await bookmark(page);
	await download(parseOriginUrlOfArtwork(element), dest);
};


// ...
// In case collecting result page...
		.then((responses: (puppeteer.HTTPResponse | any)[]) => {
			// DEBUG:
			console.log(`[assemblingResultPageCollectProcess] S:${circulator} - P:${currentPage} Resolving HTTP Response...`);
			return assembler.resolveResponses!(responses);
		})
		// 3. Collect id from the data.
		.then((data: iIllustMangaDataElement[]) => {
			// DEBUG:
			console.log(`[assemblingResultPageCollectProcess] S:${circulator} - P:${currentPage} Collecting property...`);

			return assembler.collectProperties(data, key)
		})
		// 4. Error handling
		.catch((e) => assembler.errorHandler(e, circulator))


// In case collecting artwork page...
		.then((responses: (puppeteer.HTTPResponse | any)[]) => assembler.resolveResponses!(responses, id))
		.then((resolved: iIllustData[]) => {
			// NOTE: resolvedは要素がただ一つという前提である。
			const element = resolved.shift();
			if(generateFilterLogic(optionsProxy.get())(element)) {
				assembler.collected.push(element);
				return assembler.actionExecution(element);
			}
		})
		.catch(e => assembler.errorHandler(e))
```

## 検証：AssembleParallelPageSequencesの自動セットアップ

NOTE: *これが成功で来たら内容をまとめて記事にしよう*

結局のところ、

Assemble~の逐次処理をどうするかは外部で定義することになる。

しかし、

使ってみたところ逐次処理の基本的な流れが定まってきた。

以下が単一の逐次処理の処理の流れである

- `(引数なし) => ナビゲーション()`
- `(HTTPResponses: (puppeteer.HTTPResopnse | any)[]) => resolver()`
- `(resolvedValue: T[]) => {/* 場合によるが、値を返さない */}`
- `(e) => errorHandler()`

なので逐次処理の各段階のthenハンドラに対して型を定めることができるかもしれない。


```TypeScript
type iAssemblerNavigationHandler = () => Promise<(puppeteer.HTTPResponse | any)[]>;
type iAssemblerResolveHandler = <T>(responses: (puppeteer.HTTPResponse | any)[]) => Promise<resolved: T[]>;
type iAssemblerSolutionHandler = <T>(resolved: T[]) => Promise<void>;

// これを利用すれば、予め逐次処理の関数を登録しておけるかも？
// 
// とはいえ、外部の関数をつかってAssemble~のインスタンスのアクセスが必要になる
const navigationProcess: iAssemblerNavigationHandler = () => {
	this.
}


class AssembleParallelPageSequences<T> {
	// ...
	setupSequences() {
		this.getSequences()[circulator] = this.getSequences()[circulator]
		.then(() => this.navigationProcess())
		.then((responses: (puppeteer.HTTPResponse|any)[]) => this.resolvingProcess())
		.then((resolved: iIllustData[]) => this.solutionProcess())
		.catch(e => this.errorHandler());
	};

	setNavigationProcess(navigaitonLogic) {
		// この呼出は有効か？
		this.navigationLogic = navigatoinLogic.bind(this);
	};

	// setResponsesResolverの名前を変更するだけ
	setResolvingProcess(resolveLogic) {
		this.resolveLogic = resolveLogic.bind(this);
	};

	setSolutionProcess(solutionLogic) {
		this.solutionLogic = solutionLogic.bind(this);
	};

	setErrorHandlingProcess(errorHandlingLogic) {
		this.errorHandlingLogic = errorHandlingLogic.bind(this);
	};

}
```

要検証１：class外部関数をクラス内部でbind呼び出ししたら、その関数はclass内部にアクセスできるのか？

TODO: 要テスト

```TypeScript
type iCustom = () => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
	};

	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


function customIntroduce(this: Person) {
  if(this !== undefined)
    return `Hi, this is ${this!.name} and I am ${this!.age} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());
```

TypeScriptで関数のthisを指定する方法:

参考：https://www.gesource.jp/weblog/?p=7703

こうすると、上記コードはほぼエラーにならない。

ただし、

`customIntroduce()`の中で`this.name`等にはアクセスできない。

なぜなら`name`も`age`もプライベート変数だからである。

クラスメソッドでないcustomeIntroduceはそもそもアクセスできない。

なので、

```TypeScript

type iCustom = () => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
  };
  
  
//   プライベート変数ゲッターを用意した
	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


// thisをPersonにしている外部関数なので、
// パブリックメソッドにはアクセスできる
const customIntroduce: iCustome = function(this: Person) {
  if(this !== undefined)
    return `Hi, this is ${this!.getName()} and I am ${this!.getAge()} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());
```
これでエラーはなくなった。

こういう改善もできる。

```TypeScript

type iCustom = (this: Person) => string;

class Person {
	private costomIntroduce: iCustom | undefined;
	constructor(private name: string, private age: number) {
    this.introduce = this.introduce.bind(this);
    this.setCustomIntroduce = this.setCustomIntroduce.bind(this);
    this.customIntroduce = this.customIntroduce.bind(this);
	};

	introduce(): string {
		return `Hi, this is ${this.name} and I am ${this.age} yo.`;
	};

	setCustomIntroduce(customLogic: iCustom): void {
		this.customIntroduce = customLogic.bind(this);
	};

	customIntroduce(): string {
		return this.customIntroduce();
  };
  
  
//   プライベート変数ゲッターを用意した
	getName(): string {
		return this.name;
	};

	getAge(): number {
		return this.age;
	};
};


// thisをPersonにしている外部関数なので、
// パブリックメソッドにはアクセスできる
const customIntroduce: iCustome = function(
	// this引数はもともとTypeScript用の仮引数である。
	// typeで型指定済なので、this引数の省略可能。
) {
  if(this !== undefined)
    return `Hi, this is ${this!.getName()} and I am ${this!.getAge()} yo. My favorite is make some noise`;
  else throw new Error("this is not deinfed");
};

const dd = new Person('DD', 28);
dd.setCustomIntroduce(customIntroduce);
console.log(dd.customIntroduce());

```

検証２：

```TypeScript
// NOTE: Not then handler. then handler returns below type function.
type iAssemblerNavigationProcess = (this: AssembleParallelPageCollection) => Promise<(puppeteer.HTTPResponse | any)[]>;
type iAssemblerResolveProcess = <T>(this: AssembleParallelPageCollection, responses: (puppeteer.HTTPResponse | any)[]) => Promise<resolved: T[]>;
type iAssemblerSolutionProcess = <T>(this: AssembleParallelPageCollection, resolved: T[]) => Promise<void>;
type iAssemblerErrorHandlingProcess = (e: Error) => void;


class AssembleParallelPageSequences<T> {
	// ...
	setupSequence(circulator: number) {
		if(this.getSequences()[circulator] !== undefined && assembler.getPageInstance(circulator) !== undefined) {
			this.getSequences()[circulator] = this.getSequences()[circulator]
			.then(() => this.navigationProcess())
			.then((responses: (puppeteer.HTTPResponse|any)[]) => this.resolvingProcess(responses))
			.then((resolved: iIllustData[]) => this.solutionProcess(resolved))
			.catch(e => this.errorHandler(e));
		}
		else {
			// Out of range error
		}
	};

	setNavigationProcess(navigaitonLogic) {
		this.navigationLogic = navigatoinLogic.bind(this);
	};

	// setResponsesResolverの名前を変更するだけ
	setResolvingProcess(resolveLogic) {
		this.resolveLogic = resolveLogic.bind(this);
	};

	setSolutionProcess(solutionLogic) {
		this.solutionLogic = solutionLogic.bind(this);
	};

	setErrorHandlingProcess(errorHandlingLogic) {
		this.errorHandlingLogic = errorHandlingLogic.bind(this);
	};

	// setActionExecutor(actionExecutor) {
	// 	this.actionExecutor = actionExecutor.bind(this);
	// }
};


const navigationProcess: iAssemblerNavigationProcess = function() {
	this.setResponseFilter(
		// TODO: スコープ問題
		// artworkページにおいては、idとurlが必要
	);
	return this.navigation.navigateBy(this.getPageInstance(circulator), this.getPageInstance(circualtor).goto("", { waitUntil: ["load", "networkidle2"]}));
};

const resolveProcess: iAssemblerResolveProcess<iIllustData> = function(
	responses: (puppeteer.HTTPResponse | any)[]
) {
	// TODO: スコープ問題
	// id
	return this.resolveResponses(responses, id);
};

type iActionExecutor = <T>(element: T) => Promise<void>;
/**
 * ActionはAssemble~とどういう関係であるべきか
 * 	bookmark: pageインスタンスが必要である
 * 	download: urlが必要である
 * 
 * Assembler~はActionが何をするのか関知したくない
 * 	呼出はaction.execute()位にしたい
 * 
 * 
 * */ 
const executeAction: iActionExecutor<iIllustData> = async (element) => {
	await download();
	await bookmark(
		// TODO: pageインスタンスが必要
	);
}

const solutionProcess: iAssemblerSolutionProcess<iIllustData> = function(
	resolved: iIllustData[]
) {
	// ことartworkページでのソリューションにおいて、
	// 引数resolved[]の要素数は一つである
	const element: iIllustData = resolved.shift();
	if(filterLogic(element)) {
		// TODO: 多分collectedはprivateだからアクセサが必要かも
		this.collected.push(element)
		return actionExecutor(element);
	}
}

const errorHandlingProcess: iAssemblerErrorHandlingProcess = function(e: Error) {
	// Error Handling...
};

// usage

const idTable: number[];
const numberOfProcess: number;
const assembler = new AssembleParallelPageSequences<iIllustData>(
	// ...
);
const setupSequencesOfArtworkPages = (idTable: number[], numberOfProcess: number) => {
	// すべての逐次処理をセットアップする
	for(const id of idTable) {
		// ここで単一の逐次処理に必要なセットアップを定義する。
		// 
		// ループごとに異なるパラメータを与えなくてはいけないものは
		// ここで定義する
		const circulator: number = counter % numberOfProcess;
		assembler.setResponseFilter(httpResponseFilter(id, artworkPageUrl));
		assembler.setResponsesResolver(genResolver(id));
		assembler.setupSequences(circulator);
	}

	return assembler.run()
		.then(() => assembler.getCollected())
		.catch(e => assembler.errorHandler(e))
		.finally(() => assembler.finally());
};

setupSequencesOfArtworkPages(idTable, numberOfProcess);

// resolverにidを渡さなくてはならないので...
const genResolver = (id: number) => {
	return function(responses: (puppeteer.HTTPResponse | any)[]) {
		return resolver(responses, id);
	};
};


```	