/* Landing page interactions: nav state, scroll reveals, hero gauge, FAQ accordion.
   All motion is transform/opacity; reduced-motion users get instant final states. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav shadow ---------- */
  var nav = document.querySelector(".nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- scroll reveals (staggered) ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  revealEls.forEach(function (el, i) {
    // stagger siblings inside the same parent: 0/70/140ms cycle
    var siblings = Array.prototype.filter.call(
      el.parentElement.children,
      function (c) { return c.classList && c.classList.contains("reveal"); }
    );
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", Math.min(idx, 3) * 70 + "ms");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hero gauge: count 0 -> 100, draw the ring ---------- */
  var scoreEl = document.getElementById("hero-score");
  var fillEl = document.getElementById("hero-gauge-fill");
  var CIRC = 326.73; // 2 * PI * 52

  function setGauge(v) {
    scoreEl.textContent = Math.round(v);
    fillEl.style.strokeDashoffset = String(CIRC * (1 - v / 100));
  }

  function runGauge() {
    if (reduceMotion) { setGauge(100); return; }
    var dur = 1400, t0 = null;
    function frame(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setGauge(eased * 100);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var heroVisual = document.querySelector(".hero-visual");
  if ("IntersectionObserver" in window && !reduceMotion) {
    setGauge(0); // reset from the no-JS default, then animate on entry
    var gio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runGauge(); gio.disconnect(); }
      });
    }, { threshold: 0.4 });
    gio.observe(heroVisual);
  } else {
    runGauge();
  }

  /* ---------- FAQ accordion (single-open) ---------- */
  var items = document.querySelectorAll(".faq-item");
  items.forEach(function (item) {
    var btn = item.querySelector(".faq-q");
    btn.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      items.forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
})();
