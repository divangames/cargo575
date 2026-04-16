# Виджет просмотров для LPMotor (безопасно через GitHub)

Минималистичный виджет показывает:
- просмотры из Яндекс.Метрики
- дату (вручную или автоматически из `updatedAt` JSON)

Токен Яндекс.Метрики не хранится в HTML виджете.

## Что лежит в проекте

- `lpmotor-metrika-widget.html` — код для вставки в LPMotor
- `scripts/update-metrika-views.mjs` — скрипт получения просмотров из Метрики
- `.github/workflows/update-metrika-views.yml` — автообновление JSON в GitHub Actions
- `data/metrika-views.json` — публичные данные для виджета

## Как это работает

1. GitHub Action запускается по расписанию.
2. Скрипт берет просмотры из Яндекс.Метрики через OAuth.
3. Скрипт обновляет `data/metrika-views.json`.
4. Виджет в LPMotor читает только этот JSON.

Итог: токен хранится только в `GitHub Secrets`.

## Пошаговая настройка

### 1) Подготовьте репозиторий

Загрузите файлы проекта в репозиторий GitHub.

### 2) Добавьте Secrets в GitHub

Откройте:
`Repository -> Settings -> Secrets and variables -> Actions -> New repository secret`

Создайте:
- `METRIKA_COUNTER_ID` — ID счетчика Метрики
- `METRIKA_OAUTH_TOKEN` — OAuth токен Яндекса
- `METRIKA_PAGE_URLS` — список URL страниц (через запятую или с новой строки)
- `METRIKA_PAGE_URL` — опционально, для старого режима с одной страницей

### 3) Запустите обновление

Откройте вкладку `Actions`, выберите workflow `Update Metrika Views`, нажмите `Run workflow`.

После запуска проверьте, что обновился файл `data/metrika-views.json`.
В новом режиме в JSON появляется `viewsByPage` с просмотрами по каждой странице.

### 4) Подставьте ссылку в виджет

В `lpmotor-metrika-widget.html` проверьте значение `dataUrl`.
Оно должно указывать на ваш raw URL:

`https://raw.githubusercontent.com/<username>/<repo>/<branch>/data/metrika-views.json`

Также в `config` укажите:
- `pageUrl` — URL страницы, для которой стоит этот виджет

Важно: `config.pageUrl` должен быть одним из URL из `METRIKA_PAGE_URLS`.
Если не совпадает, виджет покажет `н/д`.

### 5) Вставьте виджет в LPMotor

Скопируйте содержимое `lpmotor-metrika-widget.html` в HTML-блок страницы и опубликуйте.

### Если LPMotor режет script

Используйте iframe-режим:

1. Включите GitHub Pages для репозитория (`Settings -> Pages -> Deploy from branch`).
2. Убедитесь, что файл `widget-runtime.html` доступен по URL:
   `https://<username>.github.io/<repo>/widget-runtime.html`
3. Откройте `lpmotor-iframe-embed.html` и замените:
   - `USERNAME` / `REPO`
   - `dataUrl` на ваш raw JSON
   - `pageUrl` на URL текущей страницы (например `https://575cargo.ru/blog`)
4. Вставьте содержимое `lpmotor-iframe-embed.html` в LPMotor вместо скриптового виджета.

## Настройка внешнего вида (минимализм)

Все настройки в `config.ui`:

- `fontFamily` — шрифт
- `fontSize` — размер текста
- `fontWeight` — общий вес текста
- `labelWeight` / `valueWeight` — веса подписи и значения
- `iconSize` — размер иконок
- `gap` / `itemGap` — расстояния
- `align` — `left | center | right`
- `width` — обычно `100%` или `auto`
- `labelColor` / `valueColor` / `dividerColor`
- `showDivider` — показывать или скрывать разделитель

## Настройка даты

- `manualDate` — дата, заданная вручную
- `useJsonUpdatedDate: true` — использовать дату `updatedAt` из JSON автоматически

Если хотите всегда вручную, поставьте:

`useJsonUpdatedDate: false`

## Если захотите добавить новую механику

Рекомендуемый порядок (безопасно):

1. Добавить поле в `data/metrika-views.json`
2. Обновить `scripts/update-metrika-views.mjs` для записи этого поля
3. При необходимости расширить `lpmotor-metrika-widget.html`
4. Проверить обновление через `Run workflow`

Примеры механик:
- показывать `visits` вместе с `views`
- выводить текст "обновлено N минут назад"
- отдельные показатели по периодам (`today`, `7days`, `30days`)

## Важно по безопасности

- Никогда не вставляйте OAuth-токен в `lpmotor-metrika-widget.html`.
- Храните токен только в `GitHub Secrets`.
- Если токен хоть раз попал в клиентский код, перевыпустите его.
