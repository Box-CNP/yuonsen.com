#!/usr/bin/env node
// 04_report.mjs — ライセンス監査(設計書 §4)
//
// - 全 photo を terms_rank・source_name 別に集計
// - credit_required=true の写真のクレジット設定突き合わせ(credit_text の有無)
// - 申請制(C)案件の applied_no 一覧(申請記録として保管)
// - カバレッジ: 96湯中、写真ありが何湯か。role=hero がある湯/ない湯のリスト
// - 出力: report.md(自治体とのやり取り・内部管理用)
import fs from 'node:fs';
import path from 'node:path';
import { PATHS, loadRoster, c } from './_lib.mjs';

if (!fs.existsSync(PATHS.photosJson)) {
  console.error(c.red('✗ db/photos.json がありません。先に 03_register.mjs を実行してください。'));
  process.exit(1);
}
const photos = JSON.parse(fs.readFileSync(PATHS.photosJson, 'utf8'));
const roster = loadRoster();
const totalOnsen = roster.ids.length;

const tally = (keyFn) => {
  const m = new Map();
  for (const p of photos) {
    const k = keyFn(p);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

const byRank = tally((p) => p.terms_rank || '(不明)');
const bySource = tally((p) => p.source_name || '(不明)');

// クレジット要・突き合わせ
const creditNeeded = photos.filter((p) => p.credit_required);
const creditMissing = creditNeeded.filter((p) => !p.credit_text);

// 申請制(C)案件
const cCases = photos.filter((p) => p.terms_rank === 'C');
const cMissingNo = cCases.filter((p) => !p.applied_no);

// カバレッジ
const onsenWithPhoto = new Set(photos.map((p) => p.onsen_id));
const onsenWithHero = new Set(photos.filter((p) => p.role === 'hero').map((p) => p.onsen_id));
const onsenHavingButNoHero = [...onsenWithPhoto].filter((id) => !onsenWithHero.has(id)).sort((a, b) => a - b);

const nm = (id) => `${id} ${roster.names?.[id] ?? ''}`.trim();
const pct = (n) => `${((n / totalOnsen) * 100).toFixed(1)}%`;

const L = [];
L.push('# フォトライブラリー ライセンス監査レポート');
L.push('');
L.push(`生成: ${new Date().toISOString()}`);
L.push(`登録写真: ${photos.length} 枚 / 対象温泉: ${totalOnsen} 湯`);
L.push('');

L.push('## 1. 規約ランク別 集計');
L.push('');
L.push('| terms_rank | 枚数 |');
L.push('|---|---|');
for (const [k, n] of byRank) L.push(`| ${k} | ${n} |`);
L.push('');

L.push('## 2. 出典(source_name)別 集計');
L.push('');
L.push('| source_name | 枚数 |');
L.push('|---|---|');
for (const [k, n] of bySource) L.push(`| ${k} | ${n} |`);
L.push('');

L.push('## 3. クレジット表示の突き合わせ');
L.push('');
L.push(`- クレジット必須(credit_required=true): **${creditNeeded.length} 枚**`);
L.push(`- うち credit_text 未設定(要対応): **${creditMissing.length} 枚**`);
if (creditMissing.length) {
  L.push('');
  L.push('⚠ 以下はクレジット必須なのに表示文が空です。UIでクレジットを出せません:');
  for (const p of creditMissing) L.push(`  - ${p.id}(${nm(p.onsen_id)} / ${p.source_name})`);
}
if (creditNeeded.length) {
  L.push('');
  L.push('クレジット表示対象(UI の .credit に出すべき写真):');
  for (const p of creditNeeded) L.push(`  - ${p.id}: 「${p.credit_text || '(未設定)'}」`);
}
L.push('');

L.push('## 4. 申請制(Cランク)案件の申請記録');
L.push('');
if (cCases.length === 0) {
  L.push('- 該当なし');
} else {
  L.push('| photo id | 温泉 | source_name | applied_no | 取得日 |');
  L.push('|---|---|---|---|---|');
  for (const p of cCases) {
    L.push(`| ${p.id} | ${nm(p.onsen_id)} | ${p.source_name} | ${p.applied_no || '⚠未記入'} | ${p.acquired_at || ''} |`);
  }
  if (cMissingNo.length) {
    L.push('');
    L.push(`⚠ applied_no 未記入の C 案件が ${cMissingNo.length} 件あります(申請記録として要補完)。`);
  }
}
L.push('');

L.push('## 5. カバレッジ');
L.push('');
L.push(`- 写真がある湯: **${onsenWithPhoto.size} / ${totalOnsen}**(${pct(onsenWithPhoto.size)})`);
L.push(`- hero がある湯: **${onsenWithHero.size} / ${totalOnsen}**(${pct(onsenWithHero.size)})`);
L.push('');
if (onsenHavingButNoHero.length) {
  L.push('### 写真はあるが hero が無い湯(hero 追加の優先候補)');
  for (const id of onsenHavingButNoHero) L.push(`  - ${nm(id)}`);
  L.push('');
}
const noPhoto = roster.ids.filter((id) => !onsenWithPhoto.has(id));
L.push(`### 写真がまだ無い湯: ${noPhoto.length} 湯`);
L.push('');
if (noPhoto.length) {
  L.push(roster.ids
    .filter((id) => !onsenWithPhoto.has(id))
    .map((id) => nm(id))
    .join(' / '));
  L.push('');
}

const out = L.join('\n').replace(/\n{3,}/g, '\n\n') + '\n';
fs.writeFileSync(PATHS.auditReport, out);

console.log(c.bold('\n=== 04_report: ライセンス監査 ==='));
console.log(`写真 ${photos.length} 枚 / 写真ありの湯 ${onsenWithPhoto.size}/${totalOnsen} / hero ありの湯 ${onsenWithHero.size}`);
if (creditMissing.length) console.log(c.yellow(`  ⚠ クレジット必須なのに未設定: ${creditMissing.length} 枚`));
if (cMissingNo.length) console.log(c.yellow(`  ⚠ C案件で applied_no 未記入: ${cMissingNo.length} 件`));
console.log(c.dim(`  出力: ${path.relative(process.cwd(), PATHS.auditReport)}`));
