import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const hp = process.argv[2];
const TAG = ["d", "i", "v"].join("");
const o = (cls, attrs = "") =>
  cls ? `<${TAG} class="${cls}"${attrs}>` : attrs ? `<${TAG}${attrs}>` : `<${TAG}>`;
const c = `</${TAG}>`;
const glow = () => "";
const deco = () => "";
const visual = (name) => `${o(`section-visual section-visual--${name}`, ' aria-hidden="true"')}${c}`;
const ambient = () => "";
const flash = () => "";

const heroVisual = () => `${o("hero-visual", ' aria-hidden="true"')}
      <span class="hero-visual__beam"></span>
      ${o("hero-visual__panel")}
        <span class="hero-visual__grid"></span>
        <span class="hero-visual__ring"></span>
        <span class="hero-visual__ring hero-visual__ring--b"></span>
        <span class="hero-visual__city"></span>
        <span class="hero-visual__nodes"><i></i><i></i><i></i></span>
      ${c}
    ${c}`;

const sectionDock = () => `  <nav class="scroll-dock scroll-dock--global scroll-dock--next-only" id="site-scroll-dock" aria-label="セクション移動" aria-hidden="true">
    <button type="button" class="scroll-dock__btn scroll-dock__btn--next" id="chapter-next" aria-label="次のセクションへ">
      <span class="scroll-dock__arrow scroll-dock__arrow--main" aria-hidden="true">↓</span>
      <span class="scroll-dock__hint ui-label" id="scroll-dock-label">Scroll</span>
    </button>
  </nav>`;

const b = readFileSync(join(hp, "_backup/2026-05-15-0143/index.html"), "utf8");

const rx = (p) => {
  const m = b.match(p);
  if (!m) throw new Error("rx fail");
  return m[1];
};

const catchcopy = rx(/<span class="catchcopy-inner">([\s\S]*?)<\/span>/);
const catchcopyHtml = catchcopy.replace(
  "業務システム・ツール開発",
  '<span class="phrase-keep catchcopy-keep">業務システム・ツール開発</span>'
);
const heroSummaryContent = rx(/<div class="hero-summary business-text">([\s\S]*?)<\/div>/);
const svcLead = rx(/<p class="section-lead business-text">([\s\S]*?)<\/p>/);
const contactIntro =
  "Webサイト制作や業務ツール開発に関するご相談は、メールにてご連絡ください。内容を確認したうえで、対応可否や進め方をご案内します。";

const contactFormBlock = `
              <form class="contact-form reveal-item" data-delay="260" action="#" method="post" novalidate>
                <div class="contact-form__row contact-form__row--duo">
                  <div class="contact-form__field">
                    <label class="contact-form__label" for="wk-contact-company">会社名（任意）</label>
                    <input class="contact-form__input" type="text" id="wk-contact-company" name="company" autocomplete="organization" placeholder="例：株式会社〇〇">
                  </div>
                  <div class="contact-form__field">
                    <label class="contact-form__label" for="wk-contact-name">お名前 <span class="contact-form__req" aria-hidden="true">*</span></label>
                    <input class="contact-form__input" type="text" id="wk-contact-name" name="name" autocomplete="name" required placeholder="例：山田 太郎">
                  </div>
                </div>
                <div class="contact-form__field">
                  <label class="contact-form__label" for="wk-contact-email">メールアドレス <span class="contact-form__req" aria-hidden="true">*</span></label>
                  <input class="contact-form__input" type="email" id="wk-contact-email" name="email" autocomplete="email" required placeholder="例：example@mail.com">
                </div>
                <fieldset class="contact-form__field contact-form__field--type">
                  <legend class="contact-form__label">お問い合わせ種別 <span class="contact-form__req" aria-hidden="true">*</span></legend>
                  <div class="contact-form__radio-grid">
                    <label class="contact-form__radio">
                      <input type="radio" name="inquiry_type" value="production" required>
                      <span>制作依頼</span>
                    </label>
                    <label class="contact-form__radio">
                      <input type="radio" name="inquiry_type" value="consultation">
                      <span>相談・制作依頼以外の相談</span>
                    </label>
                    <label class="contact-form__radio">
                      <input type="radio" name="inquiry_type" value="press">
                      <span>取材依頼</span>
                    </label>
                    <label class="contact-form__radio">
                      <input type="radio" name="inquiry_type" value="other">
                      <span>その他</span>
                    </label>
                  </div>
                </fieldset>
                <div class="contact-form__field">
                  <label class="contact-form__label" for="wk-contact-message">メッセージ <span class="contact-form__req" aria-hidden="true">*</span></label>
                  <textarea class="contact-form__textarea" id="wk-contact-message" name="message" required placeholder="お気軽にどうぞ"></textarea>
                </div>
                <input type="text" name="_gotcha" class="contact-form__honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
                <p class="contact-form__status" role="status" aria-live="polite" hidden></p>
                <button type="submit" class="contact-form__submit ui-label">送信する</button>
              </form>`;
const svc1 = rx(/<article class="service-item reveal">[\s\S]*?01<\/span>([\s\S]*?)<\/article>/);
const svc2 = rx(/<article class="service-item reveal">[\s\S]*?02<\/span>([\s\S]*?)<\/article>/);
const svc3 = rx(/<article class="service-item reveal">[\s\S]*?03<\/span>([\s\S]*?)<\/article>/);
const contactDl = rx(/<dl class="contact-list reveal">([\s\S]*?)<\/dl>/);
const footerBrandBlock = b.match(
  /<p class="footer-brand brand-mark brand-mark--footer">[\s\S]*?<\/p>/
)[0];
const footerNameBlock = b.match(/<p class="footer-name business-text">[\s\S]*?<\/p>/)[0];
const footerScopeBlock = b.match(/<p class="footer-scope business-text">[\s\S]*?<\/p>/)[0];
const footerCopyBlock = b.match(/<p class="footer-copy">[\s\S]*?<\/p>/)[0];
const footerInner2 = rx(
  /<footer class="site-footer">[\s\S]*?<div class="container footer-inner">([\s\S]*?)<\/div>[\s\S]*?<\/footer>/
);

function svcSection(num, idx, inner, aria) {
  const title = inner.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
  const copy2b = inner.match(/<div class="service-item-copy[^>]*>([\s\S]*?)<\/div>/)[1];
  return [
    `<section class="section section--service section--service-${num}" id="service-${num}" data-section-index="${idx}" aria-label="${aria}">`,
    ambient(`svc${num}`),
    flash(),
    glow(),
    deco("beam"),
    `<span class="giant-number" aria-hidden="true">${num}</span>`,
    o("section-inner"),
    o("section-content section-content--service cyber-panel"),
    o("section-service-head"),
    `<span class="section-service-num ui-label reveal-item" data-delay="0">${num}</span>`,
    `<h2 class="section-title">`,
    `<span class="mask-title"><span>${title}</span></span>`,
    `</h2>`,
    c,
    `${o("section-body business-text reveal-item", ' data-delay="320"')}${copy2b}${c}`,
    c,
    c,
    `</section>`,
  ].join("\n");
}

const svc1Title = svc1.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
const svc2Title = svc2.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];
const svc3Title = svc3.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)[1];

const serviceMenuItem = (num, title, sectionIndex, delay) =>
  `          <li class="service-menu__item reveal-item" data-delay="${delay}">
            <a class="service-menu__link" href="#service-${num}" data-goto-section="${sectionIndex}">
              <span class="service-menu__num ui-label">${num}</span>
              <span class="service-menu__title business-text">${title}</span>
              <span class="service-menu__arrow" aria-hidden="true">→</span>
            </a>
          </li>`;

const serviceMenuHtml = [
  '<ul class="service-menu reveal-item" data-delay="360">',
  serviceMenuItem("01", svc1Title, "2", 400),
  serviceMenuItem("02", svc2Title, "3", 480),
  serviceMenuItem("03", svc3Title, "4", 560),
  "</ul>",
].join("\n");

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
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;family=IBM+Plex+Mono:wght@300;400&amp;family=Inter:wght@300;400;500;600;700&amp;family=JetBrains+Mono:wght@300;400;500&amp;family=Noto+Sans+JP:wght@400;500;700&amp;family=Space+Mono:wght@400;700&amp;family=Syne:wght@600;700;800&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" id="wk-css-base">
  <link rel="stylesheet" href="webkai-panels.css" id="wk-css-panels">
  <link rel="stylesheet" href="webkai-layout.css" id="wk-css-layout">
  <link rel="stylesheet" href="webkai-cyber.css" id="wk-css-cyber">
  <link rel="stylesheet" href="webkai-hero.css" id="wk-css-hero">
  <link rel="stylesheet" href="webkai-polish.css" id="wk-css-polish">
  <link rel="stylesheet" href="webkai-scroll.css" id="wk-css-scroll">
  <link rel="stylesheet" href="webkai-scroll-cue.css" id="wk-css-scroll-cue">
  <link rel="stylesheet" href="webkai-contact.css" id="wk-css-contact">
  <link rel="stylesheet" href="webkai-logo.css" id="wk-css-logo">
  <link rel="stylesheet" href="webkai-hero-card.css" id="wk-css-hero-card">
  <link rel="stylesheet" href="webkai-chapter-nav.css" id="wk-css-chapter-nav">
  <link rel="stylesheet" href="webkai-polish-pass.css" id="wk-css-polish-pass">
  <link rel="stylesheet" href="webkai-type-color.css" id="wk-css-type-color">
  <link rel="stylesheet" href="webkai-layout-system.css" id="wk-css-layout-system">
  <link rel="stylesheet" href="webkai-section-light.css" id="wk-css-section-light">
  <link rel="stylesheet" href="webkai-scale.css" id="wk-css-scale">
  <link rel="stylesheet" href="webkai-contact-fix.css" id="wk-css-contact-fix">
  <link rel="stylesheet" href="webkai-contact-compact.css" id="wk-css-contact-compact">
  <link rel="stylesheet" href="webkai-contact-form.css" id="wk-css-contact-form">
  <link rel="stylesheet" href="webkai-contact-fit.css" id="wk-css-contact-fit">
  <link rel="stylesheet" href="webkai-delight.css" id="wk-css-delight">
  <link rel="stylesheet" href="webkai-delight-premium.css" id="wk-css-delight-premium">
  <link rel="stylesheet" href="webkai-cinematic.css" id="wk-css-cinematic">
  <link rel="stylesheet" href="webkai-nav.css" id="wk-css-nav">
  <link rel="stylesheet" href="webkai-loading.css" id="wk-css-loading">
  <link rel="stylesheet" href="webkai-refine.css" id="wk-css-refine">
  <link rel="stylesheet" href="webkai-loading-plus.css" id="wk-css-loading-plus">
  <link rel="stylesheet" href="webkai-loading-pro.css" id="wk-css-loading-pro">
  <link rel="stylesheet" href="webkai-bg-soft.css" id="wk-css-bg-soft">
  <link rel="stylesheet" href="webkai-bg-reset.css" id="wk-css-bg-reset">
  <link rel="stylesheet" href="webkai-mobile.css" id="wk-css-mobile">
  <link rel="stylesheet" href="webkai-headings-unify.css" id="wk-css-headings-unify">
  <style id="wk-bg-kill-critical">
    html,body{background:#050f0d!important}
    body::before,body::after{display:none!important;content:none!important;background:none!important}
    .bg-world{background:#050f0d!important}
    .bg-world>*{display:none!important}
    .section-glow,.section-flash,.section-ambient,.section-deco{display:none!important}
    .section::before,.section::after{display:none!important;content:none!important}
    .hero-visual__panel,.hero-visual__grid,.hero-visual__beam,.hero-visual__ring,.hero-visual__city,.hero-visual__nodes,.loading-screen__glow{display:none!important}
    .giant-number{display:none!important}
    .section--service .section-inner{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;max-width:1160px!important;width:100%!important}
    .section--contact .section-inner--contact{display:flex!important;flex-direction:column!important;align-items:flex-start!important;justify-content:flex-start!important;max-width:1160px!important;max-height:none!important;overflow:visible!important;width:100%!important}
    .section--service .section-content--service{max-width:min(760px,94vw)!important;width:100%!important}
    .section--contact .contact-stack--flow{max-width:min(820px,94vw)!important;width:100%!important}
    .section--contact{justify-content:flex-start!important;overflow:visible!important;scroll-margin-top:calc(var(--header-h,68px) + 14px)}
    .cyber-panel::before,.cyber-panel::after,.section-content--service::before,.section-content--service::after{display:none!important;content:none!important}
  </style>
  <script>
    (function () {
      function wkPurgeBgArtifacts() {
        document.querySelectorAll(
          ".section-glow,.section-flash,.section-ambient,.section-deco,.bg-world > *,.hero-visual__panel,.hero-visual__grid,.hero-visual__beam,.hero-visual__ring,.hero-visual__city,.hero-visual__nodes,.loading-screen__glow,.giant-number"
        ).forEach(function (node) {
          node.remove();
        });
        var bg = document.querySelector(".bg-world");
        if (bg) {
          bg.style.background = "#050f0d";
        }
        document.documentElement.style.background = "#050f0d";
        document.body.style.background = "#050f0d";
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", wkPurgeBgArtifacts);
      } else {
        wkPurgeBgArtifacts();
      }
    })();
  </script>
  <script>
    (function () {
      var isFile = location.protocol === "file:";
      var v = String(Date.now());
      if (isFile) {
        document.getElementById("wk-css-base").href = "styles.css?v=" + v;
        document.getElementById("wk-css-panels").href = "webkai-panels.css?v=" + v;
        document.getElementById("wk-css-layout").href = "webkai-layout.css?v=" + v;
        document.getElementById("wk-css-cyber").href = "webkai-cyber.css?v=" + v;
        document.getElementById("wk-css-hero").href = "webkai-hero.css?v=" + v;
        document.getElementById("wk-css-polish").href = "webkai-polish.css?v=" + v;
        document.getElementById("wk-css-scroll").href = "webkai-scroll.css?v=" + v;
        document.getElementById("wk-css-scroll-cue").href = "webkai-scroll-cue.css?v=" + v;
        document.getElementById("wk-css-contact").href = "webkai-contact.css?v=" + v;
        document.getElementById("wk-css-logo").href = "webkai-logo.css?v=" + v;
        document.getElementById("wk-css-hero-card").href = "webkai-hero-card.css?v=" + v;
        document.getElementById("wk-css-chapter-nav").href = "webkai-chapter-nav.css?v=" + v;
        document.getElementById("wk-css-polish-pass").href = "webkai-polish-pass.css?v=" + v;
        document.getElementById("wk-css-type-color").href = "webkai-type-color.css?v=" + v;
        document.getElementById("wk-css-layout-system").href = "webkai-layout-system.css?v=" + v;
        document.getElementById("wk-css-section-light").href = "webkai-section-light.css?v=" + v;
        document.getElementById("wk-css-scale").href = "webkai-scale.css?v=" + v;
        document.getElementById("wk-css-contact-fix").href = "webkai-contact-fix.css?v=" + v;
        document.getElementById("wk-css-contact-compact").href = "webkai-contact-compact.css?v=" + v;
        document.getElementById("wk-css-contact-form").href = "webkai-contact-form.css?v=" + v;
        document.getElementById("wk-css-contact-fit").href = "webkai-contact-fit.css?v=" + v;
        document.getElementById("wk-css-delight").href = "webkai-delight.css?v=" + v;
        document.getElementById("wk-css-delight-premium").href = "webkai-delight-premium.css?v=" + v;
        document.getElementById("wk-css-cinematic").href = "webkai-cinematic.css?v=" + v;
        document.getElementById("wk-css-nav").href = "webkai-nav.css?v=" + v;
        document.getElementById("wk-css-loading").href = "webkai-loading.css?v=" + v;
        document.getElementById("wk-css-refine").href = "webkai-refine.css?v=" + v;
        document.getElementById("wk-css-loading-plus").href = "webkai-loading-plus.css?v=" + v;
        document.getElementById("wk-css-loading-pro").href = "webkai-loading-pro.css?v=" + v;
        document.getElementById("wk-css-bg-soft").href = "webkai-bg-soft.css?v=" + v;
        document.getElementById("wk-css-bg-reset").href = "webkai-bg-reset.css?v=" + v;
        document.getElementById("wk-css-mobile").href = "webkai-mobile.css?v=" + v;
        document.getElementById("wk-css-headings-unify").href = "webkai-headings-unify.css?v=" + v;
      }
      var s = document.createElement("script");
      s.defer = true;
      s.src = isFile ? "script.js?v=" + v : "script.js?v=20260519b";
      document.head.appendChild(s);
      var d = document.createElement("script");
      d.defer = true;
      d.src = isFile ? "webkai-delight.js?v=" + v : "webkai-delight.js?v=20260530a";
      document.head.appendChild(d);
      var c = document.createElement("script");
      c.defer = true;
      c.src = isFile ? "webkai-cinematic.js?v=" + v : "webkai-cinematic.js?v=20260531g";
      document.head.appendChild(c);
      var lp = document.createElement("script");
      lp.defer = true;
      lp.src = isFile ? "webkai-loading-plus.js?v=" + v : "webkai-loading-plus.js?v=20260531e";
      document.head.appendChild(lp);
    })();
  </script>
</head>
<body class="is-intro-active" data-section-theme="hero">
  <div class="loading-screen" data-intro aria-hidden="false">
    ${o("loading-screen__base")}${c}
    ${o("loading-screen__glow iridescent-bg")}${c}
    ${o("loading-screen__mark")}
      <span class="loading-screen__sweep" aria-hidden="true"></span>
      <img class="loading-screen__logo" src="logo.png" width="96" height="96" alt="" decoding="async">
      <span class="loading-screen__word">Web Kai</span>
    ${c}
  </div>

  <div class="bg-world" aria-hidden="true"></div>

  <a class="skip-link" href="#main">本文へスキップ</a>

  <header class="site-header">
    ${o("header-inner")}
      <a class="brand brand-mark" href="#top" data-goto-section="0">
        <img class="brand-logo" src="logo.png" width="40" height="40" alt="" decoding="async">
        <span>Web Kai</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">メニュー</button>
      <nav id="site-nav" class="site-nav" aria-label="ページ内メニュー">
        <a href="#top" data-goto-section="0" class="site-nav__link site-nav__link--top">ページトップ</a>
        <a href="#service" data-goto-section="1" class="site-nav__link">サービス</a>
        <a href="#contact" data-goto-section="5" class="site-nav__link">お問い合わせ</a>
      </nav>
    ${c}
  </header>

${sectionDock()}

  <main class="site-scroll" id="main">
    <section id="top" class="section section--hero" data-section-index="0" aria-label="ファーストビュー">
      ${ambient("hero")}
      ${flash()}
      ${glow()}
      ${deco("hero")}
      ${o("section-inner section-inner--hero")}
        ${o("section-split section-split--hero")}
          ${o("section-content section-content--brand hero-side reveal-item", ' data-delay="180"')}
            ${o("brand-mark brand-mark--hero")}
              <img class="brand-logo brand-logo--hero" src="logo.png" width="88" height="88" alt="Web Kai ロゴ" decoding="async">
              <p class="trade-name">Web Kai</p>
            ${c}
            <p class="owner-name business-text"><span class="owner-role">代表</span><span class="owner-name-text">加井 航貴</span></p>
          ${c}
          ${o("section-content section-content--hero hero-main")}
            <h1 class="catchcopy business-text">
              <span class="mask-title mask-title--hero"><span>${catchcopyHtml}</span></span>
            </h1>
            ${o("hero-lead business-text reveal-item", ' data-delay="520"')}
              ${heroSummaryContent}
            ${c}
          ${c}
          ${heroVisual()}
        ${c}
      ${c}
    </section>

    <section id="service" class="section section--service-intro" data-section-index="1" aria-label="サービス">
      ${ambient("intro")}
      ${flash()}
      ${glow()}
      ${deco("intro")}
      ${o("section-inner")}
        ${o("section-split section-split--intro")}
          ${o("section-content intro-copy")}
            <p class="section-label ui-label reveal-item" data-delay="0">Service</p>
            <h2 class="section-title">
              <span class="mask-title"><span>サービス</span></span>
            </h2>
            <p class="section-body reveal-item" data-delay="280">${svcLead}</p>
${serviceMenuHtml}
          ${c}
          ${visual("intro")}
        ${c}
      ${c}
    </section>
${svcSection("01", "2", svc1, svc1Title)}
${svcSection("02", "3", svc2, svc2Title)}
${svcSection("03", "4", svc3, svc3Title)}
    <section id="contact" class="section section--contact" data-section-index="5" aria-label="お問い合わせ">
      ${ambient("contact")}
      ${flash()}
      ${glow()}
      ${deco("beam")}
      ${o("section-inner section-inner--contact")}
        ${o("section-content contact-stack contact-stack--flow")}
          ${o("contact-stack__header reveal-item", ' data-delay="120"')}
            ${o("contact-copy")}
              <p class="section-label ui-label reveal-item" data-delay="0">Contact</p>
              <h2 class="section-title">
                <span class="mask-title"><span>お問い合わせ</span></span>
              </h2>
            ${c}
            <p class="section-body contact-intro--outside reveal-item" data-delay="200">${contactIntro}</p>
          ${c}
          ${o("contact-panel reveal-item", ' data-delay="260"')}
            ${o("contact-panel__grid")}
              ${o("contact-panel__body")}
${contactFormBlock}
              ${c}
            ${c}
            ${o("contact-panel__foot")}
              <footer class="site-footer section-footer reveal-item" data-delay="420">
                ${o("footer-inner-wrap")}
                  ${o("footer-profile")}
                    ${footerBrandBlock}
                    ${footerNameBlock}
                    ${o("footer-contact reveal-item", ' data-delay="380"')}
                      <dl class="contact-list contact-list--footer">
                        ${contactDl}
                      </dl>
                    ${c}
                  ${c}
                  ${footerScopeBlock}
                  ${footerCopyBlock}
                ${c}
              </footer>
            ${c}
          ${c}
        ${c}
      ${c}
    </section>
  </main>
</body>
</html>`;

const fixed = html.replace(/<\/?motion\b[^>]*>/g, (tag) =>
  tag.startsWith("</") ? c : tag.replace(/motion/, TAG)
);

writeFileSync(join(hp, "index.html"), fixed, "utf8");
console.log("OK", fixed.includes("お問い合わせ"), fixed.includes("加井"), !fixed.includes("縺"), fixed.includes("scroll-cue"));
