// 共有ユーティリティ: パス・定数・マニフェスト読み込み
// パイプライン各ステップ(01〜04)から import して使う。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

export const PATHS = {
  inbox: path.join(ROOT, 'inbox'),
  manifest: path.join(ROOT, 'manifest', 'sources.yaml'),
  dist: path.join(ROOT, 'dist'),
  db: path.join(ROOT, 'db'),
  photosJson: path.join(ROOT, 'db', 'photos.json'),
  roster: path.join(ROOT, 'db', 'onsen_roster.json'),
  validateReport: path.join(ROOT, 'db', 'validate-report.json'),
  processReport: path.join(ROOT, 'db', 'process-report.json'),
  auditReport: path.join(ROOT, 'report.md'),
};

// 設計書 §2 / §4 の許可値
export const ENUMS = {
  role: ['hero', 'card', 'scene', 'exterior', 'town'],
  source_type: ['library', 'facility', 'own', 'ugc', 'stock'], // stock = 写真AC等のフリー素材
  terms_rank: ['A', 'B', 'C'],          // D は取り込み禁止(別途エラー扱い)
  acquired_by: ['download', 'application'],
};

export const REQUIRED_FIELDS = [
  'file', 'onsen_id', 'role', 'source_name', 'source_url',
  'terms_url', 'terms_rank', 'credit_required', 'acquired_by', 'acquired_at',
];

// 設計書 §4: リサイズ幅(アスペクト比維持)。role に応じて使い分ける。
export const SIZES = {
  hero: 1600,
  card: 800,
  thumb: 400,
};
export const WEBP_QUALITY = 82;

// source_name → 既定クレジット文(03_register が credit_required=true かつ
// credit_text 未記入のとき補完に使う)。設計書 §4 03_register 参照。
export const CREDIT_DEFAULTS = {
  '焼津': '写真提供:一般社団法人焼津市観光協会',
  '霧島市ライブラリー': '写真提供:霧島市',
  '富山(とやま観光ナビ)': '©とやま観光推進機構', // 参考。Dランクなので通常は取り込まない
};

// 画像拡張子(inbox 走査対象)
export const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

// sources.yaml(人が書く)＋ sources.*.yaml(自動生成、例: sources.photoac.yaml)を
// すべて読み込んで1つの配列にマージする。生成物と手書きを別ファイルに分離するための仕組み。
export function loadManifest() {
  const dir = path.dirname(PATHS.manifest);
  if (!fs.existsSync(PATHS.manifest)) {
    throw new Error(`manifest が見つかりません: ${PATHS.manifest}`);
  }
  const files = [PATHS.manifest];
  for (const f of fs.readdirSync(dir).sort()) {
    // sources.<name>.yaml(sources.yaml 自身は除く)を追加で読む
    if (/^sources\..+\.yaml$/.test(f)) files.push(path.join(dir, f));
  }
  let all = [];
  for (const fp of files) {
    if (!fs.existsSync(fp)) continue;
    const data = yaml.load(fs.readFileSync(fp, 'utf8'));
    if (data == null) continue;
    if (!Array.isArray(data)) {
      throw new Error(`${path.basename(fp)} のトップレベルはエントリの配列である必要があります`);
    }
    all = all.concat(data);
  }
  return all;
}

export function loadRoster() {
  if (!fs.existsSync(PATHS.roster)) {
    throw new Error(`onsen_roster.json が見つかりません: ${PATHS.roster}`);
  }
  return JSON.parse(fs.readFileSync(PATHS.roster, 'utf8'));
}

// inbox/ 以下の画像ファイルを inbox 相対パスで列挙(.gitkeep 等は除外)
export function listInboxImages() {
  const out = [];
  if (!fs.existsSync(PATHS.inbox)) return out;
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (ent.isFile() && IMAGE_EXTS.has(path.extname(ent.name).toLowerCase())) {
        out.push(path.relative(PATHS.inbox, full));
      }
    }
  };
  walk(PATHS.inbox);
  return out.sort();
}

// onsen_id → dist 出力スラッグ。roster の bk(漢字名)から温泉名スラッグを作る。
// ASCII化が難しい日本語名は onsen_id ベースにフォールバック。
export function onsenSlug(onsenId, roster) {
  const name = roster?.names?.[onsenId];
  if (name) {
    const ascii = name
      .replace(/温泉郷?$/u, '')
      .normalize('NFKC')
      .replace(/[^\w-]/gu, '');
    if (ascii) return ascii.toLowerCase();
  }
  return `onsen${onsenId}`;
}

// role → 「主サイズ」の幅。hero は 1600、それ以外は card 幅 800。
// thumb(400)は全 role 共通で別途生成する。設計書 §4。
export function mainWidthFor(role) {
  return role === 'hero' ? SIZES.hero : SIZES.card;
}

// 02_process と 03_register で同一の photo id / 出力スラッグを得るための決定的採番。
// manifest の記述順を保つので、両スクリプトで結果が一致する。
// entry.id があればそれを優先。無ければ p_<slug>_<温泉内連番3桁>。
export function assignIds(manifest, roster) {
  const counter = new Map(); // onsen_id -> 連番
  return manifest.map((entry) => {
    const slug = onsenSlug(entry.onsen_id, roster);
    const n = (counter.get(entry.onsen_id) ?? 0) + 1;
    counter.set(entry.onsen_id, n);
    const id = entry.id || `p_${slug}_${String(n).padStart(3, '0')}`;
    return { entry, id, slug };
  });
}

export const c = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};
