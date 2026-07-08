import React from 'react';

const css = `
.yu-field{display:flex;flex-direction:column;gap:6px;font-family:var(--font-ui)}
.yu-field__label{font-size:13px;font-weight:500;color:var(--ink-1)}
.yu-field__en{font-size:10px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2);margin-left:8px}
.yu-field__hint{font-size:12px;color:var(--ink-2);line-height:1.6}
.yu-input{font-family:var(--font-ui);font-size:15px;color:var(--text-body);background:var(--paper-0);border:1px solid var(--border-input);border-radius:var(--radius-1);padding:10px 14px;transition:border-color var(--dur-touch) var(--ease-quiet);box-sizing:border-box;width:100%}
.yu-input::placeholder{color:var(--ink-3)}
.yu-input:hover:not(:disabled){border-color:var(--ink-2)}
.yu-input:focus{outline:none;border-color:var(--ink-0)}
.yu-input:disabled{opacity:0.4;background:var(--paper-1)}
.yu-input--underline{border-width:0 0 1px;border-radius:0;background:transparent;padding-left:0;padding-right:0}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-input-css')) {
    const s = document.createElement('style');
    s.id = 'yu-input-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Input({ label, labelEn, hint, variant = 'box', style, ...rest }) {
  ensureCss();
  const input = (
    <input className={`yu-input${variant === 'underline' ? ' yu-input--underline' : ''}`} {...rest} />
  );
  if (!label && !hint) return <span className="yu-field" style={style}>{input}</span>;
  return (
    <label className="yu-field" style={style}>
      {label && (
        <span className="yu-field__label">
          {label}
          {labelEn && <span className="yu-field__en">{labelEn}</span>}
        </span>
      )}
      {input}
      {hint && <span className="yu-field__hint">{hint}</span>}
    </label>
  );
}
