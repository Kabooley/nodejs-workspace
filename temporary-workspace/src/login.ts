8/*************************************************************
 * Login component
 *
 * ***********************************************************/
import * as puppeteer from 'puppeteer';

const selectors = {
    usernameForm:'input[autocomplete="username"].sc-bn9ph6-6.degQSE',
    passwordForm: 'input[autocomplete="current-password"].sc-bn9ph6-6.hfoSmp',
    loginButton: 'button[type="submit"].sc-bdnxRM.jvCTkj.sc-dlnjwi.pKCsX.sc-2o1uwj-7.fguACh.sc-2o1uwj-7.fguACh',
    searchBox: "input",
    nextPage: "div.sc-l7cibp-3.gCRmsl nav.sc-xhhh7v-0.kYtoqc a:last-child"

} as const;

const urlLoggedIn: string = "https://www.pixiv.net/";
const url: string = "https://accounts.pixiv.net/login?return_to=https%3A%2F%2Fwww.pixiv.net%2F&lang=ja&source=accounts&view_type=page&ref=";
const typeOptions = { delay: 100 };


export const login = async (page: puppeteer.Page, 
    {username, password}: {username: string, password: string}
    ): Promise<void> => {
    try {
        console.log('Logging in...')
        await page.goto(url, { waitUntil: "domcontentloaded" });

        console.log('Typing...')
        // Fill login form.
        await page.type(selectors.usernameForm, username, typeOptions);
        await page.type(selectors.passwordForm, password, typeOptions);

        // Click login and wait until network idle.
        const [response] = await Promise.all([
            page.waitForNavigation({ waitUntil: ["networkidle2"] }),
            page.click(selectors.loginButton)
        ]);

        if(!response || response.url() !== urlLoggedIn && response.status() !== 200 || !response.ok())
        throw new Error('Failed to login');

        console.log(response.headers());
        console.log("Logged in successfully");
    }
    catch(e) {
        // DEBUG: take screenshot to know what happened
        await page.screenshot({type: "png", path: "./dist/errorLoggingIn.png"});
        throw e;
    }
};



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