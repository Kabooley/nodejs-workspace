/************************************************************
 * pipe()使うバージョン
 * *********************************************************/ 
import type http from 'http';
import type fs from 'fs';
import * as https from 'https';

interface iOptions extends http.RequestOptions {};

export class Downloader {
    private res: http.IncomingMessage | null = null;
    constructor(
        private options: iOptions, 
        private writeStream: fs.WriteStream,
    ) {

        this.download = this.download.bind(this);
    };

    download(options?: iOptions) {
        /**
         * IncomingMessage exntends stream.readable
         * 
         * https.request()はclientRequsetを返すのでそこのAPIからイベントを確認のこと
         * */ 
        const req: http.ClientRequest = https.request(options ? options : this.options, (res: http.IncomingMessage)  => {
            if(res.statusCode !== 200) throw new Error(`Error: Server reapond ${res.statusCode}. ${res.statusMessage}`);
            console.log(`response: ${res.statusCode} ${res.statusMessage}`);
            this.res = res;
            this.res.pipe(this.writeStream, { end: true });
        });

        req.on('error', (e: Error) => { console.error(e);});
        req.on('finish', () => { console.log("request finish"); });
        req.on('close', () => { console.log("request closed"); });
        // NOTE: req.end()が呼び出されないと永遠に待機状態のようになる（何も始まらない..)
        // 
        req.end(() => {console.log("Request stream is finished"); });
    };

};


/********************************************************************
 * pipe()おさらい
 * 
 * - readableでendが発行されたら、writableが自動的にendされるようになっている。
 * - pipe(option)のoptionに`{end: false}`を渡すとこれが無効になり、writableがオープンのままになる
 * - pipe()は引数として受け取ったWritableを返す。
 * - pipeチェーンの末尾の.on()は
 * - バックプレッシャを制御する必要がない
 * - エラーがreadableで起こったら、オプション{end: true}関係なくwritableは手動で閉じなくてはならない。
 * 
 * */ 