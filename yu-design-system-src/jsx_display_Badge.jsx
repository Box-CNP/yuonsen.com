import React from 'react';

const css = `
.yu-badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--font-ui);font-size:10px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;padding:4px 10px;border-radius:var(--radius-1);line-height:1.4}
.yu-badge--ink{background:var(--ink-0);color:var(--paper-0)}
.yu-badge--paper{background:var(--paper-2);color:var(--ink-1)}
.yu-badge--shu{background:var(--accent);color:var(--paper-0)}
.yu-badge--outline{background:transparent;border:1px solid var(--border-input);color:var(--ink-1)}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-badge-css')) {
    const s = document.createElement('style');
    s.id = 'yu-badge-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Badge({ tone = 'paper', children, ...rest }) {
  ensureCss();
  return <span className={`yu-badge yu-badge--${tone}`} {...rest}>{children}</span>;
}
