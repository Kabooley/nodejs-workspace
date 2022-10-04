"use strict";
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
        while (_) try {
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
exports.__esModule = true;
/**************************************************************
 * TEST: Make sure promise.all returns what I expected array of HTTPResponses.
 *
 * TODO: HTTPResponseにbodyにデータがあるのかどうかの調査をどうやって実装すればいいのか
 * TODO:
 *
 * 健全artworkページにgoto()してそのレスポンスを調べよう。
 * ************************************************************/
var puppeteer = require("puppeteer");
var initialize_1 = require("../helper/initialize");
var Navigation_1 = require("../components/Navigation");
var browser;
var page;
var navigation;
var options = {
    headless: true,
    args: ['--disable-infobars'],
    userDataDir: "./userdata/",
    handleSIGINT: true,
    slowMo: 150
};
var url = "https://www.pixiv.net/artworks/39189162";
var httpResponseFilter = function (r) {
    console.log(r.url());
    console.log(r.status());
    // そもそもこのＵＲＬ指定が間違っているかも...
    return r.status() === 200 && r.url().includes(url);
};
(function (browser, page, navigation) {
    return __awaiter(this, void 0, void 0, function () {
        var result, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, 5, 10]);
                    return [4 /*yield*/, puppeteer.launch(options)];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, (0, initialize_1.initialize)(browser)];
                case 2:
                    page = _a.sent();
                    if (!page && page !== undefined)
                        throw new Error("Page is not generated.");
                    navigation = new Navigation_1.Navigation(page);
                    navigation.resetWaitForResponseCallback(page.waitForResponse(httpResponseFilter));
                    return [4 /*yield*/, navigation.navigateBy(function () {
                            return page.goto(url);
                        })];
                case 3:
                    result = _a.sent();
                    result.forEach(function (r) {
                        (function () {
                            return __awaiter(this, void 0, void 0, function () {
                                var _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            if (!(r !== undefined && r && typeof r["json"] !== "function")) return [3 /*break*/, 2];
                                            // HTTPResponse.json() throw Error if response body is not parsable by `JSON.parse()` 
                                            // 
                                            // JSON.parse()は引数が有効なJSONデータでない場合に
                                            // SyntaxErrorを投げる
                                            _b = (_a = console).log;
                                            return [4 /*yield*/, r.json()];
                                        case 1:
                                            // HTTPResponse.json() throw Error if response body is not parsable by `JSON.parse()` 
                                            // 
                                            // JSON.parse()は引数が有効なJSONデータでない場合に
                                            // SyntaxErrorを投げる
                                            _b.apply(_a, [_c.sent()]);
                                            _c.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            });
                        })();
                    });
                    return [3 /*break*/, 10];
                case 4:
                    e_1 = _a.sent();
                    return [3 /*break*/, 10];
                case 5:
                    if (navigation !== undefined) {
                        navigation = undefined;
                    }
                    if (!(page !== undefined)) return [3 /*break*/, 7];
                    return [4 /*yield*/, page.close()];
                case 6:
                    _a.sent();
                    page = undefined;
                    _a.label = 7;
                case 7:
                    ;
                    if (!(browser !== undefined)) return [3 /*break*/, 9];
                    return [4 /*yield*/, browser.close()];
                case 8:
                    _a.sent();
                    browser = undefined;
                    _a.label = 9;
                case 9:
                    ;
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
})(browser, page, navigation);
