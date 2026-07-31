# YAMAGUCHI AOI Portfolio

Webデザイン・コーディングの制作実績をまとめた静的ポートフォリオサイトです。

## 構成

- `index.html`: トップ、プロフィール、制作実績、スキル、GitHub導線
- `作品詳細1.html` ～ `作品詳細8.html`: 各制作事例の詳細
- `assets/css/`: 共通・詳細ページのスタイル
- `assets/js/`: ナビゲーションなどの操作
- `assets/img/`: サイト内画像

`style.css` は既存の基礎スタイル、`portfolio-polish.css` はブラッシュアップ用の追加スタイル、`syousai.css` は作品詳細専用です。追加スタイルはこの順で読み込みます。

## ローカル確認

リポジトリ直下を静的HTTPサーバーで配信します。

```powershell
npx.cmd --yes http-server . -p 4173 -c-1
```

ブラウザで `http://127.0.0.1:4173/` を開いて確認します。

## 検証

```powershell
node --check assets/js/main.js
npx.cmd --yes html-validate index.html "作品詳細*.html"
```

## 改善前へ戻す

2026-07-31のブラッシュアップ前は、ローカルタグ `backup/pre-brushup-20260731` と `C:\Codex_aoiro\90_一時保管\portfolio_backup_20260731.bundle` に保存しています。

```powershell
git switch --detach backup/pre-brushup-20260731
```
