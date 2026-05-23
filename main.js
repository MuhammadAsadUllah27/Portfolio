/* ═══════════════════════════════════════════════════════════════
   ASAD ULLAH PORTFOLIO v2.0 — MAIN JS
   • Loader with plasma animation
   • Particle network canvas
   • Per-scroll-direction toast: fires EVERY time you change direction
   • Smooth skill bar animations
   • 3D card parallax tilt
   • Project filter with stagger
   • Contact form
   • Navbar active tracking
   • Cursor glow trail
═══════════════════════════════════════════════════════════════ */

"use strict";

/* ═══════════════ LOADER ════════════════════════════════════ */
(function bootLoader() {
  const loader   = document.getElementById("loader");
  const bar      = document.getElementById("loaderProgress");
  const pct      = document.getElementById("loaderPct");
  let v = 0;

  const tick = setInterval(() => {
    v += Math.random() * 14 + 2;
    if (v >= 96) { v = 96; clearInterval(tick); }
    bar.style.width = v + "%";
    pct.textContent = Math.round(v) + "%";
  }, 80);

  function done() {
    bar.style.width = "100%";
    pct.textContent = "100%";
    setTimeout(() => {
      loader.classList.add("hide");
      initAll();
    }, 450);
  }

  if (document.readyState === "complete") { clearInterval(tick); done(); }
  else window.addEventListener("load", () => { clearInterval(tick); done(); });
})();

/* ═══════════════ MAIN BOOT ══════════════════════════════════ */
function initAll() {
  initParticles();
  initNavbar();
  initReveal();
  initSkillBars();
  initProjectFilter();
  initCardTilt();
  initContactForm();
  initCursorGlow();
  initTyped();
  initScrollToast();      // ← fires toast every direction change
}

/* ═══════════════ SMOOTH SCROLL ══════════════════════════════ */
function smoothScroll(sel) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function navClick(e, sel) {
  e.preventDefault();
  smoothScroll(sel);
  document.getElementById("navLinks").classList.remove("open");
  document.getElementById("navHamburger").classList.remove("open");
}
window.smoothScroll = smoothScroll;
window.navClick = navClick;


/* ═══════════════ PARTICLES ══════════════════════════════════ */
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  const ctx    = canvas.getContext("2d");

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", () => { resize(); });

  const COUNT = window.innerWidth < 768 ? 50 : 100;
  const particles = [];

  class P {
    constructor(rand) {
      this.init(rand);
    }
    init(rand) {
      this.x   = Math.random() * canvas.width;
      this.y   = rand ? Math.random() * canvas.height : canvas.height + 10;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = -(Math.random() * 0.5 + 0.1);
      this.r   = Math.random() * 1.6 + 0.3;
      this.a   = Math.random() * 0.45 + 0.08;
      const t  = Math.random();
      this.col = t < 0.55
        ? `rgba(0,229,255,${this.a})`
        : t < 0.78
        ? `rgba(255,32,121,${this.a})`
        : `rgba(255,190,11,${this.a * 0.6})`;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -10) this.init(false);
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.col;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new P(true));

  // Mouse interaction
  let mx = -999, my = -999;
  document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

  function drawLines() {
    const max = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < max) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,229,255,${0.07 * (1 - d / max)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    if (frame % 2 === 0) drawLines();   // draw lines every other frame for perf
    frame++;
    requestAnimationFrame(animate);
  }
  animate();
}

/* ═══════════════ NAVBAR ═════════════════════════════════════ */
function initNavbar() {
  const nav      = document.getElementById("navbar");
  const links    = document.querySelectorAll(".nav-links a");
  const burger   = document.getElementById("navHamburger");
  const navLinks = document.getElementById("navLinks");
  const backTop  = document.getElementById("backTop");

  burger.addEventListener("click", () => {
    burger.classList.toggle("open");
    navLinks.classList.toggle("open");
  });

  // Close on outside click
  document.addEventListener("click", e => {
    if (!nav.contains(e.target)) {
      burger.classList.remove("open");
      navLinks.classList.remove("open");
    }
  });

  const sections = ["about","skills","projects","experience","education", "publications","certifications","contact"];

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 60);
    if (backTop) backTop.classList.toggle("show", y > 500);

    // Active link
    let cur = "";
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 130) cur = id;
    });
    links.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === `#${cur}`);
    });
  }, { passive: true });
}

/* ═══════════════ SCROLL REVEAL ══════════════════════════════ */
function initReveal() {
  const els = document.querySelectorAll(".rev, .rev-l, .rev-r");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30px 0px" });
  els.forEach(el => obs.observe(el));
}

/* ═══════════════ SKILL BARS ════════════════════════════════ */
function initSkillBars() {
  const fills = document.querySelectorAll(".skill-fill");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("animate");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
}

/* ═══════════════ PROJECT FILTER ════════════════════════════ */
function initProjectFilter() {
  const btns  = document.querySelectorAll(".filter-btn");
  const cards = document.querySelectorAll(".proj-card");

  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      btns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;

      let delay = 0;
      cards.forEach(card => {
        const match = f === "all" || card.dataset.cat === f;
        if (match) {
          card.style.display = "";
          card.style.transition = `opacity 0.4s ${delay}s, transform 0.4s ${delay}s`;
          requestAnimationFrame(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          });
          delay += 0.06;
        } else {
          card.style.opacity = "0";
          card.style.transform = "translateY(16px)";
          setTimeout(() => { if (f !== "all" && card.dataset.cat !== f) card.style.display = "none"; }, 350);
        }
      });
    });
  });
}

/* ═══════════════ 3D CARD TILT ══════════════════════════════ */
function initCardTilt() {
  const cards = document.querySelectorAll(".proj-card, .cert-card, .pub-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width / 2;
      const cy  = r.top  + r.height / 2;
      const dx  = (e.clientX - cx) / (r.width  / 2);
      const dy  = (e.clientY - cy) / (r.height / 2);
      const rx  = -dy * 6;
      const ry  =  dx * 6;
      card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.01)`;
      card.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      card.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

/* ═══════════════ CONTACT FORM ══════════════════════════════ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const suc  = document.getElementById("formSuccess");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();
    const btn  = form.querySelector(".btn--primary");
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Sending…`;
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
      form.reset();
      suc.classList.add("show");
      showToast("Message delivered! I'll reply within 24h", "✉️");
      setTimeout(() => suc.classList.remove("show"), 5000);
    }, 1500);
  });
}

/* ═══════════════ CURSOR GLOW ════════════════════════════════ */
function initCursorGlow() {
  if (window.matchMedia("(pointer:coarse)").matches) return; // skip on mobile
  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position:     "fixed",
    width:        "320px",
    height:       "320px",
    borderRadius: "50%",
    background:   "radial-gradient(circle, rgba(0,229,255,0.045) 0%, transparent 70%)",
    pointerEvents:"none",
    zIndex:       "9997",
    transform:    "translate(-50%,-50%)",
    transition:   "left 0.14s ease, top 0.14s ease",
  });
  document.body.appendChild(glow);

  window.addEventListener("mousemove", e => {
    glow.style.left = e.clientX + "px";
    glow.style.top  = e.clientY + "px";
  }, { passive: true });
}

/* ═══════════════ TYPED NAME EFFECT ═════════════════════════ */
function initTyped() {
  const el = document.getElementById("typedName");
  if (!el) return;
  const full = el.textContent.trim();
  el.textContent = "";
  el.style.opacity = 1;
  let i = 0;
  const t = () => {
    if (i <= full.length) {
      el.textContent = full.slice(0, i++);
      setTimeout(t, 70);
    }
  };
  setTimeout(t, 800);
}