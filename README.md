# README

ここはNode.jsをいじるスペースである

## 目次

[環境](#環境)
[実行](#実行)

## 環境

環境が壊れたら次を試す。

#### wsl2+UbuntuのUbuntuを初期状態に戻す

https://docs.microsoft.com/ja-jp/windows/wsl/install

https://docs.microsoft.com/ja-jp/windows/wsl/setup/environment

https://docs.microsoft.com/ja-jp/windows/wsl/basic-commands

https://qiita.com/PoodleMaster/items/b54db3608c4d343d27c4

- windows 10 の「設定」、「アプリ」、「アプリと機能」

- 検索窓から`Ubuntu`で初期化したいディストリビューションを選択

- 「詳細オプション」を選択

- 「リセット」ボタンを押す

...でアンインストールしないでまるっと初期状態にしてくれる。

```bash
# powershell
# リセットする前
$ wsl --list --verbose
  NAME                   STATE           VERSION
* Ubuntu-18.04           Stopped         2
  docker-desktop-data    Stopped         2
  docker-desktop         Stopped         2
  Ubuntu-20.04           Stopped         2
#   リセットした後
$ wsl --list --verbose
  NAME                   STATE           VERSION
* Ubuntu-18.04           Stopped         2
  docker-desktop-data    Stopped         2
  docker-desktop         Stopped         2
```

一旦リセットするとwslの利用可能ディストリビューションとして認識されていないのがわかる

Ubuntuをwindow 10のツールバー検索窓に入力して起動させる。

するとUbuntuが起動して初期処理が始まる。

rootユーザを登録。

以上でリセット終了。

```bash
# powershell
# 
# 起動させたら、wslでディストリビューションとして認識されているのがわかる
$ wsl --list --verbose
  NAME                   STATE           VERSION
* Ubuntu-18.04           Stopped         2
  docker-desktop-data    Stopped         2
  Ubuntu-20.04           Running         2
  docker-desktop         Stopped         2
```

初期化処理が終わったら以下の公式ベストプラクティスを設定するといいかも。

https://docs.microsoft.com/ja-jp/windows/wsl/setup/environment

```bash
$ sudo apt update && sudo apt upgrade
```


#### wsl2 + Ubuntu環境でスナップショットを取る

毎度何かあったら全部初めからやり直しはスッゴクタイヘンなので

ある程度ベースとなる環境を整え終えたらスナップショットを取ると安心＆便利。



#### wsl2+Ubuntu+anyenv環境の構築

手順：

- homebrewをインストールする
- anyenvをインストールする

NOTE: env系で環境開発するときは他のenv系がない状態で環境構築すべき

NOTE: env系もとか何もインストールされていない前提で話を進める

参考：

https://docs.brew.sh/Homebrew-on-Linux

https://qiita.com/amenoyoya/items/ca9210593395dbfc8531#docker-%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89

1. Homebrewをインストールする

Qiitaの記事のほうではLinuxbrewと呼ばれているけど

公式を確認したら、homebrewをインストールすればいいみたい

前準備：

https://docs.brew.sh/Homebrew-on-Linux#requirements

ビルド関係で必要な奴らを予めインストールしておく

```bash
# ビルド関係
sudo apt-get install build-essential procps curl file git

# とにかくいろいろする前はアップデートです
$ sudo apt update && sudo apt upgrade -y

# 公式のコマンドをそのまま実行すればいいみたい
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

インストール完了したら

```bash
Warning: /home/linuxbrew/.linuxbrew/bin is not in your PATH.
  Instructions on how to configure your shell for Homebrew
  can be found in the 'Next steps' section below.
==> Installation successful!

==> Homebrew has enabled anonymous aggregate formulae and cask analytics.
Read the analytics documentation (and how to opt-out) here:
  https://docs.brew.sh/Analytics
No analytics data has been sent yet (nor will any be during this install run).

==> Homebrew is run entirely by unpaid volunteers. Please consider donating:
  https://github.com/Homebrew/brew#donations

==> Next steps:
- Run these two commands in your terminal to add Homebrew to your PATH:
    echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/username/.profile
    eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
- Install Homebrew's dependencies if you have sudo access:
    sudo apt-get install build-essential
  For more information, see:
    https://docs.brew.sh/Homebrew-on-Linux
- We recommend that you install GCC:
    brew install gcc
- Run brew help to get started
- Further documentation:
    https://docs.brew.sh
```

という表示が出る。

とにかくPATHにhomebrewを登録しようという話である。

PATHに登録すればbrewコマンドをいつでも呼び出せるよねってやつ。

ご丁寧にコマンドを示してくれているのでその通りにやればいいんだと思うよ。

公式でもPATHに追加する方法を公開している。

https://docs.brew.sh/Homebrew-on-Linux

> Follow the Next steps instructions to add Homebrew to your PATH and to your bash shell profile script, either ~/.profile on Debian/Ubuntu or ~/.bash_profile on CentOS/Fedora/Red Hat.

ということで、

Ubuntu系は.profile/のscriptに、とのこと。

PATHを通す：

```bash
# こっちのコマンドはredhat系でもdebian系でもどっちでも行ける
test -d ~/.linuxbrew && eval "$(~/.linuxbrew/bin/brew shellenv)"
test -d /home/linuxbrew/.linuxbrew && eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
test -r ~/.bash_profile && echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.bash_profile
echo "eval \"\$($(brew --prefix)/bin/brew shellenv)\"" >> ~/.profile
# もしくはインストール後に示してくれたこっちを実行しろと
echo 'eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"' >> /home/teddy/.profile
eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"
```

最後に

```bash
$ brew doctor
Your system is ready to brew.
```

でエラーがなければいいそうです

homebrewインストール・PATH登録完了

Qiitaの記事では、Linuxbrewをインストールしたら

> curl や git などは、最新版を使う方が良いため、改めて Linuxbrew で導入しなおす

ということで開発ツールを改めてインストールするといいそうです

```bash
$ brew install curl git wget gcc zlib libzip bzip2 readline openssl pkg-config autoconf
```

2. anyenvをインストールする

https://github.com/anyenv/anyenv

> env系開発環境をまとめて管理できるツール
> env系開発環境とは、pyenv, nodenv など、各プログラミング言語の複数バージョンを切り替えて使用可能とする環境のこと
> 独自に導入した env系開発環境がある場合は、それらを削除してから導入すること

だそうで。


```bash
$ brew install anyenv
$ anyenv install --init
## Do you want to checkout ? [y/N]: <= y

# anyenv 初期化スクリプトを .bashrc に記述
$ echo 'eval "$(anyenv init -)"' >> ~/.bashrc
$ source ~/.bashrc

# https://github.com/znz/anyenv-update
# 
# Plugin
mkdir -p $(anyenv root)/plugins
git clone https://github.com/znz/anyenv-update.git $(anyenv root)/plugins/anyenv-update
anyenv update
```

#### node.js開発環境構築

- nodenvの導入
- yarnの導入
- Node.jsの導入

1. nodenvの導入

https://github.com/nodenv/nodenv

公式のinstallationにはanyenvでのインストール方法は載っていない。

```bash
$ anyenv install nodenv
$ exec $SHELL -l
```

2. yarn導入

nodenv-yarn-installを導入する

https://github.com/pine/nodenv-yarn-install


```bash
$ mkdir -p "$(nodenv root)/plugins"
$ git clone https://github.com/pine/nodenv-yarn-install.git "$(nodenv root)/plugins/nodenv-yarn-install"
```

3. Node.jsの導入

```bash
# list all available versions:
$ nodenv install -l

# install a Node version:
$ nodenv install 0.10.26
```

公式で16.16.0が推奨版らしい

完了

#### Ubuntu起動のたびに`exec $SHELL -l`しないといけない

起動のたびに、`anyenv`ってなに？という旨のエラーが発生する。

そのたびに`exec $SHELL -l`する必要がある（のかな？）

TODO: これを解決したい。



#### WSL2でVSCodeを使えるようにする

https://docs.microsoft.com/ja-jp/windows/wsl/tutorials/wsl-vscode

Linuxディストリビューションから`code .`と入力するだけ

## 実行

`workspace/`でのTypeScriptファイルの実行方法いろいろ

詳しくは`./environment.md`へ。

#### `ts-node`パッケージ

NOTE: グローバルインストールするわけじゃないなら実行方法は`npx ts-node index.ts`と`npx`を付けること

```bash
$ npx ts-node index.ts
```

通常TypeScriptファイルをコンパイルして実行するには、

`tsc index.ts`から`node index.js`という2つの手順を踏まなくてはならない。

`ts-node`ならその2つの手順を1つのコマンド`ts-node index.ts`で済ませられる。そういうパッケージである。

`ts-node`は勝手に`tsconfig.json`を探し出してそのコンフィグに従ってくれるので、わざわざ指定する必要がない。

指定したかったら`ts-node inde.ts --project ./tsconfig.json`という感じに`--project`オプションを付けるとCLIでtsconfigファイルを指定できる。

(逆にスキップしたかったら`--skipProject`オプションを使う)

https://stackoverflow.com/a/50454232/13891684

上記の回答にある通り、グローバルインストールは推奨されない。

しかしグローバルインストールしないと`ts-node`コマンドがそのままだと認識されない。

そこで`npx`を付けるように言われている。

> node_modules にローカルにインストールされたモジュールからバイナリを実行するために使用される、あまり知られていないコマンド npx があります。