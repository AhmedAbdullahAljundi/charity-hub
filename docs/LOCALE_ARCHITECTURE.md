# CharityHub locale architecture (production notes)

## 1. Why the app felt slower after i18n

- **Large client message payloads**: `NextIntlClientProvider` receives all namespaces loaded on the server for that request. More namespaces → larger RSC → more JS deserialization on hydration.
- **Parallel imports vs. bundle size**: Ten separate `import()` calls still merge into one messages object sent to the client. Consolidating related JSON files reduces loader overhead and keeps the mental model simpler (`forms.json`, `surface.json`).
- **Extra client hooks**: Each `useTranslations` subtree is cheap; **rerenders** dominate when parent stores (e.g. Zustand) update frequently alongside translated subtrees.
- **Hydration mismatch risks**: If `<html lang/dir>` came from the **cookie** while visible content came from the **URL locale**, React could warn and work harder reconciling.

## 2. Hydration & SSR strategy

- Middleware forwards **`X-NEXT-INTL-LOCALE`** on the request (next-intl). **`app/layout.tsx`** prefers this header over the cookie when setting **`lang`** / **`dir`** for SSR.
- **`LocaleDocumentAttributes`** runs **`useLayoutEffect`** after navigation to sync `document.documentElement` with **`useLocale()`**, fixing SPA transitions without waiting for a full reload.

## 3. Translation boundaries

| Layer | Responsibility |
|--------|----------------|
| `i18n/request.ts` | Loads locale messages once per request; maps bundled JSON to namespaces. |
| Server layouts/pages | Prefer default server components; pass minimal props. |
| Client components | `useTranslations(namespace)` only where interactivity requires it. |

**SSR vs client**: Put static translated strings on the server when the component can stay a Server Component. Use client components only for forms, charts with hooks, and stores.

## 4. Enum / dictionary vs stored values

- **Store/API**: canonical codes only (`VERY_FRAGILE`, role keys like `super_admin`).
- **UI**: resolve labels via `domain.*` messages or dedicated namespaces (`users.roles.*`).
- **Helpers**: `lib/i18n/resolve-label.ts` (`vulnerabilityLabel`) maps vulnerability enums safely.

Never persist translated labels in Zustand or URL state.

## 5. Performance checklist

- [ ] Keep message namespaces lean; avoid duplicating keys across files.
- [ ] Prefer **`useMemo`** for derived lists that combine translations + demo data (see Users/Volunteers pages).
- [ ] Use **shallow** Zustand selectors (`useStore((s) => s.field))` where possible.
- [ ] Avoid putting huge objects into React context besides next-intl messages.

## 6. RTL / logical CSS checklist

- [ ] Prefer **`text-start` / `text-end`** over `text-left` / `text-right`.
- [ ] Prefer **`ms-*` / `me-*` / `ps-*` / `pe-*`** over `ml/mr/pl/pr` for asymmetric spacing.
- [ ] Icons that imply direction (chevrons, back arrows) may need **`rtl:rotate-180`** or logical equivalents.
- [ ] **`dir="ltr"`** on numeric/email cells remains correct for universal data.

## 7. Component migration checklist

- [ ] No hardcoded Arabic/English in JSX for visible UI.
- [ ] Demo data uses **keys** + `useTranslations`, not literal mixed strings.
- [ ] Toasts / errors use translation keys.
- [ ] Tables use **`text-start`** / logical padding (`ps-*`, `pe-*`).

## 8. next-intl practices used here

- **`localePrefix: 'always'`** with middleware matcher for consistent URLs.
- **`setRequestLocale`** in `[locale]/layout.tsx`.
- **Single messages object** per request with stable namespaces (`validation`, `auth`, `education`, …).

## 9. Files of interest

- `frontend/i18n/request.ts` — message loading map  
- `frontend/messages/<locale>/forms.json` — `validation` + `auth` bundles  
- `frontend/messages/<locale>/surface.json` — `education`, `medical`, `audit`, `reports` bundles  
- `frontend/components/providers/locale-document-attributes.tsx` — client `lang`/`dir` sync  
- `frontend/lib/i18n/constants.ts` — `X-NEXT-INTL-LOCALE` header name  
