# How to remove path

from Ubuntu PATH

.profileとか.bashとか環境変数とか

さっぱり

anyenvでinstallしたはずのnodenvが使えない。

たぶんうっかりanyenvでインストールしたことを忘れて、

直接インストールした気になって環境変数にnodenvを登録する処理をしてしまったのが原因だと思う。

nodenvを使おうとすると、Linuxカーネルは

本来nodenvをanyenvから探してくる前にnodenvの環境変数を見つけてしまうのだと思う

しかしその環境変数に記されている場所には何もない

だからnodenvなんてコマンドはないよ

と言ってい来るのだと思う。

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

## シェル変数

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

## 環境変数

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

## env

設定されている環境変数を一覧表示するコマンド

設定されているシェル変数を一覧表示するのは`set`

## export

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


## コマンド

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


## bash & shell

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



## bashの初期化ファイル

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

#### 初期化ファイルはどう運用すべきなの？

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