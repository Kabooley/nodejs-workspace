/*****************************
 * 
 * NOTE: pageの参照カウント
 * 
 * loginページへ行く
 * ログイン要素の取得：Page.evaluate()でawaitを減らす
 * 
 * **************************/
import type puppeteer from 'puppeteer';

// const url: string = "https://accounts.pixiv.net/";
const url: string = "https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2F&lang=ja&source=accounts&view_type=page&ref=";
// const url: string = "https://www.pixiv.net/";

// NOTE: Basic認証で突破することを試みる
export async function login(
    page: puppeteer.Page, 
    {username, password}: {username: string, password: string}
    ) {

        console.log(`Logging in...with ${username} ${password}`);
    try {
        await page.authenticate({username: username, password: password});
        // await page.goto(url, { waitUntil: "domcontentloaded" });
        await page.goto(url);
        await page.waitForNavigation({ waitUntil: ["networkidle2"] });
    }
    catch(e) {
        throw e;
    }
}

// DOMを取得してこねこねしてログインする方法
// 
// const loginByDOM = async function(page: puppeteer.Page, 
//     {username, password}: {username: string, password: string}
//     ) {
//     try {
//         await page.goto(url, { waitUntil: "domcontentloaded" });

//         // Get login and password form dom
//         const [$username, $password, $login] = await page.evaluate(() => {
//             const $username = document.querySelector('');
//             const $password = document.querySelector('');
//             const $login = document.querySelector('');
//             if(!$username || !$login || !$password) throw new Error('DOM: username or password or login-button were not found');
            
//             return [$username, $password, $login];
//         });
        
//         // Fill login form.
//         // Or use page.type()
//         $username.value = username;
//         $password.value = password;

//         // 
//       await Promise.all([
//         page.waitForNavigation({ waitUntil: ["networkidle2"] }),
//         page.click(),
//       ]);
//     }
//     catch(e) {
//         console.error(e);
//     }
// }