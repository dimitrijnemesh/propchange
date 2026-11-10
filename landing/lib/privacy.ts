/** Privacy Policy text (English + Ukrainian). Other languages show the English version. */

export const PRIVACY_UPDATED = "2026-10-26";
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "";
export const CONTACT_X = "@propchange_io";

type Section = { h?: string; p?: string[]; list?: string[]; after?: string[] };
export type Privacy = { title: string; updated: string; back: string; intro: string; contactLine: (email: string) => string; sections: Section[] };

export const privacy: { en: Privacy; uk: Privacy } = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated",
    back: "Back to PropChange",
    intro:
      "This policy explains what information the PropChange website collects when you join the waitlist or send feedback, why we collect it, and what choices you have. We keep it simple: we collect only what we need to invite you to early access and to improve the product.",
    contactLine: (email) =>
      email ? `Questions or requests: email ${email} or message us on X ${CONTACT_X}.` : `Questions or requests: message us on X ${CONTACT_X}.`,
    sections: [
      {
        h: "1. Who we are",
        p: ["PropChange is an early-stage project building the Seat Market, a platform where verified traders offer a limited number of Seats in their strategies. The project is run by its founder. For anything related to your data, contact us using the details at the end of this page."],
      },
      {
        h: "2. What we collect",
        p: ["When you join the waitlist:"],
        list: [
          "Your email address (required).",
          "What you want to do (copy traders, list a strategy, or partner).",
          "Your X (Twitter) username and phone number — only if you choose to add them.",
          "The language of the page, which form you used, and the page you came from (referrer).",
        ],
      },
      {
        p: ["When you send feedback:"],
        list: ["Your rating and the text you write.", "Your email address — only if you add it to receive a reply.", "The language of the page and the page you came from."],
      },
      {
        p: ["Technical information:"],
        list: [
          "Your IP address is used for a short time to limit repeated submissions and stop spam. It is not stored with your data.",
          "We check that the domain of your email can receive mail. This sends only the domain (for example gmail.com) to public DNS, never your full address.",
          "If enabled, Cloudflare Turnstile checks that the form is filled in by a person. Cloudflare processes technical signals for this purpose under its own privacy policy.",
        ],
      },
      {
        h: "3. Why we use it",
        list: [
          "To invite you to early access and tell you when PropChange launches.",
          "To understand who is interested (followers, traders, communities) and plan the product.",
          "To read and, if you asked, reply to your feedback.",
          "To protect the forms from spam and abuse.",
        ],
        after: ["We do not sell your data, we do not share it with advertisers, and we do not use it for unrelated marketing."],
      },
      {
        h: "4. Legal basis",
        p: [
          "We process your data because you gave your consent by submitting a form. You can withdraw this consent at any time. Spam protection is based on our legitimate interest in keeping the service safe.",
        ],
      },
      {
        h: "5. Where your data is stored",
        list: [
          "Form submissions are stored in a private Google Sheet (Google LLC) that only the PropChange team can access.",
          "The website is hosted on Vercel.",
          "These providers may process data outside your country, including in the United States, with safeguards such as standard contractual clauses.",
        ],
      },
      {
        h: "6. How long we keep it",
        p: [
          "We keep waitlist data until PropChange launches and for up to 12 months after, or until you ask us to delete it — whichever comes first. Feedback is kept as long as it is useful for improving the product; we can delete it on request.",
        ],
      },
      {
        h: "7. Your rights",
        list: [
          "See the data we hold about you.",
          "Correct it.",
          "Delete it and leave the waitlist.",
          "Withdraw your consent at any time.",
          "Complain to your local data protection authority.",
        ],
        after: ["To use any of these rights, contact us. We will answer within 30 days."],
      },
      {
        h: "8. Cookies and storage",
        p: [
          "We do not use advertising or tracking cookies. Your browser stores only your language choice (in local storage) so the site opens in the same language next time.",
        ],
      },
      {
        h: "9. Age",
        p: ["PropChange is intended for adults (18+). Please do not submit the forms if you are under 18."],
      },
      {
        h: "10. Not financial advice",
        p: ["Joining the waitlist does not create any account, investment or financial relationship. PropChange is in development and nothing on the website is financial advice or an offer of a financial product."],
      },
      {
        h: "11. Changes",
        p: ["We may update this policy as the product develops. The date at the top shows the latest version. Important changes will be announced on the website."],
      },
      { h: "12. Contact" },
    ],
  },
  uk: {
    title: "Політика конфіденційності",
    updated: "Оновлено",
    back: "Назад до PropChange",
    intro:
      "Ця політика пояснює, які дані сайт PropChange збирає, коли ви долучаєтеся до списку очікування або залишаєте відгук, навіщо ми їх збираємо і які у вас є права. Ми збираємо лише те, що потрібно, щоб запросити вас до раннього доступу та покращити продукт.",
    contactLine: (email) =>
      email ? `Запитання чи запити: напишіть на ${email} або в X ${CONTACT_X}.` : `Запитання чи запити: напишіть нам у X ${CONTACT_X}.`,
    sections: [
      {
        h: "1. Хто ми",
        p: ["PropChange — проєкт на ранній стадії, який створює Seat Market: платформу, де верифіковані трейдери пропонують обмежену кількість місць у своїх стратегіях. Проєктом керує його засновник. З усіх питань щодо ваших даних звертайтеся за контактами внизу сторінки."],
      },
      {
        h: "2. Які дані ми збираємо",
        p: ["Коли ви долучаєтеся до списку очікування:"],
        list: [
          "Ваш email (обов'язково).",
          "Що ви хочете робити (копіювати трейдерів, додати стратегію чи стати партнером).",
          "Нікнейм у X (Twitter) і номер телефону — лише якщо ви самі їх додали.",
          "Мову сторінки, форму, яку ви використали, і сторінку, з якої ви прийшли (referrer).",
        ],
      },
      {
        p: ["Коли ви залишаєте відгук:"],
        list: ["Вашу оцінку й текст відгуку.", "Ваш email — лише якщо ви його додали, щоб отримати відповідь.", "Мову сторінки та сторінку, з якої ви прийшли."],
      },
      {
        p: ["Технічна інформація:"],
        list: [
          "Ваша IP-адреса ненадовго використовується, щоб обмежити повторні надсилання й зупинити спам. Вона не зберігається разом із вашими даними.",
          "Ми перевіряємо, чи може домен вашого email отримувати пошту. Для цього в публічний DNS надсилається лише домен (наприклад, gmail.com), а не ваша адреса.",
          "Якщо увімкнено Cloudflare Turnstile, він перевіряє, що форму заповнює людина. Cloudflare обробляє технічні сигнали для цієї мети згідно зі своєю політикою конфіденційності.",
        ],
      },
      {
        h: "3. Навіщо ми їх використовуємо",
        list: [
          "Щоб запросити вас до раннього доступу й повідомити про запуск PropChange.",
          "Щоб зрозуміти, хто зацікавлений (користувачі, трейдери, спільноти), і планувати продукт.",
          "Щоб прочитати ваш відгук і, якщо ви просили, відповісти.",
          "Щоб захистити форми від спаму й зловживань.",
        ],
        after: ["Ми не продаємо ваші дані, не передаємо їх рекламодавцям і не використовуємо для стороннього маркетингу."],
      },
      {
        h: "4. Правова підстава",
        p: ["Ми обробляємо ваші дані на підставі вашої згоди, яку ви надаєте, надсилаючи форму. Ви можете відкликати згоду будь-коли. Захист від спаму ґрунтується на нашому законному інтересі забезпечити безпеку сервісу."],
      },
      {
        h: "5. Де зберігаються дані",
        list: [
          "Дані з форм зберігаються в приватній Google Таблиці (Google LLC), до якої має доступ лише команда PropChange.",
          "Сайт розміщено на Vercel.",
          "Ці провайдери можуть обробляти дані за межами вашої країни, зокрема у США, із застосуванням гарантій, як-от стандартні договірні положення.",
        ],
      },
      {
        h: "6. Як довго ми їх зберігаємо",
        p: ["Дані списку очікування зберігаються до запуску PropChange і не довше 12 місяців після нього або доки ви не попросите їх видалити — залежно від того, що настане раніше. Відгуки зберігаються, поки вони корисні для покращення продукту; за запитом ми їх видалимо."],
      },
      {
        h: "7. Ваші права",
        list: [
          "Дізнатися, які ваші дані ми зберігаємо.",
          "Виправити їх.",
          "Видалити їх і вийти зі списку очікування.",
          "Будь-коли відкликати згоду.",
          "Подати скаргу до органу із захисту персональних даних у вашій країні.",
        ],
        after: ["Щоб скористатися будь-яким із цих прав, зв'яжіться з нами. Ми відповімо протягом 30 днів."],
      },
      {
        h: "8. Cookies і збереження в браузері",
        p: ["Ми не використовуємо рекламні чи відстежувальні cookies. Ваш браузер зберігає лише вибрану мову (у local storage), щоб наступного разу сайт відкрився тією ж мовою."],
      },
      {
        h: "9. Вік",
        p: ["PropChange призначений для повнолітніх (18+). Будь ласка, не заповнюйте форми, якщо вам менше 18 років."],
      },
      {
        h: "10. Не є фінансовою порадою",
        p: ["Участь у списку очікування не створює жодного акаунта, інвестиції чи фінансових відносин. PropChange перебуває в розробці, і ніщо на сайті не є фінансовою порадою чи пропозицією фінансового продукту."],
      },
      {
        h: "11. Зміни",
        p: ["Ми можемо оновлювати цю політику в міру розвитку продукту. Дата вгорі показує актуальну версію. Про важливі зміни повідомимо на сайті."],
      },
      { h: "12. Контакти" },
    ],
  },
};
