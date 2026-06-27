# イメージ画像(プレースホルダ)CC0 取得ガイド

実写真がまだ無い湯に出す「※写真はイメージです」画像を、**最小3枚**そろえるための手順。
全96湯を `sea` / `mountain` / `town` の3カテゴリで使い回す(湯色別などはあとから追加可)。

## 必要な3枚

| カテゴリ | 使われる湯 | 探す言葉(例) | 雰囲気 |
|---|---|---|---|
| `sea` | 海辺の湯 | `onsen sea`, `日本海 海岸`, `coastal hot spring` | 海・海岸・水平線 |
| `mountain` | 山・秘湯 | `rotenburo mountain`, `露天風呂 山`, `hot spring snow` | 山・露天・雪・湯気 |
| `town` | 温泉街・里の湯 | `onsen town`, `温泉街 夜`, `ryokan street lantern` | 温泉街・旅館・灯り |

横長(landscape)・**幅1600px以上**を選ぶと heroスロットでも綺麗。パイプラインが縮小・WebP化・EXIF除去を自動でやるので、加工不要でそのまま置けばOK。

## 「本物のCC0」をどこで探すか

ライセンスの正確さがこのプロジェクトの肝なので、出所を選ぶ:

- **Openverse**(openverse.org)— 検索後、ライセンスで **CC0** に絞り込める。一番手軽で確実。
- **Wikimedia Commons**(commons.wikimedia.org)— CC0 / パブリックドメインが多い。ファイルページにライセンスが明記。
- ⚠ **Unsplash / Pixabay / Pexels** — 「商用無料・クレジット不要」だが**厳密にはCC0ではなく各社独自ライセンス**(再販不可・競合サービス化不可などの条件あり)。使ってもよいが、その場合は `placeholders.yaml` の `license` に実際の名称(例 `Unsplash License`)を正直に記録すること。

CC-BY(表示義務あり)の素材を使う場合は、`placeholders.yaml` の `credit` に表示文を入れる → サイトは「※イメージ」ではなく**出典帯**で出す。CC0 は `credit` 空でOK。

## 手順(10分)

1. 上記サイトで3カテゴリ分の画像を1枚ずつ選ぶ
2. ファイル名を `sea.jpg` / `mountain.jpg` / `town.jpg` にして
   `onsen-photos/inbox/_placeholders/` に置く
3. `manifest/placeholders.yaml` の各カテゴリに **出典URL・ライセンス**を記入
   (後から監査できるように。CC0 なら `credit` は空のまま)
4. `npm run placeholders` を実行(または `npm run all`)
5. ブラウザでプロトタイプを再読み込み → 全湯が写真イメージに切り替わる

> 差し替えも同じ。あとで本物の写真が手に入った湯は、実写真パイプライン(`sources.yaml`)側に入れれば、その湯だけイメージ→実写真に自動で上書きされる。
