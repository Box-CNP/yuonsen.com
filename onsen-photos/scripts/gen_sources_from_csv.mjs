#!/usr/bin/env node
// gen_sources_from_csv.mjs — 写真AC ショッピングリストCSV → sources.photoac.yaml
//
// photoac_shopping_list.csv のうち「取得状況=済」かつ inbox に画像が存在する行から、
// sources.yaml と同形式のエントリを自動生成する(別ファイル sources.photoac.yaml に出力)。
// 人が書く sources.yaml は触らない。loadManifest が両方をマージして読む。
//
// 流れ: 画像DL → CSVの「取得状況」を 済 にする → このスクリプト → npm run all
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { PATHS, c } from './_lib.mjs';

const CSV = path.join(path.dirname(PATHS.manifest), 'photoac_shopping_list.csv');
const OUT = path.join(path.dirname(PATHS.manifest), 'sources.photoac.yaml');
const TERMS_URL = 'https://www.photo-ac.com/main/dakimakura/kiyaku';
const TODAY = new Date().toISOString().slice(0, 10);
const DONE = new Set(['済', 'done', '完了', '✓', 'x', 'yes', 'true']);

// --- 最小CSVパーサ(引用符・カンマ・改行・CRLF・BOM対応) ---
function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch === '\r') { /* skip, handled by \n */ }
    else field += ch;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

if (!fs.existsSync(CSV)) {
  console.error(c.red(`✗ ${CSV} がありません。`));
  process.exit(1);
}
const rows = parseCsv(fs.readFileSync(CSV, 'utf8'));
const header = rows.shift().map((h) => h.trim());

// ヘッダ名から列インデックスを柔軟に解決
const col = (pred) => header.findIndex(pred);
const idx = {
  onsen_id: col((h) => h === 'onsen_id'),
  file: col((h) => h.includes('保存ファイル名')),
  status: col((h) => h.includes('取得状況')),
  role: col((h) => h === 'role'),
  source_url: col((h) => h.includes('検索') || h.toUpperCase().includes('URL')),
  source_name: col((h) => h === 'source_name'),
  license: col((h) => h === 'license'),
  acquired_at: col((h) => h.includes('取得日')),
};
const get = (r, i) => (i >= 0 && r[i] != null ? String(r[i]).trim() : '');

const entries = [];
const skipped = [];
let notDone = 0;

for (const r of rows) {
  const status = get(r, idx.status).toLowerCase();
  if (!DONE.has(get(r, idx.status)) && !DONE.has(status)) { notDone++; continue; }

  const file = get(r, idx.file);
  const onsen_id = parseInt(get(r, idx.onsen_id), 10);
  if (!file || !Number.isInteger(onsen_id)) {
    skipped.push({ file: file || `(onsen_id ${get(r, idx.onsen_id)})`, why: 'file/onsen_id 不足' });
    continue;
  }
  // 画像が inbox に実在するか
  if (!fs.existsSync(path.join(PATHS.inbox, file))) {
    skipped.push({ file, why: 'inbox に画像が無い(取得状況だけ済になっている?)' });
    continue;
  }

  entries.push({
    file,
    onsen_id,
    role: get(r, idx.role) || 'hero',
    source_type: 'stock',
    source_name: get(r, idx.source_name) || '写真AC',
    source_url: get(r, idx.source_url) || 'https://www.photo-ac.com/',
    terms_url: TERMS_URL,
    terms_rank: 'A', // 申請不要・クレジット不要・継続利用可 ⇒ A相当
    credit_required: false,
    license_note: get(r, idx.license) || '写真AC / AC Works License',
    acquired_by: 'download',
    acquired_at: get(r, idx.acquired_at) || TODAY,
  });
}

const banner =
  '# 自動生成: scripts/gen_sources_from_csv.mjs(photoac_shopping_list.csv の「取得状況=済」から生成)\n' +
  '# このファイルは手で編集しない。CSV を直して再生成すること。\n' +
  '# 手書きの登録は manifest/sources.yaml 側に書く(両方マージして読まれる)。\n\n';
const body = entries.length ? yaml.dump(entries, { noRefs: true, lineWidth: -1 }) : '[]\n';
fs.writeFileSync(OUT, banner + body);

console.log(c.bold('\n=== gen_sources_from_csv: 写真AC CSV → sources.photoac.yaml ==='));
console.log(`生成 ${entries.length} 件 / 未取得(済でない) ${notDone} 件 / スキップ ${skipped.length} 件`);
for (const s of skipped) console.log(c.yellow(`  ⚠ skip [${s.file}] ${s.why}`));
console.log(c.dim(`  出力: ${path.relative(process.cwd(), OUT)}`));
if (entries.length) console.log(c.green('  → 続けて `npm run all` で取り込み・反映できます。'));
