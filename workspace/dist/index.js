"use strict";
// /*****
//  * Readable streamの挙動を確認するプログラム
//  * 
//  * 
//  * */ 
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_https_1 = __importDefault(require("node:https"));
const path = __importStar(require("node:path"));
const fspromises = __importStar(require("node:fs/promises"));
const url = "https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png";
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
const pngDownloader = (dir, filename) => {
    node_https_1.default.get(url, (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        let error;
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                `Status Code: ${statusCode}`);
        }
        else if (contentType !== undefined && !/^image\/png/.test(contentType)) {
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
            catch (e) {
                console.error(e);
            }
        });
    }).on('error', (e) => {
        console.error(e);
    });
};
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
const _mkdir = (dirname) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fspromises.mkdir(path.join(__dirname, dirname), { recursive: true });
        console.log("mkdir complete");
    }
    catch (e) {
        console.error(e);
    }
});
const _writeFile = (to, filename, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fspromises.writeFile(path.join(to, filename), data, {
            encoding: "binary"
        });
    }
    catch (e) {
        console.error(e);
    }
});
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield _mkdir("out");
        pngDownloader(path.join(__dirname, "out"), "cat.png");
    });
})();
