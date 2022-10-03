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
 * 
 * 
 * */ 
/***
 * 
 * 
 * */ 

