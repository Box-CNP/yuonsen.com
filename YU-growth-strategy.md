# YU 成長戦略メモ — 「サウナイキタイの英語温泉版」

作成: 2026-07-08（Cowork戦略チャットより）
目的: YU開発チャットに引き継ぐための戦略＋実装指示書

---

## 1. ポジショニング

**英語圏に「泉質・作法・タトゥー可否・日帰り可否を構造化した検索型温泉DB」は存在しない。** ここがYUの席。

- 日本語圏は飽和（ニフティ温泉、ゆこゆこ、ゆる〜と等）→ 戦わない
- 英語圏の既存プレイヤーはタトゥー単機能（tattoo-friendly.jp / tattoo-friendly.com / tattoofriendlyonsen.com）か読み物記事（japan-guide）のみ
- タトゥーは競合の唯一の切り口 ＝ YUでは一属性にすぎない、という位置関係が勝ち筋
- 外国人の旅程づくりはすでに ChatGPT / Reddit / TikTok が入口 → 勝負はGoogle SEOではなく**AI検索の引用元の座**

## 2. モデルケース: サウナイキタイ

個人の趣味開発 → 半年で約5,000施設を網羅 → 2年目売上7,288万円、月間646万PV。
成功要因の順序が重要: **①網羅性 → ②チェックインUGC → ③Twitterコミュニティ → ④SEO**。
YUはこの順序を英語圏で再現する。①はデータ約1,400湯で着手済み。②は湯録として実装済み。③はTwitterではなくReddit。④はSEOではなくLLMO。

## 3. 真似されない資産（Moat）

| # | Moat | 急ぐ？ |
|---|---|---|
| 1 | AI検索での引用地位（先行者が固定されやすい） | **最優先。時計は公開日から動く** |
| 2 | 検証済み一次情報（実訪・自治体提携・権利処理済み写真） | 焦らず積む |
| 3 | 湯録UGCの蓄積（ネットワーク効果） | フェーズ2 |
| 4 | 自治体との関係 | 既に保有。実績が出てから声かけ |

名前と座標のDBは誰でも真似できる。上の4つは真似できない。

## 4. 優先アクション

1. **狭くてもまず英語で公開**（深い100湯＋薄い1,300湯で先に出す。完璧を待たない）
2. **プログラマティックページ＋構造化データ**（下記 §5 実装指示）
3. **Reddit r/JapanTravel に専門家として常駐**（宣伝せず回答。週2〜3件。Redditの回答はAIの引用源にもなる）
4. **バズは狙わない**（TikTok/Reelsは来たら儲けもの。やるなら onsen etiquette / tattoo rules 系の定番のみ）
5. **KPIは1つ**: 月1回、ChatGPT / Perplexity に英語で聞いてYUが引用されるか（例: "best sulfur onsen in Kansai", "tattoo friendly onsen day trip from Osaka"）

マネタイズは後。YUがIP/ブランドとして確立すれば自治体・旅館コラボはいくらでも作れる。

---

## 5. 実装指示: プログラマティックLLMO（YU開発チャットへ）

### 5-1. データ拡充（ページ生成の前提）

各湯レコードに以下のフィールドを追加していく。**このフィールド群こそが競合に対する物量戦の弾**:

- `spring_type[]` — 泉質（単純温泉/塩化物泉/炭酸水素塩泉/硫酸塩泉/二酸化炭素泉/含鉄泉/酸性泉/含よう素泉/硫黄泉/放射能泉 の環境省11分類ベース）＋ pH ＋ 源泉温度
- `tattoo_policy` — ok / covered_ok（カバーシール可）/ private_only（貸切なら可）/ ng / unknown
- `day_use` — 可否・料金・時間
- `private_bath` — 貸切風呂の有無（タトゥー層・家族層に効く）
- `access` — 最寄駅・駅からの手段と所要時間（外国人はレンタカー前提でない）
- `english_support` — none / signage / staff
- `benefit_tags[]` — 美肌 / 疲労回復 / 皮膚など効能タグ（英語では "beauty-bath" 等に変換）
- `gensen_kakenagashi` — 源泉かけ流しか
- 写真（権利処理済みのみ。credit必須フィールド）

全項目を一気に埋めない。**旗艦エリア（玉造・松江→姫路〜朝来〜城崎回廊）から深く**、他は wikidata ベースの薄いままで公開してよい。`unknown` は unknown と表示する（誠実さがAIと人間双方への信頼になる）。

### 5-2. プログラマティックページの設計

DBから「泉質 × エリア × 属性」の掛け合わせページを自動生成:

- URL例: `/en/onsen/kansai/sulfur/` `/en/onsen/osaka/tattoo-friendly/day-trip/` `/en/onsen/shimane/beauty-bath/`
- **生成条件: 該当施設3件以上のページのみ生成**（薄いページはAIにも検索にも毒）
- 各ページ冒頭に固有のイントロ文（AIドラフト→人間確認。テンプレ文の使い回しは不可）
- ページ内は施設カードのリスト＋比較表（泉質・料金・タトゥー・アクセスを表で。AIは表を引用しやすい）
- 内部リンク: 個別施設ページ ⇄ 掛け合わせページ ⇄ エリアハブを密に張る
- hreflang で ja / en を対応付け

### 5-3. 構造化データ（schema.org）

schema.org に HotSpring 型は無いので組み合わせで表現:

- 個別施設: `TouristAttraction`（+ 日帰り施設は `HealthAndBeautyBusiness`、旅館は `LodgingBusiness`）に `geo`, `openingHours`, `priceRange`, `amenityFeature`（tattoo policy, private bath, sauna等を `LocationFeatureSpecification` で列挙）
- 一覧ページ: `ItemList` ＋ `BreadcrumbList`
- 作法・タトゥー等の解説: `FAQPage`（AI検索が最も拾いやすい型）
- エリアページ: `TouristDestination`
- `sitemap.xml` と `llms.txt` を配置。主要ページはJSが無くてもコンテンツが読める形で出力（ビルド時静的生成。現行の build-site.mjs 路線でOK）

### 5-4. AI引用の月次チェック（KPI運用）

毎月同じ質問セットを ChatGPT / Perplexity / Google AI Overviews に投げ、YUの引用有無を記録:

1. best sulfur onsen in Kansai
2. tattoo friendly onsen near Osaka
3. day trip onsen from Kyoto with private bath
4. what is beauty bath (bijin-no-yu) onsen
5. onsen etiquette for first-timers

---

## 6. UGC戦略（フェーズ設計）

サウナイキタイの順序に倣う: **DBの網羅性が先、UGCは後**。ニワトリ卵を無理に解かない。

- **Phase 1（現在〜公開）**: 編集データで価値を出す。口コミゼロでも「構造化された事実」だけで使えるサイトにする。LLMOは事実データで戦える（AIが引用するのは口コミより構造化ファクト）
- **Phase 2（トラフィック発生後）**: 湯録チェックインを前面に。摩擦最小（ログイン→1タップ）。「みんなが灯した湯」ランキングが動き出せば回遊が生まれる
- **Phase 3（コミュニティ形成後）**: テキスト口コミ解放。英語圏の初期レビューは Reddit で信頼を築いた相手からの招待制で種まきする（サウナイキタイがTwitterコミュニティから口コミを育てたのと同型）。モデレーションコストが発生するので一人運営のうちは急がない

注意: 他サイトからのレビュー転載・スクレイピングはしない（写真パイプラインと同じ原則。規約遵守が自治体関係の資産を守る）。

## 7. 旗艦エリア

1. **玉造温泉（松江市）** — 美肌の湯ブランド×縁結び（出雲）。英語圏にほぼ未開拓。自治体と関係あり
2. **姫路〜朝来（竹田城）〜城崎〜松江の回廊** — 大阪起点で外国人が実際に動けるルート。城崎はインバウンド温泉の成功例で検索需要が既にある
3. 第二弾候補: 今治（鈍川温泉×しまなみ海道サイクリスト）

自治体への写真提供・連携の打診は、公開してアクセス実績が出てから。ただし観光課への情報照会・取材レベルは個人プロジェクトでも今すぐ可。

---

## 参考ソース

- サウナイキタイ分析: https://note.com/app_dev_lab/n/n622ce23703f7 / https://ecco.co.jp/blog/sauna-marketing-strategy/
- 競合: https://tattoo-friendly.jp / https://www.tattoo-friendly.com / https://www.tattoofriendlyonsen.com / https://onsen.nifty.com / https://yuru-to.net
- AI旅行計画の潮流: https://www.euronews.com/next/2026/04/11/how-will-ai-impact-tourism-and-travel-your-next-trip-could-be-entirely-planned-by-chatgpt / https://www.japantravelpros.com/blog/plan-japan-trip-feel-less-overwhelmed
