const yargs = require("yargs/yargs")(process.argv.slice(2));
const fs = require("fs").promises;
const path = require("path");

const commands = {};

// .argvを付けないといかん
// 詳しくはyargsのapi.md参照
// もしくは
// yargs.parse()をしないといかん
// と覚えておけ
yargs.command({
  command: "mkdir",
  describe: "make new directory",
  builder: {
    dirname: {
      describe: "directory name",
      demandOption: true,
      type: "string",
    },
  },
  handler: (argv) => {
    commands.dirname = argv.dirname;
  },
}).argv;

// recursive: trueの効果を検証する
/**
 * 検証１：下記のコマンドを2回以上実行してエラーが出るか同じ名前のフォルダが作成されるか確認する
 * $ node mkdir.js mkdir --dirname="new-dir"
 *
 * 結果：現在のディレクトリ/new-dirが既に存在すれば作成されないし、エラーも怒らない
 *
 * 検証２：検証1のときにnew-dirにファイルを保存して、もう一度同じコマンドを打ったら、ファイルは消えるか検証
 * 結果：消えない。つまり、既に存在するフォルダを再度作成しようとしていたらその命令は無視されるらしい
 *
 *
 *
 *
 *
 *
 */
const _mkdir = async (dirpath) => {
  await fs.mkdir(dirpath, { recursive: true });
};

const main = async () => {
  if (!Object.keys(commands).length) {
    console.log(
      "'commands' got nothing and you might have typed no command line."
    );
    return;
  }
  const dirpath = path.join(__dirname, commands.dirname);

  try {
    await _mkdir(dirpath);
  } catch (e) {
    console.log(e);
  }
};

main();
