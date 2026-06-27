#!/usr/bin/env node
// 02_process.mjs — 画像処理(自動化の主役 / 設計書 §4)
//
// 許可される処理は「縮小」と「WebP変換」だけ。
//   ・リサイズ: hero=幅1600px / card等=幅800px / thumb=幅400px(アスペクト比維持・拡大はしない)
//   ・WebP変換: quality 82
//   ・EXIF(位置情報含む全メタデータ)は出力時に完全除去(プライバシー / §7)
//   ・自動クロップはしない(トリミングのみ可の規約に配慮 → 構図調整は人が inbox 段階で行う)
//   ・フィルター/色調補正/合成は一切しない(猪苗代型の加工禁止規約に配慮 / §7)
//   ・blurhash 生成(任意・プレースホルダ用)
// 出力: dist/<onsen>/<id>.webp(主サイズ)と <id>.thumb.webp
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { encode as blurhashEncode } from 'blurhash';
import {
  PATHS, SIZES, WEBP_QUALITY, loadManifest, loadRoster,
  assignIds, mainWidthFor, c,
} from './_lib.mjs';

// 01_validate を通っていることが前提。レポートが無い/NG なら止める。
if (!fs.existsSync(PATHS.validateReport)) {
  console.error(c.red('✗ 先に 01_validate.mjs を実行してください(検証レポートがありません)。'));
  process.exit(1);
}
const vr = JSON.parse(fs.readFileSync(PATHS.validateReport, 'utf8'));
if (!vr.ok) {
  console.error(c.red('✗ 検証で NG が出ています。01_validate を通してから再実行してください。'));
  process.exit(1);
}

const manifest = loadManifest();
const roster = loadRoster();
const assigned = assignIds(manifest, roster);

async function blurhashFor(image) {
  // 32px 程度に縮小し raw RGBA から blurhash を計算
  const { data, info } = await image
    .clone()
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return blurhashEncode(
    new Uint8ClampedArray(data), info.width, info.height, 4, 3,
  );
}

const results = [];
let okCount = 0;
let skipCount = 0;

console.log(c.bold('\n=== 02_process: リサイズ + WebP変換(EXIF除去)==='));

for (const { entry, id, slug } of assigned) {
  const src = path.join(PATHS.inbox, entry.file);
  if (!fs.existsSync(src)) {
    console.log(c.yellow(`  ⚠ skip  ${entry.file}(inbox に無し)`));
    skipCount++;
    continue;
  }

  const outDir = path.join(PATHS.dist, slug);
  fs.mkdirSync(outDir, { recursive: true });

  try {
    // .rotate() = EXIF の orientation を「画素に適用」してから(下流でメタを捨てても
    //   写真の見た目が崩れないように)、metadata は出力で除去する。
    //   これは縮小と同じく「見た目を変えない」処理であり、色調補正・合成・クロップではない。
    const base = sharp(src, { failOn: 'error' }).rotate();
    const meta = await base.metadata();
    const origW = meta.width ?? null;
    const origH = meta.height ?? null;

    const mainW = mainWidthFor(entry.role);

    // sharp は既定で出力にメタデータを付けない(=EXIF/GPS は除去される)。
    // withoutEnlargement: true で「縮小のみ」(元より大きくしない)。
    const makeWebp = (width, outPath) =>
      base.clone()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        // 明示しておく: コメント/EXIF/ICC 以外のメタは持ち越さない。
        .toFile(outPath);

    const mainPath = path.join(outDir, `${id}.webp`);
    const thumbPath = path.join(outDir, `${id}.thumb.webp`);

    const [mainInfo] = await Promise.all([
      makeWebp(mainW, mainPath),
      makeWebp(SIZES.thumb, thumbPath),
    ]);

    let blurhash = null;
    try {
      blurhash = await blurhashFor(base);
    } catch (e) {
      console.log(c.yellow(`  ⚠ blurhash 生成失敗(続行): ${entry.file} — ${e.message}`));
    }

    results.push({
      id,
      file: entry.file,
      onsen_id: entry.onsen_id,
      slug,
      role: entry.role,
      orig_filename: path.basename(entry.file),
      width: origW,
      height: origH,
      webp_path: `/photos/${slug}/${id}.webp`,
      thumb_path: `/photos/${slug}/${id}.thumb.webp`,
      webp_w: mainInfo.width,
      webp_h: mainInfo.height,
      blurhash,
      dist_main: path.relative(PATHS.dist, mainPath),
      dist_thumb: path.relative(PATHS.dist, thumbPath),
    });
    okCount++;
    console.log(c.green(`  ✓ ${id}`) + c.dim(`  ${entry.file} → ${slug}/ (${mainInfo.width}px + thumb)`));
  } catch (e) {
    console.log(c.red(`  ✗ 失敗  ${entry.file} — ${e.message}`));
    skipCount++;
  }
}

const report = {
  generated_at: new Date().toISOString(),
  processed: okCount,
  skipped: skipCount,
  webp_quality: WEBP_QUALITY,
  sizes: SIZES,
  results,
};
fs.mkdirSync(PATHS.db, { recursive: true });
fs.writeFileSync(PATHS.processReport, JSON.stringify(report, null, 2) + '\n');

console.log(`\n処理: ${okCount} 枚 / スキップ: ${skipCount} 枚`);
console.log(c.dim(`  レポート: ${path.relative(process.cwd(), PATHS.processReport)}`));
if (okCount === 0) {
  console.log(c.yellow('  ※ 処理対象がありません。inbox に画像を置き sources.yaml に記入してください。'));
}
