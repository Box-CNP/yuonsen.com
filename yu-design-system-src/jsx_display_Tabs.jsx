import React from 'react';

const css = `
.yu-tabs{display:flex;gap:32px;border-bottom:1px solid var(--border-default);font-family:var(--font-ui)}
.yu-tab{background:none;border:none;padding:12px 0 14px;font-size:14px;color:var(--ink-2);cursor:pointer;position:relative;letter-spacing:0.04em;transition:color var(--dur-touch) var(--ease-quiet)}
.yu-tab:hover{color:var(--ink-0)}
.yu-tab--active{color:var(--ink-0)}
.yu-tab--active::after{content:'';position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--ink-0)}
.yu-tab__en{display:block;font-size:9px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-3);margin-top:2px}
.yu-tab:focus-visible{outline:1px solid var(--focus-ring);outline-offset:2px}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-tabs-css')) {
    const s = document.createElement('style');
    s.id = 'yu-tabs-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Tabs({ items = [], value, onChange, style }) {
  ensureCss();
  const [internal, setInternal] = React.useState(items[0]?.value);
  const active = value ?? internal;
  return (
    <div className="yu-tabs" role="tablist" style={style}>
      {items.map((it) => (
        <button
          key={it.value}
          role="tab"
          aria-selected={active === it.value}
          className={`yu-tab${active === it.value ? ' yu-tab--active' : ''}`}
          onClick={() => { setInternal(it.value); onChange && onChange(it.value); }}
        >
          {it.label}
          {it.labelEn && <span className="yu-tab__en">{it.labelEn}</span>}
        </button>
      ))}
    </div>
  );
}
