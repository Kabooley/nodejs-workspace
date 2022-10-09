/***********************************************
 * Local file management
 * 
 * 
 * *********************************************/ 
import * as fs from "fs";
import type * as promises from 'node:fs/promises';

// なんかエクスポートされていないので、
// fs.d.tsで定義されている奴そのまま
interface StreamOptions {
    flags?: string | undefined;
    encoding?: BufferEncoding | undefined;
    fd?: number | promises.FileHandle | undefined;
    mode?: number | undefined;
    autoClose?: boolean | undefined;
    /**
     * @default false
     */
    emitClose?: boolean | undefined;
    start?: number | undefined;
    highWaterMark?: number | undefined;
};



/***
 * Find out specific path is exists.
 * 
 * */ 
export const isExistSync = (path: string): boolean => {
    return fs.existsSync(path);
};

/***
 * 指定パスへのfs.WriteStreamを返す。
 * 
 * */ 
export const getFsWritableStream = (path: string, options?: BufferEncoding | StreamOptions): fs.WriteStream => {
    if(options !== undefined) return fs.createWriteStream(path, options);
    else return fs.createWriteStream(path);
};


/***
 * Create composition writable stream
 * 
 * 合成なので、拡張する以外のメソッドはすべて明示的に委譲しなくてはならない
 * 
 * 拡張したいメソッドは引数で指定して、指定されていないメソッドはすべて委譲する
 * 
 * ...という機能を実装するのは大変なので、
 * 
 * 完全に今都合がいいように拡張するだけのプロキシを作ってみる
 * 
 * 必須メソッド：
 * - write
 * - close
 * - setDefaultEncoding
 * - end
 * - cork
 * - uncork
 * - destroy
 * - 
 * 
 * 何をしたいのか...
 * - write  ログをとりたい
 * - close  特になし
 * - setDefaultEncoding 特になし
 * - end    特になし
 * - cork   使わない
 * - uncork 使わない
 * - destroy    
 * 
 * TODO: thisはどうやって型付けすればいいのじゃ？
 * 
 * どうやらTypeScriptではコンストラクタ関数は許されないレベルらしい
 * 
 * めんどくさいね
 * 
 * となると...
 * 
 * typescriptではプロトタイプによる生成は無理？
 * */ 

// interface iFuckingCompositionWritable {
    
// }
// export const createCompositionedWritable = (writableOrigin: fs.WriteStream) => {
//     const proto = Object.getPrototypeOf(writableOrigin);

//     // function CompositionWritable(writableOrigin: fs.WriteStream) {
//     //     // TODO: `this`の型付け
//     //     this.writableOrigin = writableOrigin;
//     // };

//     class CompositionWritable {
//         constructor(public writableOrigin: fs.WriteStream) {}
//     }

//     CompositionWritable.prototype = Object.create(proto);


//     CompositionWritable.prototype.write = function(chunk: any, encoding: BufferEncoding | undefined, callback: (error?: Error | null) => void): void {
//         if(!callback && typeof encoding === 'function') {
//             callback = encoding;
//             encoding = undefined;
//           }
//           // 呼出時と...
//           console.log(`Writing...: ${chunk}`);
//           return this.writableOrigin.write(chunk, encoding, function() {
//             // 書き込み完了時を拡張できる
//             console.log('Finished writing ', chunk);
//             callback && callback();
//           });
//     };

//     CompositionWritable.prototype.on = function() {
//     return this.writableOrigin.on
//         .apply(this.writableOrigin, arguments);
//     };

//     CompositionWritable.prototype.close = function() {
//         return this.writableOrigin.close.apply(this.writableOrigin, arguments);
//     };

//     CompositionWritable.prototype.setDefaultEncoding = function() {
//         return this.writableOrigin.setDefaultEncoding.apply(this.writableOrigin, arguments);
//     };


//     CompositionWritable.prototype.end = function() {
//         return this.writableOrigin.end.apply(this.writableOrigin, arguments);
//     };

//     CompositionWritable.prototype.cork = function() {
//         return this.writableOrigin.cork.apply(this.writableOrigin, arguments);
//     };

//     CompositionWritable.prototype.uncork = function() {
//         return this.writableOrigin.uncork.apply(this.writableOrigin, arguments);
//     };

//     CompositionWritable.prototype.destroy = function() {
//         return this.writableOrigin.destroy.apply(this.writableOrigin, arguments);
//     };

//     return new CompositionWritable(writableOrig);
// }

/***
 * 
 * 
 * */ 

