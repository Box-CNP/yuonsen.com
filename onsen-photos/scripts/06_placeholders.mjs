#!/usr/bin/env node
// 06_placeholders.mjs — イメージ画像(プレースホルダ)処理
//
// manifest/placeholders.yaml に登録した CC0/フリー素材を、実写真と同じ規則で
// 縮小・WebP化・EXIF除去して dist/_placeholders/ に出力し、サイトが食う
// db/placeholders.js(window.PLACEHOLDERS)を生成する。
//
// 実写真パイプライン(01〜05)とは独立。画像が未配置のカテゴリはスキップする。
// 禁止事項(§7)は実写真と同じ: 縮小と WebP 変換のみ・EXIF 除去。
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import yaml from 'js-yaml';
import { PATHS, SIZES, WEBP_QUALITY, c } from './_lib.mjs';

const MANIFEST = path.join(PATHS.inbox, '..', 'manifest', 'placeholders.yaml');
const INBOX_DIR = path.join(PATHS.inbox, '_placeholders');
const OUT_DIR = path.join(PATHS.dist, '_placeholders');
const BASE = process.env.PHOTO_BASE ?? '/photos';

if (!fs.existsSync(MANIFEST)) {
  console.error(c.red(`✗ ${MANIFEST} がありません。`));
  process.exit(1);
}
const spec = yaml.load(fs.readFileSync(MANIFEST, 'utf8')) || {};

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(INBOX_DIR, { recursive: true });

const out = {};
let done = 0;
const pending = [];

console.log(c.bold('\n=== 06_placeholders: イメージ画像処理 ==='));

for (const [cat, e] of Object.entries(spec)) {
  if (!e || !e.file) { pending.push(cat); continue; }
  const src = path.join(INBOX_DIR, e.file);
  if (!fs.existsSync(src)) {
    pending.push(cat);
    continue;
  }
  try {
    // 実写真と同じ: orientation を画素に適用 → 縮小のみ → WebP(メタ除去)
    const base = sharp(src, { failOn: 'error' }).rotate();
    const mainPath = path.join(OUT_DIR, `${cat}.webp`);
    const thumbPath = path.join(OUT_DIR, `${cat}.thumb.webp`);
    const mk = (w, p) => base.clone()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toFile(p);
    const [info] = await Promise.all([mk(SIZES.hero, mainPath), mk(SIZES.thumb, thumbPath)]);

    out[cat] = {
      src: `${BASE}/_placeholders/${cat}.webp`,
      thumb: `${BASE}/_placeholders/${cat}.thumb.webp`,
      w: info.width,
      // CC0 はクレジット不要 → credit 空。CC-BY 等はここに表示文が入り帯で出す。
      credit: e.credit || '',
      license: e.license || '',
      source_name: e.source_name || '',
      source_url: e.source_url || '',
    };
    done++;
    console.log(c.green(`  ✓ ${cat}`) + c.dim(`  ${e.file} (${info.width}px) license=${e.license || '?'}`));
  } catch (err) {
    console.log(c.red(`  ✗ ${cat} — ${err.message}`));
    pending.push(cat);
  }
}

fs.mkdirSync(PATHS.db, { recursive: true });
fs.writeFileSync(path.join(PATHS.db, 'placeholders.json'), JSON.stringify(out, null, 2) + '\n');
fs.writeFileSync(
  path.join(PATHS.db, 'placeholders.js'),
  '/* 自動生成: scripts/06_placeholders.mjs。手で編集しない。 */\n' +
  'window.PLACEHOLDERS = ' + JSON.stringify(out, null, 2) + ';\n',
);

console.log(`\n生成 ${done} カテゴリ / 未配置 ${pending.length}${pending.length ? ' ('+pending.join(', ')+')' : ''}`);
if (pending.length) {
  console.log(c.yellow(`  ⚠ 未配置カテゴリは inbox/_placeholders/ に画像を置いて再実行してください。`));
  console.log(c.dim('    取得ガイド: manifest/CC0_PLACEHOLDER_GUIDE.md'));
}
console.log(c.dim(`  出力: db/placeholders.js / db/placeholders.json / dist/_placeholders/`));
