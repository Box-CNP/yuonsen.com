# 公開手順 — Cloudflare Pages + Supabase

「お湯から、探す。」を、アカウント＋端末間同期つきで公開するための手順。
**あなたの作業(アカウント作成・キー取得)** と **こちらの作業(コード)** を分けてあります。

---

## あなたにやってほしいこと(私には代行できない部分)

### A. Supabase(認証＋記録の同期DB)— 5〜10分
1. https://supabase.com で無料アカウント作成 → 新規プロジェクト作成(リージョンは Tokyo)
2. 左メニュー **SQL Editor** → [supabase-schema.sql](supabase-schema.sql) の中身を貼り付けて **Run**
3. **Authentication → Providers** で使うログイン方法を有効化
   - 手軽さ重視:**Email(Magic Link)** だけでOK(パスワード不要、メールのリンクでログイン)
   - SNS連携したいなら Google / Apple / LINE も(各々の設定が必要)
4. **Authentication → URL Configuration** の Site URL に、公開後のURL(下のCloudflareのURL)を追加
5. **Project Settings → API** から2つの値を控える:
   - `Project URL`(例 `https://xxxx.supabase.co`)
   - `anon public` key(公開して安全なキー。RLSが守る)

### B. Cloudflare Pages(ホスティング)— 5分
1. https://dash.cloudflare.com で無料アカウント作成
2. このプロジェクトを GitHub に置く(後述のC)→ **Workers & Pages → Create → Pages → Connect to Git**
3. ビルド設定:**フレームワークなし / ビルドコマンドなし / 出力ディレクトリ = `/`(ルート)**
4. デプロイ完了で `https://xxxx.pages.dev` が発行される(独自ドメインも後で割当可)

### C. GitHub(任意だが推奨 / 自動デプロイ用)
- このフォルダを git リポジトリにして GitHub に push(私が `git init` から手伝えます)
- 以後 push するたび Cloudflare Pages が自動で再デプロイ

### D. 最後にキーを渡す
- A-5 で控えた `Project URL` と `anon public` key を私に教えてください
  (または `app-config.js` に貼るだけ。場所はこちらで用意します)

---

## こちらでやること(コード)

- [ ] デプロイ用エントリ(`index.html`)の用意とパス確認
- [ ] Supabase クライアント読込＋設定(キーは `app-config.js` に分離)
- [ ] 既存のデモ認証 → 本物のSupabase認証(Magic Link / SNS)に差し替え
- [ ] 湯録・チェックインの保存を `window.storage`(端末内)→ Supabase(クラウド同期)へ
  - 未ログイン時は従来どおり端末内に保存し、ログインで同期(オフラインでも壊れない設計)
- [ ] 写真パイプラインの `dist/` と `db/*.js` も同梱して配信

> キーが無くても**ローカル保存で動く**ように作るので、公開前でもアプリは常に動作します。
> A・B が済んでキーをもらえたら、認証＋同期を有効化して本番確認します。

---

## 公開後の安全メモ
- `anon public` key はフロント露出OK(RLSで各ユーザーの行だけに制限)。
- `service_role` key は**絶対にフロントに置かない**。
- GPSチェックインは偽装可能。お楽しみのスタンプラリーとしては十分だが、
  賞品など実利を絡めるならサーバ側検証を別途検討。
