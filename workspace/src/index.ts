/*****
 * Readable streamの挙動を確認するプログラム
 * 
 * dist/in/cat.pngをdist/out/cat.pngへコピーする
 * 
 * Readable streamはflowingモードである
 * */ 

/*
Readable stream　まとめ

Readable streamには２つの運用モードがある

flowing mode: データの読み取りはシステムが行ってくれるのでお任せできる。取得してデータはEventEmitterインタフェイスを通じたイベントハンドラによって取得できる

paused mode: `stream.read()`を明示的に呼び出すことでデータを取得できる

Readableストリームは初めは必ずpausedモードで始まり、`data`イベントハンドラを追加するなど特別なことをすることでflowingモードへ自動的に切り替わる。

また一方で、ストリームの書き込み先がないときに、`stream.pause()`を呼び出すなどするとpausedモードに切り替わる。

`fs.createReadableStream()`も、

`fs.createWritableStream()`も`highWaterMark`を指定できるので

内部バッファへの閾値を設定しながら読み取ってみる。
*/ 

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

/*
    interface ReadStreamOptions extends StreamOptions {
        end?: number | undefined;
    }
    interface StreamOptions {
        flags?: string | undefined;
        encoding?: BufferEncoding | undefined;
        fd?: number | promises.FileHandle | undefined;
        mode?: number | undefined;
        autoClose?: boolean | undefined;
         emitClose?: boolean | undefined;
         start?: number | undefined;
         highWaterMark?: number | undefined;
     }

     ということですべてオプショナルである。

     読取highWaterMarkは1024byteにしてみる
*/ 

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
        path.join(outPath, "cat" + randomString + ".png"), 
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
        console.log("readable stream has benn opened");
    });

    rfs.on('ready', () => {
        console.log("readable stream is ready");
    });

    rfs.on('close', () => {
        console.log('readable stream has been closed');
    });

    /**
     * `data`の消費者がいないかぎりReadableストリームはデータを取得しない
     * 
     * また、flowingモードでデータを制御するハンドラがない場合、データは失われる。
     * 
     * 上記は`data`イベントハンドラなしで`readable.resume()`が呼び出されたときに起る。
     * 
     * TODO: 検証：読み取ったchunkを直接渡して大丈夫か？
     * */ 
    rfs.on('data', (chunk: string | Buffer) => {
        console.log('data read!');
        console.log(`state: ${rfs.readableFlowing}`);
        console.log(`Received ${chunk.length} bytes of data.`);

        /****
         * https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writablewritechunk-encoding-callback
         * 
         * コールバックは、データの書き込みがすべて完了したら呼び出される。
         * エラーが起こった場合には引数にエラーオブジェクトが渡される。
         * */ 
        wfs.write(chunk, (e: Error | null | undefined) => {
            if(e) console.error(e.message);
            else console.log("Write data has been completed");
        })
    });

    rfs.on('end', () => {
        console.log('End read stream');
        console.log('There is no more data to be consumed from the stream');
    });

    // readable.readableFlowing !== trueの時に発火する
    /**
     * `resume`イベントは、
     * 
     * `stream.resume()`が呼び出さたとき、
     * 
     * または`readable.readableFlowing`がtrueでないときに
     * 
     * 発火する
     * 
     * */ 
    rfs.on('resume', () => {
        console.log('There is no more data to be consumed from the stream');
    });


    /**
     * 単独Errorオブジェクトを渡す。
     * 
     * */ 
    rfs.on('error', (e: Error) => {
        console.error(e.message);
        rfs.resume();
    });


    /***
     * `pause`イベントは`stream.pause()`が呼び出されたとき、
     * 
     * または`readable.readableFlowing`が`false`出ないときに
     * 
     * 発火する
     * 
     * */ 
    rfs.on('pause', () => {
        console.log("readable paused");
    })

    // --- Writable Event Handlers -----

    /**
     * `close`:
     * ファイル記述子などが閉じられたりストリームが閉じられたら発行されるイベント
     * 
     * このイベント以降何のイベントも発行されない。
     * */ 
    wfs.on('close', () => {
        console.log("Writable stream closed");
    });

    /**
     * `drain`:
     * 
     * stream.write(chunk) への呼び出しが false を返す場合、
     * ストリームへのデータの書き込みを再開するのが適切なときに
     * 「drain」イベントが発行されます。
     * 
     * ということで書込みが「再開できるとき」にこのイベントハンドラが発火する
     * */ 
    wfs.on('drain', () => {
        console.log("Drained");
    });

    /**
     * `finish`
     * `stream.end()`が呼び出されたら、もしくは全てのデータがシステムへフラッシュされたら発行されるイベント。
     * 
     * */ 
    wfs.on('finish', () => {
        console.log("");
    });

    /***
     * `pipe`
     * 
     * readableストリームで`stream.pipe()`が呼び出されたら発行されるイベント。
     * 
     * 
     * */ 
    wfs.on('pipe', () => {
        console.log("PIPED!");
    });

    wfs.on('unpiped', () => {
        console.log("UNPIPED!!");
    })

    /**
     * `error`
     * 
     * 書込み中かデータをパイプしているときにエラーが発生したら発行されるイベント。
     * 
     * ストリームを生成したときに`autoDestroy`を`false`に設定しておかない限り、
     * 
     * `error`イベントが発行されるとストリームは閉じられる。
     * 
     * `error`イベント後は`close`イベント以外は発生しない。
     * */ 
    wfs.on('error', (e: Error) => {
        console.error(e.message);
        // 念のために明示的にストリームを破棄させる。
        if(wfs.destroyed) wfs.destroy();
    });

})();