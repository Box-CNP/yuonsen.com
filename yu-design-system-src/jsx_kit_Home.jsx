import React from 'react';
import { Button } from '../../components/forms/Button.jsx';
import { Card } from '../../components/display/Card.jsx';
import { Badge } from '../../components/display/Badge.jsx';
import { ONSEN, Wash, ensureShellCss } from './Shell.jsx';

const css = `
.yuk-hero{display:grid;grid-template-columns:5fr 7fr;border-bottom:1px solid var(--border-default)}
.yuk-hero__left{padding:72px var(--page-pad);display:flex;flex-direction:column;justify-content:center;gap:20px}
.yuk-hero__mark{font-family:var(--font-display);font-size:96px;line-height:1;color:var(--ink-0);margin:0;font-weight:500}
.yuk-hero__title{font:var(--text-hero);letter-spacing:var(--tracking-display);margin:0;color:var(--ink-0)}
.yuk-hero__sub{font-family:var(--font-display);font-size:15px;line-height:2.2;color:var(--ink-1);margin:0;max-width:26em}
.yuk-hero__right{position:relative;min-height:480px}
.yuk-hero__vert{position:absolute;top:48px;right:48px;writing-mode:vertical-rl;font-family:var(--font-display);font-size:22px;letter-spacing:0.16em;color:var(--ink-0);margin:0}
.yuk-cats{display:flex;justify-content:space-between;padding:32px 0;border-bottom:1px solid var(--border-default)}
.yuk-cat{background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;transition:opacity var(--dur-touch) var(--ease-quiet)}
.yuk-cat:hover{opacity:0.55}
.yuk-cat__jp{font-family:var(--font-display);font-size:16px;color:var(--ink-0)}
.yuk-cat__en{font-size:9px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2)}
.yuk-sec{margin-top:88px}
.yuk-sec__head{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:28px}
.yuk-sec__title{display:flex;align-items:baseline;gap:16px;margin:0}
.yuk-sec__jp{font:var(--text-title);letter-spacing:var(--tracking-display);color:var(--ink-0)}
.yuk-sec__en{font-size:10px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2)}
.yuk-grid4{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.yuk-today{display:grid;grid-template-columns:7fr 5fr;background:var(--paper-1);border-radius:var(--radius-2);overflow:hidden}
.yuk-today__body{padding:48px;display:flex;flex-direction:column;gap:14px;justify-content:center;align-items:flex-start}
.yuk-today__name{font:var(--text-heading);letter-spacing:var(--tracking-display);margin:0;color:var(--ink-0)}
.yuk-today__desc{font-family:var(--font-display);font-size:15px;line-height:2.2;color:var(--ink-1);margin:0}
`;

function ensureCss() {
  ensureShellCss();
  if (typeof document !== 'undefined' && !document.getElementById('yuk-home-css')) {
    const s = document.createElement('style');
    s.id = 'yuk-home-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

const CATS = [
  { jp: '湯色で探す', en: 'By Color' },
  { jp: '泉質で探す', en: 'By Mineral' },
  { jp: '目的で探す', en: 'By Experience' },
  { jp: '文化で探す', en: 'By Culture' },
  { jp: '地図から探す', en: 'By Map' },
  { jp: '読みもの', en: 'Stories' },
];

export function Home({ onOpen, onAtlas, onStory }) {
  ensureCss();
  const today = ONSEN[0];
  return (
    <main>
      <section className="yuk-hero">
        <div className="yuk-hero__left">
          <p className="yuk-hero__mark">湯</p>
          <h1 className="yuk-hero__title">湯を、世界へ。</h1>
          <p className="yuk-hero__sub">日本の温泉文化を、美しく、静かに。1,457の湯を、色と泉質と物語でたどる、小さな博物館。</p>
          <Button variant="quiet" onClick={onAtlas}>湯をさがす</Button>
        </div>
        <div className="yuk-hero__right">
          <Wash hue="var(--yu-blue)" ratio="auto" style={{ position: 'absolute', inset: 0 }} />
          <p className="yuk-hero__vert">日本の温泉文化を美しく、静かに、世界中の人へ届ける。</p>
        </div>
      </section>
      <div className="yuk-max">
        <section className="yuk-cats">
          {CATS.map((c) => (
            <button key={c.jp} className="yuk-cat" onClick={onAtlas}>
              <span className="yuk-cat__jp">{c.jp}</span>
              <span className="yuk-cat__en">{c.en}</span>
            </button>
          ))}
        </section>
        <section className="yuk-sec">
          <div className="yuk-sec__head">
            <h2 className="yuk-sec__title"><span className="yuk-sec__jp">きょうの湯</span><span className="yuk-sec__en">Today's Onsen</span></h2>
          </div>
          <div className="yuk-today">
            <div className="yuk-today__body">
              <Badge tone="shu">きょうの湯</Badge>
              <h3 className="yuk-today__name">{today.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-2)', letterSpacing: '0.06em', margin: 0 }}>{today.place}</p>
              <p className="yuk-today__desc">{today.desc}</p>
              <Button variant="quiet" onClick={() => onOpen(today.id)}>詳しく見る</Button>
            </div>
            <Wash hue={today.hue} ratio="auto" />
          </div>
        </section>
        <section className="yuk-sec">
          <div className="yuk-sec__head">
            <h2 className="yuk-sec__title"><span className="yuk-sec__jp">湯のいろ</span><span className="yuk-sec__en">Waters of Japan</span></h2>
            <Button variant="quiet" size="sm" onClick={onAtlas}>すべて見る</Button>
          </div>
          <div className="yuk-grid4">
            {ONSEN.slice(1, 5).map((o) => (
              <Card key={o.id} media={<Wash hue={o.hue} />} place={o.place} title={o.name} onClick={() => onOpen(o.id)} />
            ))}
          </div>
        </section>
        <section className="yuk-sec">
          <div className="yuk-sec__head">
            <h2 className="yuk-sec__title"><span className="yuk-sec__jp">読みもの</span><span className="yuk-sec__en">Stories</span></h2>
            <Button variant="quiet" size="sm" onClick={onStory}>すべて見る</Button>
          </div>
          <Card variant="hairline" place="2026.07.01 · 文化" title="湯治という時間 — なぜ日本人は湯に浸かりつづけてきたのか"
            description="千年をこえて受け継がれてきた、癒しの作法について。" onClick={onStory} style={{ maxWidth: 560 }} />
        </section>
      </div>
    </main>
  );
}
