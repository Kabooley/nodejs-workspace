/*****
 * Readable streamの挙動を確認するプログラム
 * 
 * dist/in/cat.pngをdist/out/cat.pngへコピーする
 * */ 

import * as stream from 'node:stream';
import * as fs from 'node:fs';
import * as path from 'node:path';

const from: string = './dist/in';

let data = '';

const rfs: fs.ReadStream = fs.createReadStream(path.join(__dirname, 'in'));


rfs.on('open', () => {
    console.log("readable stream has benn opened");
});

rfs.on('ready', () => {
    console.log("readable stream is ready");
});

rfs.on('close', () => {
    console.log('readable stream has been closed');
});

rfs.on('data', (chunk: string | Buffer) => {
    console.log(`Received ${chunk.length} bytes of data.`);
});

rfs.on('end', () => {
    console.log('There is no more data to be consumed from the stream');
});

// readable.readableFlowing !== trueの時に発火する
rfs.on('resume', () => {
    console.log('There is no more data to be consumed from the stream');
});


// readableイベントはdataイベントハンドラを無効にするのでどっちか選べ
// 
// rfs.on('readable', () => {
//     // There is some data to read now.
//     let data;
  
//     while ((data = rfs.read()) !== null) {
//       console.log(`readable cosumed: ${data}`);
//     }
// });

rfs.on('error', (e: Error) => {
    console.error(e.message);
});