"use strict";
exports.__esModule = true;
var fs = require("fs");
var p = "./../temp.json";
(function () {
    var data = JSON.parse(fs.readFileSync(p, 'utf8'));
    // fs.writeFile("artworkpage-preload-data.txt", data, (err) => {
    //     console.error(err);
    // });
    console.log(data);
})();
