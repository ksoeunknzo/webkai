# -*- coding: utf-8 -*-
from pathlib import Path

OUT = Path(__file__).with_name("index.html")
D = "div"
o = f"<{D}>"
c = f"</{D}>"

HTML = f"""<!doctype html>
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
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&amp;family=Noto+Sans+JP:wght@400;500;700;900&amp;family=Syne:wght@600;700;800&amp;family=Zen+Kaku+Gothic+New:wght@500;700;900&amp;display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css" id="wk-css-base">
  <link rel="stylesheet" href="webkai-panels.css" id="wk-css-panels">
  <script>
    (function () {{
      var isFile = location.protocol === "file:";
      var v = String(Date.now());
      if (isFile) {{
        document.getElementById("wk-css-base").href = "styles.css?v=" + v;
        document.getElementById("wk-css-panels").href = "webkai-panels.css?v=" + v;
      }}
      var s = document.createElement("script");
      s.defer = true;
      s.src = isFile ? "script.js?v=" + v : "script.js?v=20260520b";
      document.head.appendChild(s);
    }})();
  </script>
</head>
<body class="is-intro-active" data-panel-theme="hero">
  {o.replace(">", ' class="loading-screen" data-intro aria-hidden="false">')}
    {o.replace(">", ' class="loading-screen__base">')}{c}
    {o.replace(">", ' class="loading-screen__glow">')}{c}
    {o.replace(">", ' class="loading-screen__mark">')}
      <img class="loading-screen__logo" src="logo.png" width="96" height="96" alt="" decoding="async">
      <span class="loading-screen__word">Web Kai</span>
    {c}
  {c}

  {o.replace(">", ' class="bg-world" aria-hidden="true">')}
    {o.replace(">", ' class="bg-layer bg-layer--a">')}{c}
    {o.replace(">", ' class="bg-layer bg-layer--b">')}{c}
    {o.replace(">", ' class="bg-film">')}{c}
    {o.replace(">", ' class="bg-noise">')}{c}
  {c}

  <a class="skip-link" href="#main">本文へスキップ</a>

  <header class="site-header">
    {o.replace(">", ' class="header-inner">')}
      <a class="brand brand-mark" href="#top">
        <img class="brand-logo" src="logo.png" width="40" height="40" alt="" decoding="async">
        <span>Web Kai</span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">メニュー</button>
      <nav id="site-nav" class="site-nav" aria-label="ページ内メニュー">
        <a href="#service" data-goto-panel="1">サービス</a>
        <a href="#contact" data-goto-panel="5">お問い合わせ</a>
      </nav>
    {c}
  </header>

  <main class="presentation" id="main">
    <section id="top" class="panel panel--hero is-active" data-panel-index="0" aria-label="ファーストビュー">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      {o.replace(">", ' class="panel__inner panel__inner--hero">')}
        {o.replace(">", ' class="hero-side reveal-item" data-delay="180">')}
          {o.replace(">", ' class="brand-mark brand-mark--hero">')}
            <img class="brand-logo brand-logo--hero" src="logo.png" width="96" height="96" alt="Web Kai ロゴ" decoding="async">
            <p class="trade-name">Web Kai</p>
          {c}
          <p class="owner-name business-text"><span class="owner-role">代表</span><span class="owner-name-text">加井 航貴</span></p>
        {c}
        {o.replace(">", ' class="hero-main">')}
          <h1 class="catchcopy business-text">
            <span class="mask-title mask-title--hero"><span>Webサイト制作と<br>業務システム・ツール開発</span></span>
          </h1>
          {o.replace(">", ' class="hero-lead business-text reveal-item" data-delay="520">')}
            <p>Web Kaiは、Webサイト制作、業務システム・ツール開発、IT活用の相談に対応する個人事業です。</p>
            <p>事業内容や業務の流れを確認しながら、<wbr>必要なWebサイトや管理ツールの制作を<span class="phrase-keep">行っています。</span></p>
          {c}
          {o.replace(">", ' class="hero-actions reveal-item" data-delay="700">')}
            <a class="button button--primary" href="#contact" data-goto-panel="5">お問い合わせ</a>
            <a class="button button--secondary" href="#service" data-goto-panel="1">サービスを見る</a>
          {c}
        {c}
      {c}
    </section>

    <section id="service" class="panel panel--service-intro" data-panel-index="1" aria-label="サービス">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      {o.replace(">", ' class="panel__inner">')}
        <p class="panel__index-label reveal-item" data-delay="0">Service</p>
        <h2 class="panel__title">
          <span class="mask-title"><span>サービス</span></span>
        </h2>
        <p class="panel__body reveal-item" data-delay="280">対応している主な内容です。</p>
      {c}
    </section>

    <section class="panel panel--service panel--service-01" data-panel-index="2" aria-label="Webサイト制作">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      <span class="panel__ghost" aria-hidden="true">01</span>
      {o.replace(">", ' class="panel__inner">')}
        {o.replace(">", ' class="panel__layout">')}
          <p class="panel__index-label reveal-item" data-delay="0">01</p>
          <h2 class="panel__title">
            <span class="mask-title"><span>Webサイト制作</span></span>
          </h2>
          {o.replace(">", ' class="panel__body business-text reveal-item" data-delay="320">')}
            <p>事業内容や目的に合わせて、見やすく分かりやすいWebサイトを制作します。</p>
            <p>情報整理、構成設計、デザイン、公開まで対応します。</p>
          {c}
        {c}
      {c}
    </section>

    <section class="panel panel--service panel--service-02" data-panel-index="3" aria-label="業務システム・ツール開発">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      <span class="panel__ghost" aria-hidden="true">02</span>
      {o.replace(">", ' class="panel__inner">')}
        {o.replace(">", ' class="panel__layout">')}
          <p class="panel__index-label reveal-item" data-delay="0">02</p>
          <h2 class="panel__title">
            <span class="mask-title"><span>業務システム・ツール開発</span></span>
          </h2>
          {o.replace(">", ' class="panel__body business-text reveal-item" data-delay="320">')}
            <p>日々の業務に合わせて、管理表や社内ツール、簡易システムを制作します。</p>
            <p>手作業の削減や、情報を確認しやすくする仕組みづくりに対応します。</p>
          {c}
        {c}
      {c}
    </section>

    <section class="panel panel--service panel--service-03" data-panel-index="4" aria-label="業務整理・IT活用">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      <span class="panel__ghost" aria-hidden="true">03</span>
      {o.replace(">", ' class="panel__inner">')}
        {o.replace(">", ' class="panel__layout">')}
          <p class="panel__index-label reveal-item" data-delay="0">03</p>
          <h2 class="panel__title">
            <span class="mask-title"><span>業務整理・IT活用</span></span>
          </h2>
          {o.replace(">", ' class="panel__body business-text reveal-item" data-delay="320">')}
            <p>現在の業務フローや情報管理を見直し、<span class="phrase-keep">ITを</span>活用した改善案の整理・実装を<span class="phrase-keep">行います。</span></p>
            <p>Excel、スプレッドシート、各種ツールの活用も含めて対応します。</p>
          {c}
        {c}
      {c}
    </section>

    <section id="contact" class="panel panel--contact" data-panel-index="5" aria-label="お問い合わせ">
      {o.replace(">", ' class="panel__glow" aria-hidden="true">')}{c}
      {o.replace(">", ' class="panel__inner">')}
        <p class="panel__index-label reveal-item" data-delay="0">Contact</p>
        <h2 class="panel__title">
          <span class="mask-title"><span>お問い合わせ</span></span>
        </h2>
        <p class="panel__body reveal-item" data-delay="200">Webサイト制作や業務ツール開発に関するご相談は、メールにてご連絡ください。内容を確認したうえで、対応可否や進め方をご案内します。</p>
        <dl class="contact-list reveal-item" data-delay="380">
          {o.replace(">", ' class="contact-item contact-item--primary">')}
            <dt>メールアドレス</dt>
            <dd><a class="contact-link contact-link--email business-text" href="mailto:koki.kai@autodevjapan.com">koki.kai@autodevjapan.com</a></dd>
          {c}
          {o.replace(">", ' class="contact-item">')}
            <dt>電話番号</dt>
            <dd><a class="contact-link business-text" href="tel:08027463635">080-2746-3635</a></dd>
          {c}
        </dl>
        <footer class="site-footer panel__footer reveal-item" data-delay="480">
          <p class="footer-brand brand-mark brand-mark--footer">
            <img class="brand-logo" src="logo.png" width="40" height="40" alt="" decoding="async">
            <span>Web Kai</span>
          </p>
          <p class="footer-name business-text">代表　加井 航貴</p>
          <p class="footer-scope business-text">Webサイト制作 / 業務システム開発 / IT活用支援</p>
          <p class="footer-copy">© 2026 Web Kai</p>
        </footer>
      {c}
    </section>
  </main>

  {o.replace(">", ' class="panel-chrome panel-indicator" aria-hidden="true">')}
    <span class="panel-indicator__count">01 / 06</span>
    {o.replace(">", ' class="panel-indicator__track">')}<span class="panel-indicator__thumb"></span>{c}
  {c}

  <p class="panel-hint" aria-hidden="true">Scroll / Click to continue</p>

  {o.replace(">", ' class="panel-chrome panel-nav" aria-label="画面切り替え">')}
    <button type="button" class="panel-nav__btn panel-nav__btn--prev" aria-label="前の画面" disabled>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6l-6 6 6 6M6 12h12"/></svg>
    </button>
    <button type="button" class="panel-nav__btn panel-nav__btn--next" aria-label="次の画面">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6l6 6-6 6M6 12h12"/></svg>
    </button>
  {c}
</body>
</html>
"""

OUT.write_text(HTML, encoding="utf-8")
print("OK", OUT.stat().st_size, "bytes")
