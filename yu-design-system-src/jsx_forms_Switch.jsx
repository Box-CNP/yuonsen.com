import React from 'react';

const css = `
.yu-switch{display:inline-flex;align-items:center;gap:10px;font-family:var(--font-ui);font-size:14px;color:var(--text-body);cursor:pointer;user-select:none}
.yu-switch input{position:absolute;opacity:0;width:0;height:0}
.yu-switch__track{width:36px;height:20px;border-radius:999px;background:var(--paper-3);position:relative;transition:background var(--dur-ui) var(--ease-quiet);flex-shrink:0}
.yu-switch__track::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--paper-0);transition:transform var(--dur-ui) var(--ease-quiet)}
.yu-switch input:checked + .yu-switch__track{background:var(--ink-0)}
.yu-switch input:checked + .yu-switch__track::after{transform:translateX(16px)}
.yu-switch input:focus-visible + .yu-switch__track{outline:1px solid var(--focus-ring);outline-offset:2px}
.yu-switch--disabled{opacity:0.4;cursor:default}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-switch-css')) {
    const s = document.createElement('style');
    s.id = 'yu-switch-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Switch({ label, disabled, style, ...rest }) {
  ensureCss();
  return (
    <label className={`yu-switch${disabled ? ' yu-switch--disabled' : ''}`} style={style}>
      <input type="checkbox" role="switch" disabled={disabled} {...rest} />
      <span className="yu-switch__track" aria-hidden="true"></span>
      {label && <span>{label}</span>}
    </label>
  );
}
