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
 * 
 * 
 * http.request()
 * *********************************************************/ 
import type http from 'http';
import type fs from 'fs';
import * as https from 'https';

interface iOptions extends http.RequestOptions {};

export class Downloader {
    private draining: boolean = true;
    private res: http.IncomingMessage | null = null;
    constructor(
        private options: iOptions, 
        private writeStream: fs.WriteStream,
    ) {
        // ここまででちゃんと取得しているのに...
        this.options = options;
        this.writeStream = writeStream;
    };

    download(options?: iOptions) {
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

        req.on('error', (e: Error) => { console.error(e);});
        req.on('finish', () => { console.log("request finish"); });
        req.on('close', () => { console.log("request closed"); });
        req.end(() => {console.log("Request stream is finished"); });
    };

    setEventListener() {
        if(!this.res || !this.writeStream) return;

        // Add listeners to response object.
        this.res.on("data", this.consumer);
        this.res.on("error", this.resErrorHandler);
        this.res.on("aborted", this.resAbortedHandler);
        this.res.on("end", this.resEndHandler);

        // Add listeners to fs.WriteStream
        this.writeStream.on("error", this.writableErrorHandler);
        this.writeStream.on("drain", this.drainHandler);
        this.writeStream.on("end", this.writableEndHandler);
    };

    /***
     * 
     * */ 
    resErrorHandler(e: Error) {
        console.error(e.message);
        // NOTE: ここで何をすべきかはケースごとかも
        // if(this.res && !this.res.destroyed) this.res.destroy();      // デストロイすべきはリクエストオブジェクトのほうなのかも...
        if(!this.writeStream.destroyed) this.writeStream.destroy(e);
    };

    /**
     * It might be called request.destory() or request.abort()
     * 
     * */ 
    resAbortedHandler() {}

    /**
     * Fired there is no more data to be consumed from response stream.
     * 
     * Checks message.complete if message was completely recieved or not.
     * 
     * Attaching data event listener to response stream, 
     * this listener is required to invoke fs.WritableStream.end().
     * */ 
    resEndHandler() {
        if(this.res && !this.res.complete){
            this.res.emit('error', new Error('The connection was terminated while the message was still being sent'));
        }
        console.log('Response stream ended');
        this.writeStream.end();
    };

    writableErrorHandler(e: Error) {
        // if(this.res && !this.res.destroyed) this.res.destroy(e);      // デストロイすべきはリクエストオブジェクトのほうなのかも...
        if(!this.writeStream.destroyed) this.writeStream.destroy();
    };

    writableEndHandler() {
        // CHECK STATUS OF requst and response ans writeStream
        // If all ok, then it is completely succeeded.
        console.log("Download successfully completed");
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
        console.log(this.writeStream);
        this.draining = this.writeStream.write(chunk, (e: Error | null | undefined) => {
            if(e) throw e;
        });
        if(!this.draining && this.res) this.res.pause();
    }
}