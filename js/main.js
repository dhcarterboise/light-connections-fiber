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

  // --- Gallery + lightbox ---
  const grid = document.getElementById("masonry");
  if (grid) {
    const toolbar = document.getElementById("filters");
    let items = [];
    let view = [];
    let current = 0;

    // Lightbox DOM
    const lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<div class="lb-counter"></div>' +
      '<button class="lb-btn lb-close" aria-label="Close">✕</button>' +
      '<button class="lb-btn lb-prev" aria-label="Previous">‹</button>' +
      '<img alt="">' +
      '<button class="lb-btn lb-next" aria-label="Next">›</button>' +
      '<div class="lb-caption"><div class="t"></div><div class="c"></div></div>';
    document.body.appendChild(lb);
    const lbImg = lb.querySelector("img");
    const lbT = lb.querySelector(".lb-caption .t");
    const lbC = lb.querySelector(".lb-caption .c");
    const lbCount = lb.querySelector(".lb-counter");

    const show = (i) => {
      current = (i + view.length) % view.length;
      const it = view[current];
      lbImg.src = it.src;
      lbImg.alt = it.caption;
      lbT.textContent = it.cat;
      lbC.textContent = it.caption;
      lbCount.textContent = (current + 1) + " / " + view.length;
    };
    const open = (i) => { show(i); lb.classList.add("open"); document.body.style.overflow = "hidden"; };
    const close = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };

    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
    lb.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1);
    });

    const render = (cat) => {
      view = cat === "All" ? items : items.filter((x) => x.cat === cat);
      grid.innerHTML = "";
      view.forEach((it, i) => {
        const a = document.createElement("div");
        a.className = "tile reveal in";
        a.innerHTML =
          '<img loading="lazy" src="' + it.thumb + '" alt="' + it.caption + '">' +
          '<div class="expand"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg></div>' +
          '<div class="meta"><div class="t">' + it.cat + '</div><div class="c">' + it.caption + '</div></div>';
        a.addEventListener("click", () => open(i));
        grid.appendChild(a);
      });
    };

    fetch("assets/gallery/manifest.json")
      .then((r) => r.json())
      .then((data) => {
        items = data;
        const cats = ["All", ...Array.from(new Set(data.map((x) => x.cat)))];
        if (toolbar) {
          cats.forEach((c, i) => {
            const b = document.createElement("button");
            b.className = "filter-btn" + (i === 0 ? " active" : "");
            b.textContent = c;
            b.addEventListener("click", () => {
              toolbar.querySelectorAll(".filter-btn").forEach((x) => x.classList.remove("active"));
              b.classList.add("active");
              render(c);
            });
            toolbar.appendChild(b);
          });
        }
        render("All");
      })
      .catch(() => { grid.innerHTML = '<p style="color:var(--muted)">Gallery is loading… if this persists, open via a web server.</p>'; });
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
