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
