import * as puppeteer from 'puppeteer';

/**
 * https://chromedevtools.github.io/devtools-protocol/tot/Target/
 * 
 * https://chromedevtools.github.io/devtools-protocol/tot/Network/
 * 
 * */ 
export const createWorkerSession = async (page: puppeteer.Page) => {
    try {
        console.log("create session with CDP");

        // Chrome Dev Toolsとのセッションを開きます
        const client = await page.target().createCDPSession();
        // Dev ToolsのNetworkを有効化します
        await client.send("Network.enable");
        // サービスワーカへのバイパスを有効化します
        await client.send("Network.setBypassServiceWorker", { bypass: true });

        client.on('Network.targetCreated', () => console.log("Network.targetCreated"));
        client.on('Network.targetCrashed', () => console.log("Network.targetCrashed"));
        client.on('Network.targetDestroyed', () => console.log("Network.targetDestroyed"));
        client.on('Network.receiveMesageFromTarget', () => console.log("Network.receiveMesageFromTarget"));
        client.on("request", (r: puppeteer.HTTPRequest) => {
            console.log(r.url());
        });

        console.log("session has been created");
    }
    catch(e) {
        throw e;
    }
    // finally {

    // }
};