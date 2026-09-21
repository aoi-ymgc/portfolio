# YAMAGUCHI AOI Portfolio

Webデザイン・グラフィックと制作・業務でのAI活用をまとめた静的ポートフォリオサイトです。

## 構成

- `index.html`: トップ、プロフィール、主要6作品とその他6作品、スキル・ツール、Design × AIのまとめ
- `作品詳細1.html` ～ `作品詳細12.html`: 各制作事例の詳細
- `assets/css/`: 共通・詳細ページのスタイル
- `assets/js/`: ナビゲーションなどの操作
- `assets/img/`: サイト内画像

作品詳細ページ下部の「他の作品を見る」は、各詳細ページに作品カードを重複記述せず、`index.html` の `#works .work-card` を読み込んで生成します。トップのWorksカードを追加・削除・更新すれば、詳細ページ側の候補にも反映されます。閲覧中の作品は自動的に除外し、左右矢印とキーボード操作では中央列を前後に複製した無限ループで表示します。

`style.css` は既存の基礎スタイル、`portfolio-polish.css` はブラッシュアップ用の追加スタイル、`syousai.css` は作品詳細専用です。追加スタイルはこの順で読み込みます。

2026-09-20: 個人ブランドロゴとESA CREATE名刺の完成画像を差し替え、作品・ツールの優先順位を更新。画像原本はサイト外に保持し、Web用の派生画像のみを配置しています。

2026-09-20: Skill & Toolsの小型アイコンとDesign × AIの文章・余白を調整。追加SVGは[Simple Icons v16](https://github.com/simple-icons/simple-icons)と[Microsoft AdoptionのCopilotアイコン](https://adoption.microsoft.com/en-us/copilot/app/)を使用しています。

2026-09-22: 「デルミリオーレクラウドFUTSALスクール新聞」を主要制作実績に追加。公開用に最適化したWebPのみを `assets/img/futsal-school-news/` に配置し、原本PNGはリポジトリに含めていません。

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

## 2026-09-19 Aoi Toolsの制作実績追加

- `作品詳細11.html` に3ツールの制作背景、実画面、改善例、AIを使った反復制作の流れを掲載。
- `assets/img/aoi-tools/` の5枚は公開中の各サービスから撮影した画面と、その3画面を組み合わせたHero画像。画像生成は使用していません。
- タブ操作とページ固有の見た目は `assets/js/aoi-tools.js` / `assets/css/aoi-tools.css` に分離。JavaScript無効時は3ツールすべての本文を表示します。

## 2026-09-15 名刺リニューアルの制作実績追加

- `作品詳細10.html`: 株式会社ESA CREATEの名刺リニューアル。完成表裏、旧デザイン比較、情報設計・モチーフ、検討過程、印刷工程、実物と振り返りを掲載。
- `assets/css/esa-businesscard.css` はこの作品だけに適用。共通CSS・JavaScriptと既存作品は変更していません。
- `assets/img/esa-businesscard-public/` は公開用WebPのみ。氏名・メール・電話番号を画像へ焼き込んだ不透明マスクで匿名化しています。
- 元のSVG・PNG・写真は公開リポジトリへ含めず、変更していません。写真は余白のトリミングのみで、色・明るさ・傾き・背景は変更していません。全公開画像のメタデータは除去しています。
- 完成画像は1600×960px。元SVGの縦横比を維持しているため、掲載画像から印刷寸法を測る用途には使用しません。
- 確認済み: 全HTMLの検証、JavaScript構文、360 / 390 / 768 / 1024 / 1440pxの表示、画像表示・縦横比、一覧と詳細の往復、モバイルメニューとEscape操作、既存主要ページ、内部参照438件、掲載本文33項目、公開画像9枚の目視・メタデータ確認。
