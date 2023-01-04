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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var puppeteer = __importStar(require("puppeteer"));
var Navigation_1 = require("./Navigation");
var target_1 = require("./target");
var initialize = function (browser) { return __awaiter(void 0, void 0, void 0, function () {
    var page;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, browser.pages()];
            case 1:
                page = (_a.sent())[0];
                if (!page)
                    throw new Error("Cannot find first tab of browser");
                return [4 /*yield*/, page.setViewport({ width: 1920, height: 1080 })];
            case 2:
                _a.sent();
                return [2 /*return*/, page];
        }
    });
}); };
var browserOptions = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150,
};
(function () {
    return __awaiter(this, void 0, void 0, function () {
        var browser, page, navigator_1, navigateResult, _i, navigateResult_1, r, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch(browserOptions)];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, initialize(browser)];
                case 2:
                    page = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 6, 8, 11]);
                    // await login(page, 
                    //     {
                    //         username: "",
                    //         password: ""
                    // });
                    return [4 /*yield*/, (0, target_1.createWorkerSession)(page)];
                case 4:
                    // await login(page, 
                    //     {
                    //         username: "",
                    //         password: ""
                    // });
                    _a.sent();
                    navigator_1 = new Navigation_1.Navigation();
                    navigator_1.resetFilter(
                    // failed: フルURL
                    // function filter(res: puppeteer.HTTPResponse) {
                    //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A?word=%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A&order=date_d&mode=all&p=1&s_mode=s_tag&type=all&lang=ja");
                    // }
                    // failed:
                    // function filter(res: puppeteer.HTTPResponse) {
                    //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
                    // }
                    // failed: short url ver and arrow function
                    // (res: puppeteer.HTTPResponse) => {
                    //     return res.status() === 200 && res.url().includes("https://www.pixiv.net/ajax/search/artworks/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A");
                    // }
                    // NOTE: `puppeteerはfetch requestを傍受できない問題`
                    function (res) {
                        return res.status() === 200 && res.url().includes("https://www.pixiv.net/");
                    });
                    // navigator.resetFilter(
                    //     function (res: puppeteer.HTTPResponse) {
                    //         return res.status() === 200;
                    //     }
                    // )
                    // DEBUG:検証１ page.on()でfetch requestを傍受できるのかやってみる
                    // 結果、fetch requestは傍受できなかった
                    // page.on('request', (e: puppeteer.HTTPRequest) => {
                    //     console.log("page.on request");
                    //     if(e.url().includes("www.pixiv.net/ajax/search/artworks/")){
                    //         console.log(e);
                    //     }
                    // });
                    console.log("navigating...");
                    return [4 /*yield*/, navigator_1.navigateBy(page, page.goto("https://www.pixiv.net/tags/%E3%82%AC%E3%83%AB%E3%83%91%E3%83%B310000users%E5%85%A5%E3%82%8A/artworks?p=1&s_mode=s_tag", { waitUntil: ["load", "networkidle2"] }))];
                case 5:
                    navigateResult = _a.sent();
                    console.log("navigation has been done.");
                    for (_i = 0, navigateResult_1 = navigateResult; _i < navigateResult_1.length; _i++) {
                        r = navigateResult_1[_i];
                        console.log(r);
                        console.log(r.url());
                        console.log(r.status());
                    }
                    return [3 /*break*/, 11];
                case 6:
                    e_1 = _a.sent();
                    return [4 /*yield*/, page.screenshot({ type: "png", path: "./dist/error.png" })];
                case 7:
                    _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 11];
                case 8:
                    console.log("Close page and browser instances.");
                    return [4 /*yield*/, page.close()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, browser.close()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
})();
