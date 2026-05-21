import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const hp = dirname(fileURLToPath(import.meta.url));
const backup = readFileSync(join(hp, "_backup/2026-05-15-0143/index.html"), "utf8");

function rx(p) {
  const m = backup.match(p);
  if (!m) throw new Error(`No match: ${p}`);
  return m[1];
}

const catchcopy = rx(/<span class="catchcopy-inner">([\s\S]*?)<\/span>/);
const heroSummary = rx(/<div class="hero-summary business-text">([\s\S]*?)<\/div>/);
const svcLead = rx(/<p class="section-lead business-text">([\s\S]*?)<\/p>/);
const contactLead = [...backup.matchAll(/<p class="section-lead business-text">([\s\S]*?)<\/p>/g)][1][1];
const svc1 = rx(/<article class="service-item reveal">[\s\S]*?01<\/span>([\s\S]*?)<\/article>/);
const svc2 = rx(/<article class="service-item reveal">[\s\S]*?02<\/span>([\s\S]*?)<\/article>/);
const svc3 = rx(/<article class="service-item reveal">[\s\S]*?03<\/span>([\s\S]*?)<\/article>/);
const contactDl = rx(/<dl class="contact-list reveal">([\s\S]*?)<\/dl>/);
const footerInner = rx(
  /<footer class="site-footer">[\s\S]*?<div class="container footer-inner">([\s\S]*?)<\/div>[\s\S]*?<\/footer>/
);

function svcPanel(num, idx, inner, aria) {
  const title = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
  
  const copy2 = inner.match(/<div class="service-item-copy[^>]*>([\s\S]*?)<\/div>/)[1];
  return `
    <section class="panel panel--service panel--service-${num}" data-panel-index="${idx}" aria-label="${aria}">
      <div>
      <div class="panel__deco panel__deco--beam" aria-hidden="true"></div>
      <span class="giant-number" aria-hidden="true">${num}</span>
      <div class="panel__inner">
        <div class="glass-panel">
          <div class="panel__layout">
            <p class="panel__index-label ui-label reveal-item" data-delay="0">${num}</p>
            <h2 class="panel__title">
              <span class="mask-title"><span>${title}</span></span>
            </h2>
            <div class="panel__body business-text reveal-item" data-delay="320">
              ${copy2}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

const svc1Title = svc1.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
const svc2Title = svc2.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
const svc3Title = svc3.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];

const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="description" content="Web Kai（加井 航貴）の事業紹介サイト。Webサイト制作、業務システム開発、IT活用支援を行う個人事業です。">
  <title>Web Kai | 加井 航貴</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;family=Noto+Sans+JP:wght@400;500;700&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" id="wk-css-base">
  <link rel="stylesheet" href="webkai-panels.css" id="wk-css-panels">
  <script>
    (function () {
      var isFile = location.protocol === "file:";
      var v = String(Date.now());
      if (isFile) {
        document.getElementById("wk-css-base").href = "styles.css?v=" + v;
        document.getElementById("wk-css-panels").href = "webkai-panels.css?v=" + v;
      }
      var s = document.createElement("script");
      s.defer = true;
      s.src = isFile ? "script.js?v=" + v : "script.js?v=20260520c";
      document.head.appendChild(s);
    })();
  </script>
</head>
<body class="is-intro-active panel-hero-active" data-panel-theme="hero">
  <div class="loading-screen" data-intro aria-hidden="false">
    <div class="loading-screen__base"></div>
    <div class="loading-screen__glow iridescent-bg"></div>
    <div class="loading-screen__mark">
      <img class="loading-screen__logo" src="logo.png" width="96" height="96" alt="" decoding="async">
      <span class="loading-screen__word ui-label">Web Kai</span>
    </div>
  </div>

  <div class="iridescent-bg bg-world" aria-hidden="true">
    <div class="bg-layer bg-layer--a"></div>
    <div class="bg-layer bg-layer--b"></div>
    <div class="bg-layer bg-layer--c"></div>
    <div class="bg-film"></div>
    <div class="bg-beam"></div>
    <div class="bg-noise"></div>
  </div>

  <a class="skip-link" href="#main">本文へスキップ</a>

  <header class="site-header">
    <div class="header-inner">
      <a class="brand brand-mark" href="#top" data-goto-panel="0">
        <img class="brand-logo" src="logo.png" width="40" height="40" alt="" decoding="async">
        <span>Web Kai</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">メニュー</button>
      <nav id="site-nav" class="site-nav" aria-label="ページ内メニュー">
        <a href="#service" data-goto-panel="1">サービス</a>
        <a href="#contact" data-goto-panel="5">お問い合わせ</a>
      </nav>
    </div>
  </header>

  <main class="presentation" id="main">
    <section id="top" class="panel panel--hero is-active" data-panel-index="0" aria-label="ファーストビュー">
      <div class="panel__glow" aria-hidden="true"></div>
      <div class="panel__deco panel__deco--hero" aria-hidden="true"></div>
      <span class="giant-number giant-number--hero" aria-hidden="true">01</span>
      <div class="panel__inner panel__inner--hero">
        <div class="hero-side reveal-item" data-delay="180">
          <div class="brand-mark brand-mark--hero">
            <img class="brand-logo brand-logo--hero" src="logo.png" width="96" height="96" alt="Web Kai ロゴ" decoding="async">
            <p class="trade-name">Web Kai</p>
          </div>
          <p class="owner-name business-text"><span class="owner-role">代表</span><span class="owner-name-text">加井 航貴</span></p>
        </div>
        <div class="hero-main glass-panel">
          <h1 class="catchcopy business-text">
            <span class="mask-title mask-title--hero"><span>${catchcopy}</span></span>
          </h1>
          <div class="hero-lead business-text reveal-item" data-delay="520">
            ${heroSummary}
          </div>
          <div class="hero-actions reveal-item" data-delay="700">
            <a class="button button--primary" href="#contact" data-goto-panel="5">お問い合わせ</a>
            <a class="button button--secondary" href="#service" data-goto-panel="1">サービスを見る</a>
          </div>
        </div>
      </div>
    </section>

    <section id="service" class="panel panel--service-intro" data-panel-index="1" aria-label="サービス">
      <div class="panel__glow" aria-hidden="true"></div>
      <div class="panel__deco panel__deco--beam" aria-hidden="true"></div>
      <span class="giant-number" aria-hidden="true">02</span>
      <div class="panel__inner">
        <div class="glass-panel">
          <p class="panel__index-label ui-label reveal-item" data-delay="0">Service</p>
          <h2 class="panel__title">
            <span class="mask-title"><span>サービス</span></span>
          </h2>
          <p class="panel__body reveal-item" data-delay="280">${svcLead}</p>
        </div>
      </div>
    </section>
${svcPanel("01", "2", svc1, svc1Title)}
${svcPanel("02", "3", svc2, svc2Title)}
${svcPanel("03", "4", svc3, svc3Title)}
    <section id="contact" class="panel panel--contact" data-panel-index="5" aria-label="お問い合わせ">
      <div class="panel__glow" aria-hidden="true"></div>
      <div class="panel__deco panel__deco--beam" aria-hidden="true"></div>
      <span class="giant-number" aria-hidden="true">06</span>
      <div class="panel__inner">
        <div class="glass-panel">
          <p class="panel__index-label ui-label reveal-item" data-delay="0">Contact</p>
          <h2 class="panel__title">
            <span class="mask-title"><span>お問い合わせ</span></span>
          </h2>
          <p class="panel__body reveal-item" data-delay="200">${contactLead}</p>
          <dl class="contact-list reveal-item" data-delay="380">
            ${contactDl}
          </dl>
          <footer class="site-footer panel__footer reveal-item" data-delay="480">
            <div>
              ${footerInner}
            </div>
          </footer>
        </div>
      </div>
    </section>
  </main>

  <div class="panel-chrome">
    <nav class="panel-nav" aria-label="画面ナビゲーション">
      <button type="button" class="panel-nav__back ui-label" aria-label="前の画面へ">Back</button>
      <div class="panel-indicator" aria-live="polite">
        <span class="panel-indicator__count ui-label">01 / 06</span>
        <div class="panel-indicator__track" aria-hidden="true">
          <span class="panel-indicator__thumb"></span>
        </div>
      </div>
      <button type="button" class="panel-nav__next ui-label" aria-label="次の画面へ">Next</button>
    </nav>
  </div>
</body>
</html>`;

const fixed = html.replaceAll("</?motion>", (m) => m).replace(/<\/?motion\b[^>]*>/g, (tag) =>
  tag.startsWith("</") ? "</div>" : tag.includes(" ") ? tag.replace("motion", "motion") : "<div>"
);
// proper fix
const out = html.replace(/<\/?motion\b[^>]*>/g, (tag) => (tag.startsWith("</") ? "</div>" : "<div>")).replace(/<div>/g, "<div>");
writeFileSync(join(hp, "index.html"), out.replace(/<div>/g, "<div>"), "utf8");
console.log("OK", out.includes("加井"));
