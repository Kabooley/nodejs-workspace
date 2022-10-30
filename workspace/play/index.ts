import * as fs from 'fs';
import * as path from 'path';
import { Downloader, iOptions } from './http';

// https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png
(async function() {
    try {
        const options: iOptions = {
            host: "raw.githubusercontent.com",
            path: "/wiki/Microsoft/DirectXTK/images/cat.png",
            protocol: "https:",
            method: "GET",
        };
        const ws = fs.createWriteStream(
            path.join(__dirname, "cat.png"),
            {
                encoding: 'binary',     /* default: 'utf8' */
                autoClose: true,
                emitClose: true,
                highWaterMark: 1024     /* default: 64 * 1024 */
            }
        );
        const downloader = new Downloader(options, ws);
        await downloader.download();
    }
    catch(e) {
        console.error(e);
    }
})();
// (async function() {
//     try {
//         const options: iOptions = {
//             host: "cdn8.dirtyship.net",
//             path: "/dirtyship/cdn2/AftynRosetryonhaulv.mp4",
//             protocol: "https:",
//             method: "GET",
//             headers: {
//                 referer: "https://dirtyship.com/"
//             }
//         };
//         const ws = fs.createWriteStream(
//             path.join(__dirname, "AftynRosetryonhaulv.mp4"),
//             {
//                 encoding: 'binary',     /* default: 'utf8' */
//                 autoClose: true,
//                 emitClose: true,
//                 highWaterMark: 1024     /* default: 64 * 1024 */
//             }
//         );
//         const downloader = new Downloader(options, ws);
//         await downloader.download();
//     }
//     catch(e) {
//         console.error(e);
//     }
// })();
