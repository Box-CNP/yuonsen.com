#!/usr/bin/env node
// build-site.mjs — Cloudflare Pages 用に「公開して良いアセットだけ」を public/ へ組み立てる。
// 開発ファイル(scripts/ , node_modules , 設計md , *.bak 等)は配信しない。
// Cloudflare Pages 設定: Build command = `node build-site.mjs` / Output directory = `public`
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'public');

const copy = (src, dst) => {
  if (!fs.existsSync(src)) { console.warn('  (skip, 無し) ' + path.relative(ROOT, src)); return; }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
  console.log('  + ' + path.relative(ROOT, dst));
};

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

console.log('public/ を組み立て中…');
// アプリ本体 → index.html(Cloudflare Pages のエントリ)
copy(path.join(ROOT, 'oyu-search-prototype-v21_1.html'), path.join(OUT, 'index.html'));
// 公開設定(Supabaseキー)
copy(path.join(ROOT, 'app-config.js'), path.join(OUT, 'app-config.js'));
// ページが <script src> で読む生成物(写真・プレースホルダ)
copy(path.join(ROOT, 'onsen-photos/db/site_photos.js'), path.join(OUT, 'onsen-photos/db/site_photos.js'));
copy(path.join(ROOT, 'onsen-photos/db/placeholders.js'), path.join(OUT, 'onsen-photos/db/placeholders.js'));
// 写真の実体(WebP)。今は空でも、写真が増えればそのまま配信される
copy(path.join(ROOT, 'onsen-photos/dist'), path.join(OUT, 'onsen-photos/dist'));

console.log('完了: ' + path.relative(ROOT, OUT) + '/ を Cloudflare Pages の出力ディレクトリに指定');
