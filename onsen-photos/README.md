# onsen-photos — 規約準拠フォトインジェスト・パイプライン

「お湯から、探す。」フォトライブラリー画像の規約準拠インジェスト(設計書 `../photo-ingestion-pipeline-design.md` v1.0 準拠)。

## 大原則(§0)

**収集(取得)と加工・登録を分離し、自動化するのは後者だけ。**
自治体・観光連盟のライブラリーはスクレイピングを許可していない。
→ 画像は **人が規約に沿って取得**(DL/申請)して `inbox/` に置く。スクリプトはそこから先(縮小・WebP化・メタ付与・DB登録・監査)だけを自動化する。

このリポジトリには **自動ダウンロード/クローラーは一切含まれない**(§7 厳守)。

## ディレクトリ(§3)

```
onsen-photos/
├── inbox/                 # ★人手で取得した原本をライブラリー別に置く
├── manifest/
│   ├── sources.yaml       # 人が書く唯一のファイル(画像→温泉ID・出典・規約)
│   └── sources.schema.md  # 上記のスキーマ仕様
├── dist/                  # 出力(WebP・サムネ)。デプロイ成果物
├── db/
│   ├── photos.json        # photoエンティティ集合(生成物)
│   └── onsen_roster.json  # 温泉ID一覧(プロトタイプから抽出・検証用)
└── scripts/
    ├── 01_validate.mjs    # manifest と inbox の整合チェック
    ├── 02_process.mjs     # 縮小・WebP変換・blurhash(EXIF除去)
    ├── 03_register.mjs    # photos.json を生成/更新
    └── 04_report.mjs      # ライセンス監査レポート(report.md)
```

## 使い方

```bash
npm install              # sharp / js-yaml / blurhash
# 1) inbox/ に規約準拠で取得した原本を置く
# 2) manifest/sources.yaml に記入(記入例は同ファイル内コメント参照)
npm run all              # 01→02→03→04→05 を順に実行
# 個別:  npm run validate / process / register / report / site
```

## サイトへの反映(§5)

プロトタイプ `../oyu-search-prototype-v21_1.html` は結線済み(バックアップ `*.html.bak` あり):

- `<script src="onsen-photos/db/site_photos.js">` で `PHOTOS_REAL` を読み込む
- `cardMedia`/`heroMedia` が「実画像があれば `<img>`、無ければ従来の線画」に分岐
- クレジット帯は `credit_required` のときだけ表示(Aランク=帯なし / B・C=帯付き)

運用は「inbox に画像追加 → `npm run all` → ページ再読み込み」。**集まった湯から順次** 写真に切り替わり、未取得の湯は線画のまま成立する。

画像の参照ベースパスは `PHOTO_BASE`(既定 `/photos`)で切り替え:

```bash
# 本番: dist/ を web ルートの /photos/ に配置する想定(既定)
npm run site
# ローカル確認: dist/ を相対参照させる(HTML をリポジトリ直下から開く場合)
PHOTO_BASE=onsen-photos/dist npm run site
```

ローカル確認用に最小静的サーバを同梱(`.claude/static_server.mjs`、Claude Code の Launch から `onsen-static`)。

## イメージ画像(プレースホルダ / 線画の置き換え)

実写真がまだ無い湯には、**CC0のイメージ画像**を「※写真はイメージです」付きで表示する(線画フォールバックは廃止方向)。全96湯を3カテゴリで使い回す:

| カテゴリ | 対象 |
|---|---|
| `sea` | 海辺の湯(tags=kaihin) |
| `mountain` | 山・秘湯(purpose=hito/toji) |
| `town` | それ以外(温泉街) |

手順は [manifest/CC0_PLACEHOLDER_GUIDE.md](manifest/CC0_PLACEHOLDER_GUIDE.md)(10分・最小3枚)。

```bash
# 1. CC0画像を sea.jpg / mountain.jpg / town.jpg として inbox/_placeholders/ に置く
# 2. manifest/placeholders.yaml に出典とライセンスを記録
PHOTO_BASE=onsen-photos/dist npm run placeholders   # ローカル確認用ベース
```

**表示優先順位**: 実写真(`PHOTOS_REAL`)→ イメージ画像(`PLACEHOLDERS`)→ デモSVG → 線画。
画像が未配置の間は線画にフォールバックする(`db/placeholders.js` が `{}` の状態)。

`01_validate` で NG が出た場合、後続は実行されない(NG を直してから再実行)。

## 守っている禁止事項(§7)

- フォトライブラリーへの自動アクセス・一括DLコードを**書かない**。入力は常にローカルの `inbox/`。
- **縮小と WebP 変換のみ**。色調補正・フィルター・合成・自動クロップは実装しない(加工禁止規約への配慮)。構図調整が要る場合は人が inbox 段階で行う。
- 出力 WebP から **EXIF(GPS 位置情報含む全メタデータ)を除去**(撮影者プライバシー)。

## 画像処理の仕様(§4 / 02_process)

| role | 主サイズ幅 | サムネ |
|---|---|---|
| hero | 1600px | 400px |
| card / scene / exterior / town | 800px | 400px |

- アスペクト比維持・**拡大はしない**(`withoutEnlargement`)
- WebP quality 82
- blurhash はプレースホルダ用に生成(任意・失敗しても続行)
- ※ EXIF orientation のみ「画素に適用してからメタ除去」する。これは見た目を保つための処理で、色調・合成・クロップ等の加工ではない。
