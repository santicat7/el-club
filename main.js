/* =====================================================================
   EL CLUB — main.js
   Vanilla JS · IIFE · GSAP + ScrollTrigger + Lenis
   Every init wrapped in safe(); content lives in HTML, JS only animates.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function lerp(a, b, n) { return (1 - n) * a + n * b; }

  var hasGSAP = typeof window.gsap !== "undefined";
  var hasST = hasGSAP && typeof window.ScrollTrigger !== "undefined";
  if (hasST) { window.gsap.registerPlugin(window.ScrollTrigger); }

  var lenis = null;

  /* =================================================================
     CUSTOM CURSOR
     ================================================================= */
  function initCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var cursor = $(".cursor");
    var ring = $(".cursor__ring");
    var dot = $(".cursor__dot");
    if (!cursor || !ring || !dot) return;

    document.body.classList.add("has-cursor");

    var mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var ringPos = { x: mouse.x, y: mouse.y };
    var active = false;

    window.addEventListener("mousemove", function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      dot.style.transform = "translate(" + mouse.x + "px," + mouse.y + "px) translate(-50%,-50%)";
      if (!active) {
        active = true;
        cursor.classList.add("is-active");
      }
    });

    function raf() {
      ringPos.x = lerp(ringPos.x, mouse.x, 0.16);
      ringPos.y = lerp(ringPos.y, mouse.y, 0.16);
      ring.style.transform = "translate(" + ringPos.x + "px," + ringPos.y + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    }
    raf();

    var hoverSel = "a, button, [data-magnetic], .card";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest(hoverSel)) cursor.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest(hoverSel)) cursor.classList.remove("is-hover");
    });
    window.addEventListener("mouseleave", function () { cursor.classList.remove("is-active"); });
    window.addEventListener("mouseenter", function () { cursor.classList.add("is-active"); });
  }

  /* =================================================================
     LENIS SMOOTH SCROLL
     ================================================================= */
  function initLenis() {
    if (typeof window.Lenis === "undefined") return;

    lenis = new window.Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6
    });
    window.__lenis = lenis;

    if (hasST) {
      lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
    }

    /* anchor links → smooth scroll with offset */
    $all('a[data-lenis][href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.2 });
      });
    });
  }

  /* =================================================================
     NAV — sticky background after 60px
     ================================================================= */
  function initNav() {
    var nav = $("#nav");
    if (!nav) return;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      nav.classList.toggle("is-stuck", y > 60);
    }
    onScroll();
    if (lenis) lenis.on("scroll", onScroll);
    else window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* =================================================================
     SCROLL PROGRESS BAR
     ================================================================= */
  function initProgress() {
    var bar = $(".scroll-progress__bar");
    if (!bar) return;
    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (window.scrollY || h.scrollTop) / max : 0;
      bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    }
    update();
    if (lenis) lenis.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* =================================================================
     REVEAL — IntersectionObserver (threshold 0.04)
     ================================================================= */
  function initReveals() {
    var els = $all("[data-reveal], [data-reveal-clip]");
    if (!els.length) return;

    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: "0px 0px -5% 0px" });

    els.forEach(function (el) { io.observe(el); });
  }

  /* =================================================================
     HERO ENTRANCE — curtain lines + fade
     ================================================================= */
  function initHeroEntrance() {
    var lines = $all(".hero__title .line");
    var fades = $all("[data-hero-fade]");

    if (!hasGSAP) {
      lines.forEach(function (l) { l.style.transform = "none"; });
      fades.forEach(function (f) { f.style.opacity = 1; f.style.transform = "none"; });
      return;
    }

    var tl = window.gsap.timeline({ delay: 0.15, defaults: { ease: "expo.out" } });

    tl.fromTo(lines,
      { yPercent: 115 },
      { yPercent: 0, duration: 1.1, stagger: 0.1 }
    );
    tl.fromTo(fades,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.12 },
      "-=0.6"
    );
  }

  /* =================================================================
     HERO PARALLAX
     ================================================================= */
  function initHeroParallax() {
    if (!hasST) return;
    var media = $(".hero__media");
    var content = $(".hero__content");

    if (media) {
      window.gsap.to(media, {
        yPercent: 16,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
    if (content) {
      window.gsap.to(content, {
        yPercent: -14, opacity: 0, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
      });
    }
  }

  /* =================================================================
     SPLIT TEXT — word-by-word reveal on scroll
     ================================================================= */
  function splitWords(el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    var words = text.split(" ");
    el.innerHTML = words.map(function (w) {
      return '<span class="word"><span>' + w + "</span></span>";
    }).join(" ");
    return $all(".word > span", el);
  }

  function initSplit() {
    var nodes = $all(".split, .split-big");
    if (!nodes.length) return;

    nodes.forEach(function (el) {
      var inner = splitWords(el);
      if (!hasST) { inner.forEach(function (s) { s.style.transform = "none"; }); return; }

      var big = el.classList.contains("split-big");
      window.gsap.from(inner, {
        yPercent: 115,
        opacity: 0,
        duration: big ? 1 : 0.9,
        ease: "expo.out",
        stagger: big ? 0.06 : 0.05,
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });
  }

  /* =================================================================
     MARQUEE — infinite loop (~55px/s)
     ================================================================= */
  function initMarquee() {
    var speed = 55; // px per second
    $all(".marquee__track").forEach(function (track) {
      var group = $(".marquee__group", track);
      if (!group) return;

      var groupWidth = group.offsetWidth;
      if (!groupWidth) return;

      var need = Math.ceil((window.innerWidth * 2) / groupWidth) + 1;
      for (var i = 0; i < need; i++) {
        track.appendChild(group.cloneNode(true));
      }

      if (!hasGSAP) return;
      var reverse = !!track.closest("[data-marquee-reverse]");
      var dur = groupWidth / speed;

      if (reverse) {
        window.gsap.set(track, { x: -groupWidth });
        window.gsap.to(track, { x: 0, duration: dur, ease: "none", repeat: -1 });
      } else {
        window.gsap.to(track, { x: -groupWidth, duration: dur, ease: "none", repeat: -1 });
      }
    });
  }

  /* =================================================================
     STATS COUNT-UP
     ================================================================= */
  function initCountUp() {
    var nums = $all("[data-count]");
    if (!nums.length) return;

    nums.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";

      function run() {
        if (!hasGSAP) { el.textContent = target + suffix; return; }
        var obj = { val: 0 };
        window.gsap.to(obj, {
          val: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(obj.val) + suffix; },
          onComplete: function () { el.textContent = target + suffix; }
        });
      }

      if (hasST) {
        window.ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: run });
      } else if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { run(); io.unobserve(en.target); }
          });
        }, { threshold: 0.4 });
        io.observe(el);
      } else {
        run();
      }
    });
  }

  /* =================================================================
     MAGNETIC BUTTONS
     ================================================================= */
  function initMagnetic() {
    if (!hasGSAP) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    $all("[data-magnetic]").forEach(function (btn) {
      var max = 0.22;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var mx = e.clientX - (r.left + r.width / 2);
        var my = e.clientY - (r.top + r.height / 2);
        window.gsap.to(btn, { x: mx * max, y: my * max, duration: 0.5, ease: "power3.out" });
      });
      btn.addEventListener("mouseleave", function () {
        window.gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.45)" });
      });
    });
  }

  /* =================================================================
     SAFETY NET — force-reveal anything still hidden after 6s
     ================================================================= */
  function initSafetyNet() {
    setTimeout(function () {
      $all("[data-reveal]:not(.is-revealed), [data-reveal-clip]:not(.is-revealed)")
        .forEach(function (el) { el.classList.add("is-revealed"); });
      $all("[data-hero-fade]").forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
          el.style.opacity = 1; el.style.transform = "none";
        }
      });
      $all(".hero__title .line").forEach(function (el) {
        var t = getComputedStyle(el).transform;
        if (t && t !== "none" && t.indexOf("matrix") === 0) {
          // leave if already at rest; otherwise reset
        }
      });
      $all(".split .word > span, .split-big .word > span").forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.9) {
          el.style.opacity = 1; el.style.transform = "none";
        }
      });
    }, 6000);
  }

  /* =================================================================
     BOOT
     ================================================================= */
  document.addEventListener("DOMContentLoaded", function () {
    safe(initCursor, "cursor");
    safe(initLenis, "lenis");
    safe(initNav, "nav");
    safe(initProgress, "progress");
    safe(initReveals, "reveals");
    safe(initHeroEntrance, "heroEntrance");
    safe(initSplit, "split");
    safe(initCountUp, "countup");
    safe(initMarquee, "marquee");
    safe(initMagnetic, "magnetic");
    safe(initHeroParallax, "heroParallax");
    safe(initSafetyNet, "safetyNet");
  });

  window.addEventListener("load", function () {
    if (hasST) { try { window.ScrollTrigger.refresh(); } catch (e) {} }
  });

})();
