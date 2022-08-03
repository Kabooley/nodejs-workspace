"use strict";
/*****
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
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
const createRfs = () => {
    if (!isDirExist(inPath))
        throw new Error(`The path: ${inPath} does not exist.`);
    return fs.createReadStream(path.join(inPath, "cat.png"), {
        encoding: 'binary',
        autoClose: true,
        emitClose: true,
        highWaterMark: 1024 /* default: 64 * 1024 */
    });
};
const createWfs = () => {
    if (!isDirExist(outPath))
        throw new Error(`The path: ${outPath} does not exist.`);
    return fs.createWriteStream(path.join(outPath, "cat" + randomString + ".png"), {
        encoding: 'binary',
        autoClose: true,
        emitClose: true,
        highWaterMark: 1024 /* default: 64 * 1024 */
    });
};
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const rfs = createRfs();
        const wfs = createWfs();
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
        rfs.on('data', (chunk) => {
            console.log('data read!');
            console.log(`state: ${rfs.readableFlowing}`);
            console.log(`Received ${chunk.length} bytes of data.`);
            /****
             * https://nodejs.org/dist/latest-v16.x/docs/api/stream.html#writablewritechunk-encoding-callback
             *
             * コールバックは、データの書き込みがすべて完了したら呼び出される。
             * エラーが起こった場合には引数にエラーオブジェクトが渡される。
             * */
            wfs.write(chunk, (e) => {
                if (e)
                    console.error(e.message);
                else
                    console.log("Write data has been completed");
            });
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
        rfs.on('error', (e) => {
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
        });
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
        });
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
        wfs.on('error', (e) => {
            console.error(e.message);
            // 念のために明示的にストリームを破棄させる。
            if (wfs.destroyed)
                wfs.destroy();
        });
    });
})();
