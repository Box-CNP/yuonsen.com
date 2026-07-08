import React from 'react';

const css = `
.yu-select{position:relative;display:inline-flex;width:100%}
.yu-select select{appearance:none;-webkit-appearance:none;font-family:var(--font-ui);font-size:15px;color:var(--text-body);background:var(--paper-0);border:1px solid var(--border-input);border-radius:var(--radius-1);padding:10px 40px 10px 14px;width:100%;cursor:pointer;transition:border-color var(--dur-touch) var(--ease-quiet)}
.yu-select select:hover:not(:disabled){border-color:var(--ink-2)}
.yu-select select:focus{outline:none;border-color:var(--ink-0)}
.yu-select select:disabled{opacity:0.4;background:var(--paper-1)}
.yu-select__chev{position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--ink-2);font-size:11px}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-select-css')) {
    const s = document.createElement('style');
    s.id = 'yu-select-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Select({ label, labelEn, options = [], style, ...rest }) {
  ensureCss();
  const sel = (
    <span className="yu-select">
      <select {...rest}>
        {options.map((o) => {
          const opt = typeof o === 'string' ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
      <span className="yu-select__chev" aria-hidden="true">▾</span>
    </span>
  );
  if (!label) return <span style={style}>{sel}</span>;
  return (
    <label className="yu-field" style={style}>
      <span className="yu-field__label">{label}{labelEn && <span className="yu-field__en">{labelEn}</span>}</span>
      {sel}
    </label>
  );
}
