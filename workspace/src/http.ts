// https://cdn8.dirtyship.net/dirtyship/cdn2/AftynRosetryonhaulv.mp4

/************************************************************
 * TODO: 正常に動かない。リクエストのendとか呼び出しが適切でないみたい。
 * 
 * https://stackoverflow.com/questions/9639978/sending-http-request-in-node-js
 * GETしたいだけなら`http.get()`を使うこと
 * `http.request()`を使うなら必ず戻り値を`.end()`すること
 * 
 * https://stackoverflow.com/a/70328574
 * `response.on('end')`がすべてのレスポンスを取得完了したことを示すイベントである
 * 
 * TODO: デザインパターンを参考にリファクタリングすればいいかも
 * TODO: 特に理由がないからwritable.writeはやめてpipe()にしよう
 * *********************************************************/ 
 import type http from 'http';
 import type fs from 'fs';
 import * as https from 'https';
 
 export interface iOptions extends http.RequestOptions {};
 
 export class Downloader {
     private draining: boolean = true;
     private res: http.IncomingMessage | null = null;
     constructor(
         private options: iOptions, 
         private writeStream: fs.WriteStream,
     ) {
        this.download = this.download.bind(this);
        this._setEventListener = this._setEventListener.bind(this);
        this.resEndHandler = this.resEndHandler.bind(this);
        this.resEndHandler = this.resEndHandler.bind(this);
        this.writableEndHandler = this.writableEndHandler.bind(this);
        this.writableErrorHandler = this.writableErrorHandler.bind(this);
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
             this.res = res;
             this._setEventListener();
         });
 
         req.on('error', (e: Error) => { console.error(e);});
         req.on('finish', () => { console.log("req: finished."); });
         req.on('close', () => { console.log("req: closed."); });
         req.on('end', () => { console.log("req: end."); });
         req.end(() => {console.log("req: Request stream is finished"); });
     };
 
     _setEventListener() {
         if(!this.res || !this.writeStream) return;

         // DEBUG:
         console.log("_setEventListener(): setting up listners.");
 
         // Add listeners to response object.
         this.res.on("data", this.consumer);
         this.res.on("error", this.resErrorHandler);
         this.res.on("aborted", this.resAbortedHandler);
         this.res.on("end", this.resEndHandler);
 
         // Add listeners to fs.WriteStream
         this.writeStream.on("error", this.writableErrorHandler);
         this.writeStream.on("drain", this.drainHandler);
         this.writeStream.on("end", this.writableEndHandler);

         
         // DEBUG:
         console.log("_setEventListener(): Done setting up listners.");
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
 

    //  NOTE: こいつが呼ばれていない限りレスポンスの取得が完了していない
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
         console.log('resEndHandler(): Response stream ended');
         this.writeStream.end();
     };
 
     writableErrorHandler() {
        // DEBUG:
        console.log("writableErrorHandler()");

         // if(this.res && !this.res.destroyed) this.res.destroy(e);      // デストロイすべきはリクエストオブジェクトのほうなのかも...
         if(!this.writeStream.destroyed) this.writeStream.destroy();
     };
 
     writableEndHandler() {
        // DEBUG:
        console.log("writableEndHandler()");

         // CHECK STATUS OF requst and response ans writeStream
         // If all ok, then it is completely succeeded.
         console.log("Download successfully completed");
     }
     
     drainHandler() {
        // DEBUG: 
        console.log("Redrain...");

         this.draining = true;
         this.res!.resume();
     }
 
     /**
      * Of Course it should be used pipe().
      * 
      * If error occured while write(), writable.on('error') fires.
      * */ 
     consumer(chunk: any) {

        // DEBUG:
        console.log("cosuming...");

         this.draining = this.writeStream.write(chunk, (e: Error | null | undefined) => {
             if(e) throw e;
         });
         if(!this.draining) this.res!.pause();
     }
 }