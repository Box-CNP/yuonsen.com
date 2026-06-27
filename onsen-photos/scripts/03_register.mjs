#!/usr/bin/env node
// 03_register.mjs — DB登録(設計書 §4 / §2)
//
// - sources.yaml + 02 の処理結果(寸法等)から photo エンティティを生成
// - db/photos.json にマージ(既存は id で上書き、新規は追加)
// - credit_text を source_name から自動補完(credit_required=true かつ未記入のとき)
// - 1温泉に複数写真がある場合、role=hero を先頭にする hero 優先順位を決定
import fs from 'node:fs';
import path from 'node:path';
import {
  PATHS, CREDIT_DEFAULTS, loadManifest, loadRoster, assignIds, c,
} from './_lib.mjs';

if (!fs.existsSync(PATHS.processReport)) {
  console.error(c.red('✗ 先に 02_process.mjs を実行してください(処理レポートがありません)。'));
  process.exit(1);
}
const proc = JSON.parse(fs.readFileSync(PATHS.processReport, 'utf8'));
const procById = new Map(proc.results.map((r) => [r.id, r]));

const manifest = loadManifest();
const roster = loadRoster();
const assigned = assignIds(manifest, roster);

function normDate(v) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v);
}

function creditText(entry) {
  if (entry.credit_text !== undefined && entry.credit_text !== '') return entry.credit_text;
  if (!entry.credit_required) return ''; // 不要なら空
  return CREDIT_DEFAULTS[entry.source_name] ?? `写真提供:${entry.source_name}`;
}

// 既存 photos.json を読み込み(id キーのマップに)
let existing = [];
if (fs.existsSync(PATHS.photosJson)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(PATHS.photosJson, 'utf8'));
    existing = Array.isArray(parsed) ? parsed : (parsed.photos ?? []);
  } catch {
    existing = [];
  }
}
const byId = new Map(existing.map((p) => [p.id, p]));

let added = 0;
let updated = 0;
let skipped = 0;

for (const { entry, id } of assigned) {
  const pr = procById.get(id);
  if (!pr) {
    // 02 で処理されていない(inbox に画像が無い等)→ DB には登録しない
    skipped++;
    continue;
  }

  const photo = {
    id,
    onsen_id: entry.onsen_id,
    role: entry.role,
    source_type: entry.source_type ?? 'library',
    source_name: entry.source_name,
    source_url: entry.source_url ?? '',
    terms_url: entry.terms_url ?? '',
    terms_rank: entry.terms_rank,
    credit_required: !!entry.credit_required,
    credit_text: creditText(entry),
    license_note: entry.license_note ?? '',
    acquired_by: entry.acquired_by,
    acquired_at: normDate(entry.acquired_at),
    applied_no: entry.applied_no ?? '',
    orig_filename: pr.orig_filename,
    width: pr.width,
    height: pr.height,
    webp_path: pr.webp_path,
    webp_w: pr.webp_w,
    thumb_path: pr.thumb_path,
    blurhash: pr.blurhash ?? '',
  };

  if (byId.has(id)) updated++; else added++;
  byId.set(id, photo);
}

// hero 優先順位: onsen_id ごとに role=hero を先頭へ。
// 安定ソートで、温泉ID昇順 → hero優先 → id昇順 に並べる。
const roleRank = (r) => (r === 'hero' ? 0 : 1);
const merged = [...byId.values()].sort((a, b) =>
  a.onsen_id - b.onsen_id ||
  roleRank(a.role) - roleRank(b.role) ||
  String(a.id).localeCompare(String(b.id)),
);

fs.mkdirSync(PATHS.db, { recursive: true });
fs.writeFileSync(PATHS.photosJson, JSON.stringify(merged, null, 2) + '\n');

console.log(c.bold('\n=== 03_register: photos.json 生成/更新 ==='));
console.log(`新規 ${added} / 更新 ${updated} / 未処理スキップ ${skipped}`);
console.log(`DB 合計: ${merged.length} 件`);
console.log(c.dim(`  出力: ${path.relative(process.cwd(), PATHS.photosJson)}`));
