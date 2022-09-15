import * as fs from "fs";
import * as url from "url";
import type http from 'http';
import { Downloader } from './downloader';

const _url: URL = new url.URL("https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png");

const filepath: string = "./dist/cat.png";

const options: http.RequestOptions = {
    method: "GET",
    host: _url.host,
    path: _url.pathname,
    protocol: "https:",
};

(async function(options) {
    const wfs: fs.WriteStream = fs.createWriteStream(filepath, { 
        encoding: 'binary',     /* default: 'utf8' */
        autoClose: true,
        emitClose: true,
        highWaterMark: 1024     /* default: 64 * 1024 */
    });
    console.log(wfs);
    const downloader = new Downloader(options, wfs);
    await downloader.download();
})(options);