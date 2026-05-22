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

const INTRO_HOLD_MS = 3000;
const INTRO_HOLD_REDUCED_MS = 1000;
const INTRO_EXIT_MS = 800;
const SCROLL_TOLERANCE = 12;
const CHAPTER_MS = 1100;
const LEAVE_MS = 280;
const SCROLL_IDLE_MS = 280;
const SCROLL_SNAP_MS = 420;
const SCROLL_SNAP_THRESHOLD = 100;

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
let scrollIdleTimer = 0;
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
  const padTop = getScrollPadTop();
  const viewH = window.innerHeight;
  const root = getComputedStyle(document.documentElement);
  const dockReserve = parseInt(root.getPropertyValue("--scroll-dock-reserve"), 10);
  const bottomClear = Math.max(56, (Number.isNaN(dockReserve) ? 160 : dockReserve) * 0.42);

  const stack =
    section.querySelector(".contact-stack--flow") ||
    section.querySelector(".section-inner--contact");
  const anchor = stack || section;
  const anchorRect = anchor.getBoundingClientRect();

  return {
    contentTop: window.scrollY + anchorRect.top,
    contentH: Math.max(anchor.offsetHeight, anchorRect.height),
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
    const { contentTop } = getContactPanelMetrics(section);
    const topGap = 14;
    return Math.min(Math.max(0, contentTop - padTop - topGap), maxScroll);
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

  window.clearTimeout(scrollIdleTimer);
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

const syncSectionFromScroll = () => {
  if (!introDone || isTransitioning || isScrollSnapping || isProgrammaticScroll) {
    return;
  }

  const index = findNearestSectionIndex();
  if (index !== currentIndex) {
    setActiveSection(index, { animate: false, quiet: true });
  }
};

const settleToNearestSection = () => {
  if (!introDone || isTransitioning || isScrollSnapping || isProgrammaticScroll) {
    return;
  }

  syncSectionFromScroll();

  if (!SNAP_MEDIA.matches || prefersReducedMotion) {
    return;
  }

  const index = findNearestSectionIndex();
  const section = sections[index];

  if (!shouldSkipContactSnap(section)) {
    const targetTop = Math.min(getSectionScrollTop(section), getMaxScrollTop());
    if (Math.abs(window.scrollY - targetTop) <= SCROLL_SNAP_THRESHOLD) {
      alignScrollToSection(index, "auto");
    }
  }
};

const onManualScrollEnd = () => {
  window.clearTimeout(scrollIdleTimer);
  settleToNearestSection();
};

const scheduleManualScrollEnd = () => {
  window.clearTimeout(scrollIdleTimer);
  scrollIdleTimer = window.setTimeout(onManualScrollEnd, SCROLL_IDLE_MS);
};

/* --- Header scroll -------------------------------------------------------- */

const onPageScroll = () => {
  document.body.classList.toggle("is-scrolled", window.scrollY > 20);
};

window.addEventListener(
  "scroll",
  () => {
    onPageScroll();
    if (!isProgrammaticScroll && !isScrollSnapping) {
      scheduleManualScrollEnd();
    }
  },
  { passive: true }
);

if ("onscrollend" in window) {
  window.addEventListener("scrollend", onManualScrollEnd, { passive: true });
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

const setActiveSection = (index, { animate = true, quiet = false } = {}) => {
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

  if (quiet) {
    return;
  }

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
  window.clearTimeout(scrollIdleTimer);
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
  sectionObserver = null;
};

/* --- Loading -------------------------------------------------------------- */

const hideLoading = () => {
  loadingScreen?.classList.add("is-hidden");
  loadingScreen?.setAttribute("aria-hidden", "true");
};

let introFinishTimer = 0;

const finishIntro = () => {
  if (introDone) {
    return;
  }

  window.clearTimeout(introFinishTimer);
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

const waitForIntroAssets = () =>
  new Promise((resolve) => {
    const logo = loadingScreen?.querySelector(".loading-screen__logo");
    if (!logo) {
      resolve();
      return;
    }
    if (logo.complete && logo.naturalWidth > 0) {
      resolve();
      return;
    }
    const fallback = window.setTimeout(resolve, 600);
    const done = () => {
      window.clearTimeout(fallback);
      resolve();
    };
    logo.addEventListener("load", done, { once: true });
    logo.addEventListener("error", done, { once: true });
  });

const startIntro = () => {
  introDone = false;
  document.body.classList.remove("is-loaded");
  document.body.classList.add("is-intro-active");
  loadingScreen.classList.remove("is-hidden", "is-exiting");
  loadingScreen.classList.add("is-sequence");
  loadingScreen.setAttribute("aria-hidden", "false");

  window.dispatchEvent(new CustomEvent("wk-intro-start"));

  window.requestAnimationFrame(() => {
    loadingScreen.classList.add("is-word-visible");
  });

  const holdMs = prefersReducedMotion ? INTRO_HOLD_REDUCED_MS : INTRO_HOLD_MS;
  window.clearTimeout(introFinishTimer);
  introFinishTimer = window.setTimeout(finishIntro, holdMs);
};

const initLoading = async () => {
  if (!loadingScreen) {
    document.body.classList.remove("is-intro-active");
    document.body.classList.add("is-loaded");
    introDone = true;
    initSectionObserver();
    setActiveSection(0, { animate: false });
    alignScrollToSection(0, "auto");
    return;
  }

  if (skipIntro) {
    document.body.classList.remove("is-intro-active");
    document.body.classList.add("is-loaded");
    hideLoading();
    introDone = true;
    initSectionObserver();
    setActiveSection(0, { animate: false });
    alignScrollToSection(0, "auto");
    return;
  }

  try {
    sessionStorage.removeItem("wk-intro-seen");
  } catch {
    /* ignore */
  }

  await waitForIntroAssets();
  startIntro();
};

/* --- Contact form → FormSubmit (delivers to inbox, no mail app) ---------- */

const CONTACT_FORM_ENDPOINT = "https://formsubmit.co/ajax/koki.kai@autodevjapan.com";

const initContactForm = () => {
  const form = document.querySelector(".contact-form");
  if (!form) {
    return;
  }

  const statusEl = form.querySelector(".contact-form__status");
  const submitBtn = form.querySelector(".contact-form__submit");

  const typeLabels = {
    production: "制作依頼",
    consultation: "相談・制作依頼以外の相談",
    press: "取材依頼",
    other: "その他",
  };

  const setStatus = (message, kind) => {
    if (!statusEl) {
      return;
    }

    statusEl.hidden = !message;
    statusEl.textContent = message;
    statusEl.classList.remove("is-success", "is-error");
    if (kind) {
      statusEl.classList.add(kind === "ok" ? "is-success" : "is-error");
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) {
      return;
    }

    const data = new FormData(form);
    if (String(data.get("_gotcha") || "").trim()) {
      return;
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const company = String(data.get("company") || "").trim();
    const typeKey = String(data.get("inquiry_type") || "");
    const message = String(data.get("message") || "").trim();
    const typeLabel = typeLabels[typeKey] || typeKey;

    const body = new FormData();
    body.append("name", name);
    body.append("email", email);
    body.append("company", company || "（未入力）");
    body.append("inquiry_type", typeLabel);
    body.append("message", message);
    body.append("_subject", "【Web Kai】お問い合わせ");
    body.append("_replyto", email);
    body.append("_template", "table");
    body.append("_captcha", "false");

    if (submitBtn) {
      submitBtn.disabled = true;
    }
    setStatus("送信中です…", null);

    try {
      const res = await fetch(CONTACT_FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });

      const result = await res.json().catch(() => ({}));
      const successFlag = String(result.success ?? "").toLowerCase();
      const isOk = res.ok && successFlag === "true";

      if (!isOk) {
        const apiMsg = String(result.message || "");
        if (/activation/i.test(apiMsg)) {
          throw new Error(
            "フォームの有効化が未完了です。koki.kai@autodevjapan.com に届いた FormSubmit の最新メールから「Activate Form」をクリックしてください。"
          );
        }
        throw new Error(apiMsg || "送信に失敗しました");
      }

      form.reset();
      setStatus(
        "送信しました。内容を確認のうえ、ご連絡いたします。",
        "ok"
      );
    } catch (err) {
      const detail =
        err instanceof Error && err.message
          ? err.message
          : "送信できませんでした。しばらくして再度お試しください。";
      setStatus(
        `${detail} お急ぎの場合は koki.kai@autodevjapan.com まで直接メールしてください。`,
        "err"
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });
};

/* --- Boot ----------------------------------------------------------------- */

const boot = () => {
  initLoading();
  initContactForm();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
