// const https = require("https");
const path = require("path");

import https from "https";

const options = {
    hostname: 'raw.githubusercontent.com',
    method: 'GET',
    path: '/wiki/Microsoft/DirectXTK/images/cat.png'
};

let body = '';

// req: ClientRequest
const req = https.request(options, (res) => {
    console.log(`Status Code:${res.statusCode}`);
    console.log(`Headers: ${res.headers}`);

    res.on('data', (d) => {
        // write to somewhere
    })
})

req.on('error', (e) => {
    console.error(e);
})
req.write(chunk, (e) => {

});
req.end();