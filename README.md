# Множители Лагранжа

Одна интерактивная русскоязычная статья о геометрии условного экстремума. Три сцены: поверхность и ограничение, касательная компонента градиента, несколько экстремумов на окружности.

Публичный адрес: https://michael-malis.github.io/lagrange-multipliers/ (статус проверки — `docs/PROGRESS.md`).

## Разработка

Node.js 22.12+ (CI: Node 24), npm.

```sh
npm ci
npm run dev
npm test
npx playwright install chromium
npm run build
npm run test:browser
```

Сборка создаёт только `dist/index.html`. Откройте его двойным щелчком: сеть и локальный сервер не нужны. JavaScript, CSS и шрифты KaTeX включены в HTML. При отсутствии WebGL доступны резервные SVG, формулы и управление профилем.

## Публикация и проверка

Push в `main` запускает `.github/workflows/deploy.yml`: установка, математические тесты, сборка, браузерная проверка offline-файла, GitHub Pages и проверка публичной версии. Источник Pages — GitHub Actions. `dist/` не хранится в Git.

```sh
npm run test:public
```

`docs/SPEC.md` — требования; `CODEX_MASTER_PROMPT.md` — порядок работы; `docs/PROGRESS.md` — фактические результаты; `docs/ACCEPTANCE.md` — приёмка. Сценарий в `docs/RUN_OF_SHOW.md` рассчитан на 18 минут плюс 2 минуты резерва. Реальное время и понимание требуют пробного объяснения с человеком.
