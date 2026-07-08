import React from 'react';

const css = `
.yu-tooltip-wrap{position:relative;display:inline-flex}
.yu-tooltip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);background:var(--ink-0);color:var(--paper-0);font-family:var(--font-ui);font-size:12px;letter-spacing:0.04em;line-height:1.6;padding:6px 12px;border-radius:var(--radius-1);white-space:nowrap;pointer-events:none;opacity:0;transition:opacity var(--dur-touch) var(--ease-quiet);z-index:50}
.yu-tooltip-wrap:hover .yu-tooltip,.yu-tooltip-wrap:focus-within .yu-tooltip{opacity:1}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-tooltip-css')) {
    const s = document.createElement('style');
    s.id = 'yu-tooltip-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Tooltip({ content, children, style }) {
  ensureCss();
  return (
    <span className="yu-tooltip-wrap" style={style}>
      {children}
      <span className="yu-tooltip" role="tooltip">{content}</span>
    </span>
  );
}
