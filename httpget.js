const https = require("https");
const path = require("path");
const fsp = require("fs").promises;
const fs = require("fs");
const yargs = require("yargs/yargs")(process.argv.slice(2));

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

const URL =
  "https://raw.githubusercontent.com/wiki/Microsoft/DirectXTK/images/cat.png";

const pngDownloader = async (url, filename) => {
  https.get(url, (res) => {
    const { statusCode } = res;
    const contentType = res.headers["content-type"];

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
    let rawData = "";
    // 書き込みストリームが破棄されたら"close"イベントを自動で発行するのはデフォルトである
    const dest = fs.createWriteStream(path.join(__dirname, "out", filename));
    res.on("data", (chunk) => {
      //   rawData += chunk;
      // 戻り値をチェックしたいけれど、そもそも「消費」ってどうすればいいの？
      dest.write(chunk, () => {
        console.log("write completed");
      });
    });
    res.on("end", () => {
      console.log("response stream reading is end");
    });
    res.on("error", (err) => {
      console.error(err);
      //   読み取りstreamのほうで何かしらのエラーが起こって閉じた場合、
      // 書き込みstreamは自動で閉じないので手動で閉じる
      dest.destroy(err);
    });
  });
};

pngDownloader(URL, commands.filename);

/*
fs.createWriteStream(path[, options])

	returns : <fs.WriteStream>

	オプションには、ファイルの先頭を過ぎた位置からデータを書き込めるようにするための開始オプションも含まれているかもしれませんが、
	許可される値は[0, Number.MAX_SAFE_INTEGER]の範囲です。
	ファイルを置き換えるのではなく、ファイルを変更する場合は、 flagsオプションをデフォルトのwではなくr+に設定する必要があるかもしれません。 
	エンコーディングは、<Buffer>で受け入れられるもののいずれかにすることができます。
	
	autoClose が 'error' または 'finish' で true (デフォルトの動作) に設定されている場合、
	ファイルディスクリプタは自動的に閉じられます。
	autoClose が false に設定されている場合、
	エラーがあってもファイルディスクリプタは閉じられません。
	ファイルディスクリプタを閉じて、
	ファイルディスクリプタの漏洩がないことを確認するのはアプリケーションの責任です。
	
	デフォルトでは、ほとんどの書き込み可能なストリームのように、
	ストリームが破棄された後に 'close' イベントが発生します。
	この動作を変更するには emitClose オプションを false に設定してください。
	
	fs オプションを指定することで、open, write, writev, close に対応する fs 実装をオーバーライドすることができます。
	writev() を使用せずに write() をオーバーライドすると、いくつかの最適化 (_writev() が無効になるため、パフォーマンスが低下する可能性があります。
	fs オプションを提供する際には、open, close, write, writev のうち少なくとも一つをオーバーライドする必要があります。




	- Event: "close":
	'close'イベントは、ストリームとその基礎となるリソース（ファイル記述子など）が閉じられたときに発行されます。
	このイベントは、これ以上イベントが発行されず、それ以上の計算が行われないことを示します。 
	書き込み可能なストリームは、emitCloseオプションを使用して作成された場合、常に「close」イベントを発行します。

	要は書き込み終了ならば"close"イベントを発行しないといけない（またはされる）
	fs.createWriteStream()でemitCloseオプションはデフォルトでtrueであり、
	これは「ストリームが破棄されたときに"close"イベントを発行するよ」という意味

	- writable.destroy([error]):
	ストリームを破棄する。
	破棄するので"close"イベントを発行する。
	オプションで"error"イベントを発行することができる
	
	writable.destroy()呼出し後、writable streamは終了して
	その後にwriteまたはend(いずれもwritableのメソッド)を呼び出すと、
	ERR_STREAM_DESTROYEDエラーが発生するよ

	以前のwrite（）の呼び出しはドレインされていない可能性があり、
	ERR_STREAM_DESTROYEDエラーをトリガーする可能性があります。

	データを閉じる前にフラッシュする必要がある場合は、
	destroyの代わりにend（）を使用するか、ストリームを破棄する前に「drain」イベントを待ちます。

	- writable.destroyed
	writable.destroy()が呼び出された後だとtrueになる

	- writable.end([chunk[, encoding[, callback]]]):

		chunk: 追加で書き込みたいchunkを入れられる。
		encoding: 上のchunkのエンコーディング
		callback: ストリームが完了したときのコールバック

		先の説明ではwritable.destroy()とかではストリームはすぐに閉じて途中のデータは破棄だけど
		end()ではその「途中のデータ」に対して処理を入れられる

		writable.end（）メソッドを呼び出すと、Writableにデータが書き込まれなくなることが通知されます。
		オプションのチャンクとエンコーディング引数を使用すると、
		ストリームを閉じる直前に、データの最後の追加チャンクを1つ書き込むことができます。


	- writable.writable()

		writable.write()を呼び出すのが安全かどうかの確認に使える
		つまり
		streamはdestroyedされておらず、エラーでも終了もしていないことを示す
		(trueで)

	- writable.write()

		returns: boolean　

	データをストリームに書き込む
	データが完全に処理されたらコールバック関数を呼び出す

	戻り値は、要は書き込みを続行していいか停止すべきかのサインである

	そもそもの前提として、読み取り・書き込みのストリームは各々取得したデータを内部バッファに一旦入れる。
	内部バッファがhighwatermarkの閾値に達した場合、
	ストリームは現在バッファーに入れられているデータが「消費」されるまで
	データの読み取り・書き込みを一時的に停止する。

		true: 内部バッファがhighwatermarkより小さい --> 書き込み続行
		false: "drain"イベントが発行されるまで、つまり内部バッファのデータが消費されるまで書き込みが停止する
			(内部バッファのデータが消費されたら"drain"イベントが発行されて、また書き込みが開始される)

		ということで一度でもwritable.write()からfalseが返されたら必ず書き込みは一時停止すべし
	読み取りまたは書き込みstreamの内部バッファがそれぞれ閾値に達する時間が同じとは限らないので
	ずれが生じるのであろうことは想像つく


	まとめ

	writable.end()とwritable.destroy()はどちらも書き込みstreamを破棄するよ
	前者は追加のchunkを任意に書き込んでから破棄できるよ
	後者はただ破棄するよ（エラーイベント発行できるけど）
	いずれも呼出し後に"close"イベントを発行するよ

	writable.writeはtrueかfalseを返すよ
	trueなら書き込むデータをストリームにおくり続けるよ（内部バッファに入れ続けるよ）
	falseなら内部バッファがいっぱいだから、内部バッファに入れたデータが消費されるまで一時停止することが推奨されるよ
	そもそもストリームは内部バッファが適切に消費されない限り書き込み・読み取りは一時停止するので
	falseが返されないか監視することと
	falseが返されたときに内部バッファをちゃんと消費すること

	内部バッファが消費されたら"drain"イベントが発行され、writable.write()は書き込みを再開する


*/
