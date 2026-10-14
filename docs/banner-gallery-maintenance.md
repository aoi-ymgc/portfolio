# バナーギャラリーの追加・保守

対象は `作品詳細13.html`。表示と操作はページ専用のCSS・JSに分離しています。原素材はリポジトリ外に保持し、WebPのみを配置します。

## シリーズ追加手順

1. `assets/img/banner-gallery/<series-key>/` に最適化したWebPを配置する。原素材はリポジトリ外で保持。
2. `作品詳細13.html` の `.banner-series` セクションを1つ複製し、見出し・SERIES番号・制作意図を更新。
3. `cafe` / `rental` 相当のIDを新しい固有キーに変更。セクションの `aria-labelledby`、タブの `id` / `data-panel`、パネルの `id` を対応させる。`.banner-tabs` の `data-label` も更新。
4. 各パネルの `.banner-item` を必要な1〜3案に調整。画像の `src` / リンクの `href` / `alt` / `aria-label` / `width` / `height`、01〜03と採用文を更新。
5. 片方のサイズがない場合は対応する `.banner-tab` と `.banner-panel` を両方削除する。パネルにはHTMLで `hidden` を付けず、タブ一覧だけ `hidden` のままにする。JSが存在するタブとパネルを自動初期化する。CSS・JSのシリーズ追加修正は不要。
6. 画像・リンク・サイズ・初期表示・キーボード・390px / 1440pxを確認。トップはシリーズごとのカードを追加する必要なし。ページのmetadata / sitemap更新は内容変更に応じて行う。

## 確認済み

390px・1440pxのChromiumで、画像12枚、タブ・キーボード・拡大表示、JS無効時の画像リンク、1案・1サイズの追加構造、既存作品スライダーを確認。変更HTMLのhtml-validate、JS構文とgit diff --checkは通過しています。
