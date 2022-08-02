# Stream 

Note about Stream of Node.js v16.x API

## 目次

- [node:http](#node:http)
- [node:fs](#node:fs)
- [streamが終わったのをどうやって知ればいいのか](#streamが終わったのをどうやって知ればいいのか)
- [streamを使う利点](#streamを使う利点)
- [](#)
- [](#)


## 目標

HTTP経由で大きなファイルをダウンロードして、ローカルファイルとして保存する。

その際、RAMの使用は最小限に抑えたい。

そんなダウンロードプログラムを作る。

node:https APIで読取、
node:fs APIで書き込む。


## 公式の例を少しいじって画像をダウンロードして保存する

まずは簡単にHTTP経由でウェブ上の画像をstreamを使ってダウンロードしてみる

以下の画像をstreamを使ってダウンロードする

https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png


## サンプル・コード


各読取・書込ストリームは専用のメソッドを使った場合。

```TypeScript
import { IncomingMessage } from "http";
import https from "node:https";
import * as path from "node:path";
import * as fspromises from 'node:fs/promises';

const url: string = "https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png";

const pngDownloader = (dir: string, filename: string): void => {
    https.get(url, (res: IncomingMessage) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
    
        let error;
    
        if(statusCode !== 200) {
            error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
        } else if (contentType !== undefined && !/^image\/png/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                    `Expected image/png but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // NOTE: Consume response data to free up memory
            res.resume();
            return;
        }
    
        res.setEncoding('binary');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                console.log("end");
                _writeFile(dir, filename, rawData);
            }
            catch(e) {
                console.error(e);
            }
        })
    }).on('error', (e) => {
        console.error(e);
    });
}

const _mkdir = async (dirname: string): Promise<void> => {
    try {
        await fspromises.mkdir(path.join(__dirname, dirname), { recursive: true });
        console.log("mkdir complete");
    }
    catch(e) {
        console.error(e)
    }
}

const _writeFile = async (to: string, filename: string, data: any): Promise<void> => {
    try {
        await fspromises.writeFile(path.join(to, filename), data, {
            encoding: "binary"
        });
    }
    catch(e) {
        console.error(e);
    }
}


(async function() {
    await _mkdir("out");
    pngDownloader(path.join(__dirname, "out"), "cat.png");
})()
```

やっていること箇条書き：


- `https.get()`でURL先を読み取るストリームを取得する
- NOTE: `binary`でエンコーディングして読み取る
- NOTE: `binary`エンコーディングで書き込みストリーム`fsPromises.writeFile()`へ書き込む
- fsPromises.mkdir()で保存先ディレクトリを作成する



やっていること詳しく：

- `https.get()`でURL先を読み取るストリームを取得する

ReadableStreamはここでは`https.get()`のコールバック関数に渡される引数`res`である

HTTPレスポンスの型は`IncomingMessage extends stream.Readable`で読み取りストリームの継承クラスである。

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpserverresponse

> このオブジェクトは内部的にHTTPサーバによって生成されます(Userによっては生成されません)
> `request`イベントの第二引数として渡されます。

res.on()はイベントに対して発火する。

`data`イベントは、読み取りストリームに読み取りデータがあったら発行されるイベントである。

`end`イベントが発行されたらfsメソッドへデータを渡す。


- NOTE: `binary`でエンコーディングして読み取る

PNGファイルに対してはエンコーディングを頓珍漢なものにしてしまうと大変なことになる。

大体のメソッドはデフォルトで`utf8`なので

`utf8`でPNGファイルを読み取ると大体ファイルがおかしなことになってしまう。

- NOTE: `binary`エンコーディングで書き込みストリームへ書き込む

PNGファイルが欲しいので書き込むときも、読み取った時と同様、

`binary`で書き込む。

そうしないとファイルがおかしくなる。

ちゃんとしらべていないけど、ストリームで取得したデータを変換したいときは

専用のストリームを使うこと(`Transform`ストリーム)

- fsPromises.mkdir()で保存先ディレクトリを作成する

option: `recursive: true`にしておくと既存ディレクトリと同じ名前のディレクトリを作ろうとしたときに、新たに作成はされない。

TODO: 置き換わってしまわないか要確認。




わかったこと：

- 読取ストリームで`data`イベントがある限り`chunk`という元のデータの破片が送られてくる
- 読取ストリームでもう読み取るものがなくなったら`end`イベントが発行されて、そこで読取終了とわかる
- 読取、書込各ストリームにでは`encoding`という情報の符号化を適切に指定しなくてはならない
- 読み取りストリームで取得したデータは一旦変数として確保できる
- 読み取ったものをどこかへ書き込むにはデータを書込ストリームへ渡せばいい


## node:http

HTTP APIで使える読み取りストリームについて

#### `http.request()`


```TypeScript
// http.d.ts

    function request(options: RequestOptions | string | URL, callback?: (res: IncomingMessage) => void): ClientRequest;

// requestのコールバック関数が受け取る引数の型
    class IncomingMessage extends stream.Readable {
        constructor(socket: Socket);
    }

// requestメソッドの戻り値の型
// http.ClientRequest
    class ClientRequest extends OutgoingMessage {}

// OutgoingMessage
    class OutgoingMessage extends stream.Writable {}
```

型を見るに、

`request`したらコールバックの方に読み取りストリームが、

戻り値の方に書き込みストリームが取得できる。

それぞれ何を読み取って何を書き込んでいるのか。

- `options`

割愛。公式見た方が速いね。

- オプショナル引数`callback`

> `response`イベントで一度きりのイベントリスナとして機能する。

`callback`では`IncomingMessage`インスタンスを取得する。

これは読取ストリームなので、`ReadableStream.on()`で`data`イベントをリスンして

ストリーム元を読み取る。

読み取ったデータは変数にまとめないといけないのか？



#### Class:`http.ClientRequest`

`http.request()`の戻り値。

https://nodejs.org/dist/latest-v16.x/docs/api/http.html#class-httpclientrequest


## Readable streams

https://nodejs.org/api/stream.html#readable-streams

#### 2つの読み取りモード

Readableストリームは、`flowing`と`paused`という2つのモードで効果的に動作します。

これらのモードはオブジェクトモードとは異なるものです。

- `flowing`モード：データは基礎となるシステムから自動的に読みだされて、`EventEmitter`インタフェイスに基づくイベントによってアプリケーションへASAPで供給される

- `paused`モード: `stream.read()`を明示的に呼び出してストリームからデータのチャンクを読み出す

つまり、

`flowing`モードでは読み出しにかかわる処理は自動的に行ってくれて、データの消費はイベントをリスンすることで取得できる

一方`paused`モードでは読み出しは必ず明示的に`stream.read()`を呼び出さない限り何も始まらない

...ということ。

すべての`Readable`ストリームはpausedモードから始まるけれど、以下の方法だとflowingモードにその後切り替わる：

- `data`イベントハンドラを追加する
- `stream.resume()`メソッドを呼び出す
- `stream.pipe()`メソッドを呼び出して`Writable`へデータを流す

また、次の方法をとるとpausedモードへ戻ることができる

- pipeする先（読み出したデータを流す先のことかな）がなかった場合`stream.pause()`を呼び出すことでpausedになる
- pipeする先があるときに、すべてのpipe先を取り除いたらpausedになる。`stream.unpipe()`で2つ以上のpipe先を取り除くことができるかもしれない


覚えておくべき重要な概念は、

**そのデータを消費または無視するメカニズムが提供されるまで、 Readable はデータを生成しないということです。**

消費メカニズムが無効化または削除された場合、Readable はデータの生成を停止しようとします。

後方互換性の理由から、`data` イベントハンドラを削除しても、ストリームは自動的に一時停止しません。

また、パイプで接続された送信先がある場合、 `stream.pause()` を呼び出しても、送信先からデータが流出しても、ストリームが一時停止したままになることは保証されません。

Readableがフローティング・モードに切り替わり、データを処理できるコンシューマが存在しない場合、そのデータは失われます。

これは、例えば `data` イベントにリスナーを付けずに readable.resume() メソッドを呼び出したり、 'data' イベントハンドラをストリームから削除したりした場合に起こります。

`readable` イベントハンドラを追加すると、自動的にストリームの流れが止まり、 `readable.read()` でデータを消費しなければならなくなります。

`readable` イベントハンドラが削除された場合は、 `data` イベントハンドラがあればストリームは再び流れ始めます。

つまり、

flowingモード中はコンシューマが必須。`data`イベントハンドラを必ず追加してデータ消費処理をしよう。

flowingモードで`readable`イベントハンドラを追加すると`data`イベントハンドラが無視されてpausedモードのようになってしまう

`readable`イベントハンドラを使うなら`readable.read()`の使用は必須である

公式の説明の「イベントハンドラの削除」ってのは`node:events`の`nodeEventTarget.removeListener()`をflowingモード中に使って`readable`イベントハンドラを取り除いたみたいなシナリオを想定しているのかも

...ということ。

まとめ:

- `Readable stream`には2つのモードがあり、基本的な使い方は...
- flowingモードなら`data`イベントハンドラを必ず追加してデータを消費しよう
- pausedモードなら必ず`readable.read()`を呼び出してデータを消費しよう
- flowingモードで`readable`イベントを監視したいならば、`readable.read`の使用が必須となり、`data`イベントハンドラは無視される
- 各イベントハンドラは削除ができるがその際に起こる挙動は把握しておかなくてはならない



#### 3つの状態

割愛



#### `stream.Readable`

https://nodejs.org/api/stream.html#class-streamreadable

- Event:`data`

オブジェクトモードでない場合は、`chunk`は文字列型かBuffer型になる。

> data' イベントは、ストリームがデータチャンクの所有権をコンシューマに譲渡する際に発行されます。これは、readable.pipe() や readable.resume() を呼び出したり、リスナーコールバックを 'data' イベントにアタッチしたりして、ストリームがフローティングモードに切り替わるときに発生します。また、readable.read() メソッドが呼ばれ、データのチャンクを返すことができるようになると、 'data' イベントが発行されます。

> 明示的に一時停止されていないストリームに 'data' イベントリスナーをアタッチすると、ストリームがフローティングモードに切り替わります。そして、データが利用可能になるとすぐにデータが渡されます。

> リスナーコールバックは、readable.setEncoding() メソッドを使用してストリームにデフォルトエンコーディングが指定されている場合、データのチャンクを文字列として渡されます。


## node:fs



https://nodejs.org/dist/latest-v16.x/docs/api/http.html#httprequesturl-options-callback


#### 書込ストリーム

fsには用途に応じて同じようなメソッドを用途別に用意してある。

callbackAPI
PromisesAPI
SynchronousAPI

同じwriteメソッドでも、上記のように用途別に用意されていたりする。

中身の違いについては、ここでは配慮しない。

またClassの違いもここでは同様に配慮しない。

(独断と偏見による)書き込みメソッド：

- `fileHandle.createWriteStream()`
- `fileHandle.write(buffer)`
- `fileHandle.write(string)`
- `fileHandle.writeFile()`
- `fsPromise.writeFile(file)`
- `fs.appendFile()`
- `fs.createWriteStream()`
- `fs.write(buffer)`
- `fs.write(string)`
- `fs.writeFile()`

上記の主なメソッドのそれぞれの違いについて触れながらメソッドをまとめる

##### `createWriteStream`

普段使うときは`fileHandle`の方は無視して`fs.createWriteStream`だけ知っていればいいんだと思う

```TypeScript
// fs.d.ts
    export function createWriteStream(
        path: PathLike, 
        options?: 
            BufferEncoding 
            | StreamOptions
    ): WriteStream;
```
`encoding`で指定できるのは`Buffer`型で指定しているものを指定できる。

`error`時または`finish`時に autoClose が true (デフォルトの動作) に設定されている場合、ファイル記述子は自動的に閉じられます。

`autoClose` が `false` の場合、エラーが発生してもファイル記述子は閉じられません。

**アプリケーションを閉じて、ファイル記述子のリークがないことを確認するのは、アプリケーションの責任です。**

デフォルトとして、streamは自身が破棄されたら`close`イベントを発行します。

これは`emitClose`オプションを`false`にすることで変更できます。

`options`の代わりにstringを渡すとその文字列は`encoding`指定として処理される。

`fd`オプションを指定していたら、`path`引数は無視される。代わりにfile descriptorを使う。

`fs` オプションを指定することで、open, write, writev, close に対応する fs の実装をオーバーライドすることが可能です。writev() を指定せずに write() をオーバーライドすると、一部の最適化 (_writev()) が無効となり、パフォーマンスが低下することがあります。fs オプションを指定する場合、write と writev の少なくとも一方をオーバーライドする必要がある。fdオプションが与えられない場合、openのオーバーライドも必要です。autoCloseがtrueの場合、closeのオーバーライドも必要である。

`fs.WriteStream`を返す。

`fs.WriteStream`:

```TypeScript
    export class WriteStream extends stream.Writable {
        /**
         * Closes `writeStream`. Optionally accepts a
         * callback that will be executed once the `writeStream`is closed.
         * @since v0.9.4
         */
        close(callback?: (err?: NodeJS.ErrnoException | null) => void): void;
        /**
         * The number of bytes written so far. Does not include data that is still queued
         * for writing.
         * @since v0.4.7
         */
        bytesWritten: number;
        /**
         * The path to the file the stream is writing to as specified in the first
         * argument to {@link createWriteStream}. If `path` is passed as a string, then`writeStream.path` will be a string. If `path` is passed as a `Buffer`, then`writeStream.path` will be a
         * `Buffer`.
         * @since v0.1.93
         */
        path: string | Buffer;
        /**
         * This property is `true` if the underlying file has not been opened yet,
         * i.e. before the `'ready'` event is emitted.
         * @since v11.2.0
         */
        pending: boolean;
        /**
         * events.EventEmitter
         *   1. open
         *   2. close
         *   3. ready
         */
        addListener(event: 'close', listener: () => void): this;
        addListener(event: 'drain', listener: () => void): this;
        addListener(event: 'error', listener: (err: Error) => void): this;
        addListener(event: 'finish', listener: () => void): this;
        addListener(event: 'open', listener: (fd: number) => void): this;
        addListener(event: 'pipe', listener: (src: stream.Readable) => void): this;
        addListener(event: 'ready', listener: () => void): this;
        addListener(event: 'unpipe', listener: (src: stream.Readable) => void): this;
        addListener(event: string | symbol, listener: (...args: any[]) => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'drain', listener: () => void): this;
        on(event: 'error', listener: (err: Error) => void): this;
        on(event: 'finish', listener: () => void): this;
        on(event: 'open', listener: (fd: number) => void): this;
        on(event: 'pipe', listener: (src: stream.Readable) => void): this;
        on(event: 'ready', listener: () => void): this;
        on(event: 'unpipe', listener: (src: stream.Readable) => void): this;
        on(event: string | symbol, listener: (...args: any[]) => void): this;
        once(event: 'close', listener: () => void): this;
        once(event: 'drain', listener: () => void): this;
        once(event: 'error', listener: (err: Error) => void): this;
        once(event: 'finish', listener: () => void): this;
        once(event: 'open', listener: (fd: number) => void): this;
        once(event: 'pipe', listener: (src: stream.Readable) => void): this;
        once(event: 'ready', listener: () => void): this;
        once(event: 'unpipe', listener: (src: stream.Readable) => void): this;
        once(event: string | symbol, listener: (...args: any[]) => void): this;
        prependListener(event: 'close', listener: () => void): this;
        prependListener(event: 'drain', listener: () => void): this;
        prependListener(event: 'error', listener: (err: Error) => void): this;
        prependListener(event: 'finish', listener: () => void): this;
        prependListener(event: 'open', listener: (fd: number) => void): this;
        prependListener(event: 'pipe', listener: (src: stream.Readable) => void): this;
        prependListener(event: 'ready', listener: () => void): this;
        prependListener(event: 'unpipe', listener: (src: stream.Readable) => void): this;
        prependListener(event: string | symbol, listener: (...args: any[]) => void): this;
        prependOnceListener(event: 'close', listener: () => void): this;
        prependOnceListener(event: 'drain', listener: () => void): this;
        prependOnceListener(event: 'error', listener: (err: Error) => void): this;
        prependOnceListener(event: 'finish', listener: () => void): this;
        prependOnceListener(event: 'open', listener: (fd: number) => void): this;
        prependOnceListener(event: 'pipe', listener: (src: stream.Readable) => void): this;
        prependOnceListener(event: 'ready', listener: () => void): this;
        prependOnceListener(event: 'unpipe', listener: (src: stream.Readable) => void): this;
        prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;
    }
```


ということで`fs.createWriteStream()`を使う場合、`fs.WriteStream`のインスタンスを取得することになり、

streamで発生するあらゆるイベントを制御できるようになるのである。

ここが他の書き込みメソッドと異なる部分だとおもう。



##### `fs.writeFile()`

https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fswritefilefile-data-options-callback

```TypeScript
// fs.d.ts
    export function writeFile(file: PathOrFileDescriptor, data: string | NodeJS.ArrayBufferView, options: WriteFileOptions, callback: NoParamCallback): void;
```

## 実践：streamを使ってHTTP経由で大きなファイルをダウンロードする

ずばりな質問をしてくれた先人：

https://stackoverflow.com/questions/44896984/what-is-the-best-way-to-download-a-big-file-in-nodejs


必要な知識：

- HTTP.request
- stream
- File System


#### streamを使う利点

ずばりメモリを節約できること。

たとえば`fs.writeFile()`と`fs.createWriteStream()`の違いは、

前者は書き込むファイルをすべてRAMへ展開するが、

後者は処理内容をカスタマイズすればRAMの使用を節約することができる。

たとえば10gbのファイルサイズを移動しようと思って、

`fs.writeFile`を使おうものならばメモリが足りなくてクラッシュする可能性がある。

ということで、

streamを使うならいかに効率的にメモリを節約するかが重要になってくる。