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