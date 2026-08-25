# Design System — "Ledger"

Reference for implementing the redesign on remaining screens. Originally sourced from three
Claude Design canvas mockups (`prototypes/redesign/kept-dashboard.html`,
`kept-mobile-dashboard.html`, `kept-auth.html`), now extrapolated onto screens with no mockup
(New Item/New Collection dialogs) and treated as the system going forward — **no more mockups
will be produced; use this file instead.**

Desktop only so far. Mobile is not yet designed — don't invent mobile-specific patterns beyond
what's already responsive; ask before styling a screen's mobile breakpoint.

## Status

| Area | State |
|---|---|
| Global tokens (`globals.css`, `layout.tsx` font) | ✅ Done |
| `/dashboard` (desktop) | ✅ Done |
| `/sign-in`, `/register` | ✅ Done |
| New Item / New Collection dialogs | ✅ Done (extrapolated, no mockup) |
| `forgot-password`/`reset-password`/`check-email` | ⚠️ Inherit `AuthCard`'s restyle only — forms/fields not individually redesigned |
| `/items/[type]`, `/favorites`, `/collections`, `/collections/[id]` | ⚠️ Inherit `ItemCard`/`CollectionCard`'s restyle only — page-level chrome (headers, pagination, empty states) not redesigned |
| Item drawer edit mode (`ItemDrawerEditForm.tsx`) | ❌ Not redesigned |
| Mobile dashboard | ❌ Deferred |
| `/collections/[id]` header, `/settings`, `/profile`, `/upgrade` | ❌ Not started |
| Marketing homepage (`/`) | ❌ Not started — pre-dates the ledger system, still on the old look |

## Design tokens (`src/app/globals.css`)

Dark mode is the only theme actually rendered (`<html>` is hardcoded `className="dark ..."`
in `layout.tsx` — no toggle exists). Light (`:root`) values are stubbed in for a future
toggle; don't rely on them rendering anywhere today.

| Semantic var | Dark hex | Used for |
|---|---|---|
| `--background` | `#191817` | Page background |
| `--card` / `--popover` / `--sidebar` | `#211F1E` | Panel/card/dialog/sheet background |
| `--muted` / `--secondary` / `--input` | `#2A2826` | Inset fields, content-preview boxes |
| `--foreground` | `#EDEAE6` | Headings, emphasis |
| `--ink-body` (new, not stock shadcn) | `#C2BDB7` | Body/description text — softer than `--foreground` |
| `--muted-foreground` | `#918B84` | Labels, meta text, secondary content |
| `--border` | `#363330` | Hairline borders (1px, most things) |
| `--rule-strong` (new, not stock shadcn) | `#5E5852` | Heavier dividers — section-header underlines, card left-edge on Sheets |
| `--primary` / `--ring` / `--sidebar-primary` | `#5AA687` | Accent green — CTAs, focus rings, left-edge accent stripes |
| `--primary-foreground` | `#211F1E` | Text on accent-colored buttons |
| `--accent` | `#24312C` | shadcn's "accent" = hover/active background tint |
| `--destructive` | `#C4805F` | Danger actions |

`--ink-body` and `--rule-strong` are wired into `@theme inline` as `--color-ink-body` /
`--color-rule-strong`, so they're real Tailwind utilities: `text-ink-body`, `border-rule-strong`.

**Per-item/collection type colors** (`ItemType.color` in the DB) were deliberately **not**
changed — they stay the original vivid seed values (`#3b82f6` blue, `#8b5cf6` purple, etc.).
Only their *presentation* changed (soft-tint chips via `withAlpha()`, left-edge accent
stripes) — don't touch the stored hex values without a separate, explicit decision.

**Radius**: `--radius: 0` (in `:root` only, cascades to both themes via the existing
`@theme inline` chain: `--radius-sm/md/lg/xl/2xl/3xl/4xl` are all `calc(var(--radius) * n)`).
Every shadcn primitive's rounding (`Card`, `Button`, `Badge`'s `rounded-4xl`, `Input`, `Select`)
already computes to `0` automatically — **don't add `rounded-none` overrides, they're
redundant.**

**Font**: JetBrains Mono everywhere (`src/app/layout.tsx`, two `next/font/google` instances
driving `--font-sans` and `--font-mono` from the same family — headings, body, and code all
render in the one monospace face).

**Borders**: 1px solid `border-border` is the default hairline everywhere. `border-dotted
border-border` is used specifically for *micro-dividers under section labels* (see below) —
distinct from solid hairlines, don't mix them up.

## Typography conventions

- **Section/field labels**: `text-[10px] tracking-[0.14em] text-muted-foreground uppercase`
  (form field labels use this exact string — see `LABEL_CLASS` constants below). Slightly
  larger at `text-[11px] tracking-[0.14em]` for section headers ("RECENT COLLECTIONS", "05
  RECORDS", breadcrumbs).
- **Page/dialog headings**: `text-lg`–`text-xl font-medium tracking-[0.12em] uppercase
  text-foreground` (dashboard `<h1>`, `AuthCard` title, dialog titles).
- **Body/description text**: `text-ink-body` (softer than plain `text-foreground`), typically
  `text-xs` or `text-sm` depending on context.
- **Numbers**: always `tabular-nums`. Counts are zero-padded to 2 digits via
  `String(n).padStart(2, "0")` (e.g. "03 records", "05" stat value) — this is a JS-side
  convention, not a CSS one.
- **Tag chips on cards** (`ItemCard`): bracket-style plain text, no border/fill —
  `text-[10px] tracking-[0.08em] text-muted-foreground uppercase`, rendered as `[{tag}]`.
- **Tag/collection chips in the drawer** (`ItemDrawerView`): bordered rectangles instead
  (`Badge variant="outline"` for tags; a custom bordered span with a small accent dot for
  collections) — different treatment from card tags, don't unify them.

## Layout patterns

### Collapsed-border grid (the core repeating motif)

Used for the dashboard's stat strip, every card grid (`DashboardGridSection`,
`ItemCardGrid`), by giving the *container* a background and 1px gap so hairlines appear
between cells without doubling up:

```
<div className="grid grid-cols-N gap-px border border-border bg-border ...">
  <div className="bg-card ...">cell content</div>
  ...
</div>
```

Grid sections whose header sits directly above them drop the top border
(`border border-t-0 border-border`) since the header's own `border-b border-rule-strong`
serves as the shared edge.

### Section header (title + count)

```
<div className="flex items-baseline justify-between border-b border-rule-strong pb-2.5">
  <span className="text-xs tracking-[0.14em] text-muted-foreground uppercase">{title}</span>
  <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase tabular-nums">
    {String(count).padStart(2, "0")} records
  </span>
</div>
```

### Card-as-grid-cell (not a `Card`)

`ItemCard`/`CollectionCard` are **plain `div`s, not the shadcn `Card` primitive** — `Card`'s
`ring-1 ring-foreground/10` + `--card-spacing` padding model doesn't fit the flat
bordered-grid-cell look. Each card gets a colored left accent stripe from its own data
(inline `style`, not a Tailwind class, since the color is per-row user data):

```tsx
<div
  className="flex flex-col gap-3 border-l-2 bg-card px-[18px] py-4 hover:bg-muted ..."
  style={{ borderLeftColor: item.typeColor }}
  role="button" tabIndex={0} {...clickableCard}
>
```

Same reasoning applied to `AuthCard.tsx` (dropped `Card`, plain div with
`border border-border border-l-2 border-l-primary` — accent is a fixed token here, not
per-row data, so it's a Tailwind class instead of inline style).

**When restyling a shared card/list component like this, override at the component itself,
not by fighting the `Card`/`Badge`/etc. primitive's defaults with `!important`-style class
wars.** If the box model doesn't fit, drop the primitive.

### Soft-tinted chips (`withAlpha`)

Type badge chips (`[icon] SNIPPET`) get a background tinted from the type's own color via
`src/lib/color.ts`'s `withAlpha(hex, alphaSuffix = "2E")` — appends a hex alpha suffix
(`2E` for dark mode, matching the original mockup's own technique). Use for any
"icon + label in a soft-colored box" pattern:

```tsx
<span style={{ backgroundColor: withAlpha(item.typeColor), color: item.typeColor }}>
```

### Relative time

`src/lib/relative-time.ts`'s `formatRelativeTime(date)` → `"2h ago"`, `"3d ago"`, etc. (lowercase;
apply `uppercase` via className, don't hardcode casing in the string). Used on `ItemCard`'s
header row.

## Form fields

Every text/select field in a redesigned form follows the same shape — see the `LABEL_CLASS`/
`FIELD_CLASS` constants already declared in `CollectionFormFields.tsx` and `ItemFormFields.tsx`
(copy this pattern into any new form rather than inlining the strings again):

```ts
const LABEL_CLASS = "text-[10px] tracking-[0.14em] text-muted-foreground uppercase";
const FIELD_CLASS = "rounded-none border-border bg-muted text-[13px]";
```

- `Input`/`Select` trigger: `className={`h-[38px] ${FIELD_CLASS}`}`
- `Textarea`: `className={FIELD_CLASS}` (no fixed height — grows with content)
- `Label`: `className={LABEL_CLASS}`
- Field group spacing: `flex flex-col gap-1.5` (label-to-field), `gap-4` between fields in a
  short form, `gap-[18px]` in the auth forms specifically (matches `AuthCard`'s internal
  rhythm — minor inconsistency, not worth reconciling retroactively).

`SelectContent`'s popup styling itself is **left untouched** — it's shared far more broadly
(Favorites sort, Editor Preferences theme picker) than just redesigned forms.

## Buttons

- Primary CTA (submit/create): default `Button` variant, plus `tracking-[0.14em] uppercase`
  (auth submit buttons additionally use `h-10`).
- Dialogs/cards generally don't need a bespoke button treatment beyond this — `Button`'s
  shadcn variants already inherit the accent color and zero radius from the global tokens.

## Dialogs and Sheets — scope discipline

**Never edit `src/components/ui/dialog.tsx` or `sheet.tsx` directly** — they're shared by
every dialog/sheet in the app, including ones with no redesign yet (Settings, delete
confirmations, Stripe checkout flows). Restyle at the call site instead, overriding via
`className` (which merges correctly through `cn()`/`tailwind-merge`):

```tsx
<DialogContent className="gap-5 rounded-none border border-border ring-0 sm:max-w-md">
  <DialogTitle className="text-base font-medium tracking-[0.12em] uppercase">...</DialogTitle>
  ...
  <DialogFooter className="-mx-4 -mb-4 rounded-none border-t border-border bg-muted/40 p-4">
```

Same principle applied to `ItemDrawer.tsx`'s `SheetContent` (narrowed width, restyled header/
toolbar via `className` overrides on the call site, not `sheet.tsx`).

## Icons

**Keep `lucide-react`** — the mockups used hand-drawn custom line-icon SVGs, but porting a
parallel icon set was explicitly decided against. Use the existing `iconMap`
(`src/lib/icon-map.ts`) for type icons; pick the closest semantic lucide icon for anything new.

## Engineering principles (apply these to any new screen)

1. **Scope restyles to the components that own the screen**, not to `src/components/ui/*`
   primitives that ripple across the whole app — unless the change is explicitly meant to be
   global (tokens/font/radius were the one deliberate exception).
2. **Shared components used by multiple screens** (`ItemCard`, `CollectionCard`,
   `AuthCard`, `CollectionFormFields`/`ItemFormFields`) get redesigned **in place** — accept
   that every screen using them changes too, rather than forking new variants. This has been
   the consistent call every time it came up.
3. **When no mockup exists for a screen**, extrapolate from this file rather than asking for
   a new mockup — that's the whole point of this doc existing.
4. **Preserve functionality exactly** — every redesign pass so far has been visual-only (no
   new fields, no changed validation, no changed server actions/wiring). If a screen's
   redesign seems to need new functionality (e.g. the drawer's "Last opened" footer, which
   was dropped because it needed new DB tracking), flag it as a separate decision rather than
   quietly building it.
5. **Don't invent structure the design language hasn't shown yet** (e.g. no accent-left-stripe
   was added to dialogs/sheets, since neither the mockups nor prior extrapolations used one
   there — only per-type/per-collection color-coded cards and the auth card got it).
6. Run `npm run build && npm run lint && npm run test` after every pass; verify visually via
   Playwright MCP before considering a screen done (compare against the relevant mockup
   file while one still exists in `prototypes/redesign/`, or against this doc + neighboring
   already-redesigned screens once mockups are gone).
