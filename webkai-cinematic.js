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

  const ambient = document.createElement("canvas");
  ambient.className = "wk-cine-ambient";
  ambient.setAttribute("aria-hidden", "true");
  const bg = document.querySelector(".bg-world");
  if (bg) {
    bg.after(ambient);
  } else {
    document.body.prepend(ambient);
  }

  const ctx = ambient.getContext("2d", { alpha: true });
  let particles = [];
  let lastDraw = 0;
  let rafId = 0;
  let shakeTimer = 0;
  let pulseTimer = 0;

  const themeColors = {
    hero: ["34, 245, 208", "74, 143, 212"],
    service: ["74, 143, 212", "34, 245, 208"],
    svc01: ["34, 245, 208", "184, 224, 112"],
    svc02: ["74, 143, 212", "34, 245, 208"],
    svc03: ["224, 192, 128", "34, 245, 208"],
    contact: ["34, 245, 208", "74, 143, 212"],
  };

  const initParticles = () => {
    const count = window.innerWidth < 900 ? 0 : 22;
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: 0.6 + Math.random() * 1,
    }));
  };

  const resizeAmbient = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    ambient.width = Math.floor(window.innerWidth * dpr);
    ambient.height = Math.floor(window.innerHeight * dpr);
    ambient.style.width = `${window.innerWidth}px`;
    ambient.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawAmbient = (now) => {
    if (document.hidden || document.body.classList.contains("is-intro-active")) {
      return;
    }

    if (now - lastDraw < 55) {
      return;
    }
    lastDraw = now;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const theme = themeColors[document.body.dataset.sectionTheme] || themeColors.hero;
    const [c1, c2] = theme;

    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) {
        p.vx *= -1;
      }
      if (p.y < 0 || p.y > h) {
        p.vy *= -1;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c1}, 0.35)`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 100) {
          ctx.strokeStyle = `rgba(${c2}, ${(1 - dist / 100) * 0.12})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  };

  const loop = (now) => {
    drawAmbient(now);
    rafId = requestAnimationFrame(loop);
  };

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
  window.addEventListener("resize", () => {
    resizeAmbient();
    initParticles();
    updateScrollProgress();
  }, { passive: true });

  initParticles();
  resizeAmbient();
  updateScrollProgress();
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(loop);
})();
