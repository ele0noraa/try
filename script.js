(function () {
  "use strict";

  const STORAGE_KEY = "portfolio-theme";
  const header = document.querySelector(".site-header");
  const navToggle = document.getElementById("nav-toggle");
  const siteNav = document.getElementById("site-nav");
  const themeToggle = document.getElementById("theme-toggle");
  const yearEl = document.getElementById("year");

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function setStoredTheme(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function getPreferredTheme() {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
    return "dark";
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "light" ? "切換為深色主題" : "切換為淺色主題"
      );
    }
  }

  function initTheme() {
    const stored = getStoredTheme();
    const theme = stored === "light" || stored === "dark" ? stored : getPreferredTheme();
    applyTheme(theme);
  }

  function toggleTheme() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    const next = isLight ? "dark" : "light";
    applyTheme(next);
    setStoredTheme(next);
  }

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "開啟選單");
  }

  function openNav() {
    if (!header || !navToggle) return;
    header.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "關閉選單");
  }

  function toggleNav() {
    if (!header || !navToggle) return;
    if (header.classList.contains("is-open")) {
      closeNav();
    } else {
      openNav();
    }
  }

  function initNavToggle() {
    if (!navToggle || !header) return;
    navToggle.addEventListener("click", toggleNav);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) {
        closeNav();
      }
    });
  }

  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]:not(.skip-link)');
    links.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        closeNav();
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      });
    });
  }

  function initReveal() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    const elements = document.querySelectorAll(".reveal");
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initYear() {
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  }

  function initRandomDog() {
    const API_URL = "https://dog.ceo/api/breeds/image/random";
    const btn = document.getElementById("dog-btn");
    const display = document.getElementById("dog-display");
    const placeholder = document.getElementById("dog-placeholder");
    const loading = document.getElementById("dog-loading");
    const image = document.getElementById("dog-image");
    const errorEl = document.getElementById("dog-error");

    if (!btn || !display || !loading || !image) return;

    function setHidden(el, hidden) {
      if (!el) return;
      el.classList.toggle("is-hidden", hidden);
    }

    function showLoading() {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      display.setAttribute("aria-busy", "true");
      display.classList.add("is-loading");
      setHidden(loading, false);
      setHidden(errorEl, true);
    }

    function hideLoading() {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      display.setAttribute("aria-busy", "false");
      display.classList.remove("is-loading");
      setHidden(loading, true);
    }

    function showError(message) {
      hideLoading();
      setHidden(placeholder, true);
      setHidden(image, true);
      if (errorEl) {
        errorEl.textContent = message;
        setHidden(errorEl, false);
      }
    }

    async function fetchRandomDog() {
      showLoading();

      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error("無法取得狗狗圖片，請稍後再試。");
        }

        const data = await response.json();
        if (data.status !== "success" || !data.message) {
          throw new Error("API 回傳格式異常，請稍後再試。");
        }

        await new Promise(function (resolve, reject) {
          const preload = new Image();
          preload.onload = resolve;
          preload.onerror = function () {
            reject(new Error("圖片載入失敗，請再試一次。"));
          };
          preload.src = data.message;
        });

        image.src = data.message;
        image.alt = "隨機狗狗照片";
        setHidden(placeholder, true);
        setHidden(errorEl, true);
        setHidden(image, false);
        hideLoading();
      } catch (err) {
        showError(
          err instanceof Error ? err.message : "發生未知錯誤，請稍後再試。"
        );
      }
    }

    btn.addEventListener("click", fetchRandomDog);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }
    initNavToggle();
    initSmoothScroll();
    initReveal();
    initYear();
    initRandomDog();
  });
})();
