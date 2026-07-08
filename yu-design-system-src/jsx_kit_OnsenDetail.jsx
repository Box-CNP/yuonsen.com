import React from 'react';
import { Button } from '../../components/forms/Button.jsx';
import { Badge } from '../../components/display/Badge.jsx';
import { Tag } from '../../components/display/Tag.jsx';
import { Toast } from '../../components/feedback/Toast.jsx';
import { ONSEN, Wash, ensureShellCss } from './Shell.jsx';

const css = `
.yuk-det-hero{position:relative;min-height:420px;border-bottom:1px solid var(--border-default)}
.yuk-det-grid{display:grid;grid-template-columns:7fr 4fr;gap:80px;padding:64px 0 0}
.yuk-det-name{font:var(--text-hero);letter-spacing:var(--tracking-display);margin:8px 0 4px;color:var(--ink-0)}
.yuk-det-place{font-size:13px;color:var(--ink-2);letter-spacing:0.08em;margin:0 0 28px}
.yuk-det-prose{font:var(--text-body-serif);letter-spacing:var(--tracking-body);color:var(--ink-1);max-width:var(--measure-body)}
.yuk-det-prose p{margin:0 0 1.6em}
.yuk-plaque{border-top:1px solid var(--line-2);padding-top:24px}
.yuk-plaque__row{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--border-default);font-size:13px}
.yuk-plaque__k{color:var(--ink-2)}
.yuk-plaque__v{font-family:var(--font-display);color:var(--ink-0);text-align:right}
.yuk-hue-dot{display:inline-flex;align-items:center;gap:8px}
.yuk-hue-dot span.c{width:14px;height:14px;border-radius:50%;border:1px solid var(--line-1);display:inline-block}
`;

function ensureCss() {
  ensureShellCss();
  if (typeof document !== 'undefined' && !document.getElementById('yuk-det-css')) {
    const s = document.createElement('style');
    s.id = 'yuk-det-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function OnsenDetail({ id = 'tsurunoyu' }) {
  ensureCss();
  const o = ONSEN.find((x) => x.id === id) || ONSEN[0];
  const [saved, setSaved] = React.useState(false);
  return (
    <main>
      <Wash hue={o.hue} ratio="auto" style={{ minHeight: 420 }} />
      <div className="yuk-max">
        <div className="yuk-det-grid">
          <article>
            <Badge tone="outline">秘湯</Badge>
            <h1 className="yuk-det-name">{o.name}</h1>
            <p className="yuk-det-place">{o.place}</p>
            <div className="yuk-det-prose">
              <p>{o.desc}</p>
              <p>江戸のころから、湯治の人びとがこの湯をたよりに山道を歩いた。乳白色の湯は硫黄の香りをまとい、朝の光のなかで、静かに湯けむりを立てる。</p>
              <p>ここにあるのは、効能の一覧ではない。土地の記憶と、湯にまつわる物語である。</p>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
              <Button variant="secondary" onClick={() => setSaved(true)}>湯録に追加</Button>
              <Button variant="quiet">物語を読む</Button>
            </div>
          </article>
          <aside>
            <div className="yuk-plaque">
              <div className="yuk-plaque__row"><span className="yuk-plaque__k">湯色 / Color</span>
                <span className="yuk-plaque__v yuk-hue-dot"><span className="c" style={{ background: o.hue }}></span>{o.hueName} · {o.hueEn}</span></div>
              <div className="yuk-plaque__row"><span className="yuk-plaque__k">泉質 / Mineral</span><span className="yuk-plaque__v">{o.mineral}</span></div>
              <div className="yuk-plaque__row"><span className="yuk-plaque__k">湯温 / Temp</span><span className="yuk-plaque__v">58.4°C</span></div>
              <div className="yuk-plaque__row"><span className="yuk-plaque__k">開湯 / Since</span><span className="yuk-plaque__v">1638</span></div>
              <div className="yuk-plaque__row"><span className="yuk-plaque__k">土地 / Place</span><span className="yuk-plaque__v">{o.place}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              <Tag swatch={o.hue}>{o.hueName}</Tag><Tag>{o.mineral}</Tag><Tag>山の湯</Tag>
            </div>
          </aside>
        </div>
      </div>
      <Toast open={saved} onDismiss={() => setSaved(false)}>湯録に追加しました。</Toast>
    </main>
  );
}
