import React from 'react';
import { Button } from '../../components/forms/Button.jsx';
import { Badge } from '../../components/display/Badge.jsx';
import { Card } from '../../components/display/Card.jsx';
import { Wash, ensureShellCss } from './Shell.jsx';

const css = `
.yuk-story-head{max-width:var(--measure-body);margin:0 auto;padding:80px 0 40px;text-align:center}
.yuk-story-title{font:var(--text-title);letter-spacing:var(--tracking-display);margin:16px 0 12px;color:var(--ink-0)}
.yuk-story-meta{font-size:12px;color:var(--ink-2);letter-spacing:0.1em}
.yuk-story-body{max-width:var(--measure-body);margin:0 auto;font:var(--text-body-serif);letter-spacing:var(--tracking-body);color:var(--ink-1)}
.yuk-story-body p{margin:0 0 1.8em}
.yuk-story-cap{font-family:var(--font-ui);font-size:12px;color:var(--ink-2);text-align:center;margin:12px 0 56px;letter-spacing:0.06em}
.yuk-story-more{margin-top:96px}
`;

function ensureCss() {
  ensureShellCss();
  if (typeof document !== 'undefined' && !document.getElementById('yuk-story-css')) {
    const s = document.createElement('style');
    s.id = 'yuk-story-css';
    s.textContent = css;
    document.head.appendChild(s);
  }
}

export function Story({ onAtlas }) {
  ensureCss();
  return (
    <main className="yuk-max">
      <header className="yuk-story-head">
        <Badge>Stories · 文化</Badge>
        <h1 className="yuk-story-title">湯治という時間 — なぜ日本人は湯に浸かりつづけてきたのか</h1>
        <p className="yuk-story-meta">2026.07.01 · 読了 8分</p>
      </header>
      <Wash hue="var(--yu-milky)" ratio="21/9" style={{ margin: '0 0 0' }} />
      <p className="yuk-story-cap">山あいの湯治場。朝、湯けむりが立つ。</p>
      <article className="yuk-story-body">
        <p>湯に浸かることは、日本では古くから「治す」ことであった。戦国の武将は刀傷を癒し、農民は農閑期に骨を休めた。湯治とは、湯によって身体をととのえる、ゆっくりとした時間の作法である。</p>
        <p>一週間、二週間。同じ湯に、朝と夕に浸かる。読む。歩く。眠る。それだけの日々が、心と体を静かにほどいていく。</p>
        <p>YUがたどるのは、その時間の記憶である。どこが「一番」かではなく、その湯が、なぜそこに、どのように在りつづけてきたのか。</p>
      </article>
      <section className="yuk-story-more">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <h2 style={{ font: 'var(--text-heading)', letterSpacing: 'var(--tracking-display)', margin: 0 }}>つづけて読む</h2>
          <Button variant="quiet" size="sm" onClick={onAtlas}>湯をさがす</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
          <Card variant="hairline" media={<Wash hue="var(--yu-gold)" ratio="16/9" />} place="歴史" title="開湯伝説をたどる — 鹿と僧と、湯のはじまり" />
          <Card variant="hairline" media={<Wash hue="var(--yu-blue)" ratio="16/9" />} place="科学" title="湯の色はどこから来るのか" />
          <Card variant="hairline" media={<Wash hue="var(--yu-iron)" ratio="16/9" />} place="土地" title="湯けむりの町、鉄輪に暮らす" />
        </div>
      </section>
    </main>
  );
}
