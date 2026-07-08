import React from 'react';

const css = `
.yu-check{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-ui);font-size:14px;color:var(--text-body);cursor:pointer;user-select:none}
.yu-check input{position:absolute;opacity:0;width:0;height:0}
.yu-check__box{width:16px;height:16px;border:1px solid var(--border-input);border-radius:var(--radius-1);background:var(--paper-0);display:inline-flex;align-items:center;justify-content:center;transition:background var(--dur-touch) var(--ease-quiet),border-color var(--dur-touch) var(--ease-quiet);flex-shrink:0}
.yu-check__box svg{width:10px;height:10px;opacity:0;transition:opacity var(--dur-touch) var(--ease-quiet)}
.yu-check:hover .yu-check__box{border-color:var(--ink-1)}
.yu-check input:checked + .yu-check__box{background:var(--ink-0);border-color:var(--ink-0)}
.yu-check input:checked + .yu-check__box svg{opacity:1}
.yu-check input:focus-visible + .yu-check__box{outline:1px solid var(--focus-ring);outline-offset:2px}
.yu-check--disabled{opacity:0.4;cursor:default}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-check-css')) {
    const s = document.createElement('style');
    s.id = 'yu-check-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Checkbox({ label, disabled, style, ...rest }) {
  ensureCss();
  return (
    <label className={`yu-check${disabled ? ' yu-check--disabled' : ''}`} style={style}>
      <input type="checkbox" disabled={disabled} {...rest} />
      <span className="yu-check__box" aria-hidden="true">
        <svg viewBox="0 0 12 12" fill="none" stroke="#FAF8F4" strokeWidth="1.6"><path d="M2 6.5 5 9.5 10 3" /></svg>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
