/**
 * Web Kai — CENTURY-style scroll chapters
 */

const loadingScreen = document.querySelector(".loading-screen[data-intro]");
const scrollDockEl = document.getElementById("site-scroll-dock");
const scrollDockLabel = document.getElementById("scroll-dock-label");
const chapterPrevBtn = document.getElementById("chapter-prev");
const chapterNextBtn = document.getElementById("chapter-next");
const sections = Array.from(document.querySelectorAll(".site-scroll .section"));
const lastChapterIndex = () => Math.max(0, sections.length - 1);
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const SNAP_MEDIA = window.matchMedia("(min-width: 901px) and (min-height: 721px)");
const previewParams = new URLSearchParams(window.location.search);
const skipIntro = previewParams.has("skip-intro");

const INTRO_HOLD_MS = 1500;
const INTRO_EXIT_MS = 720;
const SCROLL_TOLERANCE = 12;
const INTRO_SEEN_KEY = "wk-intro-seen";
const hasSeenIntro = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
const CHAPTER_MS = 1100;
const LEAVE_MS = 280;
const SCROLL_SETTLE_MS = 140;
const SCROLL_SNAP_MS = 420;

const SECTION_THEMES = ["hero", "service", "svc01", "svc02", "svc03", "contact"];
const BODY_THEME_CLASSES = [
  "section-hero-active",
  "section-service-active",
  "section-svc01-active",
  "section-svc02-active",
  "section-svc03-active",
  "section-contact-active",
];

let currentIndex = 0;
let introDone = false;
let isTransitioning = false;
let pendingNavIndex = null;
let navRunChain = Promise.resolve();
let isScrollSnapping = false;
let isProgrammaticScroll = false;
let scrollSnapReleaseTimer = 0;
let scrollSettleTimer = 0;
let scrollIndexTimer = 0;
let sectionObserver = null;

const getScrollPadTop = () => {
  const root = getComputedStyle(document.documentElement);
  const pad = parseInt(root.getPropertyValue("--scroll-pad-top"), 10);
  if (!Number.isNaN(pad) && pad > 0) {
    return pad;
  }
  return parseInt(root.getPropertyValue("--header-h"), 10) || 68;
};

const getMaxScrollTop = () =>
  Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

const getContactPanelMetrics = (section) => {
  const panel =
    section.querySelector(".contact-panel") ||
    section.querySelector(".contact-stack--flow");
  const padTop = getScrollPadTop();
  const viewH = window.innerHeight;
  const root = getComputedStyle(document.documentElement);
  const dockReserve = parseInt(root.getPropertyValue("--scroll-dock-reserve"), 10);
  const bottomClear = Math.max(56, (Number.isNaN(dockReserve) ? 160 : dockReserve) * 0.42);

  if (!panel) {
    return {
      contentTop: section.offsetTop,
      contentH: section.offsetHeight,
      padTop,
      viewH,
      bottomClear,
    };
  }

  const panelRect = panel.getBoundingClientRect();
  return {
    contentTop: window.scrollY + panelRect.top,
    contentH: panelRect.height,
    padTop,
    viewH,
    bottomClear,
  };
};

const getContactScrollBounds = (section) => {
  const { contentTop, contentH, padTop, viewH } = getContactPanelMetrics(section);
  const start = Math.max(0, contentTop - padTop);
  const end = Math.max(start, contentTop + contentH - viewH + padTop);
  return { start, end, isTall: contentH > viewH - padTop - 32 };
};

const getSectionScrollTop = (section) => {
  const padTop = getScrollPadTop();
  const maxScroll = getMaxScrollTop();
  const viewH = window.innerHeight;

  if (section.classList.contains("section--contact")) {
    const { contentTop, contentH, bottomClear } = getContactPanelMetrics(section);
    const band = viewH - padTop - bottomClear;

    if (contentH <= band) {
      const fit = contentTop - padTop - Math.max(0, (band - contentH) / 2);
      return Math.min(Math.max(0, fit), maxScroll);
    }

    return Math.min(Math.max(0, contentTop - padTop), maxScroll);
  }

  const top = window.scrollY + section.getBoundingClientRect().top - padTop;
  return Math.min(Math.max(0, top), maxScroll);
};

const findNearestSectionIndex = () => {
  const padTop = getScrollPadTop();
  const anchorY = window.scrollY + padTop + Math.min(window.innerHeight * 0.34, 240);

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    if (anchorY >= top && anchorY < bottom) {
      return index;
    }
  }

  let bestIndex = 0;
  let bestDistance = Infinity;

  sections.forEach((section, index) => {
    const distance = Math.abs(section.getBoundingClientRect().top - padTop);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
};

const shouldSkipContactSnap = (section) => {
  if (!section.classList.contains("section--contact")) {
    return false;
  }

  const { start, end, isTall } = getContactScrollBounds(section);
  if (!isTall) {
    return false;
  }

  return window.scrollY >= start - 10 && window.scrollY <= end + 10;
};

const alignScrollToSection = (index, behavior = "auto") => {
  const section = sections[index];
  if (!section) {
    return;
  }

  const idealTop = getSectionScrollTop(section);
  if (shouldSkipContactSnap(section)) {
    return;
  }

  const maxScroll = getMaxScrollTop();
  const targetTop = Math.min(idealTop, maxScroll);

  if (Math.abs(window.scrollY - targetTop) <= 4) {
    return;
  }

  isScrollSnapping = true;
  window.scrollTo({ top: targetTop, behavior });
  window.clearTimeout(scrollSnapReleaseTimer);
  scrollSnapReleaseTimer = window.setTimeout(() => {
    isScrollSnapping = false;
  }, behavior === "smooth" ? SCROLL_SNAP_MS : 60);
};

const waitUntilScrollNear = (targetTop, maxMs = CHAPTER_MS + 320) =>
  new Promise((resolve) => {
    const start = performance.now();

    const tick = () => {
      if (Math.abs(window.scrollY - targetTop) <= SCROLL_TOLERANCE) {
        resolve(true);
        return;
      }

      if (performance.now() - start >= maxMs) {
        window.scrollTo({ top: targetTop, behavior: "auto" });
        resolve(false);
        return;
      }

      window.requestAnimationFrame(tick);
    };

    window.requestAnimationFrame(tick);
  });

const scrollToSectionTop = async (index, emphasized = true) => {
  const section = sections[index];
  if (!section) {
    return false;
  }

  if (shouldSkipContactSnap(section)) {
    return true;
  }

  const targetTop = Math.min(getSectionScrollTop(section), getMaxScrollTop());
  const behavior = prefersReducedMotion ? "auto" : emphasized ? "smooth" : "smooth";

  window.clearTimeout(scrollSettleTimer);
  window.clearTimeout(scrollSnapReleaseTimer);
  isProgrammaticScroll = true;
  isScrollSnapping = true;
  window.scrollTo({ top: targetTop, behavior });

  await waitUntilScrollNear(targetTop);

  if (Math.abs(window.scrollY - targetTop) > SCROLL_TOLERANCE) {
    window.scrollTo({ top: targetTop, behavior: "auto" });
    await waitUntilScrollNear(targetTop, 240);
  }

  isScrollSnapping = false;
  isProgrammaticScroll = false;
  return true;
};

const settleToNearestSection = () => {
  if (!introDone || isTransitioning || isScrollSnapping || isProgrammaticScroll) {
    return;
  }

  if (!SNAP_MEDIA.matches || prefersReducedMotion) {
    return;
  }

  const index = findNearestSectionIndex();
  const section = sections[index];
  const idealTop = getSectionScrollTop(section);

  if (!shouldSkipContactSnap(section)) {
    alignScrollToSection(index, prefersReducedMotion ? "auto" : "smooth");
  }

  if (index !== currentIndex) {
    setActiveSection(index, { animate: false });
  }
};

const scheduleScrollSettle = () => {
  window.clearTimeout(scrollSettleTimer);
  scrollSettleTimer = window.setTimeout(settleToNearestSection, SCROLL_SETTLE_MS);
};

const scheduleScrollIndexUpdate = () => {
  window.clearTimeout(scrollIndexTimer);
  scrollIndexTimer = window.setTimeout(() => {
    if (!introDone || isTransitioning || isScrollSnapping || isProgrammaticScroll) {
      return;
    }
    const index = findNearestSectionIndex();
    if (index !== currentIndex) {
      setActiveSection(index, { animate: false });
    }
  }, 80);
};

/* --- Header scroll -------------------------------------------------------- */

const onPageScroll = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener(
  "scroll",
  () => {
    onPageScroll();
    scheduleScrollIndexUpdate();
    scheduleScrollSettle();
  },
  { passive: true }
);

if ("onscrollend" in window) {
  window.addEventListener("scrollend", settleToNearestSection, { passive: true });
}

onPageScroll();

/* --- Nav ------------------------------------------------------------------ */

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });
}

const runPendingNavigation = async (emphasized = true) => {
  if (pendingNavIndex == null) {
    return;
  }

  const index = pendingNavIndex;
  pendingNavIndex = null;
  await navigateToSection(index, emphasized);

  if (pendingNavIndex != null && introDone && !isTransitioning) {
    await runPendingNavigation(emphasized);
  }
};

const flushPendingNav = () => {
  if (pendingNavIndex == null || !introDone || isTransitioning) {
    return;
  }

  navRunChain = navRunChain.then(() => runPendingNavigation(true)).catch(() => {});
};

const requestNavigateToSection = (index, emphasized = true) => {
  pendingNavIndex = index;
  navRunChain = navRunChain.then(() => runPendingNavigation(emphasized)).catch(() => {});
};

const navigateToSection = async (index, emphasized = true) => {
  if (index < 0 || index >= sections.length) {
    return;
  }

  if (!introDone) {
    pendingNavIndex = index;
    return;
  }

  if (isTransitioning) {
    pendingNavIndex = index;
    return;
  }

  const section = sections[index];
  const targetTop = Math.min(getSectionScrollTop(section), getMaxScrollTop());
  const needsScroll = Math.abs(window.scrollY - targetTop) > 8;

  if (index === currentIndex) {
    if (!needsScroll) {
      updateNavActive();
      return;
    }

    await scrollToSectionTop(index, emphasized);
    updateNavActive();
    return;
  }

  await goToChapter(index, emphasized);
};

document.querySelectorAll("[data-goto-section]").forEach((el) => {
  el.addEventListener("click", (e) => {
    const target = el.getAttribute("data-goto-section");
    if (target == null) {
      return;
    }
    const index = Number(target);
    if (Number.isNaN(index)) {
      return;
    }
    e.preventDefault();

    if (siteNav?.classList.contains("is-open")) {
      siteNav.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }

    requestNavigateToSection(index, true);
  });
});

const pulseScrollDock = (direction) => {
  if (!scrollDockEl || prefersReducedMotion) {
    return;
  }

  scrollDockEl.classList.remove("is-pulse-up", "is-pulse-down");
  void scrollDockEl.offsetWidth;
  scrollDockEl.classList.add(direction === "up" ? "is-pulse-up" : "is-pulse-down");
  window.setTimeout(() => {
    scrollDockEl.classList.remove("is-pulse-up", "is-pulse-down");
  }, 560);
};

const updateNavActive = () => {
  if (!siteNav) {
    return;
  }

  siteNav.querySelectorAll("[data-goto-section]").forEach((el) => {
    const index = Number(el.getAttribute("data-goto-section"));
    const active = !Number.isNaN(index) && index === currentIndex;
    el.classList.toggle("is-active", active);
    el.setAttribute("aria-current", active ? "page" : "false");
  });
};

const updateChapterNav = () => {
  const atStart = currentIndex === 0;
  const atEnd = currentIndex >= lastChapterIndex();
  const navVisible = introDone && !document.body.classList.contains("is-intro-active");

  updateNavActive();

  if (scrollDockEl) {
    scrollDockEl.classList.toggle("is-visible", navVisible);
    scrollDockEl.classList.toggle("is-last", atEnd);
    scrollDockEl.setAttribute("aria-hidden", navVisible ? "false" : "true");
  }

  if (chapterPrevBtn) {
    const hidePrev = atStart || !navVisible;
    chapterPrevBtn.disabled = hidePrev;
    chapterPrevBtn.classList.toggle("is-hidden", hidePrev);
    chapterPrevBtn.tabIndex = hidePrev ? -1 : 0;
  }

  if (chapterNextBtn) {
    const hideNext = atEnd || !navVisible;
    chapterNextBtn.disabled = hideNext;
    chapterNextBtn.classList.toggle("is-hidden", hideNext);
    chapterNextBtn.tabIndex = hideNext ? -1 : 0;
  }

  if (scrollDockLabel) {
    scrollDockLabel.textContent = currentIndex === 0 ? "Scroll" : "Next";
  }
};

const updateScrollCueVisibility = () => {
  updateChapterNav();
};

chapterPrevBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex > 0) {
    requestNavigateToSection(currentIndex - 1, true);
  }
});

chapterNextBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (currentIndex < lastChapterIndex()) {
    requestNavigateToSection(currentIndex + 1, true);
  }
});

const isTypingTarget = (el) => {
  if (!el) {
    return false;
  }
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
};

document.addEventListener("keydown", (e) => {
  if (!introDone || isTransitioning || isTypingTarget(e.target)) {
    return;
  }

  if (e.key === "ArrowDown" || e.key === "PageDown") {
    if (currentIndex < lastChapterIndex()) {
      e.preventDefault();
      requestNavigateToSection(currentIndex + 1, true);
    }
    return;
  }

  if (e.key === "ArrowUp" || e.key === "PageUp") {
    if (currentIndex > 0) {
      e.preventDefault();
      requestNavigateToSection(currentIndex - 1, true);
    }
  }
});

/* --- Chapter state -------------------------------------------------------- */

const updateBodyTheme = () => {
  document.body.dataset.sectionTheme = SECTION_THEMES[currentIndex] || "hero";
};

const updateBodyClasses = () => {
  BODY_THEME_CLASSES.forEach((cls) => document.body.classList.remove(cls));
  document.body.classList.add(BODY_THEME_CLASSES[currentIndex] || "section-hero-active");
};

const updateProgress = () => {
  updateChapterNav();
};

const resetSectionMotion = (section) => {
  section.classList.remove("is-entering");
  section.querySelectorAll(".reveal-item.is-shown, .mask-title.is-shown").forEach((el) => {
    el.classList.remove("is-shown");
  });
};

const playSectionFlash = (section) => {
  const flash = section.querySelector(".section-flash");
  if (!flash) {
    return;
  }
  flash.classList.remove("is-run");
  void flash.offsetWidth;
  flash.classList.add("is-run");
};

const revealSection = (section, baseDelay = 0) => {
  const items = section.querySelectorAll(".mask-title, .reveal-item");

  window.setTimeout(() => playSectionFlash(section), baseDelay);

  items.forEach((el) => {
    const delay = baseDelay + Number(el.dataset.delay ?? 0);

    if (el.classList.contains("mask-title")) {
      const span = el.querySelector(":scope > span");
      if (span) {
        span.style.setProperty("--d", "0ms");
      }
    }

    window.setTimeout(() => {
      el.classList.add("is-shown");
    }, delay);
  });
};

const setActiveSection = (index, { animate = true } = {}) => {
  if (index < 0 || index >= sections.length) {
    return;
  }

  sections.forEach((section, i) => {
    const active = i === index;
    section.classList.toggle("is-active", active);
    section.classList.toggle("is-leaving", false);

    if (!active && i !== index) {
      section.classList.remove("is-entering");
    }
  });

  const target = sections[index];
  currentIndex = index;
  updateBodyTheme();
  updateBodyClasses();
  updateProgress();
  updateScrollCueVisibility();

  if (!animate || prefersReducedMotion) {
    revealSection(target, 0);
    return;
  }

  target.classList.add("is-entering");
  resetSectionMotion(target);
  revealSection(target, LEAVE_MS);
};

const goToChapter = async (index, emphasized = false) => {
  if (!introDone || isTransitioning || index < 0 || index >= sections.length) {
    return;
  }

  if (index === currentIndex) {
    return;
  }

  const from = sections[currentIndex];
  const to = sections[index];

  isTransitioning = true;
  window.clearTimeout(scrollSettleTimer);
  document.body.classList.add("is-chapter-changing");
  document.body.dispatchEvent(
    new CustomEvent("wk-chapter", { detail: { index, from: currentIndex, phase: "change" } })
  );
  if (emphasized) {
    document.body.classList.add("is-scroll-emphasized");
  }

  if (from) {
    from.classList.add("is-leaving");
    from.classList.remove("is-entering");
  }

  if (emphasized) {
    await new Promise((r) => window.setTimeout(r, LEAVE_MS));
  }

  if (index > currentIndex) {
    pulseScrollDock("down");
  } else if (index < currentIndex) {
    pulseScrollDock("up");
  }

  await scrollToSectionTop(index, emphasized);

  if (from) {
    from.classList.remove("is-leaving", "is-active");
    resetSectionMotion(from);
  }

  document.body.classList.remove("is-chapter-changing", "is-scroll-emphasized");
  setActiveSection(index, { animate: true });
  document.body.dispatchEvent(
    new CustomEvent("wk-chapter", { detail: { index, from: currentIndex, phase: "enter" } })
  );
  isTransitioning = false;
  window.requestAnimationFrame(flushPendingNav);
};

/* --- IntersectionObserver (scroll sync) ----------------------------------- */

const initSectionObserver = () => {
  sectionObserver?.disconnect();

  const headerH = getScrollPadTop();
  const topMargin = Math.min(22, Math.round((headerH / window.innerHeight) * 100));

  sectionObserver = new IntersectionObserver(
    (entries) => {
      if (!introDone || isTransitioning || isScrollSnapping || isProgrammaticScroll) {
        return;
      }

      const visible = entries
        .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.3)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) {
        return;
      }

      const index = sections.indexOf(visible[0].target);
      if (index >= 0 && index !== currentIndex) {
        setActiveSection(index, { animate: false });
      }
    },
    {
      threshold: [0.3, 0.45, 0.6],
      rootMargin: `-${topMargin}% 0px -18% 0px`,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
};

/* --- Loading -------------------------------------------------------------- */

const hideLoading = () => {
  loadingScreen?.classList.add("is-hidden");
  loadingScreen?.setAttribute("aria-hidden", "true");
};

const finishIntro = () => {
  if (introDone) {
    return;
  }

  introDone = true;
  document.body.classList.remove("is-intro-active");

  const done = () => {
    document.body.classList.add("is-loaded");
    hideLoading();
    initSectionObserver();
    setActiveSection(0, { animate: true });
    window.requestAnimationFrame(() => {
      alignScrollToSection(0, "auto");
      flushPendingNav();
    });
  };

  if (loadingScreen && !prefersReducedMotion) {
    loadingScreen.classList.add("is-exiting");
    window.setTimeout(done, INTRO_EXIT_MS);
    return;
  }

  hideLoading();
  done();
};

const initLoading = () => {
  if (!loadingScreen) {
    document.body.classList.remove("is-intro-active");
    document.body.classList.add("is-loaded");
    introDone = true;
    initSectionObserver();
    setActiveSection(0, { animate: false });
    alignScrollToSection(0, "auto");
    return;
  }

  if (prefersReducedMotion || skipIntro || hasSeenIntro) {
    document.body.classList.remove("is-intro-active");
    document.body.classList.add("is-loaded");
    hideLoading();
    introDone = true;
    initSectionObserver();
    setActiveSection(0, { animate: false });
    alignScrollToSection(0, "auto");
    if (!hasSeenIntro) {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    }
    return;
  }

  document.body.classList.add("is-intro-active");
  loadingScreen.classList.remove("is-hidden");
  loadingScreen.classList.add("is-sequence");
  loadingScreen.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    loadingScreen.classList.add("is-word-visible");
  });
  window.setTimeout(() => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    finishIntro();
  }, INTRO_HOLD_MS);
};

/* --- Boot ----------------------------------------------------------------- */

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoading);
} else {
  initLoading();
}
