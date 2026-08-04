/**
 * Заявки: Telegram/mailto + Яндекс SmartCaptcha («Я не робот»)
 * ────────────────────────────────────────────────────────────
 * Без Formspree и Google. Данные уходят только через TG/почту
 * на устройстве пользователя.
 *
 * SmartCaptcha (Yandex Cloud, РФ):
 * 1) https://console.yandex.cloud → SmartCaptcha → Создать капчу
 * 2) Домены: github.io, ваш домен, localhost
 * 3) Основное задание: «Чекбокс» / «Я не робот» (как в настройках)
 * 4) Ключ клиента → smartCaptchaClientKey ниже (можно в GitHub)
 * 5) Ключ сервера — НЕ вставлять в сайт (нужен только если позже
 *    сделаете свой backend на РФ-хостинге)
 *
 * Пока client key пустой — показывается простая арифметика.
 */
window.UD_LEADS = {
  delivery: "both",
  telegramUser: "anton111289",
  smartCaptchaClientKey: "ysc1_mhYnFzfFPGYjQ421CVprBQd4v2lDLp7R8bQPSWCe48c82fd0",
};
