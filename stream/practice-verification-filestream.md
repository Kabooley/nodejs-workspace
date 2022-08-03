# 実践と検証： File System stream

dist/in/cat.pngをストリームでdist/out/cat.pngへコピーするプログラムを作って

streamの挙動を確認、検証する。

streamは`fs.createReadStrem`, `fs.createWriteStream`で生成されるインスタンスを使用する。

TODO: Node.js デザインパターン本を立ち読みしてこよう

## 結論


[Readableの実装方法](#Readableの実装方法)
[chunkは直接渡していい](#chunkは直接渡していい)
[on()はEventTarget.addEventListenerのNode.js特化版](#on()はEventTarget.addEventListenerのNode.js特化版)
[Writableストリームは`close`イベントを自動発行してくれない](#Writableストリームは`close`イベントを自動発行してくれない)
[ストリームを閉じないと起こる現象](#ストリームを閉じないと起こる現象)
[エラーハンドリング](#エラーハンドリング)
[pipe](#pipe)

## Readableの実装方法: flowingモード

次の通りに実装するだけ。

問題は起こらない。

```TypeScript
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");

const randomString = (upto: number): string => {
    // ...
}

const isDirExist = (path: string): boolean => {
    // ...
}

const createRfs = (): fs.ReadStream => {
    if(!isDirExist(inPath)) throw new Error(`The path: ${inPath} does not exist.`);

    return fs.createReadStream(
        path.join(inPath, "cat.png"), 
        {
            encoding: 'binary',     /* default: 'utf8' */
            autoClose: true,
            emitClose: true,
            highWaterMark: 1024     /* default: 64 * 1024 */
        }
    );
}

(function() {
    const rfs: fs.ReadStream = createRfs();

    // --- Readable Event Handlers ------------

    
    rfs.on('open', (): void => {
        console.log("readable stream has been opened");
    });

    rfs.on('ready', (): void => {
        console.log("readable stream is ready");
    });

    rfs.on('close', (): void => {
        console.log('readable stream has been closed');
        wfs.end();
    });

    rfs.on('end', (): void => {
        console.log('End read stream');
        console.log('There is no more data to be consumed from the stream');
    });

    rfs.on('resume', (): void => {
        console.log('resume');
        console.log(`readaleFlowing: ${rfs.readaleFlowing}`);
    });

    rfs.on('error', (e: Error): void => {
        console.error(e.message);
        rfs.resume();
    });

    rfs.on('pause', (): void => {
        console.log("readable paused");
    })

    rfs.on('data', (chunk: string | Buffer): void => {
        console.log('data read!');
        console.log(`state: ${rfs.readableFlowing}`);
        console.log(`Received ${chunk.length} bytes of data.`);
    });
})();
```

```bash
5:09:47 AM - Starting compilation in watch mode...
[start:*build] 
[start:*run] [nodemon] restarting due to changes...
[start:*run] [nodemon] starting `node ./dist/index.js`
[start:*run] [nodemon] restarting due to changes...
[start:*build] 
[start:*build] 5:09:48 AM - Found 0 errors. Watching for file changes.
[start:*run] [nodemon] starting `node ./dist/index.js`

# resumeイベントはreadableFlowing is not trueの時に発行される
# trueやんけ
# たぶんコールバックが実行される頃にはtrueになるんだと思う
[start:*run] resume
[start:*run] readaleFlowing: true

# open
[start:*run] readable stream has been opened
# ready
[start:*run] readable stream is ready

# data
[start:*run] data read!
[start:*run] state: true
# highWaterMark通りの閾値を取得している
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 905 bytes of data.

# end
[start:*run] End read stream
[start:*run] There is no more data to be consumed from the stream
# close
[start:*run] readable stream has been closed
[start:*run] [nodemon] clean exit - waiting for changes before restart
```

流れ：

readableストリームインスタンスが生成された

readableストリームは`paused`モードになっている

このとき`readable.readableFlowing === null`である

`readable.readableFlowing === null`のとき、readableストリームには何もデータ消費者が提供されていないことを示し、データ取得を行わない状態である。

`readable.readableFlowing !== true`なので`resume`イベントが発行される

`data`イベントハンドラがついているのですぐさま`flowing`モードに変更する

このとき`readable.readableFlowing === true`である

readableストリームはデータの取得を開始する

`data`イベントハンドラがreadableストリームが取得してきたchunkを取得する

`highWaterMark`で指定した閾値通りの量を毎度取得してくる

readableストリームの読み取り先から読み取るデータがなくなったら`end`イベントがまず発行される

`end`イベントは「読み取るデータがもうない」ことを示す

その後、createReadStreamでautoClose, emitCloseでtrueを渡したので自動的に`close`イベントが発行される

readableストリームが正常に閉じられる

以上。


> flowingモードのreadableストリームはデータを消費できないとデータは失われる

`data`イベントハンドラを提供すればデータは失われない事が確認できた。

つまり、

> All Readable streams begin in paused mode but can be switched to flowing mode in one of the following ways:

> Adding a 'data' event handler.
> Calling the stream.resume() method.
> Calling the stream.pipe() method to send the data to a Writable.

の説明通りに提供すれば大丈夫


## 実験記録

### File Systemで画像をコピーするプログラム

`stream/file-to-file-stream.ts`


```TypeScript
/*****
 * file to file stream
 * 
 * 指定のファイルを指定のパスへコピーするプログラム。
 * 
 * dist/in/cat.pngをdist/out/cat.pngへコピーする
 * 
 * Readable streamはflowingモードである
 * 
 * encodingは`binary`に指定すること
 * */ 


import * as stream from 'node:stream';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");

// ランダムな文字列を生成するやつ
// 
// https://qiita.com/fukasawah/items/db7f0405564bdc37820e#node%E3%81%AE%E3%81%BF
const randomString = (upto: number): string => {
    const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(crypto.randomFillSync(new Uint8Array(upto))).map((n)=>S[n%S.length]).join('');
}


// 指定のパスにディレクトリは存在するのか確認する関数
/*
https://stackoverflow.com/questions/15630770/node-js-check-if-path-is-file-or-directory

https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#class-fsstats

*/ 
const isDirExist = (path: string): boolean => {
    return fs.lstatSync(path).isDirectory() && fs.existsSync(path);
}


const createRfs = (): fs.ReadStream => {
    if(!isDirExist(inPath)) throw new Error(`The path: ${inPath} does not exist.`);

    return fs.createReadStream(
        path.join(inPath, "cat.png"), 
        {
            encoding: 'binary',     /* default: 'utf8' */
            autoClose: true,
            emitClose: true,
            highWaterMark: 1024     /* default: 64 * 1024 */
        }
    );
    
    
}


const createWfs = (): fs.WriteStream => {
    if(!isDirExist(outPath)) throw new Error(`The path: ${outPath} does not exist.`);

    return fs.createWriteStream(
        path.join(outPath, "cat" + randomString(5) + ".png"), 
        { 
            encoding: 'binary',     /* default: 'utf8' */
            autoClose: true,
            emitClose: true,
            highWaterMark: 1024     /* default: 64 * 1024 */
    });
}



(async function() {
    const rfs: fs.ReadStream = createRfs();
    const wfs: fs.WriteStream = createWfs();

    // --- Readable Event Handlers ------------

    
    rfs.on('open', () => {
        console.log("readable stream has been opened");
    });

    rfs.on('ready', () => {
        console.log("readable stream is ready");
    });

    rfs.on('close', () => {
        console.log('readable stream has been closed');
    });

    rfs.on('data', (chunk: string | Buffer) => {
        console.log('data read!');
        console.log(`state: ${rfs.readableFlowing}`);
        console.log(`Received ${chunk.length} bytes of data.`);

        wfs.write(chunk, (e: Error | null | undefined) => {
            if(e) console.error(e.message);
            else console.log("Write data has been completed");
        })
    });

    rfs.on('end', () => {
        console.log('End read stream');
        console.log('There is no more data to be consumed from the stream');
    });

    rfs.on('resume', () => {
        console.log('There is no more data to be consumed from the stream');
    });

    rfs.on('error', (e: Error) => {
        console.error(e.message);
        rfs.resume();
    });

    rfs.on('pause', () => {
        console.log("readable paused");
    })

    // --- Writable Event Handlers -----

    wfs.on('close', () => {
        console.log("Writable stream closed");
    });

    wfs.on('drain', () => {
        console.log("Drained");
    });

    wfs.on('finish', () => {
        console.log("Finished");
    });

    wfs.on('pipe', () => {
        console.log("PIPED!");
    });

    wfs.on('unpiped', () => {
        console.log("UNPIPED!!");
    })

    wfs.on('error', (e: Error) => {
        console.error(e.message);
        // 念のために明示的にストリームを破棄させる。
        if(wfs.destroyed) wfs.destroy();
    });

})();
```

ログ

```bash
tream
[start:*run] readable stream has been opened    # `open` Readable
[start:*run] readable stream is ready           # `ready` Readable

# "data" read.
# chunk size is exactly same as highWaterMark threshold.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.

# `data` has been written.
# `data` callback has been executed.
# なのでここでデータの書き込みが行われた
[start:*run] Write data has been completed


[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] Write data has been completed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 905 bytes of data.

# readable `end` event
[start:*run] End read stream
[start:*run] There is no more data to be consumed from the stream

# writable `data` event callback has been executed
[start:*run] Write data has been completed
[start:*run] Write data has been completed

# readable `close` event
[start:*run] readable stream has been closed

# writable `drain` event
[start:*run] Drained

# writable `data` event callback has been executed
[start:*run] Write data has been completed

# 正常終了
[start:*run] [nodemon] clean exit - waiting for changes before restart
```

画像は正常に取得できた模様...

実行してみて確認できたこと:

- `highWaterMark`で指定した量でreadableはデータをバッファリングしている

常に指定した通りの1024 byte

TODO: 書き込みストリームのバッファリングのモニター

- writableストリームのイベントが`data`と`drain`以外発行されていない

readableストリームは閉じられたことがイベントから確認できる。

しかしwritableのほうは、

`close`とか`end`とかイベントハンドラが発火していない。

適切に閉じられていない可能性がある。

TODO: 適切に閉じる処理の実装方法の模索

スコープの問題なのか、発火手順がおかしいのか...

- Readableストリームは`end`の後に`close`イベントが発行される

end: 読み取りストリームの先からもう読み取るものがないよ

data: 読み取りストリームの最後のデータおくられてきたりする

close: 読み取りストリームが閉じられたよ

#### 書き込みストリームが適切に閉じられていない問題

の修正方法の模索。

検証１：`Writable`ストリームのイベントハンドラをすべて`Readable`ストリームの`data`イベントハンドラコールバック内に移すと解決するか？

結果：解決しない。`on()`はJavaScriptのaddEventListenerと同様一度呼び出せばいいのでイベントハンドラ内で呼び出すと毎度ひとつずつイベントハンドラが増えていく。やめよう

```bash
# いきなりもうデータがないといいはじめた
 There is no more data to be consumed from the stream

#  readableオープン
 readable stream has been opened
 readable stream is ready

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Write data has been completed
 
 data read!
 state: true
 Received 1024 bytes of data.
 
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.

 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (Use `node --trace-warnings ...` to show where the warning was created)
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 drain listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 finish listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 pipe listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unpiped listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Drained
 Write data has been completed
 data read!
 state: true
 Received 905 bytes of data.
 Write data has been completed
 End read stream
 There is no more data to be consumed from the stream
 readable stream has been closed
 [nodemon] clean exit - waiting for changes before restart
```

確認できたこと：

- Events.on()はイベントリスナで呼び出しただけイベントリスが追加されていく!

なので毎度`data`イベントハンドラが呼び出されるたびに`drain`が一つずつ増えていく。

追加のし過ぎでメモリリーク起きているよと警告が発生している。

ということでEvents.on()は一度だけ呼び出せばいい（はず）

ということはどこで呼び出すのか...が重要なのかしら？

TODO: Events.on()について調べること

- 検証している問題は解決できていない


検証２：readablesストリームの`data`イベントハンドラをファイルの一番最後に移した

```bash
 There is no more data to be consumed from the stream

 readable stream has been opened
 readable stream is ready

 data read!
 state: true
 Received 1024 bytes of data.

 Drained
 Write data has been completed

 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 1024 bytes of data.
 Drained
 Write data has been completed
 data read!
 state: true
 Received 905 bytes of data.
 Write data has been completed
 End read stream
 There is no more data to be consumed from the stream
 readable stream has been closed
 [nodemon] clean exit - waiting for changes before restart
```

相変わらず書き込みストリームは閉じてくれない。

検証３：`writable.end()`を呼び出す

まずはファイルの最後に呼び出す

```bash
[start:*run] There is no more data to be consumed from the stream
[start:*run] readable stream has been opened
[start:*run] readable stream is ready

# しょっぱなで閉じられていますわ
[start:*run] Close writable stream manually

# `end`イベントが発生すると`finish`イベントが発行される模様
[start:*run] Finished

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.

# 
[start:*run] write after end
[start:*run] Writable stream closed

[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 1024 bytes of data.
[start:*run] write after end
[start:*run] data read!
[start:*run] state: true
[start:*run] Received 905 bytes of data.

[start:*run] write after end

[start:*run] End read stream
[start:*run] There is no more data to be consumed from the stream
[start:*run] readable stream has been closed
[start:*run] [nodemon] clean exit - waiting for changes before restart
```

確認できること：

- `writable.end()`すると`finish`イベントが発行される

公式に書いてあったわ...

- しょっぱなでwritableが閉じるからreadableで読み取ったデータは書き込めない旨の`write after end`が出力されている

しかしwritableストリームのコンストラクタにautoCloseもemitCloseもtrueにしているのに

closeイベント発せしねーじゃん史ね

- なぜか２つファイルが作成されている

たぶん内部的に書き込みストリームが閉じられていないんだと思う。

やっぱり閉じられていないじゃん！

(nodemonが同じ処理をなぜか2度行うのも原因の一つだけど、閉じられていないのは事実)

検証４：readable.on('close')でwritable.end()を手動で呼び出す

結果：書き込みストリームは閉じられた

なんやねん
