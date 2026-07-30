# Лиды и заявки

## Сейчас (MVP в `src/js/main.js`)

1. Валидация полей формы  
2. Сбор payload: имя, телефон, telegram, message, page, timestamp  
3. Канал по умолчанию: `console.log` + `alert` успеха  
4. Опционально: `mailto:` если в `site.json` указан email  

## Нужно для боя (Q-14)

- [ ] Telegram Bot Token  
- [ ] Chat ID менеджера / группы  
- **или** webhook CRM (amo, Bitrix, …)  
- **или** SMTP / form service (Formspree, etc.)  
- [ ] Текст автоответа  
- [ ] Цель Яндекс.Метрики `lead`  

## Формат сообщения менеджеру

```
🆕 Смета с сайта
Имя: …
Телефон: …
Telegram: …
Страница: …
UTM: …
ТЗ:
…
Время: …
```

## Env (когда появится бэкенд)

```
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Не коммитить токены в git.
