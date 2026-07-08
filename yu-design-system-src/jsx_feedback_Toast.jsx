import React from 'react';

const css = `
.yu-toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:var(--ink-0);color:var(--paper-0);font-family:var(--font-ui);font-size:13px;letter-spacing:0.04em;padding:12px 24px;border-radius:var(--radius-1);z-index:110;display:flex;align-items:center;gap:12px;animation:yu-toast-in var(--dur-ui) var(--ease-quiet)}
.yu-toast__seal{width:18px;height:18px;background:var(--accent);border-radius:2px;display:inline-flex;align-items:center;justify-content:center;font-family:var(--font-display);font-size:11px;color:var(--paper-0);flex-shrink:0}
@keyframes yu-toast-in{from{opacity:0}to{opacity:1}}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-toast-css')) {
    const s = document.createElement('style');
    s.id = 'yu-toast-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Toast({ open, seal = true, duration = 3200, onDismiss, children }) {
  ensureCss();
  React.useEffect(() => {
    if (!open || !onDismiss) return;
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [open, duration, onDismiss]);
  if (!open) return null;
  return (
    <div className="yu-toast" role="status">
      {seal && <span className="yu-toast__seal" aria-hidden="true">湯</span>}
      {children}
    </div>
  );
}
