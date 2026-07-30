# СкладХаб — сайт фулфилмента (Москва)

Маркетинговый сайт **фулфилмента для Wildberries и Ozon**: приёмка → маркировка → упаковка → FBO/FBS → смета.

Референсы концепции: ffspace.ru, willbedone.pro.  
Алгоритм: `docs/SITE-BUILD-MASTER-PROMPT.md`.  
Незакрытые вопросы: `OPEN-QUESTIONS.md`.

---

## Быстрый просмотр

```bash
cd "/Volumes/SSD 250/Grok Agent/fulfillment-site"
python3 -m http.server 8080
```

Открыть: http://127.0.0.1:8080/

---

## Страницы

| URL | Назначение |
|-----|------------|
| `/` | Конверсионный лендинг |
| `/price.html` | Структура прайса (₽ — по запросу / TBD) |
| `/calculator.html` | Мастер заявки (6 шагов, без live-₽) |
| `/contacts.html` | Контакты-плейсхолдеры |
| `/privacy.html` | Политика ПДн |

---

## Контент

- `content/site.json` — бренд, метрики, фичи  
- `content/price.json` — таблица услуг (цены null до Q-04)  
- `content/faq.json`, `scenarios.json`, `leads.md`

**Нельзя** подставлять чужие цены с конкурентов.

---

## Бренд

Временное имя: **СкладХаб** (до Q-01). Замените в `site.json` и HTML.

---

## Лиды

Сейчас: `console` + `localStorage` (`skladhab_leads`).  
Бой: Telegram Bot / CRM — `content/leads.md`.

---

## GitHub Pages

1. Создать репозиторий, push `main`.  
2. Settings → Pages → Deploy from branch `main` / root.  
3. Домен — в `CNAME` при наличии.

---

## DoD MVP

- [x] Hero + услуги + процесс + FAQ + форма  
- [x] /price структура без фейковых ₽  
- [x] Мастер заявки  
- [x] Privacy  
- [x] Mobile sticky CTA  
- [ ] Реальные контакты, прайс, фото склада  
- [ ] Telegram webhook  
