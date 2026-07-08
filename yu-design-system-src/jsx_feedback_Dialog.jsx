import React from 'react';

const css = `
.yu-dialog-overlay{position:fixed;inset:0;background:rgba(28,26,23,0.35);display:flex;align-items:center;justify-content:center;z-index:100;animation:yu-fade var(--dur-drift) var(--ease-quiet)}
.yu-dialog{background:var(--paper-0);border-radius:var(--radius-2);box-shadow:var(--shadow-float);max-width:480px;width:calc(100% - 48px);padding:40px;box-sizing:border-box;font-family:var(--font-ui);animation:yu-fade var(--dur-ui) var(--ease-quiet)}
.yu-dialog__label{font-size:10px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2);margin:0 0 10px}
.yu-dialog__title{font-family:var(--font-display);font-weight:500;font-size:22px;line-height:1.7;color:var(--ink-0);margin:0 0 12px;letter-spacing:0.03em}
.yu-dialog__body{font-size:14px;line-height:2;color:var(--ink-1)}
.yu-dialog__footer{display:flex;justify-content:flex-end;gap:12px;margin-top:32px}
@keyframes yu-fade{from{opacity:0}to{opacity:1}}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-dialog-css')) {
    const s = document.createElement('style');
    s.id = 'yu-dialog-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Dialog({ open, onClose, label, title, footer, children }) {
  ensureCss();
  if (!open) return null;
  return (
    <div className="yu-dialog-overlay" onClick={onClose}>
      <div className="yu-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {label && <p className="yu-dialog__label">{label}</p>}
        {title && <h2 className="yu-dialog__title">{title}</h2>}
        <div className="yu-dialog__body">{children}</div>
        {footer && <div className="yu-dialog__footer">{footer}</div>}
      </div>
    </div>
  );
}
