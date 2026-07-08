import React from 'react';
import { Tabs } from '../../components/display/Tabs.jsx';
import { Tag } from '../../components/display/Tag.jsx';
import { Card } from '../../components/display/Card.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { ONSEN, Wash, ensureShellCss } from './Shell.jsx';

const css = `
.yuk-atlas-head{padding:64px 0 40px}
.yuk-atlas-title{font:var(--text-hero);letter-spacing:var(--tracking-display);margin:0 0 8px;color:var(--ink-0)}
.yuk-atlas-sub{font-size:14px;color:var(--ink-1);margin:0;line-height:2}
.yuk-atlas-count{font-family:var(--font-display);color:var(--ink-2);font-size:13px;letter-spacing:0.08em}
.yuk-filters{display:flex;gap:10px;flex-wrap:wrap;padding:24px 0 0}
.yuk-atlas-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px;margin-top:40px}
`;

function ensureCss() {
  ensureShellCss();
  if (typeof document !== 'undefined' && !document.getElementById('yuk-atlas-css')) {
    const s = document.createElement('style');
    s.id = 'yuk-atlas-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

const HUES = [
  { jp: '白濁', sw: 'var(--yu-milky)' }, { jp: '青', sw: 'var(--yu-blue)' }, { jp: '緑', sw: 'var(--yu-green)' },
  { jp: '金', sw: 'var(--yu-gold)' }, { jp: '鉄', sw: 'var(--yu-iron)' }, { jp: '透明', sw: 'var(--yu-clear)' },
];

export function Atlas({ onOpen }) {
  ensureCss();
  const [hue, setHue] = React.useState(null);
  const list = hue ? ONSEN.filter((o) => o.hueName === hue) : ONSEN;
  return (
    <main className="yuk-max">
      <header className="yuk-atlas-head">
        <h1 className="yuk-atlas-title">湯をさがす</h1>
        <p className="yuk-atlas-sub">色、泉質、土地、物語から。<span className="yuk-atlas-count"> — 1,457 onsen, organized beautifully.</span></p>
      </header>
      <Tabs items={[
        { value: 'color', label: '湯色', labelEn: 'Color' },
        { value: 'mineral', label: '泉質', labelEn: 'Mineral' },
        { value: 'exp', label: '目的', labelEn: 'Experience' },
        { value: 'place', label: '地域', labelEn: 'Place' },
      ]} />
      <div className="yuk-filters">
        {HUES.map((h) => (
          <Tag key={h.jp} swatch={h.sw} active={hue === h.jp} onClick={() => setHue(hue === h.jp ? null : h.jp)}>{h.jp}</Tag>
        ))}
        <Input variant="underline" placeholder="名前でさがす" style={{ width: 200, marginLeft: 'auto' }} />
      </div>
      <div className="yuk-atlas-grid">
        {list.map((o) => (
          <Card key={o.id} media={<Wash hue={o.hue} />} place={`${o.place} · ${o.mineral}`} title={o.name} description={o.desc} onClick={() => onOpen(o.id)} />
        ))}
      </div>
    </main>
  );
}
