/**
 * Заявки без Formspree / Google / США
 * ────────────────────────────────────
 * Данные НЕ уходят на иностранный form-backend.
 * После «Отправить» открывается Telegram (и при желании почтовый клиент)
 * уже на устройстве пользователя — вы получаете сообщение напрямую.
 *
 * delivery:
 *   "telegram" — только Telegram
 *   "mailto"   — только письмо через почтовый клиент
 *   "both"     — сначала Telegram, затем mailto (по умолчанию)
 *
 * telegramUser — username без @ (чат с менеджером)
 */
window.UD_LEADS = {
  delivery: "both",
  telegramUser: "anton111289",
};
