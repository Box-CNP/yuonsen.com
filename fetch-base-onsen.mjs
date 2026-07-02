#!/usr/bin/env node
// fetch-base-onsen.mjs — Wikidata から日本の温泉(ベース層)を取得して onsen-base.js を生成
//
// ソース: Wikidata SPARQL (CC0 / 公式API — スクレイピングではない)
// 取得: 温泉地名(ja/en)・座標・都道府県・Wikipedia(ja)記事名
// 出力: onsen-base.js  … window.ONSEN_BASE = [...](サイトが読む)
//       db/onsen_base.json … 同内容の素のJSON(確認・他用途)
//
// 特集96湯(ONSENに既存)との重複は、名前一致＋座標近接(10km)で除外する。
import fs from 'node:fs';

const SPARQL = `
SELECT DISTINCT ?s ?ja ?en ?coord ?prefLabel ?article WHERE {
  ?s wdt:P31/wdt:P279* wd:Q177380 .
  ?s wdt:P17 wd:Q17 .
  ?s wdt:P625 ?coord .
  OPTIONAL { ?s rdfs:label ?ja FILTER(LANG(?ja)="ja") }
  OPTIONAL { ?s rdfs:label ?en FILTER(LANG(?en)="en") }
  OPTIONAL { ?s wdt:P131* ?pref . ?pref wdt:P31 wd:Q50337 .
             ?pref rdfs:label ?prefLabel FILTER(LANG(?prefLabel)="ja") }
  OPTIONAL { ?article schema:about ?s ; schema:isPartOf <https://ja.wikipedia.org/> }
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

// Point(lng lat) をパース
const parsePoint = (wkt) => {
  const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(wkt);
  return m ? { lng: +m[1], lat: +m[2] } : null;
};

// QIDごとに集約(OPTIONALの組合せで行が重複するため)
const byQid = new Map();
for (const b of data.results.bindings) {
  const qid = b.s.value.split('/').pop();
  const cur = byQid.get(qid) || { qid };
  const pt = parsePoint(b.coord.value);
  if (pt) { cur.lat = +pt.lat.toFixed(4); cur.lng = +pt.lng.toFixed(4); }
  if (b.ja && !cur.name) cur.name = b.ja.value;
  if (b.en && !cur.en) cur.en = b.en.value;
  if (b.prefLabel && !cur.pref) cur.pref = b.prefLabel.value;
  if (b.article && !cur.wiki) cur.wiki = decodeURIComponent(b.article.value.split('/wiki/').pop());
  byQid.set(qid, cur);
}

let list = [...byQid.values()].filter(o => o.name && o.lat != null);
// 「温泉」で終わらない名前(温泉郷・温泉街もOK)や、施設っぽくない項目のゆるい選別はせず、
// 名前・座標があるものを全部残す(秘湯を落とさないため)。曖昧さ回避カッコは除去。
list.forEach(o => { o.name = o.name.replace(/\s*[（(].*?[）)]\s*$/, ''); });

// --- 特集96湯との重複除外(名前一致 or 名前類似＋10km以内) ---
const html = fs.readFileSync('oyu-search-prototype-v21_1.html', 'utf8');
const body = html.slice(html.indexOf('const ONSEN'), html.indexOf('\nconst PHOTOS'));
const featured = [];
for (const seg of body.split(/\{id:/).slice(1)) {
  const bk = (seg.match(/bk:"([^"]+)"/) || [])[1];
  const lat = +(seg.match(/lat:([\d.]+)/) || [])[1];
  const lng = +(seg.match(/lng:([\d.]+)/) || [])[1];
  if (bk && lat) featured.push({ bk: bk.replace(/\s.*$/, ''), lat, lng });
}
const hav = (a, b, c, d) => {
  const R = 6371, dLa = (c - a) * Math.PI / 180, dLo = (d - b) * Math.PI / 180;
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(a * Math.PI / 180) * Math.cos(c * Math.PI / 180) * Math.sin(dLo / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};
const isDup = (o) => featured.some(f =>
  (o.name === f.bk || o.name.startsWith(f.bk) || f.bk.startsWith(o.name)) && hav(o.lat, o.lng, f.lat, f.lng) < 10
);
const before = list.length;
list = list.filter(o => !isDup(o));
list.sort((a, b) => (a.pref || '').localeCompare(b.pref || '', 'ja') || a.name.localeCompare(b.name, 'ja'));

fs.mkdirSync('db', { recursive: true });
fs.writeFileSync('db/onsen_base.json', JSON.stringify(list, null, 1) + '\n');
fs.writeFileSync('onsen-base.js',
  '/* 自動生成: fetch-base-onsen.mjs / データ: Wikidata (CC0) ' + new Date().toISOString().slice(0, 10) + ' */\n' +
  'window.ONSEN_BASE = ' + JSON.stringify(list) + ';\n');

console.log(`取得 ${byQid.size} → 名前・座標あり ${before} → 特集と重複除外後 ${list.length} 湯`);
const prefCount = {};
list.forEach(o => { prefCount[o.pref || '不明'] = (prefCount[o.pref || '不明'] || 0) + 1; });
console.log('都道府県数:', Object.keys(prefCount).length, '/ 上位:', Object.entries(prefCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}${v}`).join(' '));
console.log('サンプル:', list.slice(0, 3).map(o => `${o.name}(${o.pref || '?'})`).join(' / '));
