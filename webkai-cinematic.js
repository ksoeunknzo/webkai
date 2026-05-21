/**
 * Web Kai — cinematic layer (system cursor unchanged)
 */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduced) {
    return;
  }

  root.classList.add("wk-cine");

  const progress = document.createElement("div");
  progress.className = "wk-cine-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  let shakeTimer = 0;
  let pulseTimer = 0;

  const updateScrollProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty("--wk-scroll-progress", String(Math.min(1, window.scrollY / max)));
  };

  const juiceChapter = () => {
    document.body.classList.remove("wk-cine-shake", "wk-cine-pulse");
    void document.body.offsetWidth;
    document.body.classList.add("wk-cine-shake", "wk-cine-pulse");

    window.clearTimeout(shakeTimer);
    window.clearTimeout(pulseTimer);
    shakeTimer = window.setTimeout(() => document.body.classList.remove("wk-cine-shake"), 450);
    pulseTimer = window.setTimeout(() => document.body.classList.remove("wk-cine-pulse"), 680);
  };

  const markSectionEnter = (section) => {
    if (!section) {
      return;
    }
    section.classList.add("wk-cine-enter");
    window.setTimeout(() => section.classList.remove("wk-cine-enter"), 1100);
  };

  document.querySelectorAll(".section").forEach((section) => {
    const observer = new MutationObserver(() => {
      if (section.classList.contains("is-entering")) {
        markSectionEnter(section);
      }
    });
    observer.observe(section, { attributes: true, attributeFilter: ["class"] });
  });

  document.body.addEventListener("wk-chapter", (e) => {
    const phase = e.detail?.phase;
    if (phase === "change") {
      juiceChapter();
    }
  });

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress, { passive: true });

  updateScrollProgress();
})();
