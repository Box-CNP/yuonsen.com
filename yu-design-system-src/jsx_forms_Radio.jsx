import React from 'react';

const css = `
.yu-radio{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-ui);font-size:14px;color:var(--text-body);cursor:pointer;user-select:none}
.yu-radio input{position:absolute;opacity:0;width:0;height:0}
.yu-radio__dot{width:16px;height:16px;border:1px solid var(--border-input);border-radius:50%;background:var(--paper-0);display:inline-flex;align-items:center;justify-content:center;transition:border-color var(--dur-touch) var(--ease-quiet);flex-shrink:0}
.yu-radio__dot::after{content:'';width:8px;height:8px;border-radius:50%;background:var(--ink-0);opacity:0;transition:opacity var(--dur-touch) var(--ease-quiet)}
.yu-radio:hover .yu-radio__dot{border-color:var(--ink-1)}
.yu-radio input:checked + .yu-radio__dot{border-color:var(--ink-0)}
.yu-radio input:checked + .yu-radio__dot::after{opacity:1}
.yu-radio input:focus-visible + .yu-radio__dot{outline:1px solid var(--focus-ring);outline-offset:2px}
.yu-radio--disabled{opacity:0.4;cursor:default}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-radio-css')) {
    const s = document.createElement('style');
    s.id = 'yu-radio-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Radio({ label, disabled, style, ...rest }) {
  ensureCss();
  return (
    <label className={`yu-radio${disabled ? ' yu-radio--disabled' : ''}`} style={style}>
      <input type="radio" disabled={disabled} {...rest} />
      <span className="yu-radio__dot" aria-hidden="true"></span>
      {label && <span>{label}</span>}
    </label>
  );
}
