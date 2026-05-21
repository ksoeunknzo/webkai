const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const siteHeader = document.querySelector(".site-header");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

revealHero();

const scrollRevealItems = [...revealItems].filter((item) => !item.closest(".hero"));

if (scrollRevealItems.length > 0 && "IntersectionObserver" in window) {
  scrollRevealItems.forEach((item, index) => {
    if (!prefersReducedMotion) {
      if (item.classList.contains("service-item")) {
        const serviceItems = [...item.parentElement.querySelectorAll(".service-item")];
        const serviceIndex = serviceItems.indexOf(item);
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

if (skyBackdrop && !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches) {
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
  link.addEventListener("click", (event) => {
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
