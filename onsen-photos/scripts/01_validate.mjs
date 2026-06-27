#!/usr/bin/env node
// 01_validate.mjs — 取り込み前チェック(設計書 §4)
//
// - inbox/ の全ファイルが sources.yaml に記載されているか(漏れ検出)
// - 各エントリの必須項目が埋まっているか
// - terms_rank: D が混入していないか → エラーで停止
// - terms_rank: C なのに applied_no が無い → 警告
// - onsen_id が 1-96 の範囲か、roster に実在するか
// - enum 値(role / source_type / acquired_by)の妥当性
// - 出力: db/validate-report.json(OK/NG一覧)。NGがあれば exit 1(後続を実行しない)
import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS, ENUMS, REQUIRED_FIELDS, loadManifest, loadRoster,
  listInboxImages, IMAGE_EXTS, c,
} from './_lib.mjs';

const errors = [];   // 致命: 後続を止める
const warnings = []; // 警告: 続行可
const err = (file, msg) => errors.push({ file, msg });
const warn = (file, msg) => warnings.push({ file, msg });

const manifest = loadManifest();
const roster = loadRoster();
const validIds = new Set(roster.ids);

// --- 1. inbox とマニフェストの突き合わせ ---
const inboxImages = listInboxImages();
const manifestFiles = new Map();
manifest.forEach((e, i) => {
  if (e && typeof e.file === 'string') {
    if (manifestFiles.has(e.file)) {
      err(e.file, `file が重複しています(エントリ #${manifestFiles.get(e.file) + 1} と #${i + 1})`);
    } else {
      manifestFiles.set(e.file, i);
    }
  }
});

// inbox にあるのに manifest に無い(記載漏れ)
for (const img of inboxImages) {
  if (!manifestFiles.has(img)) {
    err(img, 'inbox に存在するが sources.yaml に記載がありません(記載漏れ)');
  }
}

// --- 2. 各エントリのフィールド検証 ---
manifest.forEach((e, i) => {
  const tag = (e && e.file) || `#${i + 1}`;
  if (e == null || typeof e !== 'object') {
    err(tag, 'エントリがオブジェクトではありません');
    return;
  }

  // 必須項目
  for (const f of REQUIRED_FIELDS) {
    const v = e[f];
    if (v === undefined || v === null || v === '') {
      err(tag, `必須項目が未記入: ${f}`);
    }
  }

  // file 実在 + パストラバーサル防止
  if (typeof e.file === 'string') {
    if (e.file.includes('..') || path.isAbsolute(e.file)) {
      err(tag, `file は inbox 内の相対パスである必要があります: ${e.file}`);
    } else {
      const abs = path.join(PATHS.inbox, e.file);
      if (!fs.existsSync(abs)) {
        err(tag, `file が inbox に存在しません: ${e.file}`);
      } else if (!IMAGE_EXTS.has(path.extname(e.file).toLowerCase())) {
        warn(tag, `画像拡張子ではありません: ${e.file}`);
      }
    }
  }

  // onsen_id
  if (e.onsen_id !== undefined) {
    if (!Number.isInteger(e.onsen_id)) {
      err(tag, `onsen_id は整数である必要があります: ${e.onsen_id}`);
    } else if (e.onsen_id < 1 || e.onsen_id > 96) {
      err(tag, `onsen_id が範囲外(1-96): ${e.onsen_id}`);
    } else if (!validIds.has(e.onsen_id)) {
      err(tag, `onsen_id が roster に実在しません: ${e.onsen_id}`);
    }
  }

  // enum 検証
  for (const key of ['role', 'source_type', 'acquired_by']) {
    if (e[key] !== undefined && !ENUMS[key].includes(e[key])) {
      err(tag, `${key} が不正値: ${e[key]}(許可: ${ENUMS[key].join(' / ')})`);
    }
  }

  // terms_rank: D は禁止 → 致命エラー。A/B/C 以外も拒否。
  if (e.terms_rank !== undefined) {
    if (e.terms_rank === 'D') {
      err(tag, 'terms_rank: D は取り込み禁止です(継続運用と両立しない/§1・§7)');
    } else if (!ENUMS.terms_rank.includes(e.terms_rank)) {
      err(tag, `terms_rank が不正値: ${e.terms_rank}(許可: A / B / C)`);
    }
  }

  // credit_required は bool
  if (e.credit_required !== undefined && typeof e.credit_required !== 'boolean') {
    err(tag, `credit_required は true/false である必要があります: ${e.credit_required}`);
  }

  // acquired_at は YYYY-MM-DD
  if (e.acquired_at !== undefined) {
    const s = String(e.acquired_at instanceof Date ? e.acquired_at.toISOString().slice(0, 10) : e.acquired_at);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      warn(tag, `acquired_at は YYYY-MM-DD 形式を推奨: ${e.acquired_at}`);
    }
  }

  // terms_rank: C なのに applied_no が無い → 警告
  if (e.terms_rank === 'C' && (e.applied_no === undefined || e.applied_no === '')) {
    warn(tag, 'terms_rank: C(申請制)ですが applied_no が未記入です');
  }
});

// --- レポート出力 ---
const report = {
  generated_at: new Date().toISOString(),
  manifest_entries: manifest.length,
  inbox_images: inboxImages.length,
  ok: errors.length === 0,
  errors,
  warnings,
};
fs.mkdirSync(PATHS.db, { recursive: true });
fs.writeFileSync(PATHS.validateReport, JSON.stringify(report, null, 2) + '\n');

// --- コンソール出力 ---
console.log(c.bold('\n=== 01_validate: 取り込み前チェック ==='));
console.log(`マニフェスト: ${manifest.length} 件 / inbox 画像: ${inboxImages.length} 枚`);

for (const w of warnings) console.log(c.yellow(`  ⚠ WARN  [${w.file}] ${w.msg}`));
for (const e of errors) console.log(c.red(`  ✗ NG    [${e.file}] ${e.msg}`));

if (errors.length === 0) {
  console.log(c.green(`\n✓ OK — エラーなし(警告 ${warnings.length} 件)。後続(02_process)を実行できます。`));
  console.log(c.dim(`  レポート: ${path.relative(process.cwd(), PATHS.validateReport)}`));
  process.exit(0);
} else {
  console.log(c.red(`\n✗ NG — エラー ${errors.length} 件。後続は実行しません。上記を修正してください。`));
  console.log(c.dim(`  レポート: ${path.relative(process.cwd(), PATHS.validateReport)}`));
  process.exit(1);
}
