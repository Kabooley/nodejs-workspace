# Note about Node.js debug

結論：ローカルアプリならVSCodeを使ってAutoAttatchが一番楽勝。

クライアント条件下で行うならChrome Devtoolsを検討するばどする。

## 公式 Debugging Getting Started 

https://nodejs.org/en/docs/guides/debugging-getting-started/

要はCLIで`node index.js --inspector`する場合の話。

## `--inspector`を有効にする

> --inspect スイッチで開始すると、Node.js プロセスはデバッグ クライアントをリッスンします。デフォルトでは、ホストとポート 127.0.0.1:9229 でリッスンします。各プロセスには、一意の UUID も割り当てられます。

> Inspector クライアントは、接続するホスト アドレス、ポート、および UUID を認識して指定する必要があります。完全な URL は ws://127.0.0.1:9229/0f2c936f-b1cd-4ac9-aab3-f63b0f33d55e のようになります。 

> Node.js は、SIGUSR1 シグナルを受信すると、デバッグ メッセージのリッスンも開始します。 (SIGUSR1 は Windows では使用できません。) Node.js 7 以前では、これによりレガシー Debugger API がアクティブ化されます。 Node.js 8 以降では、Inspector API を有効にします。

`Inspector client`とは？

#### セキュリティへの影響

> デバッガーは Node.js 実行環境に完全にアクセスできるため、このポートに接続できる悪意のあるアクターは、Node.js プロセスに代わって任意のコードを実行できる可能性があります。パブリックおよびプライベート ネットワークでデバッガー ポートを公開することのセキュリティへの影響を理解することが重要です。

#### デバグポートを公開することは安全ではありません

> デバッガーがパブリック IP アドレスまたは 0.0.0.0 にバインドされている場合、IP アドレスに到達できるすべてのクライアントは、制限なしでデバッガーに接続でき、任意のコードを実行できます。 

> デフォルトでは、node --inspect は 127.0.0.1 にバインドします。デバッガーへの外部接続を許可する場合は、パブリック IP アドレスまたは 0.0.0.0 などを明示的に指定する必要があります。

> これを行うと、潜在的に重大なセキュリティ上の脅威にさらされる可能性があります。セキュリティ上の露出を防ぐために、適切なファイアウォールとアクセス制御を確実に実施することをお勧めします。 リモート デバッガー クライアントの接続を安全に許可する方法については、「リモート デバッグ シナリオの有効化」のセクションを参照してください。

ローカルで行うデバグは関係ないですか？

#### ローカルアプリケーションはインスペクターへフルアクセスできます

> インスペクタ ポートを 127.0.0.1 (デフォルト) にバインドした場合でも、マシン上でローカルに実行されているアプリケーションは無制限にアクセスできます。これは、ローカル デバッガーが便利にアタッチできるようにするための仕様です。

## Inspector Clients

CLIデバッガは`node inspect index.js`で取得することができる。

いくつかの商用またはオープンソースツールNode.jsインスペクターに接続できる。

#### Chrome Devtools

https://nodejs.org/en/docs/guides/debugging-getting-started/#chrome-devtools-55-microsoft-edge

#### Visual Studio Code

https://nodejs.org/en/docs/guides/debugging-getting-started/#visual-studio-code-1-10

https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_attaching-to-nodejs

に、VSCodeでNode.jsでデバグするときの手順載っている

## 詳細： Visual Studio Code　でデバグ

https://code.visualstudio.com/docs/nodejs/nodejs-debugging#_attaching-to-nodejs

3通りの方法:

- `auto attatch`を使ってVSCodeの統合ターミナルから実行したアプリケーションプロセスをデバグする方法
-  `JavaScript debug terminal`を使う方法
- `launch config`を使ってプログラムをスタートするか、実行中のVSCode外のプロセスへアタッチする

#### Auto attatch

一番簡単そうだ。

> Auto Attach 機能が有効な場合、Node デバッガは VS Code の Integrated Terminal から起動された特定の Node.js プロセスに自動的にアタッチされます。この機能を有効にするには、Command Palette (Ctrl+Shift+P) から Toggle Auto Attach コマンドを使用するか、すでに有効になっている場合は Auto Attach Status バー アイテムを使用します。

- VSCodeの統合ターミナルから実行したプログラムならデバッガが自動でアタッチされる
- この機能を有効にするにはVSCodeのコマンドパレットから`Toggle Auto Attach`コマンドを使用する

Auto Attatchには４つのモードがあるよ

- `smart`:  node_modules フォルダの外でスクリプトを実行したり、 mocha や ts-node のような一般的な「ランナー」スクリプトを使用すると、そのプロセスがデバッグされることになります。ランナースクリプトの許可リストは、Auto Attach Smart Pattern 設定 (debug.javascript.autoAttachSmartPattern) を使って設定することができます。
- `always`: すべてのVSCode統合ターミナルから実行されたNodeプロセスはデバッグされる
- `onlyWithFlag`: `--inspect`または`--inspect-brk`でプロセスが始まったときにアタッチ

都合がいいのが`onlyWithFlag`ですなぁ。

Auto Attatchを有効にしたら統合ターミナルを一度再起動しなくてはならない。

#### 実践：Auto Attatch `onlyWithFlag`

今まっさらなVSCodeである。

- `Ctrl + Shift + P`でコマンドパレットを開いて`Toggle Auto Attatch`と入力
- モードを入力（または予測から選択）を求められるので`onlyWithFlag`を選択
- するとVSCode下部のステータスバーに`Auto Attatch: With Flag`の表示が現れる
- 新しくVSCodeでターミナルを開いて`node --inspect index.js`と入力すればデバッガーがアタッチされてデバッグできるようになった

ターミナルが別にpowershellじゃなくてもいい。Ubuntu環境で試したけどbashでも大丈夫だった。

VSCode中のブレークポイントで止まってくれる。

## `Debugger`

https://nodejs.org/api/debugger.html
