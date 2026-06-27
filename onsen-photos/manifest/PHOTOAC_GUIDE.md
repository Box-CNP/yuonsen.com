# 写真AC から温泉写真を集める手順

写真AC(photo-ac.com)は商用利用OK・クレジット不要のフリー素材サイト。
温泉名・地名で検索できるので、**各湯の実写真**を効率よく集められる。

## 守ること(重要)

- **自動・一括ダウンロードはしない**(写真ACの利用規約で禁止)。必ずサイトから手でDLする。
  - 無料会員はログイン必須＋**1日のDL数に上限**あり(数枚/日)。96湯を一気には無理。
    まとめて進めるなら有料会員(ダウンロード無制限)が現実的。
- **素材そのものの再配布・再販はしない**(画像データを配る/素材集として売る等はNG)。
  サイトの挿絵・hero として「掲載」するのは規約上OK。
- **施設・人物の権利は利用者責任**(規約明記)。なので選ぶときは:
  - ✅ 温泉街の遠景・露天の引き・湯けむり・自然風景(権利問題が起きにくい)
  - ⚠ 特定旅館の浴室がはっきり主役の写真は避けるか、要確認

## 手順

1. [photoac_shopping_list.csv](photoac_shopping_list.csv) をスプレッドシートで開く
2. 各行の「写真ACで検索(URL)」をクリック → 良い写真を選んでDL
3. ファイルを **`inbox/写真AC/<温泉名>.jpg`** として保存(CSVの「保存ファイル名(例)」のとおり)
4. CSVの「取得状況」を `済` にして、必要なら role(hero/card/scene)を直す
5. `npm run all` を実行(CSV→登録→取り込み→反映まで一括)
   - `npm run all` の先頭で `gen_sources_from_csv` が走り、「取得状況=済」かつ
     inbox に画像がある行だけを `sources.photoac.yaml` に自動生成 → 取り込まれる
   - **手書きの sources.yaml 登録は不要**。CSV が実質の入力になる

## ライセンス記録

`sources.yaml`(または将来の自動生成)では、写真AC素材を次のように記録する:

```yaml
  source_name: 写真AC
  source_url: https://www.photo-ac.com/main/search?q=<温泉名>   # 取得元
  terms_url: https://www.photo-ac.com/main/dakimakura/kiyaku   # 利用規約
  terms_rank: A            # 申請不要・クレジット不要・継続利用可 ⇒ A相当
  source_type: stock       # 自治体ライブラリではなくフリー素材
  credit_required: false
  license_note: 写真AC / AC Works License。施設・人物権利は確認済みのものを使用
```

## CSV → 登録の自動化(実装済み)

`scripts/gen_sources_from_csv.mjs`(= `npm run gen-sources`、`npm run all` の先頭でも自動実行)が、
CSVの「取得状況=済」の行から登録エントリを `manifest/sources.photoac.yaml` に生成する。
手書き登録ゼロで、**「DL → CSVに済と書く → `npm run all`」** だけで反映まで通る。

- 写真AC素材は `source_type: stock` / `terms_rank: A 相当`(申請不要・クレジット不要)として登録
- `acquired_at` は実行日。CSVに「取得日」列を足せばそちらを優先
- 「済」なのに inbox に画像が無い行は安全にスキップ(警告表示)
