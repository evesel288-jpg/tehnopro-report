# ТехноПро CRM — Contract Management System

Vite + React + Tailwind CSS + Supabase + Vercel

---

## Быстрый старт

### 1. Создать проект в Supabase

1. Зайти на [supabase.com](https://supabase.com) → New project
2. Открыть **SQL Editor** → вставить содержимое `supabase_schema.sql` → Run
3. Перейти в **Project Settings → API**, скопировать:
   - `Project URL`
   - `anon public` key

### 2. Локальный запуск

```bash
git clone https://github.com/YOUR_ORG/contracts-crm.git
cd contracts-crm
cp .env.example .env
# Вставить ключи из Supabase в .env
npm install
npm run dev
```

### 3. Создать первого пользователя

В Supabase → Authentication → Users → Invite user (или Add user).

### 4. Деплой на Vercel

1. Залить репо на GitHub
2. Зайти на [vercel.com](https://vercel.com) → New Project → импортировать репо
3. В **Environment Variables** добавить:
   - `VITE_SUPABASE_URL` = ваш Project URL
   - `VITE_SUPABASE_ANON_KEY` = ваш anon key
4. Deploy

Файл `vercel.json` уже содержит правило роутинга SPA.

---

## Структура проекта

```
src/
  components/
    PrivateRoute.jsx     — защищённые роуты
    MetricCard.jsx       — карточка метрики дашборда
    ContractCard.jsx     — карточка контракта в сетке
    ContractModal.jsx    — модальное окно (детали, стадии, платежи, история)
    StageTrack.jsx       — горизонтальная шкала стадий
  pages/
    Login.jsx            — страница входа
    Dashboard.jsx        — главная страница
  hooks/
    useAuth.js           — авторизация
    useContracts.js      — CRUD контрактов
  lib/
    supabase.js          — клиент Supabase
    constants.js         — стадии, статусы оплаты
    format.js            — форматирование дат и сумм
```

---

## Таблицы БД

| Таблица        | Описание                          |
|----------------|-----------------------------------|
| `stages`       | 8 стадий (seed при инициализации) |
| `contracts`    | Контракты                         |
| `payments`     | Платежи по контрактам             |
| `stage_history`| Журнал смены стадий               |
| `documents`    | Метаданные документов             |

RLS включён: только авторизованные пользователи имеют доступ.
