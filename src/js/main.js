/**
 * Fulfillment site — UI helpers + lead form
 * Lead channel: see content/leads.md and content/site.json
 */
(function () {
  const YEAR = document.querySelectorAll("[data-year]");
  YEAR.forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // Mobile nav not needed yet (simple header)

  // Lead forms
  document.querySelectorAll("[data-lead-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        name: String(fd.get("name") || "").trim(),
        phone: String(fd.get("phone") || "").trim(),
        telegram: String(fd.get("telegram") || "").trim(),
        message: String(fd.get("message") || "").trim(),
        page: location.pathname + location.hash,
        source: form.getAttribute("data-source") || "site",
        timestamp: new Date().toISOString(),
      };

      if (!payload.name || !payload.phone) {
        alert("Укажите имя и телефон.");
        return;
      }

      if (!fd.get("consent")) {
        alert("Нужно согласие на обработку персональных данных.");
        return;
      }

      // MVP: log + optional mailto. Replace with Telegram/CRM later.
      console.log("[lead]", payload);

      try {
        const stored = JSON.parse(localStorage.getItem("ff_leads") || "[]");
        stored.push(payload);
        localStorage.setItem("ff_leads", JSON.stringify(stored));
      } catch (_) {
        /* ignore */
      }

      const success = form.querySelector(".form-success");
      if (success) {
        success.classList.add("is-visible");
        success.textContent =
          "Заявка сохранена локально (демо). Подключите Telegram/CRM — см. content/leads.md";
      }

      form.reset();

      // Optional: open mailto if data-mailto on form
      const mailto = form.getAttribute("data-mailto");
      if (mailto) {
        const subject = encodeURIComponent("Смета с сайта");
        const body = encodeURIComponent(
          `Имя: ${payload.name}\nТелефон: ${payload.phone}\nTelegram: ${payload.telegram}\n\nТЗ:\n${payload.message}`
        );
        window.location.href = `mailto:${mailto}?subject=${subject}&body=${body}`;
      }
    });
  });

  // Calculator wizard
  const wizard = document.querySelector("[data-wizard]");
  if (wizard) {
    const panels = [...wizard.querySelectorAll(".wizard-panel")];
    const dots = [...wizard.querySelectorAll("[data-wizard-dot]")];
    let step = 0;

    const show = (i) => {
      step = Math.max(0, Math.min(panels.length - 1, i));
      panels.forEach((p, idx) => p.classList.toggle("active", idx === step));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === step));
    };

    wizard.querySelectorAll("[data-wizard-next]").forEach((btn) => {
      btn.addEventListener("click", () => show(step + 1));
    });
    wizard.querySelectorAll("[data-wizard-prev]").forEach((btn) => {
      btn.addEventListener("click", () => show(step - 1));
    });

    show(0);

    // Collect wizard answers into final message field
    const syncMessage = () => {
      const mp = wizard.querySelector('[name="mp"]')?.value || "";
      const scheme = wizard.querySelector('[name="scheme"]')?.value || "";
      const units = wizard.querySelector('[name="units"]')?.value || "";
      const category = wizard.querySelector('[name="category"]')?.value || "";
      const labels = wizard.querySelector('[name="labels"]')?.value || "";
      const pack = wizard.querySelector('[name="pack"]')?.value || "";
      const pickup = wizard.querySelector('[name="pickup"]')?.value || "";
      const extra = wizard.querySelector('[name="extra"]')?.value || "";
      const msg = wizard.querySelector('[name="message"]');
      if (!msg) return;
      msg.value = [
        `МП: ${mp}`,
        `Схема: ${scheme}`,
        `Кол-во: ${units}`,
        `Категория: ${category}`,
        `Маркировка: ${labels}`,
        `Упаковка: ${pack}`,
        `Забор: ${pickup}`,
        extra ? `Дополнительно: ${extra}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    };

    wizard.querySelectorAll("input, select, textarea").forEach((el) => {
      el.addEventListener("change", syncMessage);
      el.addEventListener("input", syncMessage);
    });
  }
})();
