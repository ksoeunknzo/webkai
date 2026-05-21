const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const siteHeader = document.querySelector(".site-header");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const INTRO_STORAGE_KEY = "webkai-intro-seen-v1";
const INTRO_HOLD_MS = 900;
const INTRO_MAX_MS = 1200;
const introElement = document.querySelector("[data-intro]");
const cursorGlow = document.querySelector(".cursor-glow");
const serviceItems = document.querySelectorAll(".service-item");
const heroWireframeMount = document.getElementById("hero-wireframe");

let wireframeController = null;
let introFinished = false;
let introFinishCallbacks = [];
let introFinishTimer = 0;
let introFailsafeTimer = 0;

const runIntroCallbacks = () => {
  const callbacks = introFinishCallbacks;
  introFinishCallbacks = [];

  callbacks.forEach((callback) => {
    try {
      callback();
    } catch (error) {
      console.error(error);
    }
  });
};

const hideIntroElement = () => {
  if (!introElement) {
    return;
  }

  introElement.classList.add("is-done", "is-dismissed");
  introElement.hidden = true;
  introElement.setAttribute("aria-hidden", "true");
  introElement.style.display = "none";
};

const finishIntro = () => {
  if (introFinished) {
    return;
  }

  introFinished = true;
  window.clearTimeout(introFinishTimer);
  window.clearTimeout(introFailsafeTimer);
  document.body.classList.remove("is-intro-active");
  hideIntroElement();
  runIntroCallbacks();
  window.dispatchEvent(new CustomEvent("intro:finished"));
};

const runAfterIntro = (callback) => {
  if (introFinished) {
    try {
      callback();
    } catch (error) {
      console.error(error);
    }
    return;
  }

  introFinishCallbacks.push(callback);
};

const hasSeenIntro = () => {
  try {
    return Boolean(localStorage.getItem(INTRO_STORAGE_KEY));
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, "1");
  } catch {
    // localStorage may be unavailable in private mode or restricted contexts.
  }
};

const initPageIntro = () => {
  try {
    if (!introElement || prefersReducedMotion || hasSeenIntro()) {
      finishIntro();
      return;
    }

    introElement.hidden = false;
    introElement.removeAttribute("hidden");
    introElement.style.display = "grid";
    introElement.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-intro-active");
    markIntroSeen();

    introFinishTimer = window.setTimeout(finishIntro, INTRO_HOLD_MS);
    introFailsafeTimer = window.setTimeout(finishIntro, INTRO_MAX_MS);
  } catch (error) {
    console.error(error);
    finishIntro();
  }
};

const initCursorGlow = () => {
  if (!cursorGlow || prefersReducedMotion || !finePointer) {
    return;
  }

  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let currentX = targetX;
  let currentY = targetY;
  let frameId = 0;

  const renderGlow = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    cursorGlow.style.setProperty("--glow-x", `${currentX}px`);
    cursorGlow.style.setProperty("--glow-y", `${currentY}px`);
    frameId = window.requestAnimationFrame(renderGlow);
  };

  const queueGlow = () => {
    if (!frameId) {
      frameId = window.requestAnimationFrame(renderGlow);
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      queueGlow();
    },
    { passive: true },
  );

  queueGlow();
};

const initServiceParallax = () => {
  if (prefersReducedMotion || serviceItems.length === 0) {
    return;
  }

  let ticking = false;

  const updateParallax = () => {
    serviceItems.forEach((item) => {
      const watermark = item.querySelector(".service-watermark");

      if (!watermark) {
        return;
      }

      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height * 0.5;
      const offset = (window.innerHeight * 0.5 - center) * 0.05;
      watermark.style.setProperty("--parallax-x", `${offset.toFixed(2)}px`);
    });

    ticking = false;
  };

  const queueParallax = () => {
    if (ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateParallax);
  };

  updateParallax();
  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", queueParallax, { passive: true });
};

const initHeroVisual = async () => {
  if (!heroWireframeMount || prefersReducedMotion) {
    return;
  }

  const shouldRender = window.matchMedia("(min-width: 721px)").matches;

  if (!shouldRender) {
    heroWireframeMount.hidden = true;
    return;
  }

  try {
    const { initHeroWireframe } = await import("./hero-wireframe.js");
    heroWireframeMount.hidden = false;
    wireframeController = initHeroWireframe(heroWireframeMount, { reduceMotion: prefersReducedMotion });

    window.matchMedia("(min-width: 721px)").addEventListener("change", (event) => {
      if (event.matches) {
        if (!wireframeController) {
          heroWireframeMount.hidden = false;
          wireframeController = initHeroWireframe(heroWireframeMount, { reduceMotion: prefersReducedMotion });
        }
        return;
      }

      wireframeController?.destroy();
      wireframeController = null;
      heroWireframeMount.hidden = true;
    });
  } catch (error) {
    console.error(error);
    heroWireframeMount.hidden = true;
  }
};

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if (siteHeader && !prefersReducedMotion) {
  let headerTicking = false;

  const updateHeaderState = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    headerTicking = false;
  };

  updateHeaderState();
  window.addEventListener(
    "scroll",
    () => {
      if (headerTicking) {
        return;
      }

      headerTicking = true;
      window.requestAnimationFrame(updateHeaderState);
    },
    { passive: true },
  );
}

const revealHero = () => {
  const heroItems = document.querySelectorAll(".hero .reveal");

  heroItems.forEach((item, index) => {
    if (prefersReducedMotion) {
      item.classList.add("is-visible");
      return;
    }

    item.style.setProperty("--reveal-delay", `${index * 130}ms`);
    requestAnimationFrame(() => {
      item.classList.add("is-visible");
    });
  });
};

runAfterIntro(revealHero);

const scrollRevealItems = [...revealItems].filter((item) => !item.closest(".hero"));

if (scrollRevealItems.length > 0 && "IntersectionObserver" in window) {
  scrollRevealItems.forEach((item, index) => {
    if (!prefersReducedMotion) {
      if (item.classList.contains("service-item")) {
        const items = [...item.parentElement.querySelectorAll(".service-item")];
        const serviceIndex = items.indexOf(item);
        item.style.setProperty("--reveal-delay", `${serviceIndex * 100}ms`);
        return;
      }

      item.style.setProperty("--reveal-delay", `${(index % 4) * 100}ms`);
    }
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -5% 0px",
      threshold: 0.1,
    },
  );

  scrollRevealItems.forEach((item) => observer.observe(item));
} else {
  scrollRevealItems.forEach((item) => item.classList.add("is-visible"));
}

const skyBackdrop = document.querySelector(".sky-backdrop");
const sectionHeadings = document.querySelectorAll("#service .section-heading, #contact .section-heading");

if (sectionHeadings.length > 0) {
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const lineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const title = entry.target.querySelector(".section-title");
          if (title) {
            title.classList.add("is-line-visible");
          }

          lineObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -5% 0px",
        threshold: 0.2,
      },
    );

    sectionHeadings.forEach((heading) => lineObserver.observe(heading));
  } else {
    sectionHeadings.forEach((heading) => {
      heading.querySelector(".section-title")?.classList.add("is-line-visible");
    });
  }
}

if (skyBackdrop && !prefersReducedMotion && finePointer) {
  const maxShift = 1.2;
  let targetShiftX = 0;
  let targetShiftY = 0;
  let currentShiftX = 0;
  let currentShiftY = 0;
  let parallaxFrame = 0;

  const updateSkyShift = () => {
    currentShiftX += (targetShiftX - currentShiftX) * 0.038;
    currentShiftY += (targetShiftY - currentShiftY) * 0.038;
    skyBackdrop.style.setProperty("--sky-shift-x", currentShiftX.toFixed(3));
    skyBackdrop.style.setProperty("--sky-shift-y", currentShiftY.toFixed(3));

    if (
      Math.abs(targetShiftX - currentShiftX) > 0.001 ||
      Math.abs(targetShiftY - currentShiftY) > 0.001
    ) {
      parallaxFrame = window.requestAnimationFrame(updateSkyShift);
    } else {
      parallaxFrame = 0;
    }
  };

  const queueSkyShift = () => {
    if (!parallaxFrame) {
      parallaxFrame = window.requestAnimationFrame(updateSkyShift);
    }
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      const centerX = window.innerWidth * 0.5;
      const centerY = window.innerHeight * 0.5;
      const normalizedX = (event.clientX - centerX) / centerX;
      const normalizedY = (event.clientY - centerY) / centerY;
      targetShiftX = normalizedX * maxShift;
      targetShiftY = normalizedY * maxShift * 0.75;
      queueSkyShift();
    },
    { passive: true },
  );

  window.addEventListener(
    "pointerleave",
    () => {
      targetShiftX = 0;
      targetShiftY = 0;
      queueSkyShift();
    },
    { passive: true },
  );
}

const emphasizeSectionLine = (sectionId) => {
  if (prefersReducedMotion) {
    return;
  }

  const section = document.getElementById(sectionId);
  const title = section?.querySelector(".section-title");

  if (!title) {
    return;
  }

  if (!title.classList.contains("is-line-visible")) {
    title.classList.add("is-line-visible");
  }

  title.classList.remove("is-line-emphasized");
  requestAnimationFrame(() => {
    title.classList.add("is-line-emphasized");
  });

  window.setTimeout(() => {
    title.classList.remove("is-line-emphasized");
  }, 900);
};

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", () => {
    const hash = link.getAttribute("href");

    if (!hash || hash === "#") {
      return;
    }

    const sectionId = decodeURIComponent(hash.slice(1));

    if (sectionId !== "service" && sectionId !== "contact") {
      return;
    }

    window.setTimeout(() => emphasizeSectionLine(sectionId), 420);
  });
});

if (window.location.hash) {
  const initialSectionId = decodeURIComponent(window.location.hash.slice(1));

  if (initialSectionId === "service" || initialSectionId === "contact") {
    window.setTimeout(() => emphasizeSectionLine(initialSectionId), 500);
  }
}

initPageIntro();
window.setTimeout(finishIntro, INTRO_MAX_MS + 100);
initCursorGlow();
initServiceParallax();
runAfterIntro(initHeroVisual);

window.addEventListener("pageshow", () => {
  if (!introFinished) {
    finishIntro();
  }
});

window.addEventListener("error", () => {
  if (!introFinished) {
    finishIntro();
  }
});

window.addEventListener("unhandledrejection", () => {
  if (!introFinished) {
    finishIntro();
  }
});
