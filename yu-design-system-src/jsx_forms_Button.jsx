import React from 'react';

const css = `
.yu-btn{font-family:var(--font-ui);font-weight:500;letter-spacing:0.04em;border-radius:var(--radius-1);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background var(--dur-touch) var(--ease-quiet),color var(--dur-touch) var(--ease-quiet),border-color var(--dur-touch) var(--ease-quiet);border:1px solid transparent;text-decoration:none;box-sizing:border-box}
.yu-btn:focus-visible{outline:1px solid var(--focus-ring);outline-offset:2px}
.yu-btn[disabled]{cursor:default;opacity:0.4}
.yu-btn--md{font-size:14px;padding:11px 28px;line-height:1.4}
.yu-btn--sm{font-size:13px;padding:7px 18px;line-height:1.4}
.yu-btn--primary{background:var(--ink-0);color:var(--paper-0)}
.yu-btn--primary:hover:not([disabled]){background:var(--ink-1)}
.yu-btn--primary:active:not([disabled]){background:#000}
.yu-btn--accent{background:var(--accent);color:var(--paper-0)}
.yu-btn--accent:hover:not([disabled]){background:var(--accent-hover)}
.yu-btn--secondary{background:transparent;border-color:var(--border-input);color:var(--text-body)}
.yu-btn--secondary:hover:not([disabled]){background:var(--paper-2)}
.yu-btn--secondary:active:not([disabled]){background:var(--paper-3)}
.yu-btn--quiet{background:transparent;color:var(--text-body);padding-left:0;padding-right:0}
.yu-btn--quiet:hover:not([disabled]){color:var(--accent)}
.yu-btn--quiet .yu-btn__chev{transition:transform var(--dur-touch) var(--ease-quiet)}
.yu-btn--quiet:hover:not([disabled]) .yu-btn__chev{transform:translateX(2px)}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-btn-css')) {
    const s = document.createElement('style');
    s.id = 'yu-btn-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Button({ variant = 'primary', size = 'md', chevron, disabled, children, ...rest }) {
  ensureCss();
  const showChev = chevron ?? variant === 'quiet';
  return (
    <button className={`yu-btn yu-btn--${variant} yu-btn--${size}`} disabled={disabled} {...rest}>
      {children}
      {showChev && <span className="yu-btn__chev" aria-hidden="true">›</span>}
    </button>
  );
}
