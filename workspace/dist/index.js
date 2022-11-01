"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const URL = __importStar(require("url"));
const http_1 = require("./http");
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
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const urls = [
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
            for (const url of urls) {
                const u = URL.parse(url);
                const opt = {
                    host: u.host,
                    path: u.pathname,
                    protocol: u.protocol,
                    method: "GET",
                    headers: {
                        referer: "https://dirtyship.com/"
                    }
                };
                const ws = fs.createWriteStream(path.join(__dirname, path.basename(u.pathname)), {
                    encoding: 'binary',
                    autoClose: true,
                    emitClose: true,
                    // highWaterMark: 1024     /* default: 64 * 1024 */
                });
                new http_1.Downloader(opt, ws).download();
            }
        }
        catch (e) {
            console.error(e);
        }
    });
})();
// https://cdn7.dirtyship.net/cdn2/aftyrosesexynightv.mp4
// https://cdn10.dirtyship.net/dirtyship/cdn2/Aftynnursev.mp4
// https://cdn7.dirtyship.net/cdn2/aftyngfneedsattv.mp4
