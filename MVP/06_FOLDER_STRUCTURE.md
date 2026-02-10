```
src/
├── app/
│   ├── (admin)/
│   │   └── admin/
│   ├── (main)/
│   │   ├── about/
│   │   ├── academy/
│   │   ├── certification/
│   │   ├── directory/
│   │   ├── dpn/
│   │   ├── faq/
│   │   ├── privacy-policy/
│   │   └── home/
│   ├── error/
│   ├── not-found/
│   └── layout/
│
├── components/
│   ├── layout/
│   ├── pages/
│   └── ui/
│
├── features/
│   ├── about/
│   ├── academy/
│   ├── certification/
│   ├── directory/
│   ├── dpn/
│   ├── faq/
│   ├── home/
│   └── shared/
│
├── data/
│   ├── static/
│   ├── content/
│   └── constants/
│
├── hooks/
│
├── lib/
│   ├── config/
│   ├── utils/
│   └── services/
│
└── styles/
```

---

## Mental Model (this is the important part)

### 1. `app/` → **Routing & composition only**

> No business logic, no heavy UI here.

* Route groups: `(main)`, `(admin)`
* Each route folder maps **1:1 to a URL**
* Pages should mostly **compose features**

Rule:

> If you delete `features/`, `app/` should feel empty and dumb.

---

### 2. `features/` → **Domain ownership**

This is the heart of the app.

```
features/
├── home/
├── about/
├── academy/
├── certification/
└── shared/
```

Rules:

* One feature = one domain concept
* Feature owns:

  * Sections
  * Feature-specific components
  * Feature-only hooks (optional)
* `shared/` is **cross-feature but not global**

If a feature is deleted, **nothing else should break**.

---

### 3. `components/` → **Generic & reusable**

Used across many features.

```
components/
├── ui/        → atomic UI (buttons, modals, loaders)
├── layout/    → navbar, footer, shell
└── pages/     → page-level composition helpers
```

Rules:

* No business logic
* No feature knowledge
* Pure UI or composition

If you rename a feature, these **must not change**.

---

### 4. `data/` → **Static & structured content**

```
data/
├── static/
├── content/
└── constants/
```

Use for:

* Static datasets
* Content blocks
* Legal text
* FAQ items
* Platform lists

Rule:

> If it could live in a CMS later, it belongs here.

---

### 5. `hooks/` → **App-wide hooks only**

```
hooks/
```

Rules:

* Generic hooks
* No feature coupling
* Feature-specific hooks go inside the feature

---

### 6. `lib/` → **Infrastructure & logic**

```
lib/
├── config/
├── utils/
└── services/
```

Use for:

* App config
* Helpers
* API clients
* SDK wrappers
* Formatting logic

Rule:

> Nothing here should render JSX.

---

### 7. `styles/` → **Global styling layer**

```
styles/
```

Optional, but good for:

* Design tokens
* Tailwind extensions
* Global CSS

---

## Naming Rules (keep this consistent)

* **Folders**: kebab-case
* **Features**: match route names
* **No “common” folders** (use `shared`)
* **No deep nesting** beyond 2–3 levels

---

## Why this structure scales

✔ Feature-first
✔ Works for App Router
✔ Easy i18n integration
✔ Easy admin separation
✔ Easy to delete / refactor
✔ Works for teams
