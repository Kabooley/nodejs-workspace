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

```bash
:~$ man export
No manual entry for export
:~$ help export
export: export [-fn] [name[=value] ...] or export -p
    Set export attribute for shell variables.

    Marks each NAME for automatic export to the environment of subsequently
    executed commands.  If VALUE is supplied, assign VALUE before exporting.

    Options:
      -f        refer to shell functions
      -n        remove the export property from each NAME
      -p        display a list of all exported variables and functions

    An argument of `--' disables further option processing.

    Exit Status:
    Returns success unless an invalid option is given or NAME is invalid.
```

> 各NAMEをマークし、その後に実行されるコマンドを自動的に環境にエクスポートします。
> VALUEが指定された場合、エクスポートする前にVALUEを割り当てます。