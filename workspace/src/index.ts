import { IncomingMessage } from "http";
import https from "https";
import * as path from "path";
import * as fspromises from 'node:fs/promises';

const url: string = "https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png";

/**
 * https://nodejs.org/dist/latest-v16.x/docs/api/http.html#httpgeturl-options-callback
 * 
 * > ほとんどのリクエストは本文のない GET リクエストであるため、Node.js はこの便利なメソッドを提供します。
 * > このメソッドと http.request() の唯一の違いは、メソッドを GET に設定し、
 * > req.end() を自動的に呼び出すことです。
 * > コールバックは、http.ClientRequest セクションに記載されている理由により、
 * > 応答データを消費するように注意する必要があります。 
 * > コールバックは、http.IncomingMessage のインスタンスである単一の引数で呼び出されます。
 * */ 
const pngDownloader = (dir: string, filename: string): void => {
    https.get(url, (res: IncomingMessage) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
    
        let error;
    
        if(statusCode !== 200) {
            error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
        } else if (contentType !== undefined && !/^image\/png/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                    `Expected image/png but received ${contentType}`);
        }
        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            return;
        }
    
        res.setEncoding('binary');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            try {
                console.log("end");
                _writeFile(dir, filename, rawData);
            }
            catch(e) {
                console.error(e);
            }
        })
    }).on('error', (e) => {
        console.error(e);
    });
}


/**
 * https://nodejs.org/dist/latest-v16.x/docs/api/fs.html#fspromisesmkdirpath-options
 * 
 * `../dist/out`が作成される。
 * 
 * このファイルがコンパイル後に実行される関係から、
 * __dirnameは必然的にdist/になる
 * 
 * なのでout/が作られるのがそこになるという話。
 * 
 * */ 
const _mkdir = async (dirname: string): Promise<void> => {
    try {
        await fspromises.mkdir(path.join(__dirname, dirname), { recursive: true });
        console.log("mkdir complete");
    }
    catch(e) {
        console.error(e)
    }
}

const _writeFile = async (to: string, filename: string, data: any): Promise<void> => {
    try {
        await fspromises.writeFile(path.join(to, filename), data, {
            encoding: "binary"
        });
    }
    catch(e) {
        console.error(e);
    }
}


(async function() {
    await _mkdir("out");
    pngDownloader(path.join(__dirname, "out"), "cat.png");
})()