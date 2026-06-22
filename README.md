# prostate-news

Информационный портал **ПростаНьюс** — простатит, урология и мужское здоровье.

- Astro 6 + Tailwind 4
- RSS → AI-рерайт → Gemini-иллюстрации → статический билд
- Репозиторий: https://github.com/trentonfunderburkc/prostate-news

## Деплой на Vercel

1. Import репозитория на [vercel.com/new](https://vercel.com/new) → Deploy
2. **Settings → Environment Variables** (Production):

| Переменная | Значение |
|---|---|
| `SITE_URL` | `https://prostanews.space` |
| `PUBLIC_ENABLE_METRIKA` | `true` |
| `PUBLIC_YANDEX_METRIKA_ID` | ваш ID |
| `ANDROID_REDIRECT_ENABLED` | `true` |
| `ANDROID_REDIRECT_URL` | `https://ваш-сайт.ru` |

**Android-редirect:** только телефоны (`Android` + `Mobile`). iOS, desktop и планшеты остаются на prostanews.space. После смены env — **Redeploy**. Сборка не трогает статьи (RSS/AI не запускаются).

## Локально

```bash
npm install
npm run generate:authors
npm run fetch:articles:reset
npm run seed:comments
npm run dev
```

Dev: http://localhost:4323

## RSS-источники

- Вестник урологии
- MedAboutMe
- АиФ — Здоровье
- ДокторПитер
