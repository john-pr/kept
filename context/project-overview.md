# DevStash — Project Overview

A unified, searchable, AI-enhanced hub for developer knowledge: snippets, prompts, commands, notes, links, and files.

---

## 1. Problem

Developer essentials are fragmented across tools:

| Resource | Typical Location |
|---|---|
| Code snippets | VS Code, Notion |
| AI prompts | ChatGPT/Claude chat history |
| Context files | Buried in project folders |
| Useful links | Browser bookmarks |
| Docs | Random folders |
| Commands | `.txt` files, bash history |
| Project templates | GitHub gists |

Result: context switching, lost knowledge, inconsistent workflows.

**DevStash solves this with one fast, searchable, AI-enhanced hub.**

---

## 2. Target Users

- **Everyday Developer** — fast access to snippets, prompts, commands, links.
- **AI-first Developer** — saves prompts, contexts, workflows, system messages.
- **Content Creator / Educator** — code blocks, explanations, course notes.
- **Full-stack Builder** — patterns, boilerplates, API examples.

---

## 3. Features

### 3.1 Items & Item Types

Items are the core unit. Users can create custom types (later); the system ships with seven fixed types:

| Type | Content Kind | Tier | Color | Icon |
|---|---|---|---|---|
| Snippet | text | Free | `#3b82f6` blue | `Code` |
| Prompt | text | Free | `#8b5cf6` purple | `Sparkles` |
| Command | text | Free | `#f97316` orange | `Terminal` |
| Note | text | Free | `#fde047` yellow | `StickyNote` |
| Link | url | Free | `#10b981` emerald | `Link` |
| File | file | Pro | `#6b7280` gray | `File` |
| Image | file | Pro | `#ec4899` pink | `Image` |

- Items are created and viewed in a **drawer** for fast access.
- Routes follow the pattern `/items/{type-plural}` (e.g. `/items/snippets`).

### 3.2 Collections

- Group items of any type.
- Many-to-many: an item can belong to multiple collections (e.g. a React snippet in both "React Patterns" and "Interview Prep").
- Examples: "React Patterns", "Context Files", "Python Snippets".

### 3.3 Search

Full-text across:
- Content
- Tags
- Titles
- Types

### 3.4 Authentication

- Email/password
- GitHub OAuth

### 3.5 Other Features

- Favorites (items and collections)
- Pin items to top
- Recently used
- Import code from file
- Markdown editor for text types
- File upload for file/image types
- Export data (JSON/ZIP)
- Dark mode (default), light mode optional
- Add/remove items to/from multiple collections
- View which collections an item belongs to

### 3.6 AI Features (Pro only)

- Auto-tag suggestions
- Summaries
- "Explain this code"
- Prompt optimizer

Model: `gpt-5-nano` (OpenAI).

---

## 4. Data Model

### 4.1 Entity Relationships

```
User ──┬──< Item >──── ItemType
       │     │
       │     ├──< ItemCollection >── Collection
       │     │
       │     └──< Tag (many-to-many)
       │
       └──< Collection
```

### 4.2 Prisma Schema (Draft)

```prisma
model User {
  id                   String    @id @default(cuid())
  email                String    @unique
  name                 String?
  isPro                Boolean   @default(false)
  stripeCustomerId     String?   @unique
  stripeSubscriptionId String?   @unique
  items                Item[]
  collections          Collection[]
  itemTypes            ItemType[] // null for system types
  // NextAuth fields: accounts, sessions, etc.
}

model Item {
  id           String           @id @default(cuid())
  title        String
  contentType  ContentType      // TEXT | FILE
  content      String?          // text body or null if file
  fileUrl      String?          // R2 URL or null if text
  fileName     String?
  fileSize     Int?             // bytes
  url          String?          // for link types
  description  String?
  isFavorite   Boolean          @default(false)
  isPinned     Boolean          @default(false)
  language     String?          // optional, for code
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  userId       String
  user         User             @relation(fields: [userId], references: [id])
  itemTypeId   String
  itemType     ItemType         @relation(fields: [itemTypeId], references: [id])
  collections  ItemCollection[]
  tags         Tag[]            @relation("ItemTags")
}

enum ContentType {
  TEXT
  FILE
}

model ItemType {
  id        String  @id @default(cuid())
  name      String
  icon      String
  color     String
  isSystem  Boolean @default(false)
  userId    String? // null for system types
  user      User?   @relation(fields: [userId], references: [id])
  items     Item[]
}

model Collection {
  id             String           @id @default(cuid())
  name           String
  description    String?
  isFavorite     Boolean          @default(false)
  defaultTypeId  String?          // for empty collections
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  userId         String
  user           User             @relation(fields: [userId], references: [id])
  items          ItemCollection[]
}

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime    @default(now())
  item         Item        @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection   Collection  @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  @@id([itemId, collectionId])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  items Item[] @relation("ItemTags")
}
```

Notes:
- Collection ↔ Item handled via the explicit `ItemCollection` join table (carries `addedAt`).
- Item ↔ Tag handled via implicit Prisma many-to-many.
- `ItemType.userId` null = system type (immutable).

---

## 5. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 / React 19 |
| Rendering | SSR pages with dynamic components |
| Backend | Next.js API routes |
| Language | TypeScript |
| Database | Neon (PostgreSQL) |
| ORM | Prisma 7 — [docs](https://www.prisma.io/docs) |
| Cache | Redis (optional) |
| File storage | Cloudflare R2 |
| Auth | NextAuth v5 (email/password + GitHub OAuth) |
| AI | OpenAI `gpt-5-nano` |
| Styling | Tailwind CSS v4 |
| Components | ShadCN UI |
| Payments | Stripe |

**Migration policy:** NEVER use `prisma db push` or modify DB structure directly. All schema changes go through migrations (`prisma migrate dev` in development, `prisma migrate deploy` in production).

---

## 6. Monetization (Freemium)

### Free

- 50 items total
- 3 collections
- All system types except File/Image
- Basic search
- No file/image uploads
- No AI features

### Pro — $8/month or $72/year

- Unlimited items
- Unlimited collections
- File & image uploads
- Custom types (later)
- AI auto-tagging
- AI code explanation
- AI prompt optimizer
- Data export (JSON/ZIP)
- Priority support

**Development phase:** infrastructure for Pro gating in place, but all users get full access until launch.

---

## 7. UI / UX

### Principles

- Modern, minimal, developer-focused
- Dark mode default, light mode optional
- Clean typography, generous whitespace
- Subtle borders and shadows
- Syntax highlighting on code blocks
- References: [Notion](https://www.notion.so), [Linear](https://linear.app), [Raycast](https://www.raycast.com)

### Layout

```
┌─────────────┬──────────────────────────────────────┐
│             │                                      │
│  Sidebar    │           Main content               │
│             │                                      │
│  Item types │  Collections grid (cards)            │
│  - Snippets │  ┌──────┐ ┌──────┐ ┌──────┐         │
│  - Prompts  │  │ Coll │ │ Coll │ │ Coll │         │
│  - Commands │  └──────┘ └──────┘ └──────┘         │
│  - Notes    │                                      │
│  - Links    │  Items under collections             │
│  - Files    │  (color-coded by type)               │
│  - Images   │                                      │
│             │                                      │
│  Latest     │                                      │
│  collections│                                      │
│             │                                      │
└─────────────┴──────────────────────────────────────┘
```

- **Sidebar** (collapsible): item types with links, latest collections.
- **Main**: grid of collection cards. Card background reflects the dominant item type's color. Items within a collection appear as cards with a colored border matching their type.
- **Item view**: opens in a drawer for fast access without navigation.

### Responsive

- Desktop-first, mobile usable.
- Sidebar collapses to drawer on mobile.

### Micro-interactions

- Smooth transitions
- Card hover states
- Toast notifications for actions
- Loading skeletons

---

## 8. Routing Conventions

| Route | Purpose |
|---|---|
| `/` | Dashboard (collections grid) |
| `/items/snippets` | List of snippet items |
| `/items/prompts` | List of prompt items |
| `/items/commands` | List of command items |
| `/items/notes` | List of note items |
| `/items/links` | List of link items |
| `/items/files` | List of file items (Pro) |
| `/items/images` | List of image items (Pro) |
| `/collections/[id]` | Single collection view |
| `/settings` | User settings, billing |

---

## 9. Open Questions / Future Considerations

- Custom user-defined item types (post-launch).
- Redis caching layer — decide based on query profile after MVP.
- Sharing collections publicly (read-only links).
- Browser extension for one-click save.
- VS Code extension.
