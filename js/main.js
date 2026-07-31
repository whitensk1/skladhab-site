/**
 * Успешное Дело — light site UI + lead form
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  /* Soft, slow hero warehouse atmosphere */
  document.querySelectorAll(".hero-bg-video").forEach((video) => {
    try {
      video.playbackRate = 0.35;
      video.defaultPlaybackRate = 0.35;
      const slow = () => {
        video.playbackRate = 0.35;
      };
      video.addEventListener("play", slow);
      video.addEventListener("loadeddata", slow);
      if (video.readyState >= 2) slow();
    } catch (_) {}
  });

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

  const reveals = document.querySelectorAll(".reveal");
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
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

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
          <img src="media/fleet/van-1.jpg" alt="Автопарк DLUCK" loading="lazy" />
          <img src="media/fleet/fleet.jpg" alt="Транспорт компании" loading="lazy" />
        </div>
      `,
    },
    shifts: {
      title: "Две смены",
      html: `
        <p><strong>Дневная и ночная</strong> смены — непрерывный операционный ритм. Крупные партии, срочные отгрузки и подготовка к слотам маркетплейсов не упираются в «конец рабочего дня».</p>
        <p>Это снижает простои и помогает держать сроки, когда объём растёт.</p>
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
