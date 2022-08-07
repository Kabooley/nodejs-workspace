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
// -- HELPERS -------------------
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
    return fs.createWriteStream(path.join(outPath, "cat" + randomString(4) + ".png"), {
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
        let draining = true;
        rfs.on('data', (chunk) => {
            console.log(`Readable read ${chunk.length} byte of data`);
            draining = wfs.write(chunk, (e) => {
                if (e) {
                    // ここでエラーが起こったら`error`イベント前にこの
                    // コールバックが実行される
                    console.error(e.message);
                }
            });
            // chunkを書き込んだ後のwriteの戻り値がfalseなら
            // 読取ストリームはすぐに停止する
            if (!draining) {
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
        wfs.on('error', (e) => {
            if (!wfs.destroyed)
                wfs.destroy(e);
        });
        rfs.on('end', () => {
            console.log('there is no more data to be consumed from Readable');
            wfs.end();
        });
        rfs.on('error', (e) => {
            if (!rfs.destroyed)
                rfs.destroy(e);
        });
    });
})();
