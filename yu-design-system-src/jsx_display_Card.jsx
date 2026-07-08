import React from 'react';

const css = `
.yu-card{background:var(--surface-card);border-radius:var(--radius-2);overflow:hidden;font-family:var(--font-ui);display:flex;flex-direction:column;transition:background var(--dur-touch) var(--ease-quiet)}
.yu-card--hairline{background:var(--bg-page);border:1px solid var(--border-default)}
.yu-card--interactive{cursor:pointer}
.yu-card--interactive:hover{background:var(--paper-2)}
.yu-card--hairline.yu-card--interactive:hover{background:var(--paper-1)}
.yu-card__media{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:var(--paper-2)}
.yu-card__body{padding:20px 22px 24px;display:flex;flex-direction:column;gap:6px}
.yu-card__title{font-family:var(--font-display);font-weight:500;font-size:19px;line-height:1.6;color:var(--text-body);margin:0;letter-spacing:0.03em}
.yu-card__place{font-size:12px;color:var(--text-caption);letter-spacing:0.06em;margin:0}
.yu-card__desc{font-family:var(--font-display);font-size:14px;line-height:2;color:var(--text-secondary);margin:6px 0 0}
`;

function ensureCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yu-card-css')) {
    const s = document.createElement('style');
    s.id = 'yu-card-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Card({ variant = 'fill', image, imageAlt = '', media, title, place, description, onClick, children, style, ...rest }) {
  ensureCss();
  const cls = `yu-card${variant === 'hairline' ? ' yu-card--hairline' : ''}${onClick ? ' yu-card--interactive' : ''}`;
  return (
    <article className={cls} onClick={onClick} style={style} {...rest}>
      {media}
      {image && <img className="yu-card__media" src={image} alt={imageAlt} />}
      {(title || place || description || children) && (
        <div className="yu-card__body">
          {place && <p className="yu-card__place">{place}</p>}
          {title && <h3 className="yu-card__title">{title}</h3>}
          {description && <p className="yu-card__desc">{description}</p>}
          {children}
        </div>
      )}
    </article>
  );
}
