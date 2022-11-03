import * as fs from 'fs';
import * as path from 'path';
import * as URL from 'url';
import { Downloader, iOptions } from './http';
// import { Archiver } from './archiver';

// // https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png
// (function() {
//     try {
//         const options: iOptions = {
//             host: "raw.githubusercontent.com",
//             path: "/wiki/Microsoft/DirectXTK/images/cat.png",
//             protocol: "https:",
//             method: "GET",
//         };
//         const ws = fs.createWriteStream(
//             path.join(__dirname, "cat.png"),
//             {
//                 encoding: 'binary',     /* default: 'utf8' */
//                 autoClose: true,
//                 emitClose: true,
//                 highWaterMark: 1024     /* default: 64 * 1024 */
//             }
//         );
//         const downloader = new Downloader(options, ws);
//         downloader.download();
//     }
//     catch(e) {
//         console.error(e);
//     }
// })();

(async function() {
    try {
        const urls: string[] = [
            "https://cdn7.dirtyship.net/cdn2/aftyrosesexynightv.mp4",
            "https://cdn10.dirtyship.net/dirtyship/cdn2/Aftynnursev.mp4",
            "https://cdn7.dirtyship.net/cdn2/aftyngfneedsattv.mp4"
        ];

        // const options: iOptions = {
        //     host: "cdn8.dirtyship.net",
        //     path: "/dirtyship/cdn2/AftynRosetryonhaulv.mp4",
        //     protocol: "https:",
        //     method: "GET",
        //     headers: {
        //         referer: "https://dirtyship.com/"
        //     }
        // };
        // const ws = fs.createWriteStream(
        //     path.join(__dirname, "AftynRosetryonhaulv.mp4"),
        //     {
        //         encoding: 'binary',     /* default: 'utf8' */
        //         autoClose: true,
        //         emitClose: true,
        //         // highWaterMark: 1024     /* default: 64 * 1024 */
        //     }
        // );
        // const downloader = new Downloader(options, ws);
        // await downloader.download();

        for(const url of urls) {
            const u = URL.parse(url);
            const opt: iOptions = {
                host: u.host,
                path: u.pathname,
                protocol: u.protocol,
                method: "GET",
                headers: {
                    referer: "https://dirtyship.com/"
                }
            };
            const ws = fs.createWriteStream(
                path.join(__dirname, path.basename(u.pathname!)),
                {
                    encoding: 'binary',     /* default: 'utf8' */
                    autoClose: true,
                    emitClose: true,
                    // highWaterMark: 1024     /* default: 64 * 1024 */
                }
            );
            new Downloader(opt, ws).download();
        }
    }
    catch(e) {
        console.error(e);
    }
})();

// https://cdn7.dirtyship.net/cdn2/aftyrosesexynightv.mp4
// https://cdn10.dirtyship.net/dirtyship/cdn2/Aftynnursev.mp4
// https://cdn7.dirtyship.net/cdn2/aftyngfneedsattv.mp4

