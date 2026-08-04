/**
 * Успешное Дело — light site UI + lead form
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* 2K / 4K / 5K display mode — scale UI + show status badge */
  (function displayMode() {
    const root = document.documentElement;
    const badge = document.createElement("div");
    badge.className = "display-mode-badge";
    badge.setAttribute("role", "status");
    badge.setAttribute("aria-live", "polite");

    const resolve = () => {
      const w = window.innerWidth || root.clientWidth || 0;
      const dpr = window.devicePixelRatio || 1;
      const screenW = window.screen && screen.width ? screen.width : 0;
      /* Physical-ish width: helps Retina 4K/5K with OS scaling */
      const phys = Math.max(w * dpr, screenW * dpr);

      let mode = null;
      let label = null;

      if (w >= 4800 || (w >= 3000 && phys >= 5000)) {
        mode = "5k";
        label = "5K";
      } else if (w >= 3200 || (w >= 2300 && phys >= 3500)) {
        mode = "4k";
        label = "4K";
      } else if (w >= 2400 || (w >= 2000 && phys >= 2500)) {
        mode = "2k";
        label = "2K";
      }

      if (mode) {
        root.dataset.displayMode = mode;
        badge.textContent = "Вы смотрите сайт в режиме " + label;
        badge.classList.add("is-visible");
      } else {
        delete root.dataset.displayMode;
        badge.classList.remove("is-visible");
        badge.textContent = "";
      }
    };

    const mount = () => {
      if (!badge.isConnected) document.body.appendChild(badge);
      resolve();
    };

    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);

    let t = 0;
    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(t);
        t = window.setTimeout(resolve, 120);
      },
      { passive: true }
    );
  })();

  /* Shared rAF throttle for scroll listeners */
  function onScroll(fn) {
    let ticking = false;
    const run = () => {
      ticking = false;
      fn();
    };
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(run);
      },
      { passive: true }
    );
  }

  /* Lazy videos: load/play only when visible; pause off-screen & in hidden tab */
  (function lazyVideos() {
    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const videos = Array.from(document.querySelectorAll("video[data-lazy-video]"));
    if (!videos.length) return;

    const heroWrap = document.querySelector(".hero-bg");
    const heroVideo = document.querySelector(".hero-bg-video");

    const setHeroMode = (playing) => {
      if (!heroWrap) return;
      if (playing) {
        heroWrap.classList.add("is-video");
        heroWrap.classList.remove("is-still");
      } else {
        heroWrap.classList.add("is-still");
        heroWrap.classList.remove("is-video");
      }
    };
    if (heroWrap) setHeroMode(false);

    const ensureSources = (video) => {
      /* kick network after we decide to play (preload=none) */
      if (video.preload === "none") video.preload = "metadata";
      try {
        video.load();
      } catch (_) {}
    };

    const playVideo = (video) => {
      if (reduced) return;
      ensureSources(video);
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          if (video === heroVideo) setHeroMode(true);
        }).catch(() => {
          if (video === heroVideo) setHeroMode(false);
        });
      } else if (!video.paused && video === heroVideo) {
        setHeroMode(true);
      }
    };

    const pauseVideo = (video) => {
      try {
        video.pause();
      } catch (_) {}
      if (video === heroVideo) setHeroMode(false);
    };

    const inView = new Map();

    const sync = () => {
      if (document.hidden) {
        videos.forEach(pauseVideo);
        return;
      }
      videos.forEach((video) => {
        if (inView.get(video)) playVideo(video);
        else pauseVideo(video);
      });
    };

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            const video = e.target;
            const delay = Number(video.getAttribute("data-lazy-delay") || 0);
            const visible = e.isIntersecting && e.intersectionRatio > 0.12;
            if (visible) {
              if (delay > 0 && !video.dataset.lazyArmed) {
                video.dataset.lazyArmed = "1";
                window.setTimeout(() => {
                  inView.set(video, true);
                  sync();
                }, delay);
              } else {
                inView.set(video, true);
              }
            } else {
              inView.set(video, false);
            }
          });
          sync();
        },
        { threshold: [0, 0.12, 0.35], rootMargin: "80px 0px" }
      );
      videos.forEach((v) => {
        inView.set(v, false);
        io.observe(v);
      });
    } else {
      videos.forEach((v) => playVideo(v));
    }

    document.addEventListener("visibilitychange", sync);
    if (heroVideo) {
      heroVideo.addEventListener("error", () => setHeroMode(false));
      heroVideo.addEventListener("playing", () => setHeroMode(true));
    }
  })();

  /* Next-panel peeks + panel arrows + blink/click-to-next */
  (function panelNavAndPeeks() {
    const panels = Array.from(document.querySelectorAll("[data-panel]"));
    const prevBtn = document.querySelector("[data-panel-prev]");
    const nextBtn = document.querySelector("[data-panel-next]");
    if (!panels.length) return;

    const getIndex = () => {
      const mid = window.innerHeight * 0.35;
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const score = Math.abs(r.top);
        if (r.top <= mid && r.bottom > mid * 0.5) {
          if (score < bestDist) {
            bestDist = score;
            best = i;
          }
        } else if (score < bestDist) {
          bestDist = score;
          best = i;
        }
      });
      return best;
    };

    const go = (dir) => {
      const i = getIndex();
      const next = Math.max(0, Math.min(panels.length - 1, i + dir));
      const el = panels[next];
      if (!el) return;
      /* Desktop: flush to viewport top (scroll-margin is 0).
         Mobile keeps scroll-margin under the menu via CSS. */
      el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    };

    /* One fixed peek at viewport bottom — updates with the active panel */
    const fixed = document.createElement("button");
    fixed.type = "button";
    fixed.className = "panel-next panel-next-fixed is-hidden";
    fixed.setAttribute("aria-label", "Следующий блок");
    fixed.addEventListener("click", () => go(1));
    document.body.appendChild(fixed);

    const sync = () => {
      const i = getIndex();
      if (prevBtn) {
        prevBtn.disabled = i <= 0;
        prevBtn.classList.toggle("is-disabled", i <= 0);
      }
      if (nextBtn) {
        const atEnd = i >= panels.length - 1;
        nextBtn.disabled = atEnd;
        nextBtn.classList.toggle("is-disabled", atEnd);
      }
      const panel = panels[i];
      const label = panel ? String(panel.getAttribute("data-next") || "").trim() : "";
      if (label) {
        fixed.textContent = label;
        fixed.setAttribute("aria-label", "Дальше: " + label);
        fixed.classList.remove("is-hidden");
      } else {
        fixed.textContent = "";
        fixed.classList.add("is-hidden");
      }
    };

    if (prevBtn) prevBtn.addEventListener("click", () => go(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => go(1));
    onScroll(sync);
    window.addEventListener("resize", sync);
    sync();
  })();

  /* Messenger FAB: load Lottie only when idle / after short delay */
  (function chatFab() {
    const root = document.querySelector("[data-chat-fab]");
    if (!root) return;
    const toggle = root.querySelector("[data-chat-toggle]");
    const panel = root.querySelector("[data-chat-panel]");
    const closeBtn = root.querySelector("[data-chat-close]");
    const lottieBox = root.querySelector("[data-chat-lottie]");
    if (!toggle || !panel) return;

    let anim = null;
    let scriptLoading = false;
    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const loadLottieLib = (cb) => {
      if (window.lottie) {
        cb();
        return;
      }
      if (scriptLoading) return;
      scriptLoading = true;
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js";
      s.async = true;
      s.onload = () => cb();
      s.onerror = () => {
        scriptLoading = false;
      };
      document.head.appendChild(s);
    };

    const loadLottie = () => {
      if (!lottieBox || anim) return;
      loadLottieLib(() => {
        if (!window.lottie || anim) return;
        try {
          anim = window.lottie.loadAnimation({
            container: lottieBox,
            renderer: "svg",
            loop: !reduced,
            autoplay: !reduced && !document.hidden,
            path: "media/chat/whatsapp-telegram-max.json",
            rendererSettings: {
              progressiveLoad: true,
              hideOnTransparent: true,
              // cheaper than full quality SVG effects
              preserveAspectRatio: "xMidYMid meet",
            },
          });
          if (reduced) {
            anim.addEventListener("DOMLoaded", () => {
              try {
                anim.goToAndStop(0, true);
              } catch (_) {}
            });
          }
        } catch (err) {
          console.warn("[chat-fab] lottie failed", err);
        }
      });
    };

    /* Defer Lottie until the browser is idle (or after 1.8s) */
    const scheduleLottie = () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(loadLottie, { timeout: 2200 });
      } else {
        window.setTimeout(loadLottie, 1800);
      }
    };
    scheduleLottie();

    document.addEventListener("visibilitychange", () => {
      if (!anim) return;
      try {
        if (document.hidden || root.classList.contains("is-open")) anim.pause();
        else if (!reduced) anim.play();
      } catch (_) {}
    });

    const setOpen = (open) => {
      root.classList.toggle("is-open", open);
      panel.hidden = !open;
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      if (anim) {
        try {
          if (open || document.hidden) anim.pause();
          else if (!reduced) anim.play();
        } catch (_) {}
      }
    };

    toggle.addEventListener("click", () => setOpen(panel.hidden));
    if (closeBtn) closeBtn.addEventListener("click", () => setOpen(false));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) setOpen(false);
    });
    document.addEventListener("click", (e) => {
      if (!panel.hidden && !root.contains(e.target)) setOpen(false);
    });
  })();

  /* Floating capsule header: solid at top → semi-transparent independent bar on scroll */
  (function headerScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const threshold = 24;
    const sync = () => {
      header.classList.toggle("is-scrolled", window.scrollY > threshold);
    };
    onScroll(sync);
    sync();
  })();

  /* Partners marquee: only animate when section is on screen */
  (function partnersMarquee() {
    const marquee = document.querySelector(".marquee");
    const track = document.querySelector(".marquee-track");
    const section = document.querySelector(".partners") || marquee;
    if (!marquee || !track) return;

    let offset = 0;
    let half = 0;
    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let vel = 0;
    let raf = 0;
    let active = false;
    const autoSpeed = 0.45; /* slightly calmer than before */
    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      half = track.scrollWidth / 2;
    };

    const wrap = () => {
      if (half <= 0) return;
      while (offset <= -half) offset += half;
      while (offset > 0) offset -= half;
    };

    const apply = () => {
      wrap();
      track.style.transform = "translate3d(" + offset + "px,0,0)";
    };

    const tick = () => {
      raf = 0;
      if (!active && !dragging) return;
      if (!dragging) {
        if (!reduced && active) offset -= autoSpeed;
        if (Math.abs(vel) > 0.15) {
          offset += vel;
          vel *= 0.9;
        } else {
          vel = 0;
        }
        apply();
      }
      if (active || dragging || Math.abs(vel) > 0.15) {
        raf = requestAnimationFrame(tick);
      }
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener(
      "resize",
      () => {
        measure();
        apply();
      },
      { passive: true }
    );
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
      /* decode off the main path when possible */
      if (img.decode) img.decode().catch(() => {});
    });

    if ("IntersectionObserver" in window && section) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            active = e.isIntersecting && !document.hidden;
            marquee.classList.toggle("is-active", active);
            if (active) kick();
          });
        },
        { rootMargin: "100px 0px", threshold: 0.05 }
      );
      io.observe(section);
    } else {
      active = true;
      marquee.classList.add("is-active");
      kick();
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        active = false;
        marquee.classList.remove("is-active");
      }
      /* IO will re-enable when tab is visible and section intersects */
    });

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      vel = 0;
      marquee.classList.add("is-dragging");
      kick();
      try {
        marquee.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      offset += dx;
      vel = dx;
      apply();
    };

    const onPointerUp = (e) => {
      if (!dragging || (pointerId != null && e.pointerId !== pointerId)) return;
      dragging = false;
      pointerId = null;
      marquee.classList.remove("is-dragging");
      kick();
    };

    marquee.addEventListener("pointerdown", onPointerDown);
    marquee.addEventListener("pointermove", onPointerMove);
    marquee.addEventListener("pointerup", onPointerUp);
    marquee.addEventListener("pointercancel", onPointerUp);
    marquee.addEventListener("lostpointercapture", onPointerUp);
    marquee.addEventListener("dragstart", (e) => e.preventDefault());

    apply();
  })();

  /* Hero: pill + logos + glass plaque tint follow active marketplace */
  (function sellerBarCycle() {
    const bar = document.querySelector("[data-seller-bar]");
    if (!bar) return;
    const glass = document.querySelector(".hero-glass");
    const icons = Array.from(bar.querySelectorAll("[data-mp-icon]"));
    const cycle = ["wb", "ozon", "ym"];
    let i = 0;
    const apply = () => {
      const key = cycle[i];
      bar.setAttribute("data-mp", key);
      if (glass) glass.setAttribute("data-mp", key);
      icons.forEach((el) => {
        el.classList.toggle("is-active", el.getAttribute("data-mp-icon") === key);
      });
    };
    apply();
    const reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    setInterval(() => {
      i = (i + 1) % cycle.length;
      apply();
    }, 3200);
  })();

  /* Mini-game popup: warehouse catch (УД) — nav «Получи скидку» + floating launch */
  (function openWarehouseGame() {
    const btns = document.querySelectorAll("[data-open-game]");
    if (!btns.length) return;
    const open = () => {
      const url = "game/ud-catch.html";
      const w = 460;
      const h = 780;
      const left = Math.max(0, Math.round((window.screen.width - w) / 2));
      const top = Math.max(0, Math.round((window.screen.height - h) / 2));
      const features = [
        `width=${w}`,
        `height=${h}`,
        `left=${left}`,
        `top=${top}`,
        "menubar=no",
        "toolbar=no",
        "location=no",
        "status=no",
        "resizable=yes",
        "scrollbars=no",
      ].join(",");
      const win = window.open(url, "udCatchGame", features);
      if (!win) {
        window.location.href = url;
      } else {
        try {
          win.focus();
        } catch (_) {}
      }
      /* close mobile nav if open */
      const nav = document.getElementById("nav");
      const toggle = document.getElementById("nav-toggle");
      if (nav) nav.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    };
    btns.forEach((btn) => btn.addEventListener("click", open));
  })();

  /* Hero glass opacity slider — delicate control, text invert + tagline reveal */
  (function heroGlassOpacity() {
    const glass = document.querySelector("[data-hero-glass]");
    const range = document.querySelector("[data-hero-opacity]");
    const line = document.querySelector("[data-hero-transparency-line]");
    if (!glass || !range) return;

    const KEY = "ud-hero-glass-see";
    /* 0 = dense, 100 = fully open (slider at top when vertical) */
    const apply = (raw) => {
      const v = Math.max(0, Math.min(100, Number(raw) || 0));
      const t = v / 100;
      const glassA = 0.76 - t * 0.68;
      const blur = 20 - t * 16;
      const tint = 1 - t * 0.78;
      glass.style.setProperty("--glass-a", glassA.toFixed(3));
      glass.style.setProperty("--glass-blur", blur.toFixed(1) + "px");
      glass.style.setProperty("--glass-tint", tint.toFixed(3));
      glass.style.setProperty("--glass-see", t.toFixed(3));
      range.value = String(v);
      range.setAttribute("aria-valuenow", String(v));
      range.setAttribute(
        "aria-valuetext",
        t < 0.05 ? "плотный блок" : t > 0.95 ? "полная прозрачность" : "прозрачность " + v
      );
      if (line) {
        line.setAttribute("aria-hidden", t < 0.08 ? "true" : "false");
      }
    };

    try {
      const saved = localStorage.getItem(KEY);
      if (saved != null && saved !== "") apply(saved);
      else apply(0);
    } catch (_) {
      apply(0);
    }

    const onInput = () => {
      apply(range.value);
      try {
        localStorage.setItem(KEY, String(range.value));
      } catch (_) {}
    };
    range.addEventListener("input", onInput);
    range.addEventListener("change", onInput);
  })();

  // Optional: fill Anton's phone from query ?anton=+79...
  try {
    const anton = new URLSearchParams(location.search).get("anton");
    if (anton) {
      const clean = anton.replace(/[^\d+]/g, "");
      const block = document.getElementById("anton-phone-block");
      const note = document.getElementById("anton-phone-note");
      if (block && note && clean) {
        const display = formatPhone(clean);
        note.innerHTML =
          `<a href="tel:${clean}">${display}</a>` +
          ` · <a href="https://wa.me/${clean.replace(/\D/g, "")}" target="_blank" rel="noopener">WhatsApp</a>` +
          ` · <a href="https://t.me/+" target="_blank" rel="noopener">Telegram</a>`;
      }
    }
  } catch (_) {}

  function formatPhone(p) {
    const d = p.replace(/\D/g, "");
    if (d.length === 11 && (d[0] === "7" || d[0] === "8")) {
      return `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}`;
    }
    return p;
  }

  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* Scroll reveal: blocks fade/slide in as they enter the viewport */
  const reveals = document.querySelectorAll(".reveal, .reveal-stagger");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Stagger cards inside common grids when parent section is revealed
  document.querySelectorAll(".services-grid, .steps-row, .steps-detail, .feature-grid, .stats-premium").forEach((grid) => {
    if (!grid.classList.contains("reveal") && !grid.classList.contains("reveal-stagger")) {
      grid.classList.add("reveal-stagger");
    }
  });
  // re-observe newly tagged stagger grids
  document.querySelectorAll(".reveal-stagger:not(.is-in)").forEach((el) => {
    if ("IntersectionObserver" in window) {
      const io2 = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io2.unobserve(e.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
      );
      io2.observe(el);
    } else {
      el.classList.add("is-in");
    }
  });

  /* Topic pills — explanations */
  const topics = {
    fbo: {
      title: "FBO / FBS",
      html: `
        <p><strong>FBO</strong> (Fulfillment by Operator / площадка) — товар хранится и отгружается со склада маркетплейса. Мы готовим партию: упаковка, маркировка, комплектность — и отправляем на склад площадки.</p>
        <p><strong>FBS</strong> (Fulfillment by Seller) — заказ приходит на наш склад, мы комплектуем и отгружаем уже под конкретный заказ клиента площадки.</p>
        <p>Работаем с ведущими маркетплейсами России. Схема и объём — под ваш бренд и задачу.</p>
      `,
    },
    cz: {
      title: "«Честный Знак»",
      html: `
        <p>Государственная система маркировки товаров. Для ряда категорий (одежда, обувь, молочка, вода и др.) без кодов Data Matrix товар нельзя легально продавать.</p>
        <p>Мы закрываем <strong>полный цикл</strong>: нанесение, считывание, отчётность и подготовка к приёмке на маркетплейсах — без «дыр» в цепочке.</p>
      `,
    },
    fleet: {
      title: "Свой автопарк",
      html: `
        <p>После упаковки доставляем своим транспортом — на склады маркетплейсов и по запросу в регионы. Не зависим от «свободных машин» сторонних перевозчиков в пиковые дни.</p>
        <div class="topic-fleet">
          <img src="media/fleet/scania-1.jpg" alt="Грузовик Scania" loading="lazy" />
          <img src="media/fleet/scania-2.jpg" alt="Автопарк Scania" loading="lazy" />
        </div>
      `,
    },
    shifts: {
      title: "Круглосуточно · 24/7",
      html: `
        <p>Работаем <strong>круглосуточно (24/7)</strong> — две смены, дневная и ночная, без «конца рабочего дня».</p>
        <p>Крупные партии, срочные отгрузки и подготовка к слотам маркетплейсов идут непрерывно. Меньше простоев, стабильнее сроки при росте объёма.</p>
      `,
    },
    thermo: {
      title: "Термотоннели",
      html: `
        <p>Собственное оборудование для термоусадки плёнки. Товар фиксируется плотно, аккуратно и единообразно — меньше боя, пыли и претензий на приёмке.</p>
        <p>Подходит для групповой упаковки и подготовки партий под FBO/FBS. Материалы подбираем под категорию.</p>
      `,
    },
  };

  const modal = document.getElementById("topic-modal");
  const topicTitle = document.getElementById("topic-title");
  const topicBody = document.getElementById("topic-body");

  function openTopic(key) {
    const data = topics[key];
    if (!data || !modal || !topicTitle || !topicBody) return;
    topicTitle.textContent = data.title;
    topicBody.innerHTML = data.html;
    modal.hidden = false;
    document.body.classList.add("topic-open");
    const closeBtn = modal.querySelector(".topic-modal__close");
    if (closeBtn) closeBtn.focus();
  }

  function closeTopic() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove("topic-open");
  }

  document.querySelectorAll("[data-topic]").forEach((btn) => {
    btn.addEventListener("click", () => openTopic(btn.getAttribute("data-topic")));
  });
  document.querySelectorAll("[data-close-topic]").forEach((el) => {
    el.addEventListener("click", closeTopic);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal && !modal.hidden) closeTopic();
  });

  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      if (String(fd.get("company") || "").trim()) return;

      const payload = {
        legal: String(fd.get("legal") || fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        email: String(fd.get("email") || "").trim(),
        category: String(fd.get("category") || "").trim(),
        message: String(fd.get("message") || "").trim(),
        page: location.pathname,
        source: form.getAttribute("data-source") || "site",
        timestamp: new Date().toISOString(),
      };

      if (!payload.legal || !payload.phone) {
        alert("Укажите юридическое лицо и телефон.");
        return;
      }
      if (form.querySelector('[name="email"]') && !payload.email) {
        alert("Укажите email.");
        return;
      }
      if (form.querySelector('[name="category"]') && !payload.category) {
        alert("Укажите категорию товаров.");
        return;
      }
      if (!fd.get("consent")) {
        alert("Нужно согласие на обработку персональных данных.");
        return;
      }

      console.log("[lead]", payload);
      try {
        const stored = JSON.parse(localStorage.getItem("ud_leads") || "[]");
        stored.push(payload);
        localStorage.setItem("ud_leads", JSON.stringify(stored.slice(-50)));
      } catch (_) {}

      const success = form.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
        success.textContent =
          "Заявка принята. Мы свяжемся с вами для индивидуального расчёта. Также можно позвонить: +7 (495) 255-01-31";
      }

      const mailto = form.getAttribute("data-mailto");
      if (mailto) {
        const subject = encodeURIComponent("Заявка на фулфилмент — Успешное Дело");
        const body = encodeURIComponent(
          `Юрлицо / бренд: ${payload.legal}\nТелефон: ${payload.phone}\nEmail: ${payload.email}\nКатегория: ${payload.category}\n\nКомментарий:\n${payload.message}`
        );
        // delay so user sees success
        setTimeout(() => {
          window.location.href = `mailto:${mailto}?subject=${subject}&body=${body}`;
        }, 400);
      }

      form.reset();
    });
  });
})();
