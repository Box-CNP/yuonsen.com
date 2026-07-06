#!/usr/bin/env node
// fetch-world-onsen.mjs — Wikidata から世界の温泉(日本以外)を取得して onsen-world.js を生成
//
// ソース: Wikidata SPARQL (CC0 / 公式API)
// 取得: 名前(ja/en)・座標・国(ja/en)・Wikipedia記事(ja優先, なければen)
// 出力: onsen-world.js … window.ONSEN_WORLD = [...]
//       db/onsen_world.json … 素のJSON
import fs from 'node:fs';

const SPARQL = `
SELECT DISTINCT ?s ?ja ?en ?coord ?countryJa ?countryEn ?jaArticle ?enArticle WHERE {
  ?s wdt:P31/wdt:P279* wd:Q177380 .
  ?s wdt:P625 ?coord .
  MINUS { ?s wdt:P17 wd:Q17 }
  OPTIONAL { ?s rdfs:label ?ja FILTER(LANG(?ja)="ja") }
  OPTIONAL { ?s rdfs:label ?en FILTER(LANG(?en)="en") }
  OPTIONAL { ?s wdt:P17 ?country . ?country rdfs:label ?countryJa FILTER(LANG(?countryJa)="ja") }
  OPTIONAL { ?s wdt:P17 ?country2 . ?country2 rdfs:label ?countryEn FILTER(LANG(?countryEn)="en") }
  OPTIONAL { ?jaArticle schema:about ?s ; schema:isPartOf <https://ja.wikipedia.org/> }
  OPTIONAL { ?enArticle schema:about ?s ; schema:isPartOf <https://en.wikipedia.org/> }
}`;

const res = await fetch('https://query.wikidata.org/sparql', {
  method: 'POST',
  headers: {
    'Accept': 'application/sparql-results+json',
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'YU-onsen-db/1.0 (https://oyu-onsen.fujino-090.workers.dev; fujino@bucket.co.jp)'
  },
  body: 'query=' + encodeURIComponent(SPARQL)
});
if (!res.ok) { console.error('SPARQL failed:', res.status, await res.text()); process.exit(1); }
const data = await res.json();

const parsePoint = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt);
  return m ? { lng: +m[1], lat: +m[2] } : null;
};

const byQid = new Map();
for (const b of data.results.bindings) {
  const qid = b.s.value.split('/').pop();
  const cur = byQid.get(qid) || { qid };
  const pt = parsePoint(b.coord.value);
  if (pt) { cur.lat = +pt.lat.toFixed(4); cur.lng = +pt.lng.toFixed(4); }
  if (b.ja && !cur.ja) cur.ja = b.ja.value;
  if (b.en && !cur.en) cur.en = b.en.value;
  if (b.countryJa && !cur.country) cur.country = b.countryJa.value;
  if (b.countryEn && !cur.countryEn) cur.countryEn = b.countryEn.value;
  if (b.jaArticle && !cur.wikiJa) cur.wikiJa = decodeURIComponent(b.jaArticle.value.split('/wiki/').pop());
  if (b.enArticle && !cur.wikiEn) cur.wikiEn = decodeURIComponent(b.enArticle.value.split('/wiki/').pop());
  byQid.set(qid, cur);
}

// 名前(ja優先→en)・座標があるものだけ。QIDラベルしか無いもの(Q123…)は除外
let list = [...byQid.values()]
  .map(o => ({ ...o, name: o.ja || o.en }))
  .filter(o => o.name && !/^Q\d+$/.test(o.name) && o.lat != null
    && (o.country || o.countryEn)      /* 国なし=深海熱水噴出孔などを除外 */
    && (o.wikiJa || o.wikiEn));        /* Wikipedia記事なし=真偽を確かめられないため除外(情報の質優先) */
list.forEach(o => {
  o.name = o.name.replace(/\s*[（(].*?[）)]\s*$/, '');
  delete o.ja;
});
list.sort((a, b) => (a.countryEn || '').localeCompare(b.countryEn || '') || a.name.localeCompare(b.name));

fs.mkdirSync('db', { recursive: true });
fs.writeFileSync('db/onsen_world.json', JSON.stringify(list, null, 1) + '\n');
fs.writeFileSync('onsen-world.js',
  '/* 自動生成: fetch-world-onsen.mjs / データ: Wikidata (CC0) */\n' +
  'window.ONSEN_WORLD = ' + JSON.stringify(list) + ';\n');

console.log(`世界の温泉: ${byQid.size} 件取得 → 名前・座標ありで ${list.length} 湯`);
const cc = {};
list.forEach(o => { cc[o.countryEn || '?'] = (cc[o.countryEn || '?'] || 0) + 1; });
console.log('国数:', Object.keys(cc).length);
console.log('上位:', Object.entries(cc).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => `${k} ${v}`).join(' / '));
console.log('サンプル:', list.slice(0, 3).map(o => `${o.name}(${o.country || o.countryEn})`).join(' / '));
