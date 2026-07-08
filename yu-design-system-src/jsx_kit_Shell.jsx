import React from 'react';

// Shared fake data + shell chrome for the YU web UI kit.
export const ONSEN = [
  { id: 'tsurunoyu', name: '乳頭温泉郷 鶴の湯', place: '秋田県仙北市', hue: 'var(--yu-milky)', hueName: '白濁', hueEn: 'Milky', mineral: '硫黄泉', desc: '深い山あいに佇む秘湯。心も体も、静かにほどけていく。' },
  { id: 'kurokawa', name: '黒川温泉', place: '熊本県南小国町', hue: 'var(--yu-green)', hueName: '緑', hueEn: 'Green', mineral: '硫酸塩泉', desc: '川霧の立つ、静かな温泉郷。' },
  { id: 'zao', name: '蔵王温泉', place: '山形県山形市', hue: 'var(--yu-gold)', hueName: '金', hueEn: 'Gold', mineral: '酸性泉', desc: '千九百年の歴史をもつ、強酸性の名湯。' },
  { id: 'kannawa', name: '別府 鉄輪温泉', place: '大分県別府市', hue: 'var(--yu-iron)', hueName: '鉄', hueEn: 'Iron', mineral: '塩化物泉', desc: '湯けむりの立ちのぼる、湯治の町。' },
  { id: 'shirahone', name: '白骨温泉', place: '長野県松本市', hue: 'var(--yu-blue)', hueName: '青', hueEn: 'Blue', mineral: '炭酸水素塩泉', desc: '乳青色の湯が、谷あいに湧く。' },
  { id: 'hakone', name: '箱根湯本温泉', place: '神奈川県箱根町', hue: 'var(--yu-clear)', hueName: '透明', hueEn: 'Clear', mineral: '単純温泉', desc: '東海道の宿場に湧く、やわらかな湯。' },
];

const css = `
.yuk-shell{background:var(--bg-page);min-height:100vh;font-family:var(--font-ui);color:var(--text-body)}
.yuk-max{max-width:var(--page-max);margin:0 auto;padding:0 var(--page-pad)}
.yuk-header{border-bottom:1px solid var(--border-default)}
.yuk-header__in{display:flex;align-items:center;justify-content:space-between;height:76px}
.yuk-logo{display:flex;align-items:baseline;gap:14px;cursor:pointer;background:none;border:none;padding:0}
.yuk-logo__yu{font-family:var(--font-display);font-size:26px;font-weight:500;letter-spacing:0.2em;color:var(--ink-0)}
.yuk-logo__sub{font-size:9px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2)}
.yuk-nav{display:flex;gap:36px}
.yuk-nav__item{background:none;border:none;padding:0;cursor:pointer;display:flex;flex-direction:column;gap:2px;align-items:flex-start;transition:opacity var(--dur-touch) var(--ease-quiet)}
.yuk-nav__item:hover{opacity:0.6}
.yuk-nav__jp{font-family:var(--font-display);font-size:14px;color:var(--ink-0)}
.yuk-nav__en{font-size:8px;font-weight:500;letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--ink-2)}
.yuk-nav__item--on .yuk-nav__jp{color:var(--accent)}
.yuk-footer{border-top:1px solid var(--border-default);margin-top:104px}
.yuk-footer__in{display:flex;justify-content:space-between;align-items:center;padding:40px 0;font-size:12px;color:var(--ink-2)}
.yuk-wash{position:relative;overflow:hidden;background:var(--paper-2)}
`;

export function ensureShellCss() {
  if (typeof document !== 'undefined' && !document.getElementById('yuk-shell-css')) {
    const s = document.createElement('style');
    s.id = 'yuk-shell-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

/** Watercolor wash placeholder standing in for photography (no real photos provided). */
export function Wash({ hue, ratio = '4/3', children, style }) {
  ensureShellCss();
  return (
    <div className="yuk-wash" style={{ aspectRatio: ratio, ...style }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 42% 58%, ${hue}, transparent 78%), radial-gradient(ellipse 50% 45% at 68% 30%, ${hue}, transparent 70%)`, opacity: 0.9 }}></div>
      {children}
    </div>
  );
}

export function Shell({ nav, onNav, active, children }) {
  ensureShellCss();
  const items = [
    { id: 'home', jp: '湯', en: 'Home' },
    { id: 'atlas', jp: '湯をさがす', en: 'Atlas' },
    { id: 'detail', jp: 'きょうの湯', en: "Today's Onsen" },
    { id: 'story', jp: '読みもの', en: 'Stories' },
  ];
  return (
    <div className="yuk-shell">
      <header className="yuk-header"><div className="yuk-max yuk-header__in">
        <button className="yuk-logo" onClick={() => onNav('home')}>
          <span className="yuk-logo__yu">湯 YU</span>
          <span className="yuk-logo__sub">Japanese Onsen Atlas</span>
        </button>
        <nav className="yuk-nav">
          {items.filter((i) => i.id !== 'home').map((i) => (
            <button key={i.id} className={`yuk-nav__item${active === i.id ? ' yuk-nav__item--on' : ''}`} onClick={() => onNav(i.id)}>
              <span className="yuk-nav__jp">{i.jp}</span>
              <span className="yuk-nav__en">{i.en}</span>
            </button>
          ))}
        </nav>
      </div></header>
      {children}
      <footer className="yuk-footer"><div className="yuk-max yuk-footer__in">
        <span>湯 YU — A digital museum of Japanese onsen culture.</span>
        <span style={{ letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 10 }}>© 2026 YU</span>
      </div></footer>
    </div>
  );
}
