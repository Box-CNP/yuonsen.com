# sources.yaml スキーマ仕様

`manifest/sources.yaml` は **人が手で書く唯一のファイル**。
`inbox/` に置いた原本画像 1 枚につき 1 エントリを書き、「どの温泉の・どこから取った・どの規約の写真か」を記述する。
設計書 §3 / §2(photoエンティティ)準拠。

YAML のトップレベルは **エントリの配列**(`- file: ...` の繰り返し)。

## フィールド一覧

| キー | 必須 | 型 | 説明 |
|---|---|---|---|
| `file` | ✅ | string | `inbox/` からの相対パス。例 `旅東北/銀山温泉_雪夜.jpg`。実ファイルと一致必須 |
| `onsen_id` | ✅ | number | 紐づく温泉ID。1–96 かつ roster に実在すること |
| `role` | ✅ | enum | `hero` \| `card` \| `scene` \| `exterior` \| `town` |
| `source_type` | ⬜ | enum | `library` \| `facility` \| `own` \| `ugc`(省略時 `library`) |
| `source_name` | ✅ | string | 判定表のライブラリー名。例 `旅東北` |
| `source_url` | ✅ | string | 取得元ページURL |
| `terms_url` | ✅ | string | 利用規約ページURL |
| `terms_rank` | ✅ | enum | `A` \| `B` \| `C`。**`D` は取り込み禁止(validateでエラー停止)** |
| `credit_required` | ✅ | bool | `true` なら UI でクレジット表示必須 |
| `credit_text` | ⬜ | string | 表示文。省略時は 03_register が source_name から補完。不要なら空 |
| `license_note` | ⬜ | string | `観光PR目的・加工不可` 等の自由メモ |
| `acquired_by` | ✅ | enum | `download` \| `application` |
| `acquired_at` | ✅ | date | 取得日 `YYYY-MM-DD` |
| `applied_no` | △ | string | 申請制(`terms_rank: C`)では必須。受付番号 |
| `id` | ⬜ | string | photo ID。省略時 03_register が `p_<onsen>_<連番>` で自動採番 |

## バリデーション規則(01_validate.mjs が強制)

1. `inbox/` の全画像が sources.yaml に記載されているか(記載漏れ → NG)
2. 必須項目がすべて埋まっているか
3. `terms_rank: D` が混入 → **エラーで停止**(設計書 §1・§7)
4. `terms_rank: C` なのに `applied_no` 無し → 警告
5. `onsen_id` が 1–96 かつ roster(`db/onsen_roster.json`)に実在するか
6. `role` / `source_type` / `acquired_by` が許可された enum 値か
7. `file` が `inbox/` 内に実在するか / `..` を含む不正パスでないか
