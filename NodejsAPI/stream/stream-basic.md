# 【Node.js】検証と実践：Streamの基本的な使い方

NOTE: この記事を他人に見せるものとして編集してアップロードする。

`fs.Readable`と`fs.Writable`を使って画像ファイルをコピーするプログラムを作り

ストリームの基本的な使い方を検証、理解していく。

利用するNode.jsのバージョンはv16.xです。

## 目次

[実践](#実践)

Readable

[Readableの実装方法](#Readableの実装方法)
[Readableのモード切替方法](#Readableのモード切替方法)
[chunkは直接渡していい](#chunkは直接渡していい)
[on()はEventTarget.addEventListenerのNode.js特化版](#on()はEventTarget.addEventListenerのNode.js特化版)

Writable

[Writableストリームが自動で閉じる条件](#Writableストリームが自動で閉じる条件)
[`drain`と`writable.write()`の仕組み](#`drain`と`writable.write()`の仕組み)
[`writable.end()`と`writable.destroy()`の使い分け](#`writable.end()`と`writable.destroy()`の使い分け)

[実践：改善版](#実践：改善版)

pipe

[`pipe`](#`pipe`)
[`pipe`のエラーハンドリング](#`pipe`のエラーハンドリング)

[APIスタイルは一つだけにして複数のAPIを使わないこと](#APIスタイルは一つだけにして複数のAPIを使わないこと)

## この記事は何？

次のような方向けになると思います。

- 前提としてNode.jsのstream APIを一通り目を通した人向けの記事になります。
- 具体的に最低限レベルでのストリームを使った実装方法を知りたい人。

`fs.writeFile()`などのメモリに一旦ファイルの内容をすべて展開するメソッドを使わずに

ストリームで如何にメモリを節約しながらファイルのコピーを実現できるかを追求しながら、

その方法を実現するための実装方法を模索していきます。

ストリームの基本的な使い方といいつつ、

`trasform`と`duplex`ストリームについてはこの記事で扱いません。

`Readable`と`Writable`のみ扱います。

### 実践

画像ファイル`./dist/in/cat.png`から`./dist/out/cat.png`へコピーしたファイルを生成します。

Node.jsのstream, FileSystem APIを一通り読んだ人がとにかく書いてみたプログラムになります。

大いに誤解と間違いを含んでいるコードになります。

このコードが期待した通りに動かないことを確認し、

その原因解明をこの記事でまとめていき、最終的に正しい利用方法で改善されたコードに直します。

コードは次の思い込みで作られています。

- `Writable`ストリームは`autoClose:true`で作成されたので読み取るデータがなくなったら勝手に`Writable`は閉じられる
- `Readable`ストリームは読み取るデータがなくなったら勝手に`Readable`を閉じる
- 各ストリームは`highWaterMark`を1024byteで指定しているので毎度ストリームは1024byte読み取って1024byte書き込む
- 各ストリームの各イベントハンドラはひとまず追加しているだけでどうすればいいのかわかっていない
- `Readable`の`data`イベントで取得したchunkはそのまま`writable.write()`へわたしていい
- `Readable`はflowingモードで運用されるから`readable.readableFlowing`はtrueになるはず

画像ファイルはMicrosoftのDirectXのチュートリアルページからダウンロードした画像で約15kbサイズになります。

https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png


```TypeScript
import * as stream from 'node:stream';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");

// ランダムな文字列を生成する
const randomString = (upto: number): string => {
    // ...
    return randomCharactors;
}


// 指定のパスにディレクトリは存在するのか確認する関数
const isDirExist = (path: string): boolean => {
    // ...
    return existOrNotExistBoolean;
}

// fs.Readableを生成する
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

// fs.Writableを生成する
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



(function() {
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
        console.log("piped");
    });

    wfs.on('unpiped', () => {
        console.log("unpiped");
    })

    wfs.on('error', (e: Error) => {
        console.error(e.message);
        if(wfs.destroyed) wfs.destroy();
    });

})();
```

結果

```bash
readable stream has been opened
readable stream is ready

data read!
state: true
Received 1024 bytes of data.

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 1024 bytes of data.

data read!
state: true
Received 1024 bytes of data.
Write data has been completed

data read!
state: true
Received 905 bytes of data.

End read stream
There is no more data to be consumed from the stream

Write data has been completed
Write data has been completed

readable stream has been closed

Drained

Write data has been completed

clean exit - waiting for changes before restart
```
コピーファイルは画像ファイルとして開くことができました。

期待通りじゃなかったこと：

- `Writable`ストリームが閉じられていない

    `close`イベントは`Writable`において発生していないことが確認できます。
    自動的に閉じると勘違いしているからなのですが。

- `drain`イベントが一度しか起こらなかった

    `highWaterMark`の閾値にまで内部バッファがたまったら`drain`イベントまで書込みはできないと思っていました。
    しかし既に`highWaterMark`で1024byteを何度も受け取っているのに一度しか`drain`が発生しないのはおかしいです。

期待通りだったこと：

- `Readable`はhighWaterMarkで指定した通りのサイズを読み取ってきた
- `Readable`は読み取るデータがなくなったら自動的に閉じられた

ここ以降、実践でうまくいかなかった原因を追究してその学習内容をまとめ、

最終的にはAPIを正しく使用できているプログラムに改善する。


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
 [nodemon] restarting due to changes...
 [nodemon] starting `node ./dist/index.js`
 [nodemon] restarting due to changes...
[start:*build] 
[start:*build] 5:09:48 AM - Found 0 errors. Watching for file changes.
 [nodemon] starting `node ./dist/index.js`

# resumeイベントはreadableFlowing is not trueの時に発行される
# trueやんけ
# たぶんコールバックが実行される頃にはtrueになるんだと思う
 resume
 readaleFlowing: true

# open
 readable stream has been opened
# ready
 readable stream is ready

# data
 data read!
 state: true
# highWaterMark通りの閾値を取得している
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 1024 bytes of data.
 data read!
 state: true
 Received 905 bytes of data.

# end
 End read stream
 There is no more data to be consumed from the stream
# close
 readable stream has been closed
 [nodemon] clean exit - waiting for changes before restart
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





### paused モード

覚えておくべきこと：

- `stream.read()`を必ず明示的に呼び出さなくてはならない

- `data`イベントハンドラを呼び出してはならない

- `stream.resume()`を呼出してはならない

- `readable.pipe()`ではpausedモードにできない

- ストリームの接続先がないときに、`stream.pause()`を呼び出すとpausedモードになる

- pipeされているときに、pipeを除去することでpausedモードになる

- `data`イベントハンドラをリムーブしてもただちにpausedモードになるわけではない

- パイプされた宛先がある場合、 stream.pause() を呼び出しても、それらの宛先が排出されて追加のデータが要求されると、ストリームが一時停止したままになるとは限りません。

- flowingモードでも`readable`イベントハンドラを追加するとflowingモードが解除される

- pausedモードだと`readable.readableFlowing === false`になる

- (共通)一つのストリームからの消費者を複数用意してはならない。

必ず`on('data')`, `on('readble')`, `pipe()`いずれか一つを選ぶこと

- `stream.pause()`は`readable`イベントリスナがあるところでは何の効果もない。

- `readable.read()`はReadableがpausedモードの時だけ使うこと

#### 実践：pausedモード

`dist/in/text.txt`を読み取るストリーム。

`text.txt`は40byte.

仮定：

学習した内容から次のコードはこうなるはずという仮定。

- flowingモードになるトリガーが一切なければ`readable.readableFlowing`は常に`false`になるはず

- `readable`イベントリスナがあるから`stream.pause()`を呼出しても意味をなさないはず
- `stream.resume()`を呼出したら`readable`は働かなくなるはず

```TypeScript
import * as fs from 'node:fs';
import * as path from 'node:path';

const isDirExit = () => {
    // Find out the directory is exists.
}

const createRfs = (): fs.ReadStream => {
    if(!isDirExist(inPath)) throw new Error(`The path: ${inPath} does not exist.`);

    return fs.createReadStream(
        path.join(inPath, "text.txt"), 
        {
            encoding: 'utf8',     /* default: 'utf8' */
            autoClose: true,
            emitClose: true,
            highWaterMark: 12     /* default: 64 * 1024 */
        }
    );
}

const rfs: fs.ReadStream = createRfs();

rfs.on('error', (e: Error) => {
    console.error(e.message);
    // Destroy stream explicitly
    /***
     * オプショナルで`error`と`close`イベントを発行する
     * 
     * destroy() が呼び出されると、それ以降の呼び出しは何も行われず、
     * _destroy() 以外のエラーは「エラー」として出力されることはありません。
     * */ 
    if(!rfs.destroyed) rfs.destroy(e);
});

rfs.on('close', () => {
    console.log('close');
    if(!rfs.destroyed) rfs.destroy(); 
});

rfs.on('end', () => {
    console.log("end");
    if(!rfs.destroyed) rfs.destroy(); 
});


rfs.on('pause', () => {
    console.log("Readable paused");
});

rfs.on('resume', () => {
    console.log('resume');
    console.log(`state: ${rfs.readableFlowing}`);
});



/***
 * `readable` event:
 * 
 * `readable`イベントはストリームから読み取るデータがあるときまたは
 * 
 * ストリームの「終わり」に到達したら発行されるイベントである。
 * 
 * `readable`は効果的にストリームに新しい情報があることを示す
 * 
 * もしもデータが得られるのならば、
 * 
 * `stream.read()`がデータを返すよ
 * 
 * 以下は公式の例と同じ。
 * 
 * 場合によっては、
 * 
 * `readable`イベントはかなりの量の塊を内部バッファへ保存してなくてはならない場合もある
 * 
 * 一般的に、`readable.pipe()`や
 * */ 
 rfs.on('readable', () => {
    console.log("Readable Event");

    let chunk = rfs.read();
    // なくても大丈夫
    // たぶんストリームのコンストラクタにautoCLoseを渡してあるから
    if(chunk === null) rfs.close(); 
    else console.log(`Read ${chunk.length} bytes of data and...`);

    // stream.read()はストリームの終了に到達するとnullを返す
    // そして`end`イベントを発行する
    // つまりもう読み取るべきデータはないことを示す
    /***
     * 読み取れるデータがないとnullを返す
     * 
     * オプショナルの`size`引数は読み取りサイズを指定する
     * 
     * `size`byteが取得できないとき、ストリームが終了されていない限りnullが返される
     * 
     * `size`が指定されていないと内部バッファのすべてが返される
     * 
     * NOTE: `readable.read()`はReadableストリームがpausedモードであるときだけに使うこと
     * 
     * と公式に明示されているよ！
     * */ 
});

```

```bash
Readable Event
Read 12 bytes of data and...
Readable Event
Read 12 bytes of data and...
Readable Event
Read 12 bytes of data and...
Readable Event
Read 4 bytes of data and...
Readable Event
end
close
```

検証２：途中でflowingモードに切り割るか？

```bash
# pausedモード
 Readable Event
 Read 12 bytes of data and...
 Readable Event
 Read 12 bytes of data and...
 Readable Event
 Read 12 bytes of data and...
 Readable Event
#  flowingモードへ切り替わった
 >> Switched to flowing mode.
 state: false
#  `data`イベントハンドラで「続き」を取得した
 [flowing] Read 4 bytes of data and...
#  `readable`イベントがまだ反応している...
 Read 4 bytes of data and...
#  resumeイベントハンドラの反応遅い
 resume
#  いまだにreadableFlowingはfalseのまま
# よみとるデータがないせいかも？
 state: false
 Readable Event
 >> Switched to flowing mode.
 state: false
 resume
 state: false
 end
 CLOSE
```

```bash
 Readable Event
 Read 12 bytes of data and...
 Readable Event
 Read 12 bytes of data and...
 Readable Event
 Read 12 bytes of data and...
 Readable Event
 Read 4 bytes of data and...
 resume
 state: false
 >> Switched to flowing mode.
 Readable Event
 end
 CLOSE
```

やってみてわかったこと

切り替えはうまくいかない。

#### Readableのモード切替方法

Readableには2つのモードがある

- flowingモード：データの取得はシステムが自動的に行ってくれてデータはイベントハンドラで取得できる
- pausedモード：`stream.read()`を明示的に呼び出してストリームのチャンクを取得する

この2つのモードを切り替える方法

flowingモードに切り替える方法：

- `data`イベントハンドラを追加する
- `stream.resume()`を呼び出す
- `stream.pipe()`で`Writable`へデータを送信する

pausedモードに切り替える方法：

- pipeの到達地点がないときに、`stream.pause()`を呼出したとき
- pipeの到達地点があるときに`stream.unpipe()`を呼び出すと起こりうる

ということで、

`stream.resume()`はflowingモードに切り替えて、`stream.pause()`はflowingモードから解除をするので対照的

`stream.pause()`:

> readable.pause() メソッドは、フロー モードのストリームに「データ」イベントの発行を停止させ、フロー モードから切り替えます。利用可能になったデータは内部バッファに残ります。

`stream.resume()`:

> readable.resume() メソッドは、明示的に一時停止された Readable ストリームに「データ」イベントの発行を再開させ、ストリームをフロー モードに切り替えます。


対照的である。




注意：

- `stream.resume()`だけを呼出してもデータが失われる可能性がある。

なので`stream.resume()`でflowingモードに切り替えるときは`data`イベントハンドラなど消費者を用意しておかなくてはならない

## on()はEventTarget.addEventListenerのNode.js特化版

そんなの当たり前じゃんみたいな話をします。

つまり、何度も呼び出すと同じイベントリスナが何度も追加されていってしまうよ、ということです。

かつて私は自身が定義した書き込みストリームだと`drain`イベントが全く発行されない原因はスコープの問題かと思って

次のように`Readable`の`data`イベントのハンドラ内で`on()`を呼び出してしまいました。


```TypeScript

const rfs: fs.Readable = createReadStream(/* params */);
const wfs: fs.Writable = createWriteStream(/* params */);

rfs.on('data', (chunk: string | Buffer) => {
    console.log('data read!');
    console.log(`state: ${rfs.readableFlowing}`);
    console.log(`Received ${chunk.length} bytes of data.`);

    wfs.write(chunk, (e: Error | null | undefined) => {
        if(e) console.error(e.message);
        else console.log("Write data has been completed");
    });

    wfs.on('close', () => {
        console.log("Writable stream closed");
    });

    wfs.on('drain', () => {
        console.log("Drained");
    });

    wfs.on('finish', () => {
        console.log("Finished");
    });
});
```

すると次のように、

- `drain`イベントが読み取りごとに1つ増えていく
- メモリリークの警告を受ける

結果になりました

```bash
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

 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (Use `node --trace-warnings ...` to show where the warning was created)
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 drain listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 finish listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 pipe listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 unpiped listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit
 (node:2233) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added to [WriteStream]. Use emitter.setMaxListeners() to increase limit

# 以下略
```

つまりは`on()`は何度も呼び出していいという謎の思い込みから解き放たれました。

`EventEmitter.on()`:

https://nodejs.org/dist/latest-v16.x/docs/api/events.html#emitteroneventname-listener

> eventName という名前のイベントのリスナー配列の末尾にリスナー関数を追加します。リスナーがすでに追加されているかどうかはチェックされません。 eventName とリスナーの同じ組み合わせを渡す複数の呼び出しにより、リスナーが複数回追加され、呼び出されます。

つまり、同じイベント名で何度も`on()`を呼び出せば呼び出しただけリスナが呼び出される。

余談：一度だけ発火したら解除されるイベントリスナのラッパーはある。

`EventEmitter.once()`：

https://nodejs.org/dist/latest-v16.x/docs/api/events.html#emitteronceeventname-listener

> `eventName`という名前のイベントに対して一度切りのリスナを追加することができます。次回`eventName`がトリガーされたときに、リスナは除去されまた呼び出されます。

`on()`も`once()`もどちらも`Writable`, `Readable`classで定義されています。


## Writableストリームが自動で閉じる条件

結論：**書き込みストリームの破棄は明示的に実行しなくてはならない**

たとえば次のような使い方の時に、

`Writable`を作る時にコンストラクタに`autoClose: true`, `emitClose`を渡しても自動で`Writable`は自身を閉じてくれない。

```TypeScript
// rfs: fs.Readable
// wfs: fs.Writable
    rfs.on('data', (chunk: string | Buffer): void => {
 
        wfs.write(chunk, (e: Error | null | undefined): void => {
            if(e) console.error(e.message);
            else console.log("Write data has been completed");
        });
    });

    rfs.on('end', () => {
        console.log("End Readable");
    });

    wfs.on("close", () => {
        console.log("Close Writable");
    });

// When readable end up to read data...
// End Readable
```

理由は、

`error`または`close`または`finishi`イベントが発行されていないからである。

公式を見てみる：

`fs.createWriteStream()`より

> 「error」または「finish」時に autoClose が true (デフォルトの動作) に設定されている場合、ファイル記述子は自動的に閉じられます。 

> デフォルトでは、ストリームは破棄された後に「close」イベントを発行します。この動作を変更するには、emitClose オプションを false に設定します。

`fs.Writable::Event:'close'`より

> 「close」イベントは、ストリームとその基になるリソース (ファイル記述子など) が閉じられたときに発行されます。このイベントは、これ以上イベントが発行されず、それ以上の計算が行われないことを示します。

つまり`close`イベントは`Writable`ストリームの仕事が完全に終わったときに発行されるべき。

`fs.Writable::Event'finish'`より

> 「finish」イベントは、stream.end() メソッドが呼び出された後に発行され、すべてのデータが基盤となるシステムにフラッシュされます。

ということは、実は`Writable`は`autoClose: true`にしても勝手にとるのではなくて、閉じるためにイベントを発行させなくてはならないのである。

`autoClose: true`は`error`か`finishi`イベントが発行されたら書き込みストリームを閉じるよという意味で、

`emitClose: true`は「ストリームが破棄されたときに`close`イベントを発行するよ」という意味で、

「書き込みストリームの破棄」は自動で行うよとは一言も言っていないのである。

なので**書き込みストリームの破棄は明示的に実行しなくてはならない**

其の方法がこちら：[`writable.end()`と`writable.destroy()`の使い分け](#`writable.end()`と`writable.destroy()`の使い分け)


## `drain`と`writable.write()`の仕組み

重要：

- `writable.write()`が`false`を返したら`drain`イベントが発行されるまでデータ書き込みは停止せよ

参考：

- https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#event-drain

> `stream.write()`呼出が`false`を返したら、**ストリームへのデータの書き込みを再開するのが適切なときに「drain」イベントが発行されます。**

- https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#buffering

> (読み取りストリームは)ひとた内部バッファに保存しているデータ量が`highWaterMark`で指定した閾値に到達したら、読取ストリームはデータが消費されるまで一時的にデータを読み取るのを停止する。

> (書込みストリームは)`writable.write()`が継続的に呼び出されるとデータは`Writable`ストリームへバッファされる。

> (書込みストリームの)内部バッファが`highWaterMark`で指定した閾値へ保存データ量が到達まで、`writable.write()`はtrueを返し、到達したら`false`を返す。

- https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writablewritechunk-encoding-callback

> (`writable.write()`は)内部バッファが、チャンクを受け入れた後にストリームが作成されたときに構成された `highWaterMark`よりも小さい場合、戻り値は`true`です。 

> **`false`が返された場合、`drain`イベントが発行されるまで、ストリームへのデータ書き込みのさらなる試みは停止する必要があります。**

> ひとたびバッファへ保存されたchunkがドレインしたら（内部バッファに保存されたデータが書き込み可能になったら）`drain`イベントが発行されます。

> **`writable.write()`が`false`を返したら、`drain`イベントが発行されるまでchunkの書込みを停止するのが推奨されます。**




...ということで、まとめると...

- `highWaterMark`は内部バッファの「満タン」を（形式的に）定義してストリームを制御する

- `writable.write()`が`false`を返したら`drain`イベントが発行されるまでデータ書き込みは即座に停止しなくてはならない

- `drain`イベントが発行されてからchunkの書き込みを再開せよ

わかった。よくわかった。

では`wrtiable.write()`の戻り値を毎回チェックするとして、`false`が返されたら実際にどう処理すればいいのか？

公式では次を示されている

- https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writablewritechunk-encoding-callback

> 書き込むデータをオンデマンドで生成またはフェッチできる場合は、ロジックを Readable にカプセル化し、stream.pipe() を使用することをお勧めします。

> ただし、write() の呼び出しが優先される場合は、「drain」イベントを使用してバックプレッシャーを尊重し、メモリの問題を回避することができます。

つまり上でいうところの推奨は`radable.pipe()`を使えである。

```TypeScript
const rfs: fs.Readable = createReadStream(/**/);
const wfs: fs.Writable = createWriteStream(/**/);
rfs.pipe(wfs);
```

なんでかというと、pipeは内部的に`drain`を制御している

参考：

- https://techblog.yahoo.co.jp/advent-calendar-2016/node-stream-highwatermark/

```JavaScript

Readable.prototype.pipe = function(dest) {
  var src = this;
  src.on('data', (chunk) => {
    var ret = dest.write(chunk); // 読み込んだデータを dest に書き込む
    if (false === ret) { // highWaterMark に達していたら
      src.pause(); // 読み込み一時停止
    }
  });

  dest.on('drain', () => { // highWaterMark を下回る
    flow(src); // 読み込み再開
  });
};
```

つまり`pipe`を使えば`drain`イベントに関する制御を丸投げできるのである。

それでも`pipe()`を使えない事情があるとか完全に使用メモリ量を制御したいならば、

`writable.write()`を直接呼出す実装を自分で定義することになる。

参考：

- https://stackoverflow.com/a/45905612/13891684

- https://stackoverflow.com/a/50360972/13891684

課題：

- `writable.write()`がfalseを返したときにどうやって一時停止すればいいのか？
- `drain`イベントが発行されたらどうやって一時停止を解除すればいいのか？

公式や参考のサイトでは`process.nextTick()`, `flow()`みたいな関数を使われていた

`writable.once('drain', WRITEMETHOD)`みたいなイベントハンドラもあるみたい

しかし、

[Readableのモード切替方法](#Readableのモード切替方法)で学習したように

**`readable.pause()`と`readable.resume()`を使えばいい。**

```TypeScript
// stream/fs_writable_write.ts
// 19kbのファイルのコピーを作るプログラム

const rfs: fs.Readable = fs.createReadStream(/* params */);
const wfs: fs.Writable = fs.createWriteStream(/* params */);

let draining: boolean = true;

rfs.on('data', (chunk) => {
    console.log(`Readable read ${chunk.length} byte of data`)
    draining = wfs.write(chunk, (e: Error | null | undefined) => {
        if(e) {
            // ここでエラーが起こったら`error`イベント前にこの
            // コールバックが実行される
            console.error(e.message);
        }
    });
    // chunkを書き込んだ後のwriteの戻り値がfalseなら
    // 読取ストリームはすぐに停止する
    if(!draining) {
        console.log('Paused Readable because of reaching highWaterMark');
        rfs.pause();
    }
});

// `drain`イベントは書込みが再開できるときに発行される
wfs.on('drain', () => {
    console.log('Drained and resume Readable again.');
    // drainイベントが発行されたら読取ストリームの読取を再開する
    draining = true;
    rfs.resume();
});

wfs.on('end', () => {
    console.log('End Readable');
});

wfs.on('finish', () => {
    console.log('Finished');
});

wfs.on('close', () => {
    console.log('Writable closed');
});

/***
 * `error`イベントが発行されたらストリームは閉じられる
 * 
 * `error`以降`close`イベント以外発行されてはならない
 * */ 
wfs.on('error', (e: Error) => {
    if(!wfs.destroyed) wfs.destroy(e);
});

rfs.on('end', () => {
    console.log('there is no more data to be consumed from Readable');
    // NOTE: writableの破棄は明示的に
    wfs.end();
})

rfs.on('error', (e: Error) => {
    if(!rfs.destroyed) rfs.destroy(e);
});

```
結果：

```bash

# 開始
 Drained and resume Readable again.
#  highWaterMarkで指定した通りのデータサイズを読み取った
 Readable read 1024 byte of data
#  highWaterMarkが閾値ぴったりになったのでwritable.writeがfalseを返しReadableを一時停止した
 Paused Readable because of reaching highWaterMark
#  drainイベント
#  書き込めるようになったので書き込み再開
 Drained and resume Readable again.

 Readable read 1024 byte of data
 Paused Readable because of reaching highWaterMark
 Drained and resume Readable again.

 Readable read 1024 byte of data
 Paused Readable because of reaching highWaterMark
 Drained and resume Readable again.
#  以下しばらく同じ流れが続いたあと...

#  Readableにendイベント
#  Readableが破棄される
#  実装のWritable.end()が実行される
 there is no more data to be consumed from Readable
#  writable.end()ではfinishiイベントが発行される
#  書込みストリームの内部バッファがフラッシュされて...
 Finished
#  そのまま書込みストリームは閉じられた
 Writable closed
#  正常終了
 [nodemon] clean exit - waiting for changes before restart
```

もちろん上記の通りの実装でstreamを使うならpipe()を使った方がわかりやすく話が早い。

しかしpipe()を使わない場合にベースの実装を実現することができた。

## `writable.end()`と`writable.destroy()`の使い分け

1. `Writable`を破棄する前に内部バッファをフラッシュしたいときは`writable.end()`を呼び出そう。

なぜならば、`writable.end()`ならば`close`イベントの前に`finish`イベントを発行させることができるからである。

公式より：

- `close`イベントが発行されるとこれ以降の書き込みは受け付けなくなる。

- `finish`イベントが発行されると内部バッファのデータがすべて書き込まれる（フラッシュされる）。

- もしも`Writable`が`autoClose: true`で作成されてあったら、`finish`イベント時に`Writable`が破棄される(`fs.createWritableStream()`より)

つまり、

書き込みストリームを破棄する前に、内部バッファにあるデータを書き込み先に書き込んじゃいたいときには`finish`イベントを呼び出さない限り書き込む方法は失われるのである。

`finish`イベントを呼び出す前に`close`イベントが発行されると内部バッファにデータがあってもこれ以上の書き込みは受け付けなくなっているので、そのデータは行き先を失ってガベージコレクションに追加される。

たとえば、

内部バッファに残ったデータ量が大きいときに`close`イベントを発行してしまうと大きなメモリリークになりかねない。

イベント発行タイミングと内部バッファがちょうどクリアされているタイミングが一致するのはあんまり期待できない。

なので、

普段使うときは`writable.end()`,`finsih`,`close`のながれで`Writable`を閉じていくのが推奨の流れといえるでしょう。


2. ただちに`Writable`を破棄しなくてはならないなら`writable.destory`を呼び出そう

なぜならば、`writable.destroy()`は呼び出されると直ちに`close`イベントを発行させるからである。

(`Writable`コンストラクタに`emitClose:false`を渡してなければ)

先にも書いた通り、`close`が発行されるとこれ以上の書き込みは受け付けなくなるので内部バッファに玉ってあったデータはストリーム先に書き込まれない。



## 実践：改善版

学習した正しい使い方を反映して再度画像ファイルをコピーしてみる。

ちょっとおさらい

- `writable.write()`の戻り値をチェックして`false`が帰っていたら次の`drain`イベントまで`Readable`のデータ取得を停止すること

- `Readable`のモードは、`flowing`モード中に`readable.pause()`呼出しで`paused`モードに、`paused`モード中に`readable.resume()`呼び出しで`flowing`モードに変更される

- `writable`は明示的に閉じる処理を実装すること

以下のプログラムは次の動作をするはずである：

`highWaterMark`が1024で指定しているので

毎回読み取りストリームが`highWaterMark`マックスまでデータを読み取って

その都度`writable.write()`が内部バッファへ1024byte書き込み

こちらも`highWaterMark`へ到達するので`false`を返すはずである。

そしたら`readable.pause()`で一時停止して`drain`イベントまで読み取りを停止する。

読み取りストリームが`end`イベントを発行したら、

書き込みストリームは明示的に`writable.end()`するので`finish`イベントが発行され、

その時点の書き込みストリームの内部バッファがフラッシュされる（ファイルへ書き込まれる）

そうしたのち書き込みストリームは閉じられて、以降書き込みは許されなくなる。

```TypeScript

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';

const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");

// -- HELPERS -------------------

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
        path.join(outPath, "cat" + randomString(4) + ".png"), 
        { 
            encoding: 'binary',     /* default: 'utf8' */
            autoClose: true,
            emitClose: true,
            highWaterMark: 1024     /* default: 64 * 1024 */
    });
}



(function() {
    const rfs: fs.ReadStream = createRfs();
    const wfs: fs.WriteStream = createWfs();

    let draining: boolean = true;

    rfs.on('data', (chunk) => {
        console.log(`Readable read ${chunk.length} byte of data`)
        draining = wfs.write(chunk, (e: Error | null | undefined) => {
            if(e) {
                // ここでエラーが起こったら`error`イベント前にこの
                // コールバックが実行される
                // で、`error`イベントが発行される
                console.error(e.message);
            }
        });
        // chunkを書き込んだ後のwriteの戻り値がfalseなら
        // 読取ストリームはすぐに停止する
        if(!draining) {
            console.log('Paused Readable because of reaching highWaterMark');
            rfs.pause();
        }
    });

    // `drain`イベントは書込みが再開できるときに発行される
    wfs.on('drain', () => {
        console.log('Drained and resume Readable again.');
        // drainイベントが発行されたら読取ストリームの読取を再開する
        draining = true;
        rfs.resume();
    });

    wfs.on('end', () => {
        console.log('End Writable');
    });

    wfs.on('finish', () => {
        console.log('Finished');
    });

    wfs.on('close', () => {
        console.log('Writable closed');
    });

    /***
     * `error`イベントが発行されたらストリームは閉じられる
     * 
     * `error`以降`close`イベント以外発行されてはならない
     * */ 
    wfs.on('error', (e: Error) => {
        if(!wfs.destroyed) wfs.destroy(e);
    });

    rfs.on('end', () => {
        console.log('there is no more data to be consumed from Readable');
        wfs.end();
    })

    rfs.on('error', (e: Error) => {
        if(!rfs.destroyed) rfs.destroy(e);
    });
})();

```

結果

```bash
[start:*run] [nodemon] starting `node ./dist/index.js`
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 1024 byte of data
[start:*run] Paused Readable because of reaching highWaterMark
[start:*run] Drained and resume Readable again.
[start:*run] Readable read 905 byte of data
[start:*run] there is no more data to be consumed from Readable
[start:*run] Finished
[start:*run] Writable closed
[start:*run] [nodemon] clean exit - waiting for changes before restart
```

元のファイルサイズは15kbで、取得したのは15241byte。

書き込みストリームは閉じられている。

`drain`イベントと読み取りストリームの一時停止と再開が正常に動いている。


## `pipe`

#### 公式の訳

`readable.pipe(destination)`

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#readablepipedestination-options

Syntax: `readable.pipe(destination[, options])`

- destination <stream.Writable> The destination for writing data
- options <Object> Pipe options
- end <boolean> End the writer when the reader ends. Default: true.
- Returns: <stream.Writable> The destination, allowing for a chain of pipes if it is a Duplex or a Transform stream

> `readable.pipe()`は`Writable`を`Readable`へ接続し、
> 自動的にFlowingモードへ移行し、接続されている`Writable`へデータをプッシュします。
> 転送速度が(`Writable`よりも)速い`Readable`からのデータ量に`Writable`が圧倒されないように自動的にデータの流れを制御してくれる。

> 複数の`Writable`を単一の`Readable`へアタッチすることができる

>`readable.pipe()`の戻り値は転送先のストリームになっており、これを使って`pipe`をチェインさせることができる

```JavaScript
// 次みたいなことができるという話
document.querySelector('.container').querySelector('.header');

// こんな感じ
// 公式そのまま
const fs = require('fs');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
```

> デフォルトとして、`Readable`が`end`イベントを発行したら転送先の`Writable`で`stream.end()`が呼び出されて、転送先へこれ以上の書込みが行われないようにします。

> この通常の振舞を変更するには、(`readable.pipe()`へ渡せる引数の）`end`オプションを`false`にすることで転送先のストリームをオープンにしたままにできます。

> **一つの重要な警告は、読み取り中に`Readable`がエラーを起こしたときで、そのとき`Writable`は自動的に自身のストリームを閉じてくれない。もしもエラーが起こると、メモリリークを起こさないように手動で各ストリームを閉じる必要がある**

> `process.stderr`, `process.stdout`の`Writable`ストリームは、Node.jsが閉じられるまでは常に閉じられることはない


#### `pipe()`の実践

```TypeScript
/*****
 * ローカルの画像ファイルのコピーを作成するプログラム
 * 
 * `readable.pipe()`を使うと`writable.write()`を使うときとどう異なるのか確認。
 * 
 *  詳しくは`./practice-verification-filestream.md`に。
 * */ 

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { readFileSync } from 'node:fs';

const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");

// -- HELPERS -------------------

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
        path.join(outPath, "cat" + randomString(4) + ".png"), 
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

    let draining: boolean = true;
    
    wfs.on('drain', () => {
        console.log('drained');
    })

    wfs.on('end', () => {
        console.log('End Writable');
    });

    wfs.on('finish', () => {
        console.log('Finished');
    });

    wfs.on('close', () => {
        console.log('Writable closed');
    });

    rfs.on('end', () => {
        console.log('there is no more data to be consumed from Readable');
        // pipe()を使っているならば明示的にwritable.end()を呼び出す必要はない
        // wfs.end();
    })

    rfs.on('error', (e: Error) => {
        console.error(e.message);
    });

    
    /***
     * pipe()を使っている場合、
     * Readableでエラーが起こるとWritableは自動で閉じてくれない
     * */ 
    wfs.on('error', (e: Error) => {
        console.error(e.message);
        if(!rfs.destroyed) rfs.destroy();
        if(!wfs.destroyed) wfs.destroy();
    });

    /**
     * drain関係を一切丸投げできる
     * 
     * Readableが（エラーなく）閉じたときにWritableを閉じてくれる
     * (option {end: true} なら)
     * 
     * 
     * */ 
    rfs.pipe(wfs, {
        end: true,      // defaultでtrueだけどね
    });
})();

```

結果、

```bash
drained
drained
drained
drained
drained
drained
drained
drained
drained
drained
drained
drained
drained
there is no more data to be consumed from Readable
Finished
Writable closed
```

簡単。

#### 検証：`pipe()`のエラーハンドリング

参考：

https://stackoverflow.com/a/33195253/13891684

https://stackoverflow.com/a/22389498/13891684

`Readable`の`resume`イベントが3回起こったら`Readable`がエラーを発行する。

その挙動を確認する。


```TypeScript
let counter: number = 0;
let errorEmitted: boolean = false;

wfs.on('end', () => {
    console.log('End Writable');
});

wfs.on('finish', () => {
    console.log('Finished');
});

wfs.on('close', () => {
    console.log('Writable closed');
});

rfs.on('end', () => {
    console.log('there is no more data to be consumed from Readable');
});

wfs.on('drain', () => {
    console.log('drained');
});

rfs.on('resume', () => {
    console.log('resume');
    counter++;
    if(counter === 4 && !errorEmitted) {
        rfs.emit('error', new Error('TEST ERROR'));
        errorEmitted = true;
        counter++;
    }
});

rfs.on('error', (e: Error) => {
    console.error(`Readable caught error: ${e.message}`);
    if(!rfs.destroyed) rfs.destroy(e);
    if(!wfs.destroyed) wfs.destroy(e);
});

/***
 * pipe()を使っている場合、
 * Readableでエラーが起こるとWritableは自動で閉じてくれない
 * */ 
wfs.on('error', (e: Error) => {
    console.error(`Writable caught error: ${e.message}`);
    if(!rfs.destroyed) rfs.destroy(e);
    if(!wfs.destroyed) wfs.destroy(e);
});
```

結果

```bash
resume
drained
resume
drained
resume
drained
resume
Readable caught error: TEST ERROR
Writable caught error: TEST ERROR
Writable closed
Readable caught error: TEST ERROR
clean exit - waiting for changes before restart
```

どうやら`destory()`になにも考えずにErrorオブジェクトを引数として渡しているから

やたらエラーイベントが反応してしまっている。

`stream.destroy()`の使い方が正しくない。

なのでおさらい。

---

`stream.destroy()`について：

`stream.destory()`は呼び出されたときに、引数にErrorオブジェクトを渡すと`error`イベントを発行する。

ストリームのインスタンス生成時に`emitClose: false`していない限り`close`イベントを発行する。

`Readable`でdestoryした場合、この呼び出しの後、読み取り可能なストリームはすべての内部リソースを解放し、その後の push() の呼び出しは無視されます。

`Writable`でdestoryしたときも同様。

---

つまり、

今のところのコードだと

- destroy()すると`close`イベントが発行される。
- destroy(error)すると`error`イベントがこの後発生する。

となると

```TypeScript

rfs.on('error', (e: Error) => {
    console.error(`Readable caught error: ${e.message}`);
    if(!rfs.destroyed) rfs.destroy(e);
    if(!wfs.destroyed) wfs.destroy(e);
});

wfs.on('error', (e: Error) => {
    console.error(`Writable caught error: ${e.message}`);
    if(!rfs.destroyed) rfs.destroy(e);
    if(!wfs.destroyed) wfs.destroy(e);
});
```

というコードだと、

`error`イベントでdestroy()しているのにErrorオブジェクトを渡しているので再度`error`イベントを発行させてしまっている。

だからやたらerrorイベントが発生しているのである。

こうすればいい。


```TypeScript

    rfs.on('error', (e: Error) => {
        console.error(`Readable caught error: ${e.message}`);
        // ここは既にReadableのerrorイベント真っ最中なので
        // これ以上Readableにerrorイベントを発行させる必要がない
        // なので引数なしでdestroy()する
        if(!rfs.destroyed) rfs.destroy();
        // Writableにはerrorイベントを発行させる
        if(!wfs.destroyed) wfs.destroy(e);
    });
    
    /***
     * pipe()を使っている場合、
     * Readableでエラーが起こるとWritableは自動で閉じてくれない
     * */ 
    wfs.on('error', (e: Error) => {
        console.error(`Writable caught error: ${e.message}`);
        // ここは既にWritableのerrorイベント真っ最中なので
        // これ以上Writableにerrorイベントを発行させる必要がない
        // なので引数なしでdestroy()する
        if(!wfs.destroyed) wfs.destroy();
        // Readableにはerrorイベントを発行させる
        if(!rfs.destroyed) rfs.destroy(e);
    });

    rfs.pipe(wfs, {
        end: true,      // defaultでtrueだけどね
    });
```

結果

```bash
[nodemon] starting `node ./dist/index.js`
resume
drained
resume
drained
resume
drained
resume
Readable caught error: TEST ERROR
Writable closed
Writable caught error: TEST ERROR
Readable closed
```

期待通り、

readable.emit('error')したからReadableのerrorイベントハンドラが一度だけ反応して、

その再writable.destroy(error)したのでwritableのerrorイベントが一度だけ反応している。

closeイベントが発行されるので両ストリームは閉じられた。

検証２：`pipe.().on('error')`は書き込み、読み取り両ストリームでのエラーに反応するのか？

Readableでエラーが発生した場合

```TypeScript
(async function() {
    const rfs: fs.ReadStream = createRfs();
    const wfs: fs.WriteStream = createWfs();
    
    let counter: number = 0;
    let errorEmitted: boolean = false;

    wfs.on('drain', () => {
        console.log('drained');
    });

    wfs.on('end', () => {
        console.log('End Writable');
    });

    wfs.on('finish', () => {
        console.log('Finished');
    });

    wfs.on('close', () => {
        console.log('Writable closed');
    });

    rfs.on('close', () => {
        console.log('Readable closed');
    });

    rfs.on('end', () => {
        console.log('there is no more data to be consumed from Readable');
        // pipe()を使っているならば明示的にwritable.end()を呼び出す必要はない
        // wfs.end();
    });

    rfs.on('resume', () => {
        console.log('resume');
        counter++;
        if(counter === 4 && !errorEmitted) {
            rfs.emit('error', new Error('TEST ERROR'));
            errorEmitted = true;
            counter++;
        }
    });

    rfs.on('error', (e: Error) => {
        console.error(`Readable caught error: ${e.message}`);
        if(!rfs.destroyed) {
            console.log("destroy readable");
            rfs.destroy();
        }
        if(!wfs.destroyed) {
            console.log("destroy writable");
            wfs.destroy(e);
        }
    });
    
    wfs.on('error', (e: Error) => {
        console.error(`Writable caught error: ${e.message}`);
        if(!wfs.destroyed) {
            console.log("destroy writable");
            wfs.destroy();
        }
        if(!rfs.destroyed) {
            console.log("destroy readable");
            rfs.destroy(e);
        }
    });

    rfs.pipe(wfs, {
        end: true,      // defaultでtrueだけどね
    })
    .on('error', (e) => {
        console.log('Another error handler');
    });

})();

```

結果

```bash
resume
drained
resume
drained
resume
drained
resume
Readable caught error: TEST ERROR
destroy readable
destroy writable
Writable caught error: TEST ERROR
Another error handler
Writable closed
Readable closed
```

Writableでエラーが発生した場合

```TypeScript
    rfs.on('resume', () => {
        console.log('resume');
        counter++;
        if(counter === 4 && !errorEmitted) {
            // writableでエラーを発生させた
            wfs.emit('error', new Error('TEST ERROR'));
            errorEmitted = true;
            counter++;
        }
    });

    rfs.on('error', (e: Error) => {
        console.error(`Readable caught error: ${e.message}`);
        if(!rfs.destroyed) {
            console.log("destroy readable");
            rfs.destroy();
        }
        if(!wfs.destroyed) {
            console.log("destroy writable");
            wfs.destroy(e);
        }
    });

    wfs.on('error', (e: Error) => {
        console.error(`Writable caught error: ${e.message}`);
        if(!wfs.destroyed) {
            console.log("destroy writable");
            wfs.destroy();
        }
        if(!rfs.destroyed) {
            console.log("destroy readable");
            rfs.destroy(e);
        }
    });

    rfs.pipe(wfs, {
        end: true,      // defaultでtrueだけどね
    })
    .on('error', (e) => {
        console.log('Another error handler');
    });
```

結果：Writableでエラーが発生した場合

```bash
resume
drained
resume
drained
resume
drained
resume
Writable caught error: TEST ERROR
destroy writable
destroy readable
Another error handler
Writable closed
Readable caught error: TEST ERROR
Readable closed
```

pipeしている最中に読み取りストリーム、書き込みストリームどちらでエラーが起こっても`pipe().on('error)'`で両方エラーを取得することはできる。

ストリームでエラーが発生した場合、自動でデータを読み取っている関係上

読み取りストリームを優先して閉じてそれから書き込みストリームを閉じるというのが

内部バッファに貯まった消費されなくなったデータ量が最小で済むことになると思う。

なので

次の通りに実装するといいのかも。

```TypeScript
    // rfs.on('error'), wfs.on('error')は削除してある

    rfs.pipe(wfs, {
        end: true,      // defaultでtrueだけどね
    })
    .on('error', (e) => {
        console.log('piped error handler');
        if(!rfs.destroyed) {
            console.log("destroy readable");
            rfs.destroy();
        }
        if(!wfs.destroyed) {
            console.log("destroy writable");
            wfs.destroy();
        }
    });
```

結果

```bash
resume
drained
resume
drained
resume
drained
resume
piped error handler
destroy readable
destroy writable
Writable closed
Readable closed
```

## APIスタイルは一つだけにして複数のAPIを使わないこと

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#choose-one-api-style

> 開発者はデータ消費の為に一つの方法だけを選択し、一つのストリームに対して複数の方法をデータ消費のために使ってはならない。

> 特に、`on('data')`,`on('readable')`, `pipe()`を併用すること（以下略）

ということで、`pipe()`を使っている最中に`data`イベントハンドラを追加してはならない。

そう考えると、`pipe()`を使うときは`data`イベントは監視できないといえる。

`pipe()`を使うならする必要もないでしょうが。

