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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = void 0;
// Default settings for page.waitFor methods
var defaultOptions = { waitUntil: ["load", "domcontentloaded"] };
var defaultWaitForResponseFilter = function (res) { return res.status() === 200; };
/***
 *
 *
 * UPDATED: 2022/10/11
 * Refactored that Navigation is able to run without Page instance.
 * Page instance is only required when run navigate() or navigateBy().
 *
 * */
var Navigation = /** @class */ (function () {
    function Navigation() {
        this.waitForOptions = defaultOptions;
        this.filter = defaultWaitForResponseFilter;
        this.tasks = [];
        this.push = this.push.bind(this);
        this.navigateBy = this.navigateBy.bind(this);
        this.navigate = this.navigate.bind(this);
    }
    ;
    Navigation.prototype.push = function (task) {
        this.tasks.push(task);
    };
    ;
    Navigation.prototype.resetFilter = function (filter) {
        this.filter = filter;
    };
    Navigation.prototype.resetWaitForOptions = function (options) {
        this.waitForOptions = options;
    };
    /******
     * Navigate by trigger and execute tasks.
     *
     *
     * */
    Navigation.prototype.navigate = function (page, trigger) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], this.tasks, true), [
                            page.waitForResponse(this.filter),
                            page.waitForNavigation(this.waitForOptions),
                            trigger
                        ], false))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ;
    /***
     * navigate that doesn't run `this.tasks`.
     * */
    Navigation.prototype.navigateBy = function (page, trigger) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            page.waitForResponse(this.filter),
                            page.waitForNavigation(this.waitForOptions),
                            trigger
                        ])];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ;
    return Navigation;
}());
exports.Navigation = Navigation;
;
// 一時的に退避。
// Navigationをpageインスタンスに因らないように作り変えてみる
// 
// /****
//  * Navigation class
//  * 
//  * @constructor
//  * @param {puppeteer.Page} page - puppeteer page instance.
//  * @param {() => Promise<any>} trigger - Asychronous function taht triggers navigation.
//  * @param {puppeteer.WaitForOptions} [options] - Options for page.waitForNavigation.
//  * 
//  * 
//  * Usage:
//  * ```
//  * navigate.resetWaitForResponse(page.waitForResponse(...));
//  * navigate.resetWaitForNavigation(page.waitForNavigation(...));
//  * navigate.push([...taskPromises]);
//  * const [responses] = await navigate(function() {return page.click(".button");});
//  * const [responses] = await navigateBy(function() {return page.click(".button");});
//  * const [responses] = await navigateBy(function() {return page.keyboard.press("Enter");});
//  * // Page transition has been completed...
//  * ```
//  * 
//  * */ 
// export class Navigation {
//     private tasks: Promise<any>[];
//     private waitForNavigation: Promise<puppeteer.HTTPResponse | null>;
//     private waitForResponse: Promise<puppeteer.HTTPResponse>;
//     constructor(
//         page: puppeteer.Page
//         ) {
//             this.waitForNavigation = page.waitForNavigation(defaultOptions);
//             this.waitForResponse = page.waitForResponse(defaultWaitForResponseCallback);
//             this.tasks = [];
//             this.push = this.push.bind(this);
//             this.navigateBy = this.navigateBy.bind(this);
//             this.navigate = this.navigate.bind(this);
//     };
//     push(task: Promise<any>): void {
//         this.tasks.push(task);
//     };
//     resetWaitForResponseCallback(cb: Promise<puppeteer.HTTPResponse>): void {
//         this.waitForResponse = cb;
//     };
//     resetWaitForNavigation(p: Promise<puppeteer.HTTPResponse | null>): void {
//         this.waitForNavigation = p;
//     };
//     /******
//      * Navigate by trigger and execute tasks.
//      * 
//      * 
//      * */ 
//     async navigate(trigger: () => Promise<void>): Promise<(puppeteer.HTTPResponse | any)[]> {
//         return await Promise.all([
//             ...this.tasks,
//             this.waitForResponse,
//             this.waitForNavigation,
//             trigger()
//         ]);
//     };
//     /***
//      * Bit faster than navigate()
//      * navigate()とほぼ変わらないし影響もしないからいらないかも。
//      * 
//      * 10/2: trigger: () => Promise<void>をtrigger: () => Promise<any>にした
//      * */ 
//     async navigateBy(trigger: () => Promise<any>): Promise<(puppeteer.HTTPResponse | any)[]> {
//         return await Promise.all([
//             this.waitForResponse,
//             this.waitForNavigation,
//             trigger()
//         ]);
//     };
// };
