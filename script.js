/* ============================================================
   PORTFOLIO — script.js
   ============================================================
   Para agregar proyectos: edita solo el array `projects`.
   ============================================================ */

/* ─── PROYECTOS ──────────────────────────────────────────────
   categoria: "featured" → tarjeta grande
              "more"     → ítem de lista
   ─────────────────────────────────────────────────────────── */
const projects = [

  /* ── DESTACADOS ──────────────────────────────────────── */
  {
    nombre:      "Expenzo",
    descripcion: "Controla tus finanzas personales de forma simple e inteligente. Registra gastos, ingresos y entiende a dónde va tu dinero.",
    link:        "https://expenzo.vercel.app",
    categoria:   "featured",
    emoji:       "💸"
  },
  {
    nombre:      "Proyecto Dos",
    descripcion: "Breve descripción de tu segundo proyecto más importante.",
    link:        "https://tuproyecto.com",
    categoria:   "featured",
    emoji:       "⚡"
  },

  /* ── MÁS PROYECTOS (mayor → menor importancia) ────────── */
  {
    nombre:      "Proyecto Tres",
    descripcion: "Descripción corta del proyecto",
    link:        "https://proyecto3.com",
    categoria:   "more",
    emoji:       "🔥"
  },
  {
    nombre:      "Proyecto Cuatro",
    descripcion: "Descripción corta del proyecto",
    link:        "https://proyecto4.com",
    categoria:   "more",
    emoji:       "🎯"
  },
  {
    nombre:      "Proyecto Cinco",
    descripcion: "Descripción corta del proyecto",
    link:        "https://proyecto5.com",
    categoria:   "more",
    emoji:       "✨"
  }
];

/* ─── PALETA NEON ────────────────────────────────────────────
   Cada color dura 5 segundos antes de transicionar al siguiente.
   Puedes agregar, quitar o cambiar colores libremente [R, G, B].
   ─────────────────────────────────────────────────────────── */
const PALETTE = [
  [0,   230, 255],  // cyan eléctrico
  [180, 60,  255],  // violeta neon
  [0,   255, 120],  // verde neon
  [255, 20,  160],  // rosa hot
  [255, 180, 0],    // ámbar neon
];

/* ═══════════════════════════════════════════════════════════
   WAVE BACKGROUND
═══════════════════════════════════════════════════════════ */
class WaveBackground {
  constructor() {
    this.canvas = document.getElementById('bg-canvas');
    this.ctx    = this.canvas.getContext('2d');

    this.t        = 0;
    this.colorIdx = 0;
    this.colorT   = 0;   // 0→1, transición entre dos colores

    /* Cursor / touch — empieza fuera de pantalla */
    this.mouseX = -9999;
    this.mouseY = -9999;
    /* Posición suavizada del cursor (lerp) */
    this.smoothX = -9999;
    this.smoothY = -9999;

    /* 3 capas de olas: delantera, media, trasera */
    this.waves = [
      { amp: 60, freq: 0.007, speed: 0.008, phase: 0,           yRatio: 0.70 },
      { amp: 44, freq: 0.010, speed: 0.013, phase: Math.PI,     yRatio: 0.77 },
      { amp: 30, freq: 0.014, speed: 0.007, phase: Math.PI / 2, yRatio: 0.83 },
    ];

    this.particles = [];
    this.w = 0;
    this.h = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  /* ── Ajusta canvas al viewport ── */
  resize() {
    const dpr   = Math.min(window.devicePixelRatio || 1, 2);
    this.w      = window.innerWidth;
    this.h      = window.innerHeight;
    this.canvas.width  = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width  = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.initParticles();
  }

  /* ── Partículas flotantes ── */
  initParticles() {
    const count     = Math.min(18, Math.floor(this.w / 50));
    this.particles  = Array.from({ length: count }, () => this.spawnParticle(true));
  }

  spawnParticle(randomY = false) {
    return {
      x:     Math.random() * this.w,
      y:     randomY ? Math.random() * this.h : this.h + 10,
      size:  Math.random() * 2.8 + 0.8,
      speed: Math.random() * 0.5 + 0.18,
      alpha: Math.random() * 0.55 + 0.35,   // más visibles
      drift: (Math.random() - 0.5) * 0.3,
    };
  }

  /* ── Interpolación ease-in-out entre dos colores ──
     Pasa más tiempo en los extremos (color puro) y
     transiciona rápido en el medio → colores más notorios   */
  currentColor() {
    const a = PALETTE[this.colorIdx % PALETTE.length];
    const b = PALETTE[(this.colorIdx + 1) % PALETTE.length];

    // Ease-in-out cuadrática
    const t = this.colorT < 0.5
      ? 2 * this.colorT * this.colorT
      : 1 - Math.pow(-2 * this.colorT + 2, 2) / 2;

    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t),
    ];
  }

  /* ── Sincroniza el color con toda la UI vía CSS vars ── */
  syncUIColor([r, g, b]) {
    const s = document.documentElement.style;
    /* --cyan-rgb permite usar rgba(var(--cyan-rgb), alpha) en CSS */
    s.setProperty('--cyan-rgb',     `${r}, ${g}, ${b}`);
    s.setProperty('--cyan',         `rgb(${r},${g},${b})`);
    s.setProperty('--glow-cyan',    `rgba(${r},${g},${b},0.45)`);
    s.setProperty('--border-focus', `rgba(${r},${g},${b},0.6)`);
  }

  /* ── Lógica por frame ── */
  update() {
    this.t += 1;

    /* 5 segundos por color @ 60 fps → 1/(5×60) = 0.00333 */
    this.colorT += 0.00333;
    if (this.colorT >= 1) {
      this.colorT   = 0;
      this.colorIdx = (this.colorIdx + 1) % PALETTE.length;
    }

    /* Suaviza la posición del cursor con lerp */
    const lerpSpeed = 0.10;
    if (this.mouseX > -999) {
      this.smoothX += (this.mouseX - this.smoothX) * lerpSpeed;
      this.smoothY += (this.mouseY - this.smoothY) * lerpSpeed;
    }

    /* Mueve partículas hacia arriba */
    this.particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -8) Object.assign(p, this.spawnParticle(false));
    });
  }

  /* ── Dibuja las olas con desplazamiento por cursor ── */
  drawWaves([r, g, b]) {
    const { ctx, w, h, t } = this;
    const mx      = this.smoothX;
    const my      = this.smoothY;
    const active  = mx > -999;
    const sigma2  = 2 * 130 * 130; // radio de influencia del cursor ~130px

    this.waves.forEach((wave, i) => {
      ctx.beginPath();

      for (let x = 0; x <= w; x += 3) {
        const baseY = h * wave.yRatio
          + Math.sin(x * wave.freq + t * wave.speed + wave.phase) * wave.amp
          + Math.sin(x * wave.freq * 0.55 + t * wave.speed * 0.7) * wave.amp * 0.38;

        let y = baseY;
        if (active) {
          const dx       = x - mx;
          const gaussian = Math.exp(-(dx * dx) / sigma2);
          /* La ola delantera reacciona más fuerte */
          const pull     = (0.50 - i * 0.12) * gaussian;
          y = baseY + (my - baseY) * pull;
        }

        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();

      /* Gradiente vertical: más intenso arriba de la ola */
      const alpha = 0.16 - i * 0.03;
      const grad  = ctx.createLinearGradient(0, h * wave.yRatio - wave.amp * 1.5, 0, h);
      grad.addColorStop(0, `rgba(${r},${g},${b},${alpha * 3})`);
      grad.addColorStop(1, `rgba(${r},${g},${b},${alpha * 0.2})`);
      ctx.fillStyle = grad;
      ctx.fill();
    });

    /* Línea neon brillante en la cresta de la ola delantera */
    const fw = this.waves[0];
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const baseY = h * fw.yRatio
        + Math.sin(x * fw.freq + t * fw.speed + fw.phase) * fw.amp
        + Math.sin(x * fw.freq * 0.55 + t * fw.speed * 0.7) * fw.amp * 0.38;

      let y = baseY;
      if (active) {
        const dx       = x - mx;
        const gaussian = Math.exp(-(dx * dx) / sigma2);
        y = baseY + (my - baseY) * gaussian * 0.50;
      }

      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},0.80)`;
    ctx.lineWidth   = 2;
    ctx.shadowColor = `rgb(${r},${g},${b})`;
    ctx.shadowBlur  = 28;
    ctx.stroke();
    ctx.shadowBlur  = 0;
  }

  /* ── Partículas neon ── */
  drawParticles([r, g, b]) {
    const { ctx } = this;
    this.particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle   = `rgba(${r},${g},${b},${p.alpha})`;
      ctx.shadowColor = `rgb(${r},${g},${b})`;
      ctx.shadowBlur  = 18;
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }

  draw() {
    const { ctx, w, h } = this;
    ctx.clearRect(0, 0, w, h);
    const color = this.currentColor();
    this.syncUIColor(color);
    this.drawWaves(color);
    this.drawParticles(color);
  }

  tick() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.tick());
  }

  /* ── Registra eventos de cursor y toque ── */
  bindPointer() {
    const update = (x, y) => { this.mouseX = x; this.mouseY = y; };
    const reset  = ()      => { this.mouseX = -9999; this.mouseY = -9999; };

    window.addEventListener('mousemove',  e => update(e.clientX, e.clientY), { passive: true });
    window.addEventListener('mouseleave', reset, { passive: true });
    window.addEventListener('touchmove',  e => update(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    window.addEventListener('touchend',   reset, { passive: true });
  }

  start() {
    this.bindPointer();
    this.tick();
  }
}

/* ═══════════════════════════════════════════════════════════
   RIPPLE — feedback táctil en botones y tarjetas
═══════════════════════════════════════════════════════════ */
function createRipple(e) {
  const el   = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const src  = e.touches ? e.touches[0] : e;

  const ripple = document.createElement('span');
  ripple.className = 'ripple-fx';

  const size = Math.max(rect.width, rect.height) * 1.9;
  ripple.style.cssText = `
    width:  ${size}px;
    height: ${size}px;
    left:   ${(src.clientX - rect.left) - size / 2}px;
    top:    ${(src.clientY - rect.top)  - size / 2}px;
  `;
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

function initRipples() {
  document.querySelectorAll('.featured-card, .project-item, .wa-btn, .card-btn')
    .forEach(el => {
      el.addEventListener('click',      createRipple);
      el.addEventListener('touchstart', createRipple, { passive: true });
    });
}

/* ═══════════════════════════════════════════════════════════
   RENDER — PROYECTOS DESTACADOS
═══════════════════════════════════════════════════════════ */
const ARROW = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>`;

function renderFeatured() {
  const container = document.getElementById('featured-projects');
  projects
    .filter(p => p.categoria === 'featured')
    .forEach((p, i) => {
      const isMain = i === 0;
      const card   = document.createElement('a');
      card.href      = p.link;
      card.target    = '_blank';
      card.rel       = 'noopener noreferrer';
      card.className = `featured-card reveal${isMain ? ' main' : ''}`;
      card.innerHTML = `
        ${isMain ? `<div class="card-badge"><span class="dot" aria-hidden="true"></span>Proyecto Principal</div>` : ''}
        <h3 class="card-title">${escapeHtml(p.nombre)}</h3>
        <p class="card-desc">${escapeHtml(p.descripcion)}</p>
        <span class="card-btn">Ver proyecto ${ARROW}</span>
      `;
      container.appendChild(card);
    });
}

/* ═══════════════════════════════════════════════════════════
   RENDER — MÁS PROYECTOS
═══════════════════════════════════════════════════════════ */
function renderMore() {
  const container = document.getElementById('more-projects');
  projects
    .filter(p => p.categoria === 'more')
    .forEach(p => {
      const item = document.createElement('a');
      item.href      = p.link;
      item.target    = '_blank';
      item.rel       = 'noopener noreferrer';
      item.className = 'project-item reveal';
      item.innerHTML = `
        <div class="project-item-left">
          <div class="project-icon" aria-hidden="true">${p.emoji}</div>
          <div class="project-info">
            <div class="project-info-name">${escapeHtml(p.nombre)}</div>
            <div class="project-info-desc">${escapeHtml(p.descripcion)}</div>
          </div>
        </div>
        <svg class="project-arrow" width="15" height="15" viewBox="0 0 24 24"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      `;
      container.appendChild(item);
    });
}

/* ─── SCROLL REVEAL ─────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.10, rootMargin: '0px 0px -20px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ─── SANITIZACIÓN: evita XSS ──────────────────────────── */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── INIT ───────────────────────────────────────────────── */
function init() {
  renderFeatured();
  renderMore();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      initScrollReveal();
      initRipples();
    });
  });

  new WaveBackground().start();
}

document.addEventListener('DOMContentLoaded', init);
