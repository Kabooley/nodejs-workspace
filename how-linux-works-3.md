# Note How Linux Works 3rd

『スーパーユーザなら知っておくべきLinuxの仕組み 第三版』by Brian Ward

Node.jsと関係ないとは言い切れないけどノートをとるためにわざわざ新しいgitレポ作りたくないので

ここにお邪魔する。

TODO: まとまったらTILへ。

## 目次

[5: Linuxカーネルの起動の仕組み](#5:-Linuxカーネルの起動の仕組み)
[6: ユーザ空間の開始の仕組み](#6:-ユーザ空間の開始の仕組み)
[](#)
[](#)
[](#)
[自習室](#自習室)


## 5: Linuxカーネルの起動の仕組み

Linuxカーネルが起動されるまでの手順７

1. マシンのBIOS、またはブートファームウェアがブートローダをロードして実行する
2. ブートローダはディスク上のカーネルイメージを見つけ、メモリにロードして起動する
3. カーネルはデバイスとドライバを初期化する
4. カーネルはルートファイルシステムをマウントする。
5. カーネルはプロセスIDを１として`init`と呼ばれるプログラムを起動する。**この時点がユーザ空間である**
6. `init`はシステムの残りのプロセスを起動する。
7. `init`はある時点でログインの為のプロセスを開始する

#### カーネルの初期化と起動オプション

上記の手順3~5のあたりの話

1. CPUの検査
2. メモリの検査
3. デバイスバスの発見
4. デバイスの発見
5. 補助的なカーネルサブシステムの設定
6. ルートファイルシステムのﾏｳﾝﾄ
7. ユーザ空間の開始

以降の話はブートローダの起動の仕組みなど詳細な話。割愛。

## 6: ユーザ空間の開始の仕組み

理解したこと箇条書き：

- `init`はユーザ空間プロセスであり、ユーザ空間はここから始まる



ユーザ空間プロセスである`init`をカーネルが開始する処理ステップは重要な意味を持つ。

理由は、正常にシステムが動作するためにメモリとCPUの準備が整ったというだけでなく、

システムの残りの部分全てがどうのように構築されていくのか確認できるから。

#### initバージョンの確認方法

自分が使っているシステムのinitバージョンの確認方法

- /usr/lib/bin/systemd, /etc/systemdがあればsystemd
- いくつかの.confファイルを含む/etc/initディレクトリがあれば、おそらくUpstart
- 上記のどれにも当てはまらず、/etc/inititabファイルがある場合、System V initを使っている

NOTE: 自分が使っているのはWSL2上のLinuxなので、systemdではないことは確実である。

確認してみたところ...

```bash
$ ls /usr/lib/systemd
boot                            systemd-cryptsetup            systemd-resolved
catalog                         systemd-dissect               systemd-rfkill
libsystemd-shared-245.so        systemd-fsck                  systemd-shutdown
logind.conf.d                   systemd-fsckd                 systemd-sleep
network

# 以下略

$ ls /etc/init
ls: cannot access '/etc/init': No such file or directory
$ ls /etc/inittab
ls: cannot access '/etc/inittab': No such file or directory
```
WSLの事情かな。Ubuntu自体はsystemdなんだけど、systemdを使っていない。

実はWSLでは独自の`init`を使っているらしい。

`pstree`コマンドは現在動作しているプロセスをツリー形式で表示するコマンド。「どのプロセスからどのプロセスが起動しているのか」という“親子関係”が分かる。

`pstree -p`でプロセスID付きで出力してくれる。

```bash
$ pstree
 pstree -p
init(1)─┬─init(7)───init(8)───bash(9)───pstree(2039)
        ├─init(445)───init(446)───sh(447)───sh(448)───sh(453)───node(457)─┬─node(477)─┬─bash(583)
        │                                                                 │           ├─{node}(478)
        │                                                                 │           ├─{node}(479)
        │                                                                 │           ├─{node}(480)
        │                                                                 │           ├─{node}(481)
        │                                                                 │           ├─{node}(482)
        │                                                                 │           ├─{node}(487)
        │                                                                 │           ├─{node}(492)
        │                                                                 │           ├─{node}(493)
        │                                                                 │           ├─{node}(494)
        │                                                                 │           ├─{node}(495)
        │                                                                 │           └─{node}(584)
        │                                                                 ├─node(512)─┬─{node}(513)
        │                                                                 │           ├─{node}(514)
        │                                                                 │           ├─{node}(515)
        │                                                                 │           ├─{node}(516)
        │                                                                 │           ├─{node}(517)
        │                                                                 │           ├─{node}(518)
        │                                                                 │           ├─{node}(519)
        │                                                                 │           ├─{node}(520)
        │                                                                 │           ├─{node}(521)
        │                                                                 │           ├─{node}(522)
        │                                                                 │           ├─{node}(523)
        │                                                                 │           └─{node}(524)
        │                                                                 ├─node(548)─┬─node(1031)─┬─{node}(1032)
        │                                                                 │           │            ├─{node}(1033)
        │                                                                 │           │            ├─{node}(1034)
        │                                                                 │           │            ├─{node}(1035)
        │                                                                 │           │            ├─{node}(1036)
        │                                                                 │           │            └─{node}(1038)
        │                                                                 │           ├─{node}(549)
        │                                                                 │           ├─{node}(550)
        │                                                                 │           ├─{node}(551)
        │                                                                 │           ├─{node}(552)
        │                                                                 │           ├─{node}(553)
        │                                                                 │           ├─{node}(554)
        │                                                                 │           ├─{node}(555)
        │                                                                 │           ├─{node}(556)
        │                                                                 │           ├─{node}(557)
        │                                                                 │           ├─{node}(558)
        │                                                                 │           └─{node}(559)
        │                                                                 ├─{node}(458)
        │                                                                 ├─{node}(459)
        │                                                                 ├─{node}(460)
        │                                                                 ├─{node}(461)
        │                                                                 ├─{node}(462)
        │                                                                 ├─{node}(463)
        │                                                                 ├─{node}(464)
        │                                                                 ├─{node}(465)
        │                                                                 ├─{node}(466)
        │                                                                 └─{node}(467)
        ├─init(468)───init(469)───node(470)─┬─{node}(471)
        │                                   ├─{node}(472)
        │                                   ├─{node}(473)
        │                                   ├─{node}(474)
        │                                   ├─{node}(475)
        │                                   └─{node}(476)
        ├─init(501)───init(502)───node(503)─┬─{node}(504)
        │                                   ├─{node}(505)
        │                                   ├─{node}(506)
        │                                   ├─{node}(507)
        │                                   ├─{node}(508)
        │                                   └─{node}(510)
        └─{init}(6)
$
```

ということで`init`からプロセスが始まっていて、`systemd`は一切登場しない。

Linuxについてユーザ空間プロセスを学習するならOracleのVirtualBoxで開いた方がいいかも。（けど遅いし見づらいんだよね）

#### (自習)WSL2はどうやってsystemdなしで動いている？

参考：

https://superuser.com/questions/1719393/how-does-wsl-wsl2-wslg-work-without-systemd

https://superuser.com/a/1719430

> systemdはLinuxでは必須ではないということを指摘しておきます。

> systemdはユーザ空間プロセスのinitの実装の一つであり、他にもinit実装は存在するので、Linuxディストリビューションがどれを採用するのかで採用されるinitは異なる。

> WSL2 ディストリビューションを実行している場合、そのディストリビューションは仮想マシンで実行されていないことを理解することが重要です。 WSL2 自体は、独自のディストリビューションで仮想マシンを実行しています (推測する必要がある場合は、おそらく Mariner ベースです)。 

> その非表示の仮想マシン内で、ディストリビューションが独自の名前空間のセットで実行されます。 WSL2 で複数のディストリビューションを同時に実行する場合、それらはすべて同じ VM で実行され、それぞれに独自のものがあります。

## 自習室

WSL2上のUbuntuではlinuxbrew, anyenv, nodenvを取り入れてenv系の管理とNode.jsのバージョン切り替えを可能とする環境にしている。

しかし、毎度Ubuntuを起動するとnodenvなんて知らないといわれる。

なので毎度`exec $SHELL -l`しないと環境変数を取り込んでくれない。

しかしこの辺のなんでそうなるの？が全くさっぱりなので、

「なぜUbuntu起動時にanyenvでインストールしたnodenvの環境変数をbashが知らないのか？」を学習して理解し、解決していく。

あと、「一度`$PATH`へ登録した環境変数のパスは後から消してもいいのか」なども解決したい。

憶測だけど、

たぶんうっかりanyenvでインストールしたことを忘れて、

直接インストールした気になって環境変数にnodenvを登録する処理をしてしまったのが原因だと思う。

nodenvを使おうとすると、Linuxカーネルは

本来nodenvをanyenvから探してくる前にnodenvの環境変数を見つけてしまうのだと思う

しかしその環境変数に記されている場所には何もない

だからnodenvなんてコマンドはないよ

#### 自習室目次

[現状](#現状)
[Linux基礎](#Linux基礎)
[bash & shell](#bash-&-shell)
[](#)

#### 現状

```bash
# $PATHにはnodenvが登録されている模様だが...
~$ echo $PATH
/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:/home/teddy/.nodenv/bin:/home/teddy/.yarn/bin: # 以下略

#  .nodenvが一切見当たらない
~$ ls -a
.        .bash_history  .cache      .landscape   .profile                   .vscode-server  .yarnrc           projects
..       .bash_logout   .config     .motd_shown  .ssh                       .wget-hsts      cpp
.anyenv  .bashrc        .gitconfig  .npm         .sudo_as_admin_successful  .yarn           nodejs-workspace
~$ ls -a | grep .nodenv
# しかしanyenv以下にはnodenvがある
~$　anyenv install nodenv
anyenv: /home/teddy/.anyenv/envs/nodenv already exists
Reinstallation keeps versions directories
continue with installation? (y/N) N
```

ということで$PATHに登録した存在しないコマンドを消したい。

それを正しくできるまでに必要なことを学習する。

つまりLinuxの基礎である

#### Linux基礎

##### シェル変数

TODO: カス本ではなくてBrianWard本の内容にして

『LPICの基礎が学べる本』(インプレス社) より

> 1つのシェルの中においてスコープできる変数をシェル変数という

シェル変数の宣言方法は次の通り

```bash
# 変数の設定 空白を入れないこと
$ var=Linux
# 変数の確認 変数名には$をつけること
$ echo $var
Linux
# 変数は宣言したシェルでしかスコープできないことの確認
$ bash  # あらたなシェルの起動
$ echo $var

# 変数varはあらたなシェル上ではスコープできていない
$ exit
$ echo $var
```

変数は多くのプログラミング言語のルール同様大文字小文字が区別されるよ

変数の内容はシェルが終了したら失われるよ

変数のスコープは宣言したシェルの中だけだよ

##### 環境変数

『LPICの基礎が学べる本』(インプレス社) より

> シェル上で起動したシェルや、実行したコマンドでも使える変数を環境変数という

つまり、先のシェル変数と異なり、

あらたに生成したシェル上でも、予め設定しておいた環境変数ならばスコープできるというわけだ。

```bash
$ VAR1=Linuxx
# 環境変数の設定方法 2通り
$ export VAR1
$ export VAR2=Ubuntuu
```
```bash
# あらたに生成したシェル上でも環境変数ならばアクセスできることの確認
~$ VAR1=Linuxx
~$ echo VAR1
VAR1
~$ echo $VAR1
Linuxx
# 環境変数としてVAR1とVAR2が登録されて...
~$ export VAR1
~$ export VAR2=Ubuntuu
~$ local=LOCAL
# あらたなシェルへ移動した
~$ bash
# 環境変数にアクセスできる
~$ echo $VAR1
Linuxx
~$ echo $VAR2
Ubuntuu
# しかし元のシェル上で設定したシェル変数にはアクセスできない
~$ echo $local

~$ sprite=SPRITE
# もとのシェルに戻って...
~$ exit
exit
~$ echo $sprite

~$ echo $VAR1
Linuxx
~$ echo $VAR2
Ubuntuu
~$ echo $local
LOCAL
~$
```

##### env

設定されている環境変数を一覧表示するコマンド

設定されているシェル変数を一覧表示するのは`set`

##### export

manコマンドは使えなくてhelpコマンドで詳細を表示してくれる。

```bash
:~$ man export
No manual entry for export

:~$ help export
export: export [-fn] [name[=value] ...] or export -p
    Set export attribute for shell variables.

    Marks each NAME for automatic export to the environment of subsequently
    executed commands.  If VALUE is supplied, assign VALUE before exporting.

    Options:
                # シェル関数を参照する
      -f        refer to shell functions
                # 指定した環境変数をシェル変数へ変える
      -n        remove the export property from each NAME
                # すべてのエクスポートされた変数と関数を一覧表示する
      -p        display a list of all exported variables and functions

    An argument of `--' disables further option processing.

    Exit Status:
    Returns success unless an invalid option is given or NAME is invalid.
```

> 各NAMEをマークし、その後に実行されるコマンドを自動的に環境にエクスポートします。
> VALUEが指定された場合、エクスポートする前にVALUEを割り当てます。

まず復習で、

シェル変数はシェルから参照できる変数で、そのシェルからしか参照できない。

環境変数はシェルのみならず、環境変数を設定したシェルから新たに生成したシェルからや、コマンドから参照できる変数である。

で、

`export`は

- 環境変数を定義する
- シェル変数を環境変数として変更またはその逆をする

という機能を持つ。


##### コマンド

組み込みコマンドと外部コマンドという2種類が存在する。

組み込みコマンド一例：

```bash
# 組み込みコマンドを一覧表示するにはhelpコマンドを使う
$ help
GNU bash, version 5.0.17(1)-release (x86_64-pc-linux-gnu)
These shell commands are defined internally.  Type `help' to see this list.
Type `help name' to find out more about the function `name'.
Use `info bash' to find out more about the shell in general.
Use `man -k' or `info' to find out more about commands not in this list.

A star (*) next to a name means that the command is disabled.

 job_spec [&]                                               history [-c] [-d offset] [n] or history -anrw [filename>
 (( expression ))                                           if COMMANDS; then COMMANDS; [ elif COMMANDS; then COMMA>
 . filename [arguments]                                     jobs [-lnprs] [jobspec ...] or jobs -x command [args]
 :                                                          kill [-s sigspec | -n signum | -sigspec] pid | jobspec >
 [ arg... ]                                                 let arg [arg ...]
 [[ expression ]]                                           local [option] name[=value] ...
 alias [-p] [name[=value] ... ]                             logout [n]
 bg [job_spec ...]                                          mapfile [-d delim] [-n count] [-O origin] [-s count] [->
 bind [-lpsvPSVX] [-m keymap] [-f filename] [-q name] [-u>  popd [-n] [+N | -N]
 break [n]                                                  printf [-v var] format [arguments]
 builtin [shell-builtin [arg ...]]                          pushd [-n] [+N | -N | dir]
 caller [expr]                                              pwd [-LP]
 case WORD in [PATTERN [| PATTERN]...) COMMANDS ;;]... es>  read [-ers] [-a array] [-d delim] [-i text] [-n nchars]>
 cd [-L|[-P [-e]] [-@]] [dir]                               readarray [-d delim] [-n count] [-O origin] [-s count] >
 command [-pVv] command [arg ...]                           readonly [-aAf] [name[=value] ...] or readonly -p
 compgen [-abcdefgjksuv] [-o option] [-A action] [-G glob>  return [n]
 complete [-abcdefgjksuv] [-pr] [-DEI] [-o option] [-A ac>  select NAME [in WORDS ... ;] do COMMANDS; done
 compopt [-o|+o option] [-DEI] [name ...]                   set [-abefhkmnptuvxBCHP] [-o option-name] [--] [arg ..>
 continue [n]                                               shift [n]
 coproc [NAME] command [redirections]                       shopt [-pqsu] [-o] [optname ...]
 declare [-aAfFgilnrtux] [-p] [name[=value] ...]            source filename [arguments]
 dirs [-clpv] [+N] [-N]                                     suspend [-f]
 disown [-h] [-ar] [jobspec ... | pid ...]                  test [expr]
 echo [-neE] [arg ...]                                      time [-p] pipeline
 enable [-a] [-dnps] [-f filename] [name ...]               times
 eval [arg ...]                                             trap [-lp] [[arg] signal_spec ...]
 exec [-cl] [-a name] [command [arguments ...]] [redirect>  true
 exit [n]                                                   type [-afptP] name [name ...]
 export [-fn] [name[=value] ...] or export -p               typeset [-aAfFgilnrtux] [-p] name[=value] ...
 false                                                      ulimit [-SHabcdefiklmnpqrstuvxPT] [limit]
 fc [-e ename] [-lnr] [first] [last] or fc -s [pat=rep] [>  umask [-p] [-S] [mode]
 fg [job_spec]                                              unalias [-a] name [name ...]
 for NAME [in WORDS ... ] ; do COMMANDS; done               unset [-f] [-v] [-n] [name ...]
 for (( exp1; exp2; exp3 )); do COMMANDS; done              until COMMANDS; do COMMANDS; done
 function name { COMMANDS ; } or name () { COMMANDS ; }     variables - Names and meanings of some shell variables
 getopts optstring name [arg]                               wait [-fn] [id ...]
 hash [-lr] [-p pathname] [-dt] [name ...]                  while COMMANDS; do COMMANDS; done
 help [-dms] [pattern ...]                                  { COMMANDS ; }

```

本来コマンドを実行するには、

組み込みコマンドでない限りそのコマンドのbinまでのパスを指定する必要がある。

しかし組み込みコマンドと、変数`PATH`に登録されてある実行ファイルは

パスをわざわざ指定しなくてもコマンド名だけで実行してくれる。

なのでNode.jsをインストールして`node index.js`でNode.jsが実行してくれるのは、

予め変数`PATH`に自身のbinを登録してあるからである。

つまり、

あらたにインストールしたNode.jsやnpmなどは、

変数`PATH`に登録しない限りパスを毎度指定しなくてはならなくなる。

```bash
# 変数PATHへ登録されている実行ファイル一覧
$ echo $PATH
/home/linuxbrew/.linuxbrew/bin:/home/linuxbrew/.linuxbrew/sbin:/home/teddy/.yarn/bin:/home/teddy/.yarn/bin:/home/teddy/
# 以下略

# binまでのパスを指定すればその実行ファイルを実行できることの確認
# 
# まずは実行ファイルがどこにあるのかwhichで探す
$ which brew
/home/linuxbrew/.linuxbrew/bin/brew

# brew doctorを実行する
# 
# 実行できた
~/home$ linuxbrew/.linuxbrew/bin/brew doctor
Please note that these warnings are just used to help the Homebrew maintainers
with debugging if you file an issue. If everything you use Homebrew for is
working fine: please don't worry or file an issue; just ignore this. Thanks!
```

まとめ：

- 本来コマンドを実行するにはそのコマンドのbin/以下の該当コマンドファイルをパスで呼び出さなくてはならない

- それは面倒なので通常コマンドをシェル変数にして、変数`PATH`へ登録する

- カーネルはコマンドに一致した変数を組み込みコマンドか`PATH`から探し出して一致しているものがあればそれを実行する


#### bash & shell

シェルとは？Bashとは？

シェルとは、広義でいえばコマンドを入力するためにユーザが使用するプログラム、プログラムを実行するためのプログラムである。

それの役割はOSの詳細を隠してシェルのインタフェイスだけをユーザに提供して、カーネルインタフェイスの技術的詳細とのやり取りを行う。

Bashとはそんなシェルの種類の一つである。現在ではほとんどのLinuxのディストリビューションのデフォルトログインシェルとして広く普及している。

Bashはその前身Bourne Shellの代替フリーソフトウェアとして開発されたものである。

ということで、

シェルとは広義にUNIX系におけるインタプリタのことで

BashとはそのUNIX系シェルとして開発されたもののひとつで、Ubuntu含めデフォルトのシェルとしてLinuxディストリビューションを起動するとシェルとして起動される。

Linuxコマンドとしてのbashが存在する。

Linuxのシェルで、デフォルトとして起動するBashはbashコマンドで何をするのか？



#### bashの初期化ファイル

参考：

https://blog1.mammb.com/entry/2019/12/01/090000

https://atmarkit.itmedia.co.jp/flinux/rensai/linuxtips/168bpronrc.html

公式っぽい記事は見つけられなかった...

.bash, .bash_profile, .profileってなんやねん。

開発環境構築の際によく見かけるinstallationで環境変数を設定するコマンド、

```bash
# linuxbrewを導入直後
# `brew`のPATHを通すとき
$ echo 'export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"' >> ~/.bashrc
$ source ~/.bashrc
```

は、一体全体何をしているのか？

`export PATH="/home/linuxbrew/.linuxbrew/bin:$PATH"`だけではいけないのか？

bashの初期化ファイルはログイン時に自動的に読み込まれるファイルのことである。

それら初期化ファイルがなんであるかは`man bash`すればわかるらしい。

(?つまりexport PATH=""はシェルが終了したらPATHにあった内容は消えて次回起動時には存在しないということか？)

#### bashとログインシェル

```bash
$ man bash
# 4500行におよぶマニュアル...
# 「どういうものなのか」について詳細だけど
# どう運用すればいいのかは書いていない...
```

`INVOCATION`の行以降の説明にその旨が書いてある


> **ログインシェルとは、引数ゼロの最初の文字が`-`であるシェル、または`--login`オプションで起動するシェルのことである。**

> (中略)

> 以下の段落では、bashが起動ファイルをどのように実行するかを説明します。 ファイルが存在するが読み込めない場合が存在するが読み込めない場合、bashはエラーを報告する。 チルダは、以下の「チルダの展開」セクションで説明するように、ファイル名で展開されます。
> EXPANSIONセクションで説明します。

> bashは対話型ログインシェルとして、または--loginオプションで非対話型シェルとして起動されると、まずコマンドを読み込んで実行します。

> bash が対話的なログインシェルとして起動されるか、 --login オプション付きの非対話的シェルとして起動されると、 /etc/profile ファイルが存在すれば、 bash はまずここからコマンドを読み込んで実行します。 

> このファイルを読んだ後、 bash は ~/.bash_profile, ~/.bash_login, ~/.profile をこの 順番で探します。 bash は、この中で最初に見つかり、かつ読み込みが可能であるファイルから コマンドを読み込んで実行します。 --noprofile オプションを使ってシェルを起動すれば、 この動作を行わないようにできます。

> ログインシェルが終了するときには、 ~/.bash_logout ファイルがあれば、 bash はこれを読み込んで実行します。

> ログインシェルでない対話的シェルとして起動されると、 ~/.bashrc ファイルがあれば、 bash はここからコマンドを読み込み、実行します。 この動作は --norc オプションで行わないようにできます。 --rcfile file オプションを使うと、 コマンドの読み込みと実行を ~/.bashrc からでなく file から行わせることができます。

> (例えばシェルスクリプトを実行するために) シェルが非対話的に起動されると、 bash は環境変数 BASH_ENV を調べ、この変数が定義されていればその値を展開し、 得られた値をファイル名とみなして、 そこからコマンドの読み込みと実行を行います。 つまり bash は以下のコマンドが実行されたのと同じように動作します:

> `if [ -n "$BASH_ENV" ]; then . "$BASH_ENV"; fi`

ただし、ファイル名を探すために PATH 環境変数の値が使われることはありません。

sh という名前で bash を起動すると、 bash は古くからある sh の起動動作をできるだけ真似しようとします。 また POSIX 標準にもできるだけ従おうとします。 対話的なログインシェルとして起動されると、 あるいは --login オプション付きの非対話的シェルとして起動されると、 このシェルはまず /etc/profile と ~/.profile の順でコマンドの読み込みと実行をしようとします。 --noprofile オプションを使うと、この動作を行わないよう...(以下略)


ということで、

- 初期化ファイルはシェルの起動時に自動的に読み込まれるコマンドがつまったファイルであるということ

- 初期化ファイルは読み込まれる順番があるということ

- 初期化ファイルの読み込みの順番はシェルがどのように起動されたのかに依るということ

がわかる。

ログインシェルとは先の説明の通り理解すればいいけれど、

普段WSL2で起動しているプロセスとしてのUbuntuを起動させたときはログインシェルなのか対話型(インタラクティブ)シェルなのかどちらなのだろう。

ユーザはUbuntu初回起動時に登録したsuper userだけだけど。

https://askubuntu.com/a/156038

> 

> シェルかターミナルを起動したときにログインを求められたならば、それはログインシェルである

> ログインを求められずそのまま使えるならば非ログインシェルである

ということは現状非ログインシェルが毎回起動しているということか？

##### 初期化ファイルはどう運用すべきなの？

https://techracho.bpsinc.jp/hachi8833/2021_07_08/66396

https://superuser.com/a/183980

そのまま引用・翻訳

> 伝統的に、UNIXシステムへログインすると、システムは一つのプログラムをあなたへ与えます。

> 即ちほかのプログラムを起動するためのプログラムである。

> これがコマンドラインシェルである。

> 他のプログラムの名前をコマンドとして打ち込んでプログラムを実行する。

> デフォルトのシェルは(Bourne Shellという)、ログインシェルとして呼び出されたときに`./profile`からコマンドを読みだす。

> BashとはBourne Shellのようなものである。

> Bashはログインシェルとして起動したときに`~/.bash_profile`からコマンドを読み出す。

> もしもそのファイル(`~/.bash_profile`)が存在しない場合、`~/.profile`を代わりに読み出す。

> 貴方はいつでも直接シェルを呼び出してもかまわない、例えばGUI環境内でターミナルエミュレータを起動するようなときとか。

> もしもShellがログインシェルでないとき、Shellは`~/.profile`を読まない。

> もしもShellを対話型シェルとして起動した場合は、`~/.bashrc`を読む。

> (ログイン シェルとして呼び出された場合を除き、~/.bash_profile または ~/.profile のみが読み取られます)

> したがって、

> - `~/.profile`: エイリアスと関数の定義、シェル オプション、プロンプト設定など、bash 自体にのみ適用されるものを置く場所です。 (そこにキーバインディングを配置することもできますが、bash の場合は通常 ~/.inputrc に入ります。)

> - `~/.bashrc`: エイリアスと関数の定義、シェル オプション、プロンプト設定など、bash 自体にのみ適用されるものを置く場所です。 (そこにキーバインディングを配置することもできますが、bash の場合は通常 ~/.inputrc に入ります。)

> - `~/.bash_profile`: ~/.profile の代わりに使用できますが、他のシェルではなく、bash によってのみ読み取られます。 (初期化ファイルを複数のマシンで動作させたいが、ログイン シェルがすべてのマシンで bash でない場合、これは主に懸念事項です。) シェルが対話型の場合、これは ~/.bashrc を含める論理的な場所です。 ~/.bash_profile の次の内容をお勧めします。

```bash
if [ -r ~/.profile ]; then . ~/.profile; fi
case "$-" in *i*) if [ -r ~/.bashrc ]; then . ~/.bashrc; fi;; esac
```
> (GUI関連の話なので中略)

> 環境変数の定義を ~/.bashrc に置くか、ログインシェルを常にターミナルで起動することを推奨しているのをあちこちで見かけるかもしれませんので、注意してください。どちらも良くない考えです。どちらの方法でも、環境変数が設定されるのはターミナルで起動するプログラムのみで、アイコンやメニュー、キーボードショートカットで直接起動するプログラムには設定されない、というのが最も一般的な問題点です。

> .bash_profile が存在しない場合、bash は .profile にフォールバックする前に .bash_login も試行します。存在することを忘れてもかまいません。

#### 環境変数は結局どの初期化ファイルに書けばいいの？

https://superuser.com/questions/409186/environment-variables-in-bash-profile-or-bashrc

環境変数を設定して PATH (JAVA_HOME など) に追加する場合、エクスポート エントリを配置するのに最適な場所はどこになるの？という話。


> `~/.bashrc`如何には何を置くといいの？エイリアスだけ？

> サブシェルによって自動的に継承されないものを ~/.bashrc に入れます。これは、主にエイリアスと関数を意味しますが、シェルの外で表示したくない変数設定がある場合もあります (これは非常にまれです)。それらを何らかの方法でエクスポートする必要があると主張することもできますが、さまざまな実験的な試みが、環境内にそれらを隠そうとすることで互換性の問題に遭遇し、ほとんどが放棄されました.

> 環境変数を設定して PATH (JAVA_HOME など) に追加する場合、エクスポート エントリを配置するのに最適な場所はどこですか? ~/.bash_profile? ~/.bashrc?

> 環境設定を ~/.bash_profile に置くことで、まともな初期設定が与えられるようになります。環境設定を ~/.bashrc に置くと、その環境から実行されるシェルは環境のカスタマイズを失い、結果として正しく動作しないことがあります。モジュール、virtualenv、rvm などのパッケージを使って複数の開発環境を管理している場合も同様です。~/.bashrc に設定を入れると、エディタの中で好きな環境を実行できず、代わりにシステムのデフォルトに強制されることになります。

> ログインシェルじゃないと、`~/.bashrc`は選択されないと思うんだけど？

> これは正しいです。通常、最初のシェルはログインシェルにし、その下で起動するシェルはログインシェルにしないようにしたいものです。初期シェルがログインシェルでない場合、デフォルトのPATHや他の様々な設定（JAVA_HOMEの例も含む）はありません。

> ディスプレイマネージャから起動するデスクトップ環境（つまりグラフィカルログインの大半）は、デスクトップ全体にログイン環境を設定しないので、ターミナルで初期シェルをログインシェルとして実行せざるを得ません。これは多くの問題を引き起こしますが (特に、パネルはターミナルではないので ~/.bash_profile を実行していないため、例えばパネルから実行されるプログラムが利用できる PATH などが適切に設定されません)、ディスプレイマネージャで開始するセッションの最初に非インタラクティブ環境で ~/.bash_profile を実行することがその内容によっては必ずしも正直にできないことから、妥当な妥協点であると言えるでしょう。ログインシェルを設定する代わりに ~/.bashrc に環境設定を置くことが提案されることがありますが、 上で述べたように、これは環境を上書きする必要がない限りは有効ですが、上書きする必要がある場合は奇妙な破損を引き起こします。

> OS X では、Linux とは異なり、ユーザーの $HOME が伝播され、 ~/.bashrc が root シェルで実行されるようになります。これらの環境を使おうとする前は問題なかったのですが、使い始めると予想外に設定が消えてしまい、困惑しているようです。

TODO: つまりどういうことなのかまとめよう

#### source

`help source`

source: source filename [arguments]
    Execute commands from a file in the current shell.

    Read and execute commands from FILENAME in the current shell.  The
    entries in $PATH are used to find the directory containing FILENAME.
    If any ARGUMENTS are supplied, they become the positional parameters
    when FILENAME is executed.

    Exit Status:
    Returns the status of the last command executed in FILENAME; fails if
    FILENAME cannot be read.



#### (番外編)Ubuntuの自動ログインを無効化する

https://vitux.com/how-to-enable-disable-automatic-login-in-ubuntu/

今のところUbuntuをlogoutで閉じても、次回起動時はやっぱり自動ログインである。

もしかしたらだけど

対話型ログインと自動ログインで読み込む初期化ファイルが違うせいでいろいろ、

とくにnodenvがないとか言われるのだと思う。

ひとまずだけど毎回sudoユーザーでもログインを求める仕様に変更する。

...と思ったけどなんだかその方法が見つからない。

これってもしかして、

普通はsudoユーザ以外のユーザを作成して、毎度Ubuntu起動したらそのユーザのためにあたらしいシェルを起動してログインを求める

...というのがお作法なのかしら？

#### (番外編) Ubuntu user management

Ubuntuにはrootユーザが存在しない。

代わりにsudo特権を持つユーザを一番初めに作成させて、rootの権限をsudo経由で実行できる。



## surface environment

サーフェイスの方だと

`.linuxbrew`はteddy/の上のディレクトリにある

`anyenv`は

```bash
$ ls -a ../linuxbrew/
.  ..  .linuxbrew
$ ls -a ../linuxbrew/.linuxbrew/
.  ..  Caskroom  Cellar  Frameworks  Homebrew  bin  etc  include  lib  opt  sbin  share  var
$ which anyenv
/home/linuxbrew/.linuxbrew/bin/anyenv

# 使えはする
$ brew --version
Homebrew 3.5.6
Homebrew/homebrew-core (git revision 588c31e556d; last commit 2022-07-28)
$ anyenv --version
anyenv 1.1.4
# やっぱりnodenvはどうしても認識しない
$ nodenv --version

Command 'nodenv' not found, did you mean:

  command 'nodeenv' from deb nodeenv (0.13.4-1.1)

Try: sudo apt install <deb name>

# anyenvはここにある
$ ls -a | grep anyenv
.anyenv # home/username/.anyenv

# nodenvはここにある
$ anyenv install nodenv
anyenv: /home/teddy/.anyenv/envs/nodenv already exists
Reinstallation keeps versions directories
continue with installation? (y/N) N

# nodenvのbinはそこにあるのか？
# あった
$ ls .anyenv/envs/nodenv/
CONDUCT.md       LICENSE    bin          default-packages  nodenv.d           package.json  script  src   version
CONTRIBUTING.md  README.md  completions  libexec           package-lock.json  plugins       shims   test  versions

# 環境変数として登録されてあるか
$ env
# (とにかくなかった)

# 以下をしてみる
$ exec $SHELL -l
# もう一度
$ env
NODENV_SHELL=bash
NODENV_ROOT=/home/teddy/.anyenv/envs/nodenv
# あった

# 使えた
$ nodenv versions
* 16.16.0 (set by /home/teddy/.anyenv/envs/nodenv/version)
```

なんやねん。

とにかく`exec $SHELL -l`しないと認識されない。

サーフェイス環境の方はこれを修正すればいいのかな



## (関係ない話)Linuxスーパーユーザなら知っておくべきLinuxの仕組み

#### 基本コマンドとディレクトリ階層

#### `find`, `locate`コマンド

```bash
# ndp2というディレクトリから'README.md'というファイルを探してその結果を標準出力してね
$ find ./ndp2 -name 'README.md' -print

./ndp2/example/ch05/08_streams_writable/node_modules/chance/README.md
./ndp2/example/ch05/08_streams_writable/node_modules/chance/docs/README.md
./ndp2/example/ch05/17_streams_combined_a/node_modules/isarray/README.md
# ...中略...
./ndp2/example/ch04/12_generators_sequential_execution/node_modules/lodash.reject/README.md
./ndp2/example/ch04/12_generators_sequential_execution/node_modules/nth-check/README.md
./ndp2/README.md

```

ということでその指定ディレクリ以下の階層全てから`README.md`を探し出してくれた。

探し出す対象は*など特別な意味を持つ文字を含んで探し出す場合はシングルクオートで囲うこと'*'

`locate`はシステムが定期的に構築するインデックスから該当するものを探し出す。

`find`は指定したディレクトリ以下から指定のファイルを探し出す

#### 環境変数とシェル変数

環境変数は、シェルの環境変数はすべてOSによって実行されるすべてのコマンドに対して提供される

環境変数はシェルに固有でないので、あらたにシェルを生成しても先のシェルでの環境変数にアクセスできる。

シェル変数はコマンドからアクセスできない。

シェル変数はシェルに固有である（なのであとから生成したシェルからさきのシェル変数にはアクセスできない）


#### ユーザ環境

スタートアップファイルには何を書けばいいのか？

シェルの起動方法別にどのスタートアップファイルが実行されるのか？

##### 13.4 スタートアップファイルの順序と例

bahsシェル：

> シェルのインスタンス種別には主に対話型と非対話型の2種類がありますが、

> （中略）非対話型シェルは通常、スタートアップファイルを読み込みません。

> 対話型シェルとは、この本で紹介したようなターミナルからコマンドを実行する際に使うシェルで、

> ログイン型と非ログイン型に分類されます。

ということで基本的に対話型シェルしかスタートアップファイルを読み込みませんと。

##### 疑問：自分が今開いているシェルはログインシェルなのかどうか確認する方法

テキストの方では、

> `echo $0`を実行して最初の文字が`-`ならそのシェルはログインシェルである

とのことだけど、自分の環境で実行したら、

`/bin/bash`が帰ってきた。

http://www.dba-oracle.com/t_linux_login_shell.htm


```bash
$ echo $0
/bin/bash

$ echo $SHELL
/bin/bash

```

`$SHELL`

> この変数は、コマンド ライン セッションが開始されたときにのみ設定されます。最初のログイン時、または su - が呼び出されて別のユーザーとしてログイン シェルが呼び出されたとき、次のセクションで説明するようにシェルが一時的に切り替えられた場合は更新されません。 ログイン時に呼び出されたかどうか、またはログイン後に切り替えられたかどうかに関係なく、現在実行されているシェルを確認するには、別のシェル変数 0 を確認します。

`$0`

> この変数は、現在実行中のプログラムの名前を返します。シェルスクリプト内でスクリプトの名前を出力するために使用できますが、シェルセッションではシェルの名前を返します。

結局わからん。

しかしテキストの話を信じるとしたらいつもUbuntuを起動させたときに起動されるシェルはログインシェルである。

となると、自分のシェルは、

`/etc/profile`が読みだされ、

次に`~/.bash_profile`, `~/.bash_login`, `~/.profile`のうち初めに見つけたファイルを読み込む。

この辺の情報はいろんな情報源から信頼できる。


##### `/etc/profile`の中身

とにかく/etc/profileはすべてのユーザに適用される。

```bash
$ cat /etc/profile
# /etc/profile: system-wide .profile file for the Bourne shell (sh(1))
# and Bourne compatible shells (bash(1), ksh(1), ash(1), ...).

# ${PS1-}は${PS1}と同じ挙動だけど、PS1が未定義の時は空文字列を生成するという意味
# つまりPS1が空でないなら真という意味になるのかも
# 
# PS1とはPrompt Statementの略のことのようで、
# 対話型のシェルならばPS1が設定されているから真なら対話型シェルである
# という意味になる
if [ "${PS1-}" ]; then
  # bin/shはBourne Shellのこと。
  # 現在起動中のbashがbin/shじゃないなら真って意味
  # 
  # 変数BASHが空でなくて、且つ"bin/sh"として設定されていなければ真という意味
  # Bourne Shell以外ならという意味ともいえる
  if [ "${BASH-}" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    # 
    # /etc/bash.bashrcがレギュラーファイルであるならばという意味
    if [ -f /etc/bash.bashrc ]; then
      # . ファイル名で、カレント環境でシェルスクリプトを実行するという意味らしい。
      . /etc/bash.bashrc
    fi
  # Bourne Shellならもしくは$BASHが空なら
  # rootユーザかどうかチェックする
  else
    if [ "`id -u`" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

# -dはディレクトリがあればという意味
# つまり、/etc/profile.dというディレクトリがあれば
# (/etc/profile.dはディレクトリであることは確認済)
if [ -d /etc/profile.d ]; then
  # for...in文は要素を一つずつ変数iに格納してdo...doneの間の処理を実行する
  for i in /etc/profile.d/*.sh; do
    # 変数iに入れたファイルが読み取り可能であるならば
    if [ -r $i ]; then
      # わからんけど多分.shファイルの内容を読みだしたのだと思う
      . $i
    fi
  done
  # 変数iの値を空に戻す
  unset i
fi
```

解読大変やった...

まとめると、

---

prompt statementが空か?

  真：変数BASHが空でなくてbin/shが割り当てられてもいないか?

    真：/etc/bash.bashrcシェルスクリプトを実行する

    偽：rootユーザか?

        真：PS1を"# "にする
        偽：PS1を"$ "にする

/etc/profile.dというディレクトリがあるか？

  真：あるだけの/etc/profile.d/*.shファイル実行する

---

参考:

https://www.tohoho-web.com/ex/shell.html

https://unix.stackexchange.com/questions/32096/why-is-bashs-prompt-variable-called-ps1

https://qiita.com/shiro_usagi/questions/72e48fffa453e2aaa303

https://okwave.jp/qa/q2342756.html

https://www.ibm.com/docs/en/zos/2.1.0?topic=descriptions-dot-run-shell-file-in-current-environment


つまり、

1. etc/profileを実行するときにすでにBASHが割り当てられていれば/etc/bash.bashrcが実行される

2. まだPS1が割り当てられていないならPS1を割り当てる

3. 最後は必ず/etc/profileのシェルスクリプトが実行される

ということは

基本的には3を実行して、PS1の状態に応じてやることを変える感じ。

```bash
$ echo $PS1
\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$

$ id -u
1000
```