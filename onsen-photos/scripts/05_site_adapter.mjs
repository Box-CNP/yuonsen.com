#!/usr/bin/env node
// 05_site_adapter.mjs — サイト結線アダプタ(設計書 §5)
//
// db/photos.json を、温泉サイトのプロトタイプが食える形(onsen_id をキーにした
// 実画像参照のマップ)に変換する。プロトタイプ HTML 自体は書き換えない。
// 出力:
//   - db/site_photos.json … 汎用 JSON(他用途・確認用)
//   - db/site_photos.js   … `window.PHOTOS_REAL = {...}` を定義する読み込み用スニペット
//
// プロトタイプ側は cardMedia/heroMedia で PHOTOS_REAL[o.id] を優先参照すれば、
// 写真がある湯は WebP、無い湯は従来の線画フォールバックのまま、で順次反映できる。
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, c } from './_lib.mjs';

// 公開時の画像ベースパス。dist/ を web ルートの /photos/ に配置する前提(§5)。
// 別パスに置くなら環境変数 PHOTO_BASE で上書き(例 PHOTO_BASE=./onsen-photos/dist)。
const BASE = process.env.PHOTO_BASE ?? '/photos';
const rebase = (p) => (p || '').replace(/^\/photos/, BASE);

if (!fs.existsSync(PATHS.photosJson)) {
  console.error(c.red('✗ db/photos.json がありません。先に 03_register.mjs を実行してください。'));
  process.exit(1);
}
const photos = JSON.parse(fs.readFileSync(PATHS.photosJson, 'utf8'));

// onsen_id ごとにまとめる。photos.json は既に「温泉ID昇順 → hero優先」で並んでいるので、
// 配列の先頭が hero(あれば)になる。
const byOnsen = {};
for (const p of photos) {
  (byOnsen[p.onsen_id] ??= []).push({
    id: p.id,
    src: rebase(p.webp_path),
    thumb: rebase(p.thumb_path),
    w: p.webp_w,
    blurhash: p.blurhash || '',
    role: p.role,
    // クレジットは credit_required を見て自動。A ランク(不要)は空 → 帯を出さない。
    credit_required: !!p.credit_required,
    credit: p.credit_required ? (p.credit_text || `写真提供:${p.source_name}`) : '',
    source_name: p.source_name,
    terms_rank: p.terms_rank,
  });
}

fs.mkdirSync(PATHS.db, { recursive: true });
const jsonPath = path.join(PATHS.db, 'site_photos.json');
const jsPath = path.join(PATHS.db, 'site_photos.js');
fs.writeFileSync(jsonPath, JSON.stringify(byOnsen, null, 2) + '\n');
fs.writeFileSync(
  jsPath,
  '/* 自動生成: scripts/05_site_adapter.mjs。手で編集しない。 */\n' +
  'window.PHOTOS_REAL = ' + JSON.stringify(byOnsen, null, 2) + ';\n',
);

const onsenCount = Object.keys(byOnsen).length;
console.log(c.bold('\n=== 05_site_adapter: サイト結線データ生成 ==='));
console.log(`写真 ${photos.length} 枚 / 対象 ${onsenCount} 湯 / ベースパス ${BASE}`);
console.log(c.dim(`  出力: ${path.relative(process.cwd(), jsonPath)}`));
console.log(c.dim(`        ${path.relative(process.cwd(), jsPath)}`));
