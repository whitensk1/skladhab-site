/**
 * СкладХаб — UI, lead form, wizard, mobile nav
 */
(function () {
  "use strict";

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Mobile nav
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

  // Reveal on scroll
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Lead forms
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      // honeypot
      if (String(fd.get("company") || "").trim()) {
        return;
      }

      const wizardBits = collectWizard(form);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        telegram: String(fd.get("telegram") || "").trim(),
        message: String(fd.get("message") || "").trim(),
        page: location.pathname + location.hash,
        source: form.getAttribute("data-source") || "site",
        wizard: wizardBits,
        timestamp: new Date().toISOString(),
        utm: getUtm(),
      };

      if (!payload.name || !payload.phone) {
        alert("Укажите имя и телефон.");
        return;
      }
      if (!fd.get("consent")) {
        alert("Нужно согласие на обработку персональных данных.");
        return;
      }

      // Compose full message body for managers
      const fullMessage = [
        payload.message,
        wizardBits ? "\n— Мастер —\n" + wizardBits : "",
      ]
        .join("")
        .trim();

      console.log("[lead]", { ...payload, message: fullMessage });

      try {
        const stored = JSON.parse(localStorage.getItem("skladhab_leads") || "[]");
        stored.push({ ...payload, message: fullMessage });
        localStorage.setItem("skladhab_leads", JSON.stringify(stored.slice(-50)));
      } catch (_) {
        /* ignore */
      }

      const success = form.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
        success.textContent =
          "Заявка принята (сохранена локально). Подключите Telegram/CRM — см. content/leads.md";
      }

      // Optional mailto
      const mailto = form.getAttribute("data-mailto");
      if (mailto) {
        const subject = encodeURIComponent("Смета с сайта СкладХаб");
        const body = encodeURIComponent(
          `Имя: ${payload.name}\nТелефон: ${payload.phone}\nTelegram: ${payload.telegram}\n\nТЗ:\n${fullMessage}`
        );
        window.open(`mailto:${mailto}?subject=${subject}&body=${body}`, "_self");
      }

      form.reset();
    });
  });

  function collectWizard(form) {
    const parts = [];
    const mp = form.querySelector('input[name="mp"]:checked');
    const scheme = form.querySelector('input[name="scheme"]:checked');
    const units = form.querySelector('[name="units"]');
    const category = form.querySelector('[name="category"]');
    const pack = form.querySelector('[name="pack"]');
    const pickup = form.querySelector('input[name="pickup"]:checked');
    const pickupZone = form.querySelector('[name="pickupZone"]');
    const ops = [...form.querySelectorAll('input[name="ops"]:checked')].map((el) => el.value);

    if (mp) parts.push("МП: " + mp.value);
    if (scheme) parts.push("Схема: " + scheme.value);
    if (units && units.value) parts.push("Ед.: " + units.value);
    if (category && category.value) parts.push("Категория: " + category.value);
    if (ops.length) parts.push("Операции: " + ops.join(", "));
    if (pack && pack.value) parts.push("Упаковка: " + pack.value);
    if (pickup) parts.push("Забор: " + pickup.value);
    if (pickupZone && pickupZone.value) parts.push("Зона: " + pickupZone.value);
    return parts.join("\n");
  }

  function getUtm() {
    try {
      const u = new URLSearchParams(location.search);
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
      const o = {};
      keys.forEach((k) => {
        if (u.get(k)) o[k] = u.get(k);
      });
      return o;
    } catch (_) {
      return {};
    }
  }

  // Wizard
  const wizard = document.querySelector("[data-wizard]");
  if (wizard) {
    const panels = [...wizard.querySelectorAll(".wizard-panel")];
    const dots = [...wizard.querySelectorAll("[data-wizard-dot]")];
    let step = 0;

    const show = (i) => {
      step = Math.max(0, Math.min(panels.length - 1, i));
      panels.forEach((p, idx) => p.classList.toggle("active", idx === step));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === step));
      wizard.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    wizard.querySelectorAll("[data-wizard-next]").forEach((btn) => {
      btn.addEventListener("click", () => show(step + 1));
    });
    wizard.querySelectorAll("[data-wizard-prev]").forEach((btn) => {
      btn.addEventListener("click", () => show(step - 1));
    });
  }
})();
