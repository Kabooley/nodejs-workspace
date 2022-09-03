# Puppeteerでwebscrapingすっぞ

## 目次

## chromium起動できない問題

puppeteerインストール直後、サンプルプログラムを動かして正常動作するか確認しようとしたところ...

```bash
$ ts-node src/index.ts
Error: Failed to launch the browser process!
/home/teddy/nodejs/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome: error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file: No such file or directory


TROUBLESHOOTING: https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md

    at onClose (/home/teddy/nodejs/web-scrape/node_modules/puppeteer/src/node/BrowserRunner.ts:306:9)
    at Interface.<anonymous> (/home/teddy/nodejs/web-scrape/node_modules/puppeteer/src/node/BrowserRunner.ts:292:16)
    at Interface.emit (node:events:539:35)
    at Interface.emit (node:domain:475:12)
    at Interface.close (node:readline:586:8)
    at Socket.onend (node:readline:277:10)
    at Socket.emit (node:events:539:35)
    at Socket.emit (node:domain:475:12)
    at endReadableNT (node:internal/streams/readable:1345:12)
    at processTicksAndRejections (node:internal/process/task_queues:83:21)
```

ということで、

`/home/teddy/nodejs/web-scrape/node_modules/puppeteer/.local-chromium/linux-1036745/chrome-linux/chrome`が存在するのは確認した。

`libatk-1.0.so.0`というファイルだかが存在するのか調査に間れしてみてググってみたら

https://dev.to/chis0m/installing-puppeteer-on-an-ubuntu-aws-ec2-instance-5o7

とりあえず以下のライブラリが必要になるからインストールするといい。

```bash
sudo apt update && sudo apt install -y gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget

```

結果サンプルプログラムは正常に実行できた。

## モジュール解決がうまくいかない

```TypeScript
import puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({path: 'example.png'});
  
    await browser.close();
  })();
```

```bash
 ts-node src/index.ts
/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:43192
        ts.Debug.assert(typeof typeReferenceDirectiveName === "string", "Non-string value passed to `ts.resolveTypeReferenceDirective`, likely by a wrapping package working with an outdated `resolveTypeReferenceDirectives` signature. This is probably not a problem in TS itself.");
                 ^
Error: Debug Failure. False expression: Non-string value passed to `ts.resolveTypeReferenceDirective`, likely by a wrapping package working with an outdated `resolveTypeReferenceDirectives` signature. This is probably not a problem in TS itself.
    at Object.resolveTypeReferenceDirective (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:43192:18)
    at /mnt/c/Users/yashi/AppData/Roaming/npm/node_modules/ts-node/src/resolver-functions.ts:131:51
    at Array.map (<anonymous>)
    at Object.resolveTypeReferenceDirectives (/mnt/c/Users/yashi/AppData/Roaming/npm/node_modules/ts-node/src/resolver-functions.ts:130:31)
    at actualResolveTypeReferenceDirectiveNamesWorker (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:118205:163)
    at resolveTypeReferenceDirectiveNamesWorker (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:118505:26)
    at processTypeReferenceDirectives (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:120002:31)
    at findSourceFileWorker (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:119887:21)
    at findSourceFile (/home/teddy/nodejs/web-scrape/node_modules/typescript/lib/typescript.js:119739:26)
```

これはTypeScriptの問題ではない可能性が高いですとのこと。

tsconfig.jsonのモジュールの指定と、ファイルに記述するモジュールインポート記述が一致していないのかも。

ts-nodeじゃなくてtscしてみた。

```bash
tsc src/index.ts
node_modules/puppeteer/lib/types.d.ts:33:5 - error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.

33     #private;
       ~~~~~~~~

node_modules/puppeteer/lib/types.d.ts:167:5 - error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.

167     #private;
        ~~~~~~~~

node_modules/puppeteer/lib/types.d.ts:367:5 - error TS18028: Private identifiers are only available when targeting ECMAScript 2015 and higher.

367     #private;

# 以下略
```

どうやら`target: es6`じゃないから解決しないよみたいなことを言っている。

`"target": "es5"`だったので"es6"にした。

```JSON
{
    {
        "target": "es6",

    }
}
```


```bash
$ tsc index.ts
# 先と同じエラーが発生
# tsconfig.jsonを変更したのに反映されないのか、誤ったプロパティを変更したのか...

# 強制的に指定する
# -tでtargetの指定。
$ tsc index.ts -t es6
index.ts:1:1 - error TS1202: Import assignment cannot be used when targeting ECMAScript modules. Consider using 'import * as ns from "mod"', 'import {a} from "mod"', 'import d from "mod"', or another module format instead.

1 import puppeteer = require('puppeteer');
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Found 1 error.
```

上記の通りpuppeteer側のES6構文に対するエラーはなくなって、

モジュール解決のエラーが発生。

`import`文使えだって。

```TypeScript
// 変更した
// import puppeteer = require('puppeteer');
import * as puppeteer from 'puppeteer';
```

```bash
$ tsc index.ts -t es6
# 正常にコンパイル完了

# 出来上がったファイルを実行してみると...
$ node index.js
(node:10398) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
(Use `node --trace-warnings ...` to show where the warning was created)
/home/teddy/nodejs/web-scrape/src/index.js:11
import * as puppeteer from 'puppeteer';
^^^^^^

SyntaxError: Cannot use import statement outside a module
    at Object.compileFunction (node:vm:352:18)
    at wrapSafe (node:internal/modules/cjs/loader:1033:15)
    at Module._compile (node:internal/modules/cjs/loader:1069:27)
    at Object.Module._extensions..js (node:internal/modules/cjs/loader:1159:10)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:77:12)
    at node:internal/main/run_main_module:17:47
```

お前が実行しようとしたファイルはモジュールだから、

package.jsonを`"type": "module" `に変更しろ、もしくは拡張子を`.mjs`にしろ

とのこと。

多分CommonJS文法でないと受け付けないんだと思う。

う～ん面倒。

TypeScriptファイルではES6で書いて、ターゲットもES6と認識させて、出力ファイルはCommonJSで出力できないのかしら。

はぁ面倒。

## モジュール解決がうまくいかない: tsconfigをいじる

#### "module"

https://www.typescriptlang.org/ja/tsconfig#module

コンパイル後に出力されるJavaScriptファイルが採用することになるモジュール規格。

`"module": "commonjs"`がデフォルトで推奨。

これが適用される場合、

```TypeScript
// @filename: index.ts
import { valueOfPi } from "./constants";
 
export const twoPi = valueOfPi * 2;
```
上記をコンパイルすると、以下が出力される。

```JavaScript
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.twoPi = void 0;
const constants_1 = require("./constants");
exports.twoPi = constants_1.valueOfPi * 2;
```

つまりTypeScriptでECMAScriptモジュールで書いていても、出力ファイルはCommonJSに変換してくれる。

#### "target"

https://www.typescriptlang.org/tsconfig#target

#### "rootDir"

#### "outDir"
