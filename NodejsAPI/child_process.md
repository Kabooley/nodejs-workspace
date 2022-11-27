# Note: Node.js child process

https://nodejs.org/api/child_process.html

## 目次



## 公式

`spawn`: 産みつける　卵（名詞）

> node:child_process モジュールは popen(3) と似ていますが同じではない方法でサブプロセスを生成する機能を提供します。この機能は主に child_process.spawn() 関数によって提供されます。

要はプログラム内で「コマンド」を実行して、そのコマンドのプロセスを子プロセスとして生成して制御する仕組みのこと。

プログラマティックにコマンドを実行できるので自動コマンドを組める。

以下は`ls -lh ./usr`を子プロセスとして生成して実行している。

```JavaScript
const { spawn } = require('node:child_process');
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

> デフォルトで、`stdin``stodout``stderr`へのパイプは親Node.jsプロセスと生成されたサブプロセスとの間に生成される。

> これらのパイプはキャパシティに制限がある。

>  もしサブプロセスが出力をキャプチャせずにその制限を越えて標準出力に書き込んだ場合、サブプロセスはパイプバッファがより多くのデータを受け入れるのを待つためにブロックされます。これは、シェルにおけるパイプの動作と同じです。stdio: 出力が消費されない場合は、'ignore' } オプションを使用します。

> コマンドの検索は、options オブジェクトに env がある場合は options.env.PATH 環境変数を使用して行われます。そうでない場合は、process.env.PATH が使用されます。options.env に PATH が設定されていない場合、Unix では /usr/bin:/bin のデフォルトの検索パス検索が行われ (execvpe/execvp についてはオペレーティングシステムのマニュアルを参照してください)、Windows では現在のプロセス環境変数 PATH が使用されます。

> child_process.spawn() メソッドは、Node.js のイベントループをブロックせずに、非同期に子プロセスを生成します。child_process.spawnSync() 関数は、生成されたプロセスが終了するか、終了するまでイベントループをブロックする同期的な方法で同等の機能を提供します。

> シェルスクリプトの自動化など、特定のユースケースでは、同期型の方が便利な場合があります。しかし、多くの場合、同期メソッドは、生成されたプロセスが完了するまでの間、イベントループを停止させるため、パフォーマンスに大きな影響を与える可能性があります。

#### 非同期プロセス生成

> `child_process.spawn()`, `cihld_process.fork()`, `child_process.exec()`, `child_process.execFile()`メソッドは特にNode.jsの非同期プログラミングパターンの文法に従います。

> いずれのプロセスもchildprocessインスタンスを返します。これらのオブジェクトはNode.jsの`EventEmitter`APIを実装し、子プロセスのライフサイクル中に発生するイベントに対するリスナを親プロセスが追加することを許します。

#### `child_process.spawn()`

https://nodejs.org/api/child_process.html#child_processspawncommand-args-options


## 実践

https://devforth.io/blog/how-to-simply-workaround-ram-leaking-libraries-like-puppeteer-universal-way-to-fix-ram-leaks-once-and-forever/

やりたいことはメモリリークの防止で、

メモリリーク発生させるマンのpuppeteerを子プロセスで実行させることでメモリリークを抑える。

