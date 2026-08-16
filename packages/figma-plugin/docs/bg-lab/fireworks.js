/* Micro-fireworks — a standalone, reusable PixiJS layer.
 *
 * The animated counterpart of `microFirework()` in src/pages/templateVizitka.ts:
 * a burst of tadpole sparks — glowing head, thin fading tail — thrown out from one
 * point, jittered so it reads organic rather than mechanical.
 *
 * It knows nothing about the scene it lives in. Give it a PIXI namespace and it
 * hands back a container plus three methods:
 *
 *   const fw = Fireworks.create({ PIXI, hues: [...], region: {...} });
 *   parent.addChild(fw.container);
 *   fw.resize(W, H);            // on every viewport change
 *   fw.update(elapsedSeconds);  // once per frame; autoplay fires bursts on its own
 *   fw.burst(x, y);             // …or fire one by hand, in px
 *   fw.destroy();
 *
 * Every knob lives in DEFAULTS and can be overridden per instance. Mutating
 * `fw.cfg` at runtime works too — the frame loop reads it live, which is what
 * makes console tuning possible.
 */
"use strict";

(function (global) {
  // -------------------------------------------------------------------------
  // DEFAULTS — the whole look lives here
  // -------------------------------------------------------------------------
  const DEFAULTS = {
    // hues mirror FIREWORK_HUES in src/pages/templateVizitka.ts
    hues: ["#5EE6C1", "#FF3D8B", "#818CF8", "#FFFFFF"],

    pool: 2, // bursts alive at once — 2 keeps it rare but never dead
    spokes: [11, 15], // sparks per burst
    jitter: 11, // ± degrees off the even spacing; the organic bit
    lenVary: [0.55, 1.0], // per-spoke share of the burst radius

    radius: [0.075, 0.13], // burst radius as a fraction of min(W, H)
    dur: [1.8, 2.6], // seconds from ignition to gone
    gap: [3.4, 9.0], // idle seconds between a burst dying and the next igniting
    stagger: 0.1, // fraction of dur over which spokes leave the core

    ease: 2.6, // radial deceleration; higher = harder brake at the rim
    gravity: 0.16, // droop at end of life, as a fraction of the radius
    drag: 0.3, // how much the tail shortens as the head slows

    headSize: 5.0, // px of the lit core; the dot texture adds a soft skirt
    headGlow: 3.4, // halo diameter as a multiple of headSize
    tail: 0.88, // tail length as a fraction of distance travelled
    thickness: 6, // tail sprite height in px; the lit line is ~1 px of it
    tailAlpha: 0.78,

    fadeIn: 0.08, // fraction of dur spent flaring up
    fadeOut: 1.15, // fade exponent — higher burns out sooner
    flicker: 0.22, // head twinkle depth
    flickerHz: 9.0,

    flash: 0.3, // ignition flash: diameter as a fraction of the radius
    flashAlpha: 0.34,
    flashDecay: 5.5, // how fast the flash dies (higher = snappier)

    // where bursts are allowed to appear, as viewport fractions
    region: { x: [0.1, 0.9], y: [0.12, 0.85] },
    alpha: 1, // master dimmer for the whole layer
    blend: "add",
    reducedMotion: null, // null = detect; true = freeze one static burst
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const rgb255 = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  // -------------------------------------------------------------------------
  // textures — generated once per hue, shared across every instance
  // -------------------------------------------------------------------------
  const texCache = new Map();
  function cached(PIXI, key, make) {
    if (!texCache.has(key)) texCache.set(key, PIXI.Texture.from(make()));
    return texCache.get(key);
  }

  /** Tight bright core with a small halo — a spark head, not a fuzzy ball. */
  function dotCanvas(hex) {
    const S = 64;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0.0, "#ffffff");
    g.addColorStop(0.12, hex);
    g.addColorStop(0.26, hex + "aa");
    g.addColorStop(0.46, hex + "30");
    g.addColorStop(1.0, hex + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return c;
  }

  /** Wide soft wash — the ignition flash and the head halo. */
  function haloCanvas(hex) {
    const S = 128;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0.0, hex + "cc");
    g.addColorStop(0.22, hex + "55");
    g.addColorStop(0.55, hex + "14");
    g.addColorStop(1.0, hex + "00");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
    return c;
  }

  /**
   * The tail: hairline core along the length, gaussian across it, fading to
   * nothing at the far tip. Anchored at the head end so it trails behind —
   * one continuous line, never a row of dots.
   */
  function tailCanvas(hex) {
    const W = 256,
      H = 16;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(W, H);
    const [r, g, b] = rgb255(hex);

    for (let x = 0; x < W; x++) {
      const u = x / (W - 1); // 0 = tail tip, 1 = head
      const along = Math.pow(u, 2.2); // long taper toward the tip
      const coreW = 0.6 + 0.6 * u;
      const glowW = 1.2 + 3.2 * u;
      for (let y = 0; y < H; y++) {
        const dy = y - (H - 1) / 2;
        const core = Math.exp(-(dy * dy) / (2 * coreW * coreW));
        const glow = Math.exp(-(dy * dy) / (2 * glowW * glowW)) * 0.24;
        const a = Math.min(1, (core + glow) * along);
        const i = (y * W + x) * 4;
        const hot = Math.pow(a, 2.0) * 0.8; // core burns toward white
        img.data[i] = Math.min(255, r + (255 - r) * hot);
        img.data[i + 1] = Math.min(255, g + (255 - g) * hot);
        img.data[i + 2] = Math.min(255, b + (255 - b) * hot);
        img.data[i + 3] = a * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c;
  }

  const dotTex = (PIXI, hex) => cached(PIXI, "fwdot:" + hex, () => dotCanvas(hex));
  const haloTex = (PIXI, hex) => cached(PIXI, "fwhalo:" + hex, () => haloCanvas(hex));
  const tailTex = (PIXI, hex) => cached(PIXI, "fwtail:" + hex, () => tailCanvas(hex));

  // -------------------------------------------------------------------------
  // factory
  // -------------------------------------------------------------------------
  function create(opts) {
    const PIXI = (opts && opts.PIXI) || global.PIXI;
    if (!PIXI) throw new Error("Fireworks.create: PixiJS namespace not found");

    const cfg = Object.assign({}, DEFAULTS, opts);
    cfg.region = Object.assign({}, DEFAULTS.region, opts && opts.region);
    const reduced =
      cfg.reducedMotion === null
        ? matchMedia("(prefers-reduced-motion: reduce)").matches
        : !!cfg.reducedMotion;

    const container = new PIXI.Container();
    container.alpha = cfg.alpha;

    let W = 1,
      H = 1;

    // one burst = a pre-allocated set of spokes, recycled forever
    const maxSpokes = cfg.spokes[1];
    const bursts = [];

    for (let i = 0; i < cfg.pool; i++) {
      const group = new PIXI.Container();
      group.visible = false;
      container.addChild(group);

      const flash = new PIXI.Sprite(haloTex(PIXI, "#FFFFFF"));
      flash.anchor.set(0.5);
      flash.blendMode = cfg.blend;
      group.addChild(flash);

      const spokes = [];
      for (let j = 0; j < maxSpokes; j++) {
        // textures are (re)assigned per hue at ignition, so cfg.hues stays live
        const tail = new PIXI.Sprite(tailTex(PIXI, cfg.hues[0]));
        tail.anchor.set(1, 0.5); // pivot at the head
        tail.blendMode = cfg.blend;
        const halo = new PIXI.Sprite(haloTex(PIXI, cfg.hues[0]));
        halo.anchor.set(0.5);
        halo.blendMode = cfg.blend;
        const head = new PIXI.Sprite(dotTex(PIXI, cfg.hues[0]));
        head.anchor.set(0.5);
        head.blendMode = cfg.blend;
        group.addChild(tail, halo, head);
        spokes.push({ tail, halo, head, angle: 0, len: 1, lag: 0, phase: 0 });
      }

      bursts.push({
        group,
        flash,
        spokes,
        live: false,
        t0: 0,
        dur: 2,
        n: maxSpokes,
        radius: 40,
        x: 0,
        y: 0,
        // stagger the pool so two bursts never ignite in lockstep
        next: 1.5 + i * rand(2.5, 5.0),
      });
    }

    /** Arm one burst at (x, y) in px. Called by autoplay and by burst(). */
    function ignite(b, t, x, y, over) {
      const o = over || {};
      b.live = true;
      b.t0 = t;
      b.dur = o.dur || rand(cfg.dur[0], cfg.dur[1]);
      b.radius = o.radius || rand(cfg.radius[0], cfg.radius[1]) * Math.min(W, H);
      b.n = o.spokes || Math.round(rand(cfg.spokes[0], cfg.spokes[1]));
      b.x = x;
      b.y = y;
      b.next = t + b.dur + rand(cfg.gap[0], cfg.gap[1]);

      b.group.visible = true;
      b.group.x = x;
      b.group.y = y;

      const step = 360 / b.n;
      for (let j = 0; j < b.spokes.length; j++) {
        const sp = b.spokes[j];
        const on = j < b.n;
        sp.tail.visible = sp.head.visible = sp.halo.visible = on;
        if (!on) continue;
        const hex = cfg.hues[j % cfg.hues.length];
        sp.tail.texture = tailTex(PIXI, hex);
        sp.halo.texture = haloTex(PIXI, hex);
        sp.head.texture = dotTex(PIXI, hex);
        sp.angle = ((step * j + rand(-cfg.jitter, cfg.jitter)) * Math.PI) / 180;
        sp.len = rand(cfg.lenVary[0], cfg.lenVary[1]);
        sp.lag = Math.random() * cfg.stagger; // not every spark leaves at once
        sp.phase = Math.random() * Math.PI * 2;
      }
    }

    function extinguish(b) {
      b.live = false;
      b.group.visible = false;
    }

    function drawBurst(b, t) {
      const k = (t - b.t0) / b.dur;
      if (k >= 1) {
        extinguish(b);
        return;
      }

      // ignition flash — pops, then dies far faster than the sparks
      const fk = Math.exp(-k * cfg.flashDecay);
      b.flash.width = b.flash.height = b.radius * cfg.flash * (1 + 2.4 * k);
      b.flash.alpha = cfg.flashAlpha * fk;

      for (let j = 0; j < b.n; j++) {
        const sp = b.spokes[j];
        // each spark runs its own slightly delayed, slightly rescaled life
        const sk = Math.min(1, Math.max(0, (k - sp.lag) / (1 - sp.lag)));
        if (sk <= 0) {
          sp.head.alpha = sp.tail.alpha = sp.halo.alpha = 0;
          continue;
        }

        const e = 1 - Math.pow(1 - sk, cfg.ease); // decelerating flight
        const r = b.radius * sp.len * e;
        const dirX = Math.cos(sp.angle),
          dirY = Math.sin(sp.angle);
        const sag = b.radius * cfg.gravity * sk * sk; // the droop at the end

        const hx = dirX * r;
        const hy = dirY * r + sag;

        const inK = Math.min(1, sk / cfg.fadeIn);
        const life = inK * inK * (3 - 2 * inK) * Math.pow(1 - sk, cfg.fadeOut);
        const twinkle = 1 - cfg.flicker * (0.5 + 0.5 * Math.sin(t * cfg.flickerHz + sp.phase));
        const a = life * twinkle;

        sp.head.x = sp.halo.x = hx;
        sp.head.y = sp.halo.y = hy;
        sp.head.width = sp.head.height = cfg.headSize * (0.75 + 0.5 * (1 - sk));
        sp.head.alpha = a;
        sp.halo.width = sp.halo.height = cfg.headSize * cfg.headGlow;
        sp.halo.alpha = a * 0.5;

        // the tail hangs off the head, pointing back at the core
        sp.tail.x = hx;
        sp.tail.y = hy;
        sp.tail.rotation = Math.atan2(hy, hx);
        sp.tail.width = Math.max(1, r * cfg.tail * (1 - cfg.drag * sk));
        sp.tail.height = cfg.thickness;
        sp.tail.alpha = a * cfg.tailAlpha;
      }
    }

    // -----------------------------------------------------------------------
    // public surface
    // -----------------------------------------------------------------------
    const api = {
      container,
      cfg,

      resize(w, h) {
        W = w;
        H = h;
        // a live burst keeps its px geometry; the next one picks up the new scale
      },

      /** Fire a burst now. x/y in px; omit them for a random spot in the region. */
      burst(x, y, over) {
        const b = bursts.find((v) => !v.live) || bursts[0];
        const px = x === undefined ? rand(cfg.region.x[0], cfg.region.x[1]) * W : x;
        const py = y === undefined ? rand(cfg.region.y[0], cfg.region.y[1]) * H : y;
        ignite(b, api._t, px, py, over);
        drawBurst(b, api._t);
      },

      /** Swap the palette — picked up by the next burst, not the live one. */
      setHues(hues) {
        if (hues && hues.length) cfg.hues = hues;
      },

      _t: 0,

      update(t) {
        api._t = t;
        if (reduced) return;
        for (const b of bursts) {
          if (!b.live) {
            if (t < b.next) continue;
            ignite(
              b,
              t,
              rand(cfg.region.x[0], cfg.region.x[1]) * W,
              rand(cfg.region.y[0], cfg.region.y[1]) * H,
            );
          }
          drawBurst(b, t);
        }
      },

      /** Reduced-motion fallback: one frozen burst, mid-flight. */
      still(x, y) {
        const b = bursts[0];
        ignite(b, 0, x === undefined ? W * 0.5 : x, y === undefined ? H * 0.35 : y);
        for (const sp of b.spokes) sp.lag = 0;
        drawBurst(b, b.dur * 0.35);
      },

      destroy() {
        container.destroy({ children: true, texture: false });
      },
    };

    return api;
  }

  global.Fireworks = { create, DEFAULTS };
})(window);
