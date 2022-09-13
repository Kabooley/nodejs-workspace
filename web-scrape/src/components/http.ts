/************************************************************
 * Node.js HTTPS APIを使ってリクエストとか送信するかも
 * 
 * 指定URLとoptionを受け取ってhttpsリクエストを送信する
 * 
 * HTTPRequestを送信して、レスポンスからデータをストリーム取得する
 * 
 * コーディング心得：
 * 
 * - コールバックAPIとPromiseAPI統一すること
 * *********************************************************/ 
import type http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { string } from 'yargs';

interface iOptions {

}

export class Downloader {
    draining: boolean = true;
    res: http.ClientResponse = null;
    constructor(
        private options: iOptions, 
        private writeStream: fs.WriteStream,
    ) {
    };

    request(options?: iOptions) {
        http.ClientRequest = https.request(options ? options : this.options, (res: http.ClientResonse)  => {
            this.res = res;
            this.setEventListener();
        });
    };

    setEventListener() {
        if(!this.res || !this.writeStream) return;

        this.res.on("error", this.responseErrorHandler);
        this.res.on("end", this.responseEndHandler);
        this.writeStream.on("error", this.writableErrorHandler);
        this.writeStream.on("drain", this.drainHandler);
        this.writeStream.on("end", this.writableEndHandler);
        this.res.on("data", this.consumer);
    };

    responseErrorHandler(e: Error) {
        if(!this.res.destroyed) this.res.destroy();
        if(!this.writeStream.destroyed) this.writeStream.destroy(e);

    };

    responseEndHandler() {
        this.writeStream.end();
    };

    writableErrorHandler(e: Error) {
        if(!this.res.destroyed) this.res.destroy(e);
        if(!this.writeStream.destroyed) this.writeStream.destroy();
    };

    writableEndHandler() {
        console.log("Download successfully completed");
        // 
        // NOTE: Might as well delete instance itself.
        // 
    }
    
    drainHandler() {
        this.draining = true;
        this.res.resume();
    }

    /**
     * Of Course it should be used pipe()
     * */ 
    consumer(chunk) {
        this.draining = this.writeStream.write(chunk, (e: Error | null | undefined) => {
            /**
             * If error occured here, writable.on('error') fires.
             * */ 
            if(e) throw e;
        });
        if(!this.draining) this.res.pause();
    }
}