/**
 * Web Kai — pro boot FX (additive canvas + HUD; does not change copy/layout)
 */
const bootLoadingFx = () => {
  const screen = document.querySelector(".loading-screen[data-intro]");
  if (!screen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  if (screen.querySelector(".wk-load-fx")) {
    return;
  }

  if (screen.classList.contains("is-hidden")) {
    return;
  }

  const logo = screen.querySelector(".loading-screen__logo");
  if (logo) {
    logo.classList.add("is-boot-live");
  }

  const fx = document.createElement("div");
  fx.className = "wk-load-fx";
  fx.setAttribute("aria-hidden", "true");
  fx.innerHTML = `
    <svg class="wk-load-fx__defs" width="0" height="0" aria-hidden="true">
      <defs>
        <linearGradient id="wk-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#22f5d0"/>
          <stop offset="50%" stop-color="#e8fffc"/>
          <stop offset="100%" stop-color="#4a8fd4"/>
        </linearGradient>
      </defs>
    </svg>
    <canvas class="wk-load-fx__canvas"></canvas>
    <svg class="wk-load-fx__ring" viewBox="0 0 148 148" aria-hidden="true">
      <circle class="wk-load-fx__ring-track" cx="74" cy="74" r="70"/>
      <circle class="wk-load-fx__ring-spin" cx="74" cy="74" r="62"/>
      <circle class="wk-load-fx__ring-progress" cx="74" cy="74" r="70"/>
    </svg>
    <div class="wk-load-fx__grid"></div>
    <div class="wk-load-fx__flare"></div>
    <div class="wk-load-fx__corner wk-load-fx__corner--tl"></div>
    <div class="wk-load-fx__corner wk-load-fx__corner--tr"></div>
    <div class="wk-load-fx__corner wk-load-fx__corner--bl"></div>
    <div class="wk-load-fx__corner wk-load-fx__corner--br"></div>
    <div class="wk-load-fx__hud wk-load-fx__hud--l">
      <div class="wk-load-fx__hud-line">&gt; WK_CORE :: INIT</div>
      <div class="wk-load-fx__hud-line">&gt; MESH :: LINKED</div>
      <div class="wk-load-fx__hud-line">&gt; SHADER :: COMPILE</div>
      <div class="wk-load-fx__hud-line">&gt; BUFFER :: ALLOC</div>
      <div class="wk-load-fx__hud-line">&gt; SYNC :: OK</div>
    </div>
    <div class="wk-load-fx__hud wk-load-fx__hud--r">
      <div class="wk-load-fx__hud-line">LAT 35.42° N</div>
      <div class="wk-load-fx__hud-line">PIPELINE v3.2</div>
      <div class="wk-load-fx__hud-line">RENDER 60 FPS</div>
    </div>
    <div class="wk-load-fx__ticks">
      <span class="wk-load-fx__hex" data-hex>0x00A0</span>
      <span class="wk-load-fx__status">BOOT SEQUENCE</span>
    </div>
  `;
  screen.prepend(fx);

  const canvas = fx.querySelector(".wk-load-fx__canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const hexEl = fx.querySelector("[data-hex]");
  if (!ctx) {
    return;
  }

  let raf = 0;
  let w = 0;
  let h = 0;
  let cx = 0;
  let cy = 0;
  let particles = [];
  let sparks = [];
  let packets = [];
  let t = 0;
  let exiting = false;

  const COUNT = 72;
  const SPARK_MAX = 24;
  const PACKET_MAX = 8;

  const rand = (a, b) => a + Math.random() * (b - a);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = screen.clientWidth;
    h = screen.clientHeight;
    cx = w * 0.5;
    cy = h * 0.46;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    particles = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const dist = rand(80, Math.max(w, h) * 0.55);
      return {
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        px: 0,
        py: 0,
        vx: 0,
        vy: 0,
        r: rand(0.5, 1.8),
        a: rand(0.2, 0.75),
        hue: Math.random() > 0.75 ? 205 : 168,
      };
    });
  };

  const spawnSpark = () => {
    if (sparks.length >= SPARK_MAX) {
      sparks.shift();
    }
    const a = Math.random() * Math.PI * 2;
    sparks.push({
      x: cx + Math.cos(a) * rand(40, 90),
      y: cy + Math.sin(a) * rand(40, 90),
      vx: Math.cos(a) * rand(1.2, 3.5),
      vy: Math.sin(a) * rand(1.2, 3.5),
      life: 1,
    });
  };

  const spawnPacket = () => {
    if (packets.length >= PACKET_MAX) {
      packets.shift();
    }
    const fromLeft = Math.random() > 0.5;
    packets.push({
      x: fromLeft ? -20 : w + 20,
      y: rand(cy - 120, cy + 120),
      tx: fromLeft ? w + 40 : -40,
      ty: cy + rand(-30, 30),
      p: 0,
      speed: rand(0.012, 0.022),
    });
  };

  const draw = () => {
    t += 1;
    ctx.clearRect(0, 0, w, h);

    if (!exiting && t % 18 === 0) {
      spawnSpark();
    }
    if (!exiting && t % 45 === 0) {
      spawnPacket();
    }

    const burst = exiting ? 2.8 : 1;

    particles.forEach((p) => {
      const dx = cx - p.x;
      const dy = cy - p.y;
      const dist = Math.hypot(dx, dy) || 1;
      const force = exiting ? -0.00035 * burst : 0.00014;
      const swirl = exiting ? 0 : 0.00006;
      p.vx += dx * force - dy * swirl;
      p.vy += dy * force + dx * swirl;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * burst;
      p.y += p.vy * burst;

      const glow = p.a * (exiting ? 1.2 : 1);
      ctx.beginPath();
      ctx.shadowBlur = 10;
      ctx.shadowColor = `hsla(${p.hue}, 100%, 70%, 0.55)`;
      ctx.fillStyle = `hsla(${p.hue}, 95%, 72%, ${glow})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!exiting && dist < 140) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(34, 245, 208, ${0.22 * (1 - dist / 140)})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(cx, cy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
    });

    particles.forEach((a, i) => {
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 64) {
          const alpha = 0.18 * (1 - dist / 64);
          ctx.strokeStyle = `rgba(34, 245, 208, ${alpha})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    });

    sparks.forEach((s) => {
      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.028;
      if (s.life <= 0) {
        return;
      }
      ctx.strokeStyle = `rgba(230, 255, 250, ${s.life * 0.9})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 4, s.y - s.vy * 4);
      ctx.stroke();
    });
    sparks = sparks.filter((s) => s.life > 0);

    packets.forEach((pk) => {
      pk.p += pk.speed;
      const x = pk.x + (pk.tx - pk.x) * pk.p;
      const y = pk.y + (pk.ty - pk.y) * pk.p;
      ctx.strokeStyle = `rgba(34, 245, 208, ${0.35 * (1 - Math.abs(pk.p - 0.5) * 2)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 12, y);
      ctx.lineTo(x + 12, y);
      ctx.stroke();
    });
    packets = packets.filter((pk) => pk.p < 1.02);

    if (hexEl && t % 8 === 0) {
      const v = 0xa0 + Math.floor((t / 8) % 96);
      hexEl.textContent = `0x${v.toString(16).toUpperCase().padStart(4, "0")}`;
    }

    raf = window.requestAnimationFrame(draw);
  };

  const cleanup = () => {
    window.cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    logo?.classList.remove("is-boot-live");
    fx.remove();
    observer.disconnect();
  };

  const observer = new MutationObserver(() => {
    if (screen.classList.contains("is-exiting")) {
      exiting = true;
    }
    if (screen.classList.contains("is-hidden")) {
      cleanup();
    }
  });

  resize();
  draw();
  window.addEventListener("resize", resize, { passive: true });
  observer.observe(screen, { attributes: true, attributeFilter: ["class"] });
};

if (document.body.classList.contains("is-intro-active")) {
  bootLoadingFx();
} else {
  document.addEventListener("wk-intro-start", bootLoadingFx, { once: true });
}
