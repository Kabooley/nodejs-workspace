# 【Node.js】検証と実践：Streamの基本的な使い方

TODO: pipeの記事を追加する

`fs.Readable`と`fs.Writable`を使って画像ファイルをコピーするプログラムを作り

ストリームの基本的な使い方を検証、理解していく。

利用するNode.jsのバージョンはv16.xです。


## この記事は何？

次のような方向けになると思います。

- Node.jsのstream APIを一通り目を通した人。
- 具体的に`writable.write()`を使った最低限レベルでのストリームを使った実装方法を知りたい人。

`fs.writeFile()`のような一旦ファイルの内容をすべてメモリを展開するメソッドを使わずに

メモリが節約できるストリームを使っていく方法を模索していきます。

ストリームの基本的な使い方といいつつ、

`trasform`と`duplex`ストリームについてはこの記事で扱いません。

`Readable`と`Writable`のみ扱います。

この記事の流れですが、

まず誤解したままでざっくり実装してみて、その後間違っている部分を解消していき、改善したコードに作り直していきます。

なげーです。

## 実践

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

コピーファイルは画像ファイルとして開くことができました...しかし

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

最終的にはAPIを正しく使用できているプログラムに改善します。


## Writableストリームを適切に閉じる方法

結論：**書き込みストリームの破棄は明示的に実行しなくてはならない**

次のような勘違いをしていました。

「`Writable`インスタンスを生成するときにコンストラクタに`autoClose: true`, `emitClose: true`を渡したら、`Writable`は自動的に閉じてくれるはず」

これは当然ですが間違いでした。

このままでは`Writable`が閉じられない理由は２つあって、

- そもそも`Readable`が閉じられたことを自動的に`Writable`が知る仕組みはないから。
- `Writable`において`error`または`close`または`finishi`イベントが発行されていないから。

公式を見てみる：

`fs.createWriteStream()`より

> 「error」または「finish」時に autoClose が true (デフォルトの動作) に設定されている場合、ファイル記述子は自動的に閉じられます。 

> デフォルトでは、ストリームは破棄された後に「close」イベントを発行します。この動作を変更するには、emitClose オプションを false に設定します。

`fs.Writable::Event:'close'`より

> 「close」イベントは、ストリームとその基になるリソース (ファイル記述子など) が閉じられたときに発行されます。このイベントは、これ以上イベントが発行されず、それ以上の計算が行われないことを示します。

つまり`close`イベントは`Writable`ストリームの仕事が完全に終わったときに発行されるべき。

`fs.Writable::Event'finish'`より

> 「finish」イベントは、stream.end() メソッドが呼び出された後に発行され、すべてのデータが基盤となるシステムにフラッシュされます。

ということは、

実は`Writable`は`autoClose: true`にしても勝手に閉じるのではなくて、閉じるためにイベントを発行させなくてはならないのである。

`autoClose: true`は`error`か`finish`イベントが発行されたら書き込みストリームを閉じるよという意味で、

`emitClose: true`は「ストリームが破棄されたときに`close`イベントを発行するよ」という意味で、

「書き込みストリームの破棄」は自動で行うよとは一言も言っていないのである。

なので**書き込みストリームの破棄は明示的に実行しなくてはならない**

そして書き込みストリームが自動的に閉じてもらうには、

**`autoClose: true`を前提に`error`か`finish`イベントを発行しなくてはならない**のです。


## `Writable`はいつ閉じればいいのか

`Writable`は明示的に閉じる処理を実行しない限り閉じられることはないことがわかりました。

(`readble.pipe()`を使えばその限りではないですが。)

では実際にいつ、どうやって閉じればいいのでしょうか。

そこは各ストリームの内部バッファについて考慮しなくてはなりません。

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#buffering

公式の説明から、ストリームは読み取り先からデータを吸い取ったら各ストリームが持つ内部バッファへ一旦保存することがわかります。

> 内部読み取りバッファーの合計サイズが、highWaterMark で指定されたしきい値に達すると、ストリームは、現在バッファーされているデータが消費されるまで、基になるリソースからのデータの読み取りを一時的に停止します

> 内部書き込みバッファの合計サイズが highWaterMark によって設定されたしきい値を下回っている間、writable.write() への呼び出しは true を返します。内部バッファーのサイズが highWaterMark に達するか超えると、false が返されます。



いずれのストリームも`highWaterMark`で指定した閾値まで内部バッファにデータがたまると一旦データの吸い取りを停止し、消費されるまで止まったままになる（またはすべき）ということが書いてあります。

この内部バッファにデータを残した状態でストリームが閉じられると、内部バッファデータはメモリに残り続けていずれガベージコレクションに登録されます。

ということで、

**ストリームを閉じるには常に内部バッファが空であるかを考慮しなくてはなりません。**

正常動作の後に閉じたいときは内部バッファは空っぽにしておくべきで、

エラーが起こった場合はこれ以上データを吸い取らないようにすぐに破棄すべきです。

その方法を次でまとめます。


### `writable.end()`と`writable.destroy()`の使い分け

`Writable`を閉じるには明示的に閉じる処理を呼び出すこと、内部バッファは空にしてから閉じることが

正しい使い方であることを知りました。

では具体的に何を呼び出せばいいのかと、どこで呼び出せばいいのかが分かれば正しい実装が実現できそうです。

ここでは何を呼び出せばいいかをまとめます。

(`Readable`は読み取り先からもう読み取るものがないと自動的に閉じるので割愛しました。)

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


2. エラーが起こったけど内部バッファをフラッシュしたいときは`writable.end()`か次の`drain`イベントを待つ

やはり内部バッファを出し切るためには`finish`イベントが発行されなくてはならないので。

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writabledestroyerror

> データを閉じる前にフラッシュする必要がある場合は、destroy の代わりに end() を使用するか、ストリームを破棄する前に「drain」イベントを待ちます。

この使い方は、`error`イベントハンドラが発火したらコールバックで`writable.end()`を呼び出すことになります。

次の`drain`イベントを待つ場合、

`drain`イベントが発行されると「書き込み可能になった」わけなので、

データを吸い取る`writeble.write()`が呼び出される前に直ちに`writable.end()`を呼び出すことになります。

3. ただちに`Writable`を破棄しなくてはならないなら`writable.destory`を呼び出そう

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writabledestroyerror

なぜならば、`writable.destroy()`は呼び出されると直ちに書き込みストリームが破棄されるからである。

つまりこれ以上の書き込みがなされないので、内部バッファにデータが残ったままになります。


### `Writable`はこのときに閉じます

`Readable`からもうデータがおくられてくることが最早ないなら`Writable`を閉じればいい。

その適切なタイミングといえば、`Readable`で`end`イベントが発行された時である。

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#event-end

> 「終了」イベントは、ストリームから消費されるデータがなくなると発行されます。 データが完全に消費されない限り、「終了」イベントは発行されません。

ということで`Readable`で`end`イベントが発行されたら、

`Readable`で内部バッファにあるデータは完全に消費しきったというお墨付きということなので

`end`イベントハンドラ内部で`writable.end()`を呼び出すのが適切となります。

まぁそうなるよねという結論ですが、

自信をもってこうであるというにはAPIドキュメントを何度も読み返して先のように順序だてる必要がありました。

ここまでで、

[Writableストリームを適切に閉じる方法](#Writableストリームを適切に閉じる方法)の解答を導き出すことができました。


## `drain`イベントの適切な処理の仕方

先の実践のところでのコードでは`drain`イベントハンドラで何もしていませんでした。

しかし`writable.write()`を使う以上`drain`イベントは適切に処理しなくてはなりません。

### `drain`と`writable.write()`の仕組み

重要：**`writable.write()`が`false`を返したら`drain`イベントが発行されるまでデータ書き込みは停止せよ**

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

ということで、まとめると...

- `highWaterMark`は内部バッファの「満タン」を（形式的に）定義してストリームを制御する

- `writable.write()`が`false`を返したら`drain`イベントが発行されるまでデータ書き込みは即座に停止しなくてはならない

- `drain`イベントが発行されてからchunkの書き込みを再開せよ

ナルホド。

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

なんでかというと、pipeは内部的に`drain`を制御しているからです。

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

つまり`pipe`を使えば`drain`イベントに関する制御を丸投げできるのです。

それでも`pipe()`を使えない事情があるとか完全に使用メモリ量を制御したいなどの事情があるならば、

`writable.write()`を直接呼出す実装を自分で定義することになります。

さて、

この記事では`writable.write()`を適切に使う方法を追求するので、

`pipe()`がやってくれている内容を自分で実装しなくてはなりません。

つまり、`writable.write(chunk)`が`false`を返したらデータ読み取りを一時停止して、

次回`drain`イベントが起こったらデータ読み取りを再開する

そんな処理をどうやって実現すればいいでしょうか。

参考：

https://stackoverflow.com/a/45905612/13891684

https://stackoverflow.com/a/50360972/13891684


公式や参考のサイトでは`process.nextTick()`, `flow()`みたいな関数を使われていた

`writable.once('drain')`みたいなイベントハンドラもあるみたい

しかし、**`readable.pause()`と`readable.resume()`を使えばいい**のです。

### Readableのモード切替方法

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#two-reading-modes

Readableには2つのモードがある

> - flowingモード：データの取得はシステムが自動的に行ってくれてデータはイベントハンドラで取得できる
> - pausedモード：`stream.read()`を明示的に呼び出してストリームのチャンクを取得する

この2つのモードを切り替える方法

flowingモードに切り替える方法：

- `data`イベントハンドラを追加する
- `stream.resume()`を呼び出す
- `stream.pipe()`で`Writable`へデータを送信する

pausedモードに切り替える方法：

- pipeの到達地点がないときに、`stream.pause()`を呼出したとき
- pipeの到達地点があるときに`stream.unpipe()`を呼び出すと起こりうる

ということで、

明示的に両モードを切り替えられるメソッドが`readable.resume()`と`readable.pause()`であようです。

`stream.resume()`はflowingモードに切り替えて、`stream.pause()`はflowingモードから解除をします。


https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#readablepause

> readable.pause() メソッドは、フロー モードのストリームに「データ」イベントの発行を停止させ、フロー モードから切り替えます。利用可能になったデータは内部バッファに残ります。

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#readableresume

> readable.resume() メソッドは、明示的に一時停止された Readable ストリームに「データ」イベントの発行を再開させ、ストリームをフロー モードに切り替えます。


今回の実践のところでは`Readable`は`data`イベントハンドラをアタッチしているのでFlowingモードで動作させています。

なので、

`writable.write(chunk)`で`false`が帰ってきたら`readable.pause()`で`Readable`をPausedモードにして、

`drain`イベントが発行されたら`readable.resume()`で明示的にFlowingモードに戻せば、

そのまま`data`イベントハンドラが自動的にデータ取得を再開してくれる。

という実装をすればいいということになる。

## 実装：改善版

ここまでで学習して導き出した適切な実装方法を先のコードに適用してみます。

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

    // Writableへ書き込み可能ならtrue。そうでないならfalse。
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

    wfs.on('error', (e: Error) => {
        if(!rfs.destroyed) rfs.destroy(e);
        if(!wfs.destroyed) wfs.destroy();
    });

    rfs.on('end', () => {
        console.log('there is no more data to be consumed from Readable');
        // Readableでendイベントが発行されたら、完全に内部バッファにデータがない証拠なので
        // ここでWritableを閉じる
        wfs.end();
    })

    rfs.on('error', (e: Error) => {
        if(!rfs.destroyed) rfs.destroy();
        if(!wfs.destroyed) wfs.destroy(e);
    });
})();

```

結果

```bash
[nodemon] starting `node ./dist/index.js`

# highWaterMarkで指定したデータ量いっぱいまでデータを読み取って
Readable read 1024 byte of data
# そのデータをそのままWritableへ渡す。
# WritableもhighWaterMarkいっぱいまでデータ取得したので
# writable.write()がfalseを返し、readable.pause()で一時停止
Paused Readable because of reaching highWaterMark
# 書き込み再開できるようになったのでdrainイベントが発行され
# readable.resume()して再開。
Drained and resume Readable again.

# 以降同じ展開が続く...

Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
Readable read 1024 byte of data
Paused Readable because of reaching highWaterMark
Drained and resume Readable again.
# 最後に読み取ったデータはhighWaterMark未満なので
# そのまま流れていった
Readable read 905 byte of data
# 最後のデータを読み取ってReadableでendイベントが発行されて
# Writable.end()が実行される。
there is no more data to be consumed from Readable
# Writableでfinishイベントが発行されて内部バッファがフラッシュされて
Finished
# 自動的にWritableは閉じられた。
Writable closed
[nodemon] clean exit - waiting for changes before restart
```

出力先のディレクトリに正しく画像ファイルのコピーが生成されているのを確認できました。

読み込み・書き込み両ストリームは閉じられているし、`drain`イベントと読み取りストリームの一時停止と再開が正常に動いているのも確認できます。

完全に期待通りに動作しました。

先の実践コードから改善ができたと思います。

## 【余談】APIスタイルは一つだけにして複数のAPIを使わないこと

https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#choose-one-api-style

> 開発者はデータ消費の為に一つの方法だけを選択し、一つのストリームに対して複数の方法をデータ消費のために使ってはならない。

> 特に、`on('data')`,`on('readable')`, `pipe()`を併用

してはならないそうです。

例えば、

`pipe()`を使っている最中に`data`イベントハンドラを追加してはならないということです。

そう考えると、`pipe()`を使っているときは`data`イベントは監視できないといえます。

まぁ`pipe()`を使うなら監視する必要もないでしょうが。

