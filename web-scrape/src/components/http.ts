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
import type fs from 'fs';
import * as https from 'https';

interface iOptions extends http.RequestOptions {

}

export class Downloader {
    draining: boolean = true;
    res: http.IncomingMessage | null = null;
    constructor(
        private options: iOptions, 
        private writeStream: fs.WriteStream,
    ) {
    };

    request(options?: iOptions) {
        /**
         * IncomingMessage exntends stream.readable
         * 
         * https.request()はclientRequsetを返すのでそこのAPIからイベントを確認のこと
         * */ 
        const req: http.ClientRequest = https.request(options ? options : this.options, (res: http.IncomingMessage)  => {
            if(res.statusCode !== 200) throw new Error(`Error: Server reapond ${res.statusCode}. ${res.statusMessage}`);
            this.res = res;
            this.setEventListener();
        });

        // Error among sending request will be caught here.
        req.on('error', (e) => { 
            console.error(e);
            // req.destroy()だとまずい？
            req.end();
        });
        // Make sure that request has been sent completely.
        // request.end() must be invoked while using http.request().
        req.on('finish', () => { req.end(); });
    };

    setEventListener() {
        if(!this.res || !this.writeStream) return;

        this.res.on("data", this.consumer);
        this.res.on("error", this.responseErrorHandler);
        this.res.on("end", this.responseEndHandler);
        this.writeStream.on("error", this.writableErrorHandler);
        this.writeStream.on("drain", this.drainHandler);
        this.writeStream.on("end", this.writableEndHandler);
    };

    responseErrorHandler(e: Error) {
        if(this.res && !this.res.destroyed) this.res.destroy();
        if(!this.writeStream.destroyed) this.writeStream.destroy(e);

    };

    responseEndHandler() {
        this.writeStream.end();
    };

    writableErrorHandler(e: Error) {
        if(this.res && !this.res.destroyed) this.res.destroy(e);
        if(!this.writeStream.destroyed) this.writeStream.destroy();
    };

    writableEndHandler() {
        // CHECK STATUS OF requst and response ans writeStream
        // If all ok, then it is completely succeeded.
        console.log("Download successfully completed");
        // TODO: 何か明示的に終了させる対象などがあるのかしら？
        // 
        // NOTE: Might as well delete instance itself.
        // 
    }
    
    drainHandler() {
        this.draining = true;
    }

    /**
     * Of Course it should be used pipe().
     * 
     * If error occured while write(), writable.on('error') fires.
     * */ 
    consumer(chunk: any) {
        this.draining = this.writeStream.write(chunk, (e: Error | null | undefined) => {
            if(e) throw e;
        });
        if(!this.draining && this.res) this.res.pause();
    }
}