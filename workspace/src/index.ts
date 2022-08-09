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
    
    let counter: number = 0;
    let errorEmitted: boolean = false;

    // let draining: boolean = true;

    // --- pipe()を使うとコメントアウトしたところがいらなくなる ---
    // まぁイベントを監視する必要があるならdrainとか要るけど...
    // 
    // rfs.on('data', (chunk) => {
    //     console.log(`Readable read ${chunk.length} byte of data`)
    //     draining = wfs.write(chunk, (e: Error | null | undefined) => {
    //         if(e) {
    //             // ここでエラーが起こったら`error`イベント前にこの
    //             // コールバックが実行される
    //             console.error(e.message);
    //         }
    //     });
    //     // chunkを書き込んだ後のwriteの戻り値がfalseなら
    //     // 読取ストリームはすぐに停止する
    //     if(!draining) {
    //         console.log('Paused Readable because of reaching highWaterMark');
    //         rfs.pause();
    //     }
    // });

    // // `drain`イベントは書込みが再開できるときに発行される
    // wfs.on('drain', () => {
    //     console.log('Drained and resume Readable again.');
    //     // drainイベントが発行されたら読取ストリームの読取を再開する
    //     draining = true;
    //     rfs.resume();
    // });
    
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
    })
    // .on('error', (e) => {
    //     console.log('Another error handler');
    //     if(!rfs.destroyed) rfs.destroy(e);
    //     if(!wfs.destroyed) wfs.destroy(e);
    // });

})();
