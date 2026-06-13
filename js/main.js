/* Light Connections — interactions: nav, 3D tilt, parallax headline, reveal */
(function () {
  "use strict";

  // --- Sticky nav state ---
  const nav = document.querySelector(".nav");
  const onScroll = () => nav && nav.classList.toggle("scrolled", window.scrollY > 24);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // --- Mobile menu ---
  const toggle = document.querySelector(".menu-toggle");
  const links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
    links.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => links.classList.remove("open"))
    );
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Parallax 3D headline (follows pointer) ---
  const title = document.querySelector(".title-3d");
  const stage = document.querySelector(".hero-3d");
  if (title && stage && !reduce) {
    stage.addEventListener("pointermove", (e) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      title.style.transform = `rotateX(${-py * 12}deg) rotateY(${px * 16}deg)`;
    });
    stage.addEventListener("pointerleave", () => {
      title.style.transform = "rotateX(0) rotateY(0)";
    });
  }

  // --- 3D tilt cards ---
  if (!reduce) {
    document.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(800px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateY(-6px)`;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  // --- Scroll reveal ---
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en, i) => {
          if (en.isIntersecting) {
            const el = en.target;
            const delay = parseFloat(el.dataset.delay || "0");
            setTimeout(() => el.classList.add("in"), delay * 120);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("in"));
  }

  // --- Animated stat counters ---
  const counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dur = 1400;
        let start = null;
        const step = (t) => {
          if (!start) start = t;
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io2.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => io2.observe(el));
  }

  // --- Form fake submit ---
  document.querySelectorAll("form[data-demo]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector("button[type=submit]");
      if (btn) {
        const old = btn.innerHTML;
        btn.innerHTML = "Sent ✓";
        btn.disabled = true;
        setTimeout(() => { btn.innerHTML = old; btn.disabled = false; form.reset(); }, 2600);
      }
    });
  });
})();
