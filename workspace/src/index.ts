import * as fs from 'fs';

const p = "./../temp.json";


(function() {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    // fs.writeFile("artworkpage-preload-data.txt", data, (err) => {
    //     console.error(err);
    // });
    console.log(data);
})();