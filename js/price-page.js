/**
 * Render price categories from content/price.json
 */
(async function () {
  const root = document.getElementById("price-root");
  if (!root) return;

  let data;
  try {
    const res = await fetch("content/price.json", { cache: "no-store" });
    data = await res.json();
  } catch (e) {
    root.innerHTML = "<p class='disclaimer'>Не удалось загрузить content/price.json</p>";
    return;
  }

  const cats = data.categories || {};
  let html = "";

  Object.keys(cats).forEach((key) => {
    const cat = cats[key];
    html += `<h2 class="cat-title">${escapeHtml(cat.title || key)}</h2>`;
    html += `<div class="table-wrap"><table class="price-table"><thead><tr>
      <th>Услуга</th><th>Ед.</th><th>Цена от, ₽</th>
    </tr></thead><tbody>`;
    (cat.items || []).forEach((item) => {
      const price =
        item.priceFrom == null
          ? "<span class='muted'>по запросу</span>"
          : String(item.priceFrom);
      html += `<tr>
        <td>${escapeHtml(item.name || item.id)}</td>
        <td class="muted">${escapeHtml(item.unit || "—")}</td>
        <td>${price}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  });

  if (data.volumeTiers && data.volumeTiers.length) {
    html += `<h2 class="cat-title">Шкала объёма (заготовка)</h2>`;
    html += `<div class="table-wrap"><table class="price-table"><thead><tr>
      <th>От</th><th>До</th><th>₽/ед от</th>
    </tr></thead><tbody>`;
    data.volumeTiers.forEach((t) => {
      html += `<tr>
        <td>${t.from ?? "—"}</td>
        <td>${t.to == null ? "∞" : t.to}</td>
        <td class="muted">${t.pricePerUnitFrom == null ? "TBD" : t.pricePerUnitFrom}</td>
      </tr>`;
    });
    html += `</tbody></table></div>`;
  }

  root.innerHTML = html;

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
