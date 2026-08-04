/**
 * Заявки: Formspree + Google reCAPTCHA v2
 * ─────────────────────────────────────────
 * Секрет reCAPTCHA кладётся в кабинет Formspree, НЕ в GitHub.
 * Site key и endpoint формы — ниже (это «публичные» значения).
 *
 * Настройка (один раз, ~10 минут):
 *
 * 1) Formspree — https://formspree.io
 *    · New Form → укажите почту, куда слать заявки
 *    · скопируйте endpoint вида https://formspree.io/f/xxxxxxxx
 *    · вставьте в formspreeEndpoint ниже
 *
 * 2) reCAPTCHA v2 — https://www.google.com/recaptcha/admin
 *    · тип: «Checkbox» (v2)
 *    · домены: ваш сайт + localhost (для теста)
 *    · Site key → recaptchaSiteKey ниже
 *    · Secret key → Formspree → ваша форма → Settings → reCAPTCHA
 *      (или Spam Filtering → Google reCAPTCHA) — вставить Secret
 *
 * 3) Закоммитьте только этот файл с endpoint + site key (secret — нет!).
 * 4) Hard-refresh сайта, отправьте тестовую заявку.
 *
 * Пока оба поля пустые — форма работает по-старому (mailto), без captcha.
 */
window.UD_LEADS = {
  /* Пример: "https://formspree.io/f/xpwzgkya" */
  formspreeEndpoint: "",
  /* Пример: "6Lc................................" */
  recaptchaSiteKey: "",
};
