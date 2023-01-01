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
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
8; /*************************************************************
 * Login component
 *
 * ***********************************************************/
var selectors = {
    usernameForm: 'input[autocomplete="username"].sc-bn9ph6-6.degQSE',
    passwordForm: 'input[autocomplete="current-password"].sc-bn9ph6-6.hfoSmp',
    loginButton: 'button[type="submit"].sc-bdnxRM.jvCTkj.sc-dlnjwi.pKCsX.sc-2o1uwj-7.fguACh.sc-2o1uwj-7.fguACh',
    searchBox: "input",
    nextPage: "div.sc-l7cibp-3.gCRmsl nav.sc-xhhh7v-0.kYtoqc a:last-child"
};
var urlLoggedIn = "https://www.pixiv.net/";
var url = "https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2F&lang=ja&source=accounts&view_type=page&ref=";
var typeOptions = { delay: 100 };
var login = function (page, _a) {
    var username = _a.username, password = _a.password;
    return __awaiter(void 0, void 0, void 0, function () {
        var response, e_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 7]);
                    console.log('Logging in...');
                    return [4 /*yield*/, page.goto(url, { waitUntil: "domcontentloaded" })];
                case 1:
                    _b.sent();
                    console.log('Typing...');
                    // Fill login form.
                    return [4 /*yield*/, page.type(selectors.usernameForm, username, typeOptions)];
                case 2:
                    // Fill login form.
                    _b.sent();
                    return [4 /*yield*/, page.type(selectors.passwordForm, password, typeOptions)];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, Promise.all([
                            page.waitForNavigation({ waitUntil: ["networkidle2"] }),
                            page.click(selectors.loginButton)
                        ])];
                case 4:
                    response = (_b.sent())[0];
                    if (!response || response.url() !== urlLoggedIn && response.status() !== 200 || !response.ok())
                        throw new Error('Failed to login');
                    console.log(response.headers());
                    console.log("Logged in successfully");
                    return [3 /*break*/, 7];
                case 5:
                    e_1 = _b.sent();
                    // DEBUG: take screenshot to know what happened
                    return [4 /*yield*/, page.screenshot({ type: "png", path: "./dist/errorLoggingIn.png" })];
                case 6:
                    // DEBUG: take screenshot to know what happened
                    _b.sent();
                    throw e_1;
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.login = login;
// --- LEGACY ---
// 
// // ver.1
// export const login = async (page: puppeteer.Page, 
//     {username, password}: {username: string, password: string}
//     ): Promise<void> => {
//     try {
//         console.log('Logging in...')
//         await page.goto(url, { waitUntil: "domcontentloaded" });
//         // This may not necessary. After all page.type and page.click will throw error if the selector does not match anything.
//         // 
//         // Make sure required DOM is exists
//         await page.evaluate((selectors) => {
//             const $username: HTMLInputElement | null = document.querySelector<HTMLInputElement>(selectors.usernameForm);
//             const $password: HTMLInputElement | null = document.querySelector<HTMLInputElement>(selectors.passwordForm);
//             const $login: HTMLElement | null = document.querySelector<HTMLElement>(selectors.loginButton);
//             if(!$username || !$login || !$password) throw new Error('DOM: username or password or login-button were not found');
//         }, selectors);
//         console.log('Typing...')
//         // Fill login form.
//         await page.type(selectors.usernameForm, username, typeOptions);
//         await page.type(selectors.passwordForm, password, typeOptions);
//         // Click login and wait until network idle.
//         const [response] = await Promise.all([
//             page.waitForNavigation({ waitUntil: ["networkidle2"] }),
//             page.click(selectors.loginButton)
//         ]);
//         if(!response || response.url() !== urlLoggedIn && response.status() !== 200 || !response.ok())
//         throw new Error('Failed to login');
//         console.log(response.headers());
//         console.log("Logged in successfully");
//     }
//     catch(e) {
//         // DEBUG: take screenshot to know what happened
//         await page.screenshot({type: "png", path: "./dist/errorLoggingIn.png"});
//         throw e;
//     }
// };
// 
// 
// 
// 
// // Basic認証で突破することを試みる...やっぱだめだ
// export async function login(
//     page: puppeteer.Page, 
//     {username, password}: {username: string, password: string}
//     ) {
//         console.log(`Logging in...with ${username} ${password}`);
//     try {
//         await page.authenticate({username: username, password: password});
//         // await page.goto(url, { waitUntil: "domcontentloaded" });
//         await page.goto(url);
//         // NOTE: どうてしても遷移しないらしい。Timeoutになる。
//         await page.waitForNavigation({ waitUntil: ["networkidle2"] });
//         console.log("Logged in");
//     }
//     catch(e) {
//         throw e;
//     }
// }
