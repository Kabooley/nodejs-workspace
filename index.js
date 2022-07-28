const fsp = require("fs").promises;
const fs = require("fs");
const path = require("path");

const _mkdir = async (to) => {
  await fsp.mkdir(to, { recursive: true });
};

const _findFiles = async (from) => {
  const foundFiles = [];

  const findFiles = async (from) => {
    const items = await fsp.readdir(from, { withFileTypes: true });
    for (item of items) {
      if (item.isDirectory()) {
        findFiles(`${from}/${item.name}`);
      } else {
        if (
          path.extname(item.name) === ".png" ||
          path.extname(item.name) === ".jpg" ||
          path.extname(item.name === "jpeg")
        ) {
          foundFiles.push(path.join(from, item.name));
        }
      }
    }
  };

  await findFiles(from);
  return foundFiles;
};

// 実現したいこと
// 画像ファイルをストリームで読み込んで
// ストリームで取得したデータが「完成」してから
// ストリームで書き込む
const copyImagesToFolder = async (files, to) => {
  for (file of files) {
    console.log("-----------------------------------------------");
    let data = "";
    const rs = fs.createReadStream(file);
    rs.on("open", () => console.log("open"));
    rs.on("data", (chunk) => {
      // true: chunkはBufferである
      console.log(Buffer.isBuffer(chunk));
      //   object: Bufferだから
      console.log(typeof chunk);
      console.log(`Received ${chunk.length} bytes of data.`);
      data += chunk;
    });
    rs.on("end", () => {
      console.log("end reading");
      //   String
      console.log(typeof data);
      console.log(data);
    });
  }
};

const reCopyImagesToFolder = async (files, to) => {
  let index = 0;
  for (file of files) {
    index++;
    const filename = file.includes(".png")
      ? `img${index}.png`
      : `img${index}.jpg`;
    const rs = fs.createReadStream(file);
    const ws = fs.createWriteStream(path.join(to, filename));
    rs.pipe(ws);

    // rsで読み取り中に何らかのエラーが発生した場合、
    // wsは自動的に閉じられない（そしてそれは深刻な問題をもたらす）
    // なので手動で閉じなさいとのこと
    rs.on("error", (err) => {
      ws.destroy(err);
      ws.destroy();
      ws.end();
    });
    rs.on("end", () => console.log("ok"));
  }
};

const main = async () => {
  // process.argvは配列を返す
  if (!process.argv.length) {
    console.log("Command line required");
    return;
  }
  // ひとまず画像を読み込んでコピーを作る
  console.log(process.argv);
  const from = path.join(__dirname, process.argv[2]);
  const to = path.join(__dirname, process.argv[2], "out");

  try {
    _mkdir(to);
    const files = await _findFiles(from);
    await reCopyImagesToFolder(files, to);
  } catch (e) {
    console.log(e);
  }
};

main();
