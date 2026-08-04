/**
 * Успешное Дело — light site UI + lead form
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Next-panel peeks: oval label at bottom naming the block below (not clickable) */
  (function panelNextLabels() {
    document.querySelectorAll("[data-panel][data-next]").forEach((panel) => {
      const label = String(panel.getAttribute("data-next") || "").trim();
      if (!label) return;
      const el = document.createElement("div");
      el.className = "panel-next";
      el.setAttribute("aria-hidden", "true");
      el.textContent = label;
      panel.appendChild(el);
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
    window.addEventListener("scroll", sync, { passive: true });
    sync();
  })();

  /* Partners marquee: finger/mouse drag + continuous auto-scroll left */
  (function partnersMarquee() {
    const marquee = document.querySelector(".marquee");
    const track = document.querySelector(".marquee-track");
    if (!marquee || !track) return;

    let offset = 0;
    let half = 0;
    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let vel = 0;
    let raf = 0;
    const autoSpeed = 0.55; /* px per frame ≈ leftward */
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
      if (!dragging) {
        if (!reduced) offset -= autoSpeed;
        if (Math.abs(vel) > 0.15) {
          offset += vel;
          vel *= 0.92;
        } else {
          vel = 0;
        }
        apply();
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", () => {
      measure();
      apply();
    });
    track.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure, { once: true });
    });

    const onPointerDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      pointerId = e.pointerId;
      lastX = e.clientX;
      vel = 0;
      marquee.classList.add("is-dragging");
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
    };

    marquee.addEventListener("pointerdown", onPointerDown);
    marquee.addEventListener("pointermove", onPointerMove);
    marquee.addEventListener("pointerup", onPointerUp);
    marquee.addEventListener("pointercancel", onPointerUp);
    marquee.addEventListener("lostpointercapture", onPointerUp);

    /* Prevent image drag-ghost / text selection interfering with swipe */
    marquee.addEventListener("dragstart", (e) => e.preventDefault());

    apply();
    raf = requestAnimationFrame(tick);

    /* cleanup not required on static page unload */
    void raf;
  })();

  /* Floating up/down — jump between full page panels */
  (function panelNav() {
    const panels = Array.from(document.querySelectorAll("[data-panel]"));
    const prevBtn = document.querySelector("[data-panel-prev]");
    const nextBtn = document.querySelector("[data-panel-next]");
    if (!panels.length || !prevBtn || !nextBtn) return;

    const getIndex = () => {
      const mid = window.innerHeight * 0.35;
      let best = 0;
      let bestDist = Infinity;
      panels.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top - mid * 0.15);
        // prefer section whose top is near/above viewport top
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
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const sync = () => {
      const i = getIndex();
      prevBtn.disabled = i <= 0;
      nextBtn.disabled = i >= panels.length - 1;
      prevBtn.classList.toggle("is-disabled", i <= 0);
      nextBtn.classList.toggle("is-disabled", i >= panels.length - 1);
    };

    prevBtn.addEventListener("click", () => go(-1));
    nextBtn.addEventListener("click", () => go(1));
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
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
