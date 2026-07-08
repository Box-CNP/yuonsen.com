import React from 'react';

const css = `
.yu-iconbtn{width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:1px solid transparent;border-radius:var(--radius-1);color:var(--ink-1);cursor:pointer;transition:background var(--dur-touch) var(--ease-quiet),color var(--dur-touch) var(--ease-quiet)}
.yu-iconbtn:hover:not([disabled]){background:var(--paper-2);color:var(--ink-0)}
.yu-iconbtn:active:not([disabled]){background:var(--paper-3)}
.yu-iconbtn:focus-visible{outline:1px solid var(--focus-ring);outline-offset:2px}
.yu-iconbtn[disabled]{opacity:0.4;cursor:default}
.yu-iconbtn--outline{border-color:var(--border-input)}
.yu-iconbtn--sm{width:32px;height:32px}
.yu-iconbtn svg{width:20px;height:20px;stroke-width:1.25}
.yu-iconbtn--sm svg{width:16px;height:16px}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-iconbtn-css')) {
    const s = document.createElement('style');
    s.id = 'yu-iconbtn-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function IconButton({ variant = 'ghost', size = 'md', label, children, ...rest }) {
  ensureCss();
  return (
    <button
      className={`yu-iconbtn${variant === 'outline' ? ' yu-iconbtn--outline' : ''}${size === 'sm' ? ' yu-iconbtn--sm' : ''}`}
      aria-label={label}
      title={label}
      {...rest}
    >
      {children}
    </button>
  );
}
