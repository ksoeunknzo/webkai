/**
 * Web Kai — delight (chapter FX + pointer glow). Default system cursor.
 */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    return;
  }

  root.classList.add("wk-premium");

  let flashTimer = 0;
  let warpTimer = 0;
  let pointerIdle = 0;
  let glowRaf = 0;
  let glowX = 0.5;
  let glowY = 0.5;

  const paintGlow = () => {
    glowRaf = 0;
    root.style.setProperty("--wk-px", `${glowX * 100}%`);
    root.style.setProperty("--wk-py", `${glowY * 100}%`);
  };

  const onPointerMove = (e) => {
    glowX = e.clientX / window.innerWidth;
    glowY = e.clientY / window.innerHeight;

    if (!glowRaf) {
      glowRaf = requestAnimationFrame(paintGlow);
    }

    root.classList.add("wk-has-pointer", "wk-pointer-on");

    window.clearTimeout(pointerIdle);
    pointerIdle = window.setTimeout(() => {
      root.classList.remove("wk-pointer-on");
    }, 2000);
  };

  const triggerChapterFlash = () => {
    root.classList.remove("wk-chapter-flash", "wk-chapter-warp");
    window.clearTimeout(flashTimer);
    window.clearTimeout(warpTimer);
    void root.offsetWidth;
    root.classList.add("wk-chapter-flash", "wk-chapter-warp");
    flashTimer = window.setTimeout(() => root.classList.remove("wk-chapter-flash"), 760);
    warpTimer = window.setTimeout(() => root.classList.remove("wk-chapter-warp"), 900);
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const bodyObserver = new MutationObserver((records) => {
    for (const record of records) {
      if (record.attributeName !== "class") {
        continue;
      }
      if (document.body.classList.contains("is-chapter-changing")) {
        triggerChapterFlash();
      }
    }
  });

  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });

  document.querySelectorAll(".service-menu__link, .site-nav a, .scroll-dock__btn").forEach((el) => {
    el.addEventListener(
      "click",
      () => {
        el.classList.add("wk-tap");
        window.setTimeout(() => el.classList.remove("wk-tap"), 420);
      },
      { passive: true }
    );
  });
})();
