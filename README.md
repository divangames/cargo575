# Виджет просмотров для LPMotor (безопасно через GitHub)

## Быстрая навигация

- [Что лежит в проекте](#что-лежит-в-проекте)
- [Как это работает](#как-это-работает)
- [Пошаговая настройка](#пошаговая-настройка)
- [Если LPMotor режет script](#если-lpmotor-режет-script)
- [Как добавить новую статью: подробно](#как-добавить-новую-статью-подробно)
- [Сценарий 1. Добавить новую статью обычным способом](#сценарий-1-добавить-новую-статью-обычным-способом)
- [Сценарий 2. Добавить новую статью, если LPMotor режет script](#сценарий-2-добавить-новую-статью-если-lpmotor-режет-script)
- [Что делать, если режет и script, и iframe](#что-делать-если-режет-и-script-и-iframe)
- [Самый простой рабочий процесс на будущее](#самый-простой-рабочий-процесс-на-будущее)
- [Настройка внешнего вида](#настройка-внешнего-вида-минимализм)
- [Настройка даты](#настройка-даты)
- [Если захотите добавить новую механику](#если-захотите-добавить-новую-механику)
- [Важно по безопасности](#важно-по-безопасности)

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

## Как добавить новую статью: подробно

Ниже два сценария:

1. Обычный сценарий — если блок LPMotor позволяет вставлять HTML/JS.
2. Сценарий с ограничениями — если LPMotor режет `script`.

### Сценарий 1. Добавить новую статью обычным способом

Используйте этот сценарий только если у вас на нужной странице LPMotor не вырезает `script`.

#### Шаг 1. Опубликуйте новую статью

Сначала создайте и опубликуйте страницу статьи в LPMotor.

Пример URL:

`https://575cargo.ru/novaya-statya`

Важно:
- URL должен быть финальным, без временных адресов
- лучше сразу использовать точный адрес, который останется после публикации

#### Шаг 2. Добавьте URL статьи в GitHub Secrets

Откройте:

`GitHub -> divangames/cargo575 -> Settings -> Secrets and variables -> Actions`

Найдите секрет:

`METRIKA_PAGE_URLS`

И добавьте в него новый URL статьи.

Можно хранить список:
- по одной ссылке в строке
- или через запятую

Пример:

```text
https://575cargo.ru/7-oshibok-pri-rabote-s-dostavkoy-iz-kitaya
https://575cargo.ru/novaya-statya
https://575cargo.ru/eshe-odna-statya
```

Важно:
- не удаляйте старые ссылки, если для них тоже должны считаться просмотры
- новая ссылка должна быть полной, вместе с `https://`

#### Шаг 3. Обновите данные просмотров

Откройте:

`GitHub -> Actions -> Update Metrika Views`

Нажмите:

`Run workflow`

Это нужно, чтобы GitHub заново сходил в Яндекс.Метрику и обновил файл:

`data/metrika-views.json`

#### Шаг 4. Проверьте, что новая статья попала в JSON

Откройте в браузере:

`https://raw.githubusercontent.com/divangames/cargo575/main/data/metrika-views.json`

Проверьте, что внутри `viewsByPage` появилась ваша новая статья.

Должно быть примерно так:

```json
"viewsByPage": {
  "https://575cargo.ru/novaya-statya": 25
}
```

Если ссылки там нет:
- проверьте `METRIKA_PAGE_URLS`
- снова запустите `Run workflow`

#### Шаг 5. Подставьте ссылку статьи в виджет

Откройте файл:

`lpmotor-metrika-widget.html`

Найдите в `config` поле:

`pageUrl`

И поставьте туда URL новой статьи:

```html
pageUrl: "https://575cargo.ru/novaya-statya",
```

#### Шаг 6. Вставьте код виджета в статью

Скопируйте содержимое:

`lpmotor-metrika-widget.html`

И вставьте в HTML-блок страницы статьи в LPMotor.

#### Шаг 7. Опубликуйте и проверьте

После публикации:
- откройте статью
- убедитесь, что вместо `...` показано число просмотров

Если виджет показывает `н/д`:
- проверьте, что `pageUrl` совпадает со ссылкой в `METRIKA_PAGE_URLS`
- проверьте `data/metrika-views.json`

### Сценарий 2. Добавить новую статью, если LPMotor режет script

Это основной резервный сценарий.

Если LPMotor вырезает `script`, обычный `lpmotor-metrika-widget.html` не сработает.
Тогда используйте отдельную runtime-страницу на GitHub Pages и вставку через `iframe`.

#### Шаг 1. Опубликуйте новую статью

Сначала создайте и опубликуйте страницу статьи в LPMotor.

Пример:

`https://575cargo.ru/novaya-statya`

#### Шаг 2. Добавьте URL статьи в GitHub Secrets

Откройте:

`GitHub -> divangames/cargo575 -> Settings -> Secrets and variables -> Actions`

Откройте секрет:

`METRIKA_PAGE_URLS`

Добавьте туда новый URL статьи.

Пример:

```text
https://575cargo.ru/7-oshibok-pri-rabote-s-dostavkoy-iz-kitaya
https://575cargo.ru/novaya-statya
```

#### Шаг 3. Запустите обновление просмотров

Откройте:

`GitHub -> Actions -> Update Metrika Views`

Нажмите:

`Run workflow`

Это обновит:

`data/metrika-views.json`

#### Шаг 4. Проверьте, что статья появилась в JSON

Откройте:

`https://raw.githubusercontent.com/divangames/cargo575/main/data/metrika-views.json`

Найдите URL новой статьи внутри `viewsByPage`.

Если его там нет, виджет не покажет просмотры.

#### Шаг 5. Подготовьте iframe-код

Откройте файл:

`lpmotor-iframe-embed.html`

Внутри есть строка:

```html
src="https://divangames.github.io/cargo575/widget-runtime.html?dataUrl=https%3A%2F%2Fraw.githubusercontent.com%2Fdivangames%2Fcargo575%2Fmain%2Fdata%2Fmetrika-views.json&pageUrl=https%3A%2F%2F575cargo.ru%2F7-oshibok-pri-rabote-s-dostavkoy-iz-kitaya&dateMode=json&manualDate=08.04.2026"
```

В ней нужно заменить только `pageUrl=...` на URL новой статьи в закодированном виде.

Пример:

обычный URL:

`https://575cargo.ru/novaya-statya`

закодированный URL:

`https%3A%2F%2F575cargo.ru%2Fnovaya-statya`

#### Шаг 6. Если не хотите кодировать вручную

Используйте файл:

`link-generator.html`

Как пользоваться:

1. Откройте `link-generator.html` локально в браузере
2. Вставьте URL новой статьи
3. Нажмите кнопку генерации
4. Скопируйте готовый iframe-код

Важно:
- `link-generator.html` нужно открывать отдельно в браузере
- его не нужно вставлять в LPMotor
- внутри LPMotor он работать не будет, если платформа режет `script`

#### Шаг 7. Вставьте iframe в LPMotor

Скопируйте готовый код из:

- `lpmotor-iframe-embed.html`
- или из `link-generator.html`

И вставьте его в HTML-блок нужной статьи.

#### Шаг 8. Проверьте работу

После публикации статьи:
- откройте страницу
- проверьте, появился ли блок с просмотрами

Если не работает:
- проверьте, разрешает ли конкретный блок LPMotor вставку `iframe`
- проверьте, открывается ли `widget-runtime.html` отдельно в браузере
- проверьте, есть ли новая статья в `data/metrika-views.json`

### Что делать, если режет и script, и iframe

Если LPMotor режет и `script`, и `iframe`, то текущая схема не сможет отрисовать динамический виджет прямо в блоке.

Тогда следующий вариант:

1. Делать не HTML-виджет, а картинку/бейдж
2. GitHub Action будет обновлять не только JSON, но и картинку
3. В LPMotor вставляется обычный `<img>`

Это самый совместимый вариант, если конструктор сильно ограничивает вставку кода.

### Самый простой рабочий процесс на будущее

Если нужно быстро добавить новую статью без ручной сборки:

1. Создаете и публикуете новую статью
2. Добавляете URL в `METRIKA_PAGE_URLS`
3. Запускаете `Update Metrika Views`
4. Присылаете URL статьи
5. Для этой статьи генерируется готовый код вставки

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
