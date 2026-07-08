import React from 'react';

const css = `
.yu-tag{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-ui);font-size:13px;color:var(--ink-1);background:transparent;border:1px solid var(--border-default);border-radius:var(--radius-pill);padding:6px 16px;line-height:1.4;cursor:pointer;transition:background var(--dur-touch) var(--ease-quiet),border-color var(--dur-touch) var(--ease-quiet),color var(--dur-touch) var(--ease-quiet);user-select:none}
.yu-tag:hover{border-color:var(--ink-2);background:var(--paper-1)}
.yu-tag--active{background:var(--ink-0);border-color:var(--ink-0);color:var(--paper-0)}
.yu-tag--active:hover{background:var(--ink-1);border-color:var(--ink-1)}
.yu-tag--static{cursor:default}
.yu-tag--static:hover{border-color:var(--border-default);background:transparent}
.yu-tag__swatch{width:10px;height:10px;border-radius:50%;border:1px solid rgba(28,26,23,.15);flex-shrink:0}
.yu-tag:focus-visible{outline:1px solid var(--focus-ring);outline-offset:2px}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-tag-css')) {
    const s = document.createElement('style');
    s.id = 'yu-tag-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Tag({ active, swatch, onClick, children, ...rest }) {
  ensureCss();
  const cls = `yu-tag${active ? ' yu-tag--active' : ''}${onClick ? '' : ' yu-tag--static'}`;
  return (
    <button type="button" className={cls} onClick={onClick} {...rest}>
      {swatch && <span className="yu-tag__swatch" style={{ background: swatch }} aria-hidden="true"></span>}
      {children}
    </button>
  );
}
