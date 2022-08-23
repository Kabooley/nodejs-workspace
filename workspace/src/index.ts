"use strict";
import * as fs from "node:fs";

function loadModule(filename: string, module: any, require: any): void {
    const wrappedSrc: string = `
    (function(module, exports, require){
        ${fs.readFileSync(filename, 'utf8')}
    })(module, module.exports, require);`;
    eval(wrappedSrc);
}


