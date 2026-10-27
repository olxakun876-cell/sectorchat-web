/**
 * SectorChat — landing page
 * Skrip tanpa dependensi: menu mobile, animasi reveal, tahun footer,
 * dan pengecekan ketersediaan APK.
 */
(function () {
  "use strict";

  /**
   * Konfigurasi unduhan.
   * Letakkan APK di `website/download/sectorchat-1.0.0.apk`, atau ganti
   * `apkUrl` ke URL lain (mis. GitHub Releases / Cloudflare R2).
   * Jika berkas tidak ditemukan, tombol otomatis berubah menjadi "Segera Hadir".
   */
  var CONFIG = {
    apkUrl: "/download/sectorchat-1.0.0.apk",
    readyNote: "Android 7.0+ · APK ditandatangani · ±19 MB",
    soonNote: "APK sedang disiapkan — pantau terus halaman ini.",
    soonMessage: "APK belum tersedia. Kami akan mengumumkannya segera."
  };

  /* ------------------------------------------------------------ utilitas --- */

  function showToast(message) {
    var toast = document.querySelector("[data-toast]");
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("is-visible");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 3600);
  }

  /* ------------------------------------------------------------ tahun --- */

  function setYear() {
    var target = document.querySelector("[data-year]");
    if (target) {
      target.textContent = String(new Date().getFullYear());
    }
  }

  /* -------------------------------------------------------- menu mobile --- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("primary-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
      nav.classList.toggle("is-open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) setOpen(false);
    });
  }

  /* ------------------------------------------------------ animasi reveal --- */

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || typeof IntersectionObserver === "undefined") {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    items.forEach(function (item, index) {
      item.style.transitionDelay = Math.min(index * 70, 280) + "ms";
      observer.observe(item);
    });
  }

  /* -------------------------------------------------- ketersediaan APK --- */

  function setSoonState() {
    document.querySelectorAll("[data-download]").forEach(function (button) {
      button.setAttribute("data-soon", "true");
    });

    document.querySelectorAll("[data-download-label]").forEach(function (label) {
      label.textContent = "Segera Hadir";
    });

    var note = document.querySelector("[data-download-note]");
    if (note) note.textContent = CONFIG.soonNote;
  }

  function isApkAvailable() {
    if (!CONFIG.apkUrl) return Promise.resolve(false);

    return fetch(CONFIG.apkUrl, { method: "HEAD", cache: "no-store" })
      .then(function (response) {
        var type = response.headers.get("content-type") || "";
        // Halaman 404 kustom tetap mengembalikan 200, jadi cek content-type juga.
        return response.ok && type.indexOf("text/html") === -1;
      })
      .catch(function () {
        return false;
      });
  }

  function initDownload() {
    var buttons = document.querySelectorAll("[data-download]");
    if (!buttons.length) return;

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        if (button.getAttribute("data-soon") === "true") {
          event.preventDefault();
          showToast(CONFIG.soonMessage);
        }
      });
    });

    isApkAvailable().then(function (available) {
      if (!available) {
        setSoonState();
      } else {
        var note = document.querySelector("[data-download-note]");
        if (note) note.textContent = CONFIG.readyNote;
      }
    });
  }

  /* ------------------------------------------------------------- start --- */

  function init() {
    setYear();
    initNav();
    initReveal();
    initDownload();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
