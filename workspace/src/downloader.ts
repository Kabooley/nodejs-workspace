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

        this.download = this.download.bind(this);
        this.setEventListener = this.setEventListener.bind(this);
        this.resErrorHandler = this.resErrorHandler.bind(this);
        this.resAbortedHandler = this.resAbortedHandler.bind(this);
        this.resEndHandler = this.resEndHandler.bind(this);
        this.writableEndHandler = this.writableEndHandler.bind(this);
        this.writableErrorHandler = this.writableErrorHandler.bind(this);
        this.writableCloseHandler = this.writableCloseHandler.bind(this);
        this.drainHandler = this.drainHandler.bind(this);
        this.consumer = this.consumer.bind(this);
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
            this.setEventListener();
        });

        req.on('error', (e: Error) => { console.error(e);});
        req.on('finish', () => { console.log("request finish"); });
        req.on('close', () => { console.log("request closed"); });
        // NOTE: req.end()が呼び出されないと永遠に待機状態のようになる（何も始まらない..)
        // 
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
        this.writeStream.on("close", this.writableCloseHandler);

        console.log('event listeners are set.');
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
        console.error(e.message);
        // if(this.res && !this.res.destroyed) this.res.destroy(e);      // デストロイすべきはリクエストオブジェクトのほうなのかも...
        if(!this.writeStream.destroyed) this.writeStream.destroy();
    };

    // fs.WriteStreamにはendなんてイベントないかも...
    writableEndHandler() {
        console.log("fs.writeStream ended");
    }

    writableCloseHandler() {
        console.log("fs.writeStream has been closed");
    }
    
    drainHandler() {
        console.log("Consume again.");
        this.draining = true;
        if(this.res) this.res.resume();
    }

    /**
     * Of Course it should be used pipe().
     * 
     * If error occured while write(), writable.on('error') fires.
     * */ 
    consumer(chunk: any) {
        this.draining = this.writeStream.write(chunk, (e: Error | null | undefined) => {
            console.log(`wrote: ${chunk.length}`)
            if(e) throw e;
        });
        if(!this.draining && this.res){ 
            console.log("Stopped consuming")
            this.res.pause();
        };
    }
};


/*********************************************************************************
 * 
 * 実行結果：
 * 
```bash
request finish              # `finish` on request
Request stream is finished  # request.end() callback 
response: 200 OK            # http.request() callback 
event listeners are set.    # setEventListener()

# `data` on response, 
Stopped consuming
Consume again.
wrote: 1378

Stopped consuming

request closed              # `close` on request

Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Stopped consuming
Consume again.
wrote: 1378

Response stream ended       # `end` on response

wrote: 83

fs.writeStream has been closed      # `close` on fs.WriteStream

# cat.png successfully downloaded.
```

`finish` on request > request.end() callback > http.request() callback > set listeners > `data` on reqponse ここまでは想定通り。

response と fs.WriteStream がやり取りしている間に `close` on request が発生したのが想定外。

`end` on response > `close` on fs.WriteStream は想定通り。

正常運転が実現できているならば、`close` on requestは一番最後（`end` on responseよりあと）のはずだと思ったけれど、結果ファイルは取得できている。
******************************************************************************/ 