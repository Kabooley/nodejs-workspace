"use strict";
/*****
 * file to file stream
 *
 * Readable streamの挙動を確認するプログラム
 *
 * dist/in/cat.pngをdist/out/cat.pngへコピーする
 *
 * Readable streamはflowingモードである
 * */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const crypto = __importStar(require("node:crypto"));
const outPath = path.join(__dirname, "out");
const inPath = path.join(__dirname, "in");
// ランダムな文字列を生成するやつ
// 
// https://qiita.com/fukasawah/items/db7f0405564bdc37820e#node%E3%81%AE%E3%81%BF
const randomString = (upto) => {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from(crypto.randomFillSync(new Uint8Array(upto))).map((n) => S[n % S.length]).join('');
};
// 指定のパスにディレクトリは存在するのか確認する関数
/*
https://stackoverflow.com/questions/15630770/node-js-check-if-path-is-file-or-directory

https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#class-fsstats

*/
const isDirExist = (path) => {
    return fs.lstatSync(path).isDirectory() && fs.existsSync(path);
};
// /*
//     interface ReadStreamOptions extends StreamOptions {
//         end?: number | undefined;
//     }
//     interface StreamOptions {
//         flags?: string | undefined;
//         encoding?: BufferEncoding | undefined;
//         fd?: number | promises.FileHandle | undefined;
//         mode?: number | undefined;
//         autoClose?: boolean | undefined;
//          emitClose?: boolean | undefined;
//          start?: number | undefined;
//          highWaterMark?: number | undefined;
//      }
//      ということですべてオプショナルである。
//      読取highWaterMarkは1024byteにしてみる
// */ 
// const createRfs = (): fs.ReadStream => {
//     if(!isDirExist(inPath)) throw new Error(`The path: ${inPath} does not exist.`);
//     return fs.createReadStream(
//         path.join(inPath, "cat.png"), 
//         {
//             encoding: 'binary',     /* default: 'utf8' */
//             autoClose: true,
//             emitClose: true,
//             highWaterMark: 1024     /* default: 64 * 1024 */
//         }
//     );
// }
// const createWfs = (): fs.WriteStream => {
//     if(!isDirExist(outPath)) throw new Error(`The path: ${outPath} does not exist.`);
//     return fs.createWriteStream(
//         path.join(outPath, "cat" + randomString(4) + ".png"), 
//         { 
//             encoding: 'binary',     /* default: 'utf8' */
//             autoClose: true,
//             emitClose: true,
//             highWaterMark: 1024     /* default: 64 * 1024 */
//     });
// }
// (async function() {
//     const rfs: fs.ReadStream = createRfs();
//     const wfs: fs.WriteStream = createWfs();
//     // --- Readable Event Handlers ------------
//     rfs.on('open', (): void => {
//         console.log("readable stream has been opened");
//     });
//     rfs.on('ready', (): void => {
//         console.log("readable stream is ready");
//     });
//     /***
//      * 「close」イベントは、ストリームとその基になるリソース (ファイル記述子など) が
//      * 閉じられたときに発行されます。
//      * このイベントは、
//      * これ以上イベントが発行されず、それ以上の計算が行われないことを示します。
//      * 
//      * */ 
//     rfs.on('close', (): void => {
//         console.log('readable stream has been closed');
//         wfs.end();
//     });
//     /***
//      * 「終了」イベントは、ストリームから消費されるデータがなくなると発行されます。 
//      * **データが完全に消費されない限り、「終了」イベントは発行されません。**
//      * これは、ストリームをフロー モードに切り替えるか、
//      * すべてのデータが消費されるまで stream.read() を繰り返し呼び出すことで実現できます。
//      * 
//      * つまり読み取りストリームの読み取り先から読み取るものがもうないことを示すのかな
//      * */ 
//     rfs.on('end', (): void => {
//         console.log('End read stream');
//         console.log('There is no more data to be consumed from the stream');
//     });
//     // readable.readableFlowing !== trueの時に発火する
//     /**
//      * `resume`イベントは、
//      * 
//      * `stream.resume()`が呼び出さたとき、
//      * 
//      * または`readable.readableFlowing`がtrueでないときに
//      * 
//      * 発火する
//      * 
//      * */ 
//     rfs.on('resume', (): void => {
//         console.log('resume');
//     });
//     /**
//      * 単独Errorオブジェクトを渡す。
//      * 
//      * */ 
//     rfs.on('error', (e: Error): void => {
//         wfs.destroy(e); // this will emit 'error' and 'close'
//         // // or
//         // wfs.destroy();    // this will emit 'close'
//         // // or
//         // wfs.end();        // this will emit 'finish'
//         console.error(e.message);
//         rfs.resume();
//     });
//     /***
//      * `pause`イベントは`stream.pause()`が呼び出されたとき、
//      * 
//      * または`readable.readableFlowing`が`false`出ないときに
//      * 
//      * 発火する
//      * 
//      * */ 
//     rfs.on('pause', (): void => {
//         console.log("readable paused");
//     })
//     // --- Writable Event Handlers -----
//     /**
//      * `close`:
//      * ファイル記述子などが閉じられたりストリームが閉じられたら発行されるイベント
//      * 
//      * このイベント以降何のイベントも発行されない。
//      * */ 
//     wfs.on('close', (): void => {
//         console.log("Writable stream closed");
//     });
//     /**
//      * `drain`:
//      * 
//      * stream.write(chunk) への呼び出しが false を返す場合、
//      * ストリームへのデータの書き込みを再開するのが適切なときに
//      * 「drain」イベントが発行されます。
//      * 
//      * ということで書込みが「再開できるとき」にこのイベントハンドラが発火する
//      * */ 
//     wfs.on('drain', (): void => {
//         console.log("Drained");
//     });
//     /**
//      * `finish`
//      * `stream.end()`が呼び出されたら、もしくは全てのデータがシステムへフラッシュされたら発行されるイベント。
//      * 
//      * */ 
//     wfs.on('finish', (): void => {
//         console.log("Finished");
//     });
//     /***
//      * `pipe`
//      * 
//      * readableストリームで`stream.pipe()`が呼び出されたら発行されるイベント。
//      * 
//      * 
//      * */ 
//     wfs.on('pipe', (): void => {
//         console.log("PIPED!");
//     });
//     wfs.on('unpiped', (): void => {
//         console.log("UNPIPED!!");
//     })
//     /**
//      * `error`
//      * 
//      * 書込み中かデータをパイプしているときにエラーが発生したら発行されるイベント。
//      * 
//      * ストリームを生成したときに`autoDestroy`を`false`に設定しておかない限り、
//      * 
//      * `error`イベントが発行されるとストリームは閉じられる。
//      * 
//      * `error`イベント後は`close`イベント以外は発生しない。
//      * */ 
//     wfs.on('error', (e: Error): void => {
//         console.error(e.message);
//         // 念のために明示的にストリームを破棄させる。
//         if(wfs.destroyed) wfs.destroy();
//     });
//     /**
//      * `data`の消費者がいないかぎりReadableストリームはデータを取得しない
//      * 
//      * また、flowingモードでデータを制御するハンドラがない場合、データは失われる。
//      * 
//      * 上記は`data`イベントハンドラなしで`readable.resume()`が呼び出されたときに起る。
//      * 
//      * TODO: 検証：読み取ったchunkを直接渡して大丈夫か？
//      * */ 
//     rfs.on('data', (chunk: string | Buffer): void => {
//         console.log('data read!');
//         console.log(`state: ${rfs.readableFlowing}`);
//         console.log(`Received ${chunk.length} bytes of data.`);
//         /****
//          * https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writablewritechunk-encoding-callback
//          * 
//          * コールバックは、データの書き込みがすべて完了したら呼び出される。
//          * エラーが起こった場合には引数にエラーオブジェクトが渡される。
//          * */ 
//         wfs.write(chunk, (e: Error | null | undefined): void => {
//             if(e) console.error(e.message);
//             else console.log("Write data has been completed");
//         });
//     });
// })();
// -- PAUSED MODE ---------------
/*********
 * `paused`モードなので
 *
 *
 *
 * */
const createRfs = () => {
    if (!isDirExist(inPath))
        throw new Error(`The path: ${inPath} does not exist.`);
    return fs.createReadStream(path.join(inPath, "text.txt"), {
        encoding: 'utf8',
        autoClose: true,
        emitClose: true,
        highWaterMark: 12 /* default: 64 * 1024 */
    });
};
let counter = 0;
const rfs = createRfs();
rfs.on('error', (e) => {
    console.error(e.message);
    // Destroy stream explicitly
    /***
     * オプショナルで`error`と`close`イベントを発行する
     *
     * destroy() が呼び出されると、それ以降の呼び出しは何も行われず、
     * _destroy() 以外のエラーは「エラー」として出力されることはありません。
     * */
    if (!rfs.destroyed)
        rfs.destroy(e);
});
rfs.on('close', () => {
    console.log('CLOSE');
    if (!rfs.destroyed)
        rfs.destroy();
});
rfs.on('end', () => {
    console.log("end");
    if (!rfs.destroyed)
        rfs.destroy();
});
rfs.on('pause', () => {
    console.log("Readable paused");
});
rfs.on('resume', () => {
    console.log('resume');
    console.log(`state: ${rfs.readableFlowing}`);
    console.log(">> Switched to flowing mode.");
    // pausedモードのままならば
    rfs.on('data', (chunk) => {
        console.log(`[flowing] Read ${chunk.length} bytes of data and...`);
    });
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
    // 検証２
    // pausedモードでの読み取りが3回を超えたら
    // stream.resume()を呼び出してどうなるか見てみる
    if (counter === 3) {
        rfs.resume();
    }
    let chunk = rfs.read();
    // なくても大丈夫
    // たぶんストリームのコンストラクタにautoCLoseを渡してあるから
    if (chunk === null)
        rfs.close();
    else
        console.log(`Read ${chunk.length} bytes of data and...`);
    counter++;
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
