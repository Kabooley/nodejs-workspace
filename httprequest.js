const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;
const https = require("https");
const yargs = require("yargs/yargs")(process.argv.slice(2));

// -- sample ------------------------------
// const options = {
//   hostname: "encrypted.google.com",
//   port: 443,
//   path: "/",
//   method: "GET",
// };

// const req = https.request(options, (res) => {
//   console.log("statusCode:", res.statusCode);
//   console.log("headers:", res.headers);

//   res.on("data", (d) => {
//     process.stdout.write(d);
//   });
// });

// req.on("error", (e) => {
//   console.error(e);
// });
// req.end();

const commands = {};
yargs.command({
  command: "get-image",
  describe: "get image/png",
  builder: {
    filename: {
      describe: "file name",
      demandOption: true,
      type: "string",
    },
  },
  handler: (argv) => {
    commands.filename = argv.filename;
  },
}).argv;

const options = {
  url:
    "https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png",
  method: "GET",
};

const httpsRequest = (filename) => {
  const req = https.request(options, (res) => {
    const { statusCode } = res;
    const contentType = res.headers["content-type"];

    console.log(contentType);

    // image/png以外かチェックする
    let error;
    if (statusCode !== 200) {
      error = new Error("Request Failed.\n" + `Status Code: ${statusCode}`);
    }
    if (error) {
      console.error(error.message);
      res.resume();
      return;
    } else if (!/^image\/png/.test(contentType)) {
      error = new Error(
        "Invalid content-type.\n" +
          `Expected image/png but received ${contentType}`
      );
    }

    // image/png
    console.log(contentType);

    // mkdir and touch file
    fs.mkdir(path.join(__dirname, "out"), { recursive: true }).catch((e) => {
      console.error(e);
    });

    //
    res.setEncoding("utf8");
    const dest = fs.createWriteStream(path.join(__dirname, "out", filename));
    res.on("data", (chunk) => {
      dest.write(chunk, () => {
        console.log("write completed");
      });
    });
    res.on("end", () => {
      console.log("response stream reading is end");
    });
    res.on("error", (err) => {
      console.error(err);
      dest.destroy(err);
    });
  });

  req.on("error", (e) => console.error(e));
  req.end();
};

httpsRequest(commands.filename);
