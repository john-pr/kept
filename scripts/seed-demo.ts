import "dotenv/config";
import readline from "readline";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Populates the public demo account with realistic mock data.
 *
 * Independent of `prisma/seed.ts` (the dev seed): this one is richer, sets the
 * account to Pro, and is meant to run once against the PRODUCTION Neon branch at
 * deploy time — never wired into `prisma db seed`.
 *
 *   npm run db:seed:demo               # interactive confirmation
 *   npm run db:seed:demo -- --yes      # skip the prompt (CI / scripted)
 *   SEED_DEMO_YES=1 npm run db:seed:demo   # same, via env var
 *
 * Idempotent: every row is upserted by a stable `demo-*` id, so re-running only
 * refreshes content and never duplicates.
 */

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@kept.app";
const DEMO_PASSWORD = "12345678";

// System item types — resolved by `name` in the app, ids are stable for upserts.
const itemTypes = [
  { id: "type-snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "type-prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type-command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "type-note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "type-file", name: "file", icon: "File", color: "#6b7280" },
  { id: "type-image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "type-link", name: "link", icon: "Link", color: "#10b981" },
];

interface SeedCollection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

const collections: SeedCollection[] = [
  {
    id: "demo-col-react-patterns",
    name: "React Patterns",
    description: "Reusable hooks and component patterns",
    isFavorite: true,
  },
  {
    id: "demo-col-ai-workflows",
    name: "AI Workflows",
    description: "Prompts and workflow automations for AI-assisted coding",
    isFavorite: false,
  },
  {
    id: "demo-col-devops",
    name: "DevOps",
    description: "Containers, CI/CD, and deployment resources",
    isFavorite: true,
  },
  {
    id: "demo-col-shell-git",
    name: "Shell & Git",
    description: "Everyday terminal commands and git recipes",
    isFavorite: false,
  },
  {
    id: "demo-col-design-resources",
    name: "Design Resources",
    description: "UI, CSS, and design-system references",
    isFavorite: false,
  },
  {
    id: "demo-col-typescript-notes",
    name: "TypeScript Notes",
    description: "Type-level tricks and gotchas worth remembering",
    isFavorite: true,
  },
];

interface SeedItem {
  id: string;
  title: string;
  itemTypeId: string;
  collectionIds: string[];
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  content?: string;
  url?: string;
  description?: string;
  language?: string;
}

const items: SeedItem[] = [
  // ── React Patterns ────────────────────────────────────────────────────────
  {
    id: "demo-item-usedebounce",
    title: "useDebounce Hook",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n\n  return debounced;\n}`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "hooks", "typescript"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-08-24T10:00:00Z",
  },
  {
    id: "demo-item-uselocalstorage",
    title: "useLocalStorage Hook",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `function useLocalStorage<T>(key: string, initialValue: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = window.localStorage.getItem(key);\n    return stored ? (JSON.parse(stored) as T) : initialValue;\n  });\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue] as const;\n}`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "hooks", "typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-11T10:00:00Z",
  },
  {
    id: "demo-item-context-provider-pattern",
    title: "Typed Context Provider",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `interface ThemeContextValue {\n  theme: "light" | "dark";\n  toggleTheme: () => void;\n}\n\nconst ThemeContext = createContext<ThemeContextValue | null>(null);\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useState<"light" | "dark">("dark");\n  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));\n\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\nexport function useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");\n  return ctx;\n}`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "context", "typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-03T10:00:00Z",
  },
  {
    id: "demo-item-usemediaquery",
    title: "useMediaQuery Hook",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `function useMediaQuery(query: string): boolean {\n  const [matches, setMatches] = useState(\n    () => typeof window !== "undefined" && window.matchMedia(query).matches,\n  );\n\n  useEffect(() => {\n    const mql = window.matchMedia(query);\n    const onChange = () => setMatches(mql.matches);\n    mql.addEventListener("change", onChange);\n    onChange();\n    return () => mql.removeEventListener("change", onChange);\n  }, [query]);\n\n  return matches;\n}`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "hooks", "responsive"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-07-19T10:00:00Z",
  },
  {
    id: "demo-item-compound-component",
    title: "Compound Component Skeleton",
    itemTypeId: "type-snippet",
    language: "tsx",
    content: `const TabsContext = createContext<{ active: string; setActive: (v: string) => void } | null>(null);\n\nfunction Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {\n  const [active, setActive] = useState(defaultValue);\n  return <TabsContext.Provider value={{ active, setActive }}>{children}</TabsContext.Provider>;\n}\n\nTabs.List = function List({ children }: { children: ReactNode }) {\n  return <div role="tablist">{children}</div>;\n};\n\nTabs.Tab = function Tab({ value, children }: { value: string; children: ReactNode }) {\n  const ctx = useContext(TabsContext)!;\n  return (\n    <button role="tab" aria-selected={ctx.active === value} onClick={() => ctx.setActive(value)}>\n      {children}\n    </button>\n  );\n};`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "patterns", "typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-05T10:00:00Z",
  },
  {
    id: "demo-item-you-might-not-need-effect",
    title: "You Might Not Need an Effect",
    itemTypeId: "type-link",
    url: "https://react.dev/learn/you-might-not-need-an-effect",
    description: "React docs — removing unnecessary Effects and the bugs they cause",
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "docs", "performance"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-06-30T10:00:00Z",
  },
  {
    id: "demo-item-note-usememo",
    title: "When to actually reach for useMemo",
    itemTypeId: "type-note",
    content: `Reach for \`useMemo\` when **one** of these is true:\n\n- The computation is genuinely expensive (parsing, big list transforms) and runs on most renders.\n- The value is a dependency of another hook (\`useEffect\`, \`useMemo\`) and must be referentially stable.\n- You're passing it to a \`memo\`-wrapped child that would otherwise re-render on every parent render.\n\nOtherwise skip it — the bookkeeping cost and readability hit usually outweigh a cheap recompute. Measure with the Profiler before sprinkling it everywhere.`,
    collectionIds: ["demo-col-react-patterns"],
    tags: ["react", "performance"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-22T10:00:00Z",
  },

  // ── AI Workflows ──────────────────────────────────────────────────────────
  {
    id: "demo-item-code-review-prompt",
    title: "Code Review Prompt",
    itemTypeId: "type-prompt",
    content:
      "Review this code for potential bugs, security issues, and performance improvements. For each finding, explain the failure scenario and suggest a concrete fix. Rank findings by severity and skip anything that's purely stylistic.",
    collectionIds: ["demo-col-ai-workflows"],
    tags: ["ai", "code-review"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-08-20T10:00:00Z",
  },
  {
    id: "demo-item-doc-generation-prompt",
    title: "Documentation Generation Prompt",
    itemTypeId: "type-prompt",
    content:
      "Generate concise API documentation for this module. Include a short description, parameters with types, return values, thrown errors, and one realistic usage example per exported function. Match the tone of the existing docs.",
    collectionIds: ["demo-col-ai-workflows"],
    tags: ["ai", "documentation"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-14T10:00:00Z",
  },
  {
    id: "demo-item-refactoring-prompt",
    title: "Refactoring Assistance Prompt",
    itemTypeId: "type-prompt",
    content:
      "Suggest a refactor of this code that improves readability and removes duplication without changing its external behavior. List the specific changes and why each one helps. Do not introduce new dependencies.",
    collectionIds: ["demo-col-ai-workflows"],
    tags: ["ai", "refactoring"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-08T10:00:00Z",
  },
  {
    id: "demo-item-commit-message-prompt",
    title: "Commit Message Prompt",
    itemTypeId: "type-prompt",
    content:
      "Write a Conventional Commits message for this diff. One line summary under 72 characters, then a body explaining the why (not the what) if the change isn't self-evident. Use the type that matches the intent: feat, fix, chore, docs, refactor, test.",
    collectionIds: ["demo-col-ai-workflows", "demo-col-shell-git"],
    tags: ["ai", "git"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-07-28T10:00:00Z",
  },
  {
    id: "demo-item-test-generation-prompt",
    title: "Test Generation Prompt",
    itemTypeId: "type-prompt",
    content:
      "Write unit tests for this function using Vitest. Cover the happy path, boundary values, and every error branch. Mock external calls at the module boundary. Name each test after the behavior it verifies, not the function name.",
    collectionIds: ["demo-col-ai-workflows"],
    tags: ["ai", "testing"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-07-16T10:00:00Z",
  },
  {
    id: "demo-item-explain-code-prompt",
    title: "Explain This Code Prompt",
    itemTypeId: "type-prompt",
    content:
      "Explain what this code does at three levels: a one-sentence summary, a step-by-step walkthrough of the control flow, and a note on any non-obvious edge cases or assumptions. Assume I know the language but not this codebase.",
    collectionIds: ["demo-col-ai-workflows"],
    tags: ["ai", "learning"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-02T10:00:00Z",
  },

  // ── DevOps ────────────────────────────────────────────────────────────────
  {
    id: "demo-item-docker-multistage",
    title: "Multi-Stage Dockerfile",
    itemTypeId: "type-snippet",
    language: "dockerfile",
    content: `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next ./.next\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./package.json\nEXPOSE 3000\nCMD ["npm", "start"]`,
    collectionIds: ["demo-col-devops"],
    tags: ["docker", "ci-cd"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-18T10:00:00Z",
  },
  {
    id: "demo-item-gha-node-ci",
    title: "GitHub Actions — Node CI",
    itemTypeId: "type-snippet",
    language: "yaml",
    content: `name: CI\n\non:\n  push:\n    branches: [master]\n  pull_request:\n    branches: [master]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: npm ci\n      - run: npm run lint\n      - run: npx tsc --noEmit\n      - run: npm test`,
    collectionIds: ["demo-col-devops"],
    tags: ["ci-cd", "github"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-08-05T10:00:00Z",
  },
  {
    id: "demo-item-deploy-script",
    title: "Deploy to Production",
    itemTypeId: "type-command",
    content: "npm run build && npm run db:migrate:deploy && pm2 restart kept",
    collectionIds: ["demo-col-devops"],
    tags: ["deployment", "pm2"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-07-25T10:00:00Z",
  },
  {
    id: "demo-item-docker-prune",
    title: "Docker System Prune",
    itemTypeId: "type-command",
    content: "docker system prune -af --volumes",
    collectionIds: ["demo-col-devops"],
    tags: ["docker", "cleanup"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-11T10:00:00Z",
  },
  {
    id: "demo-item-docker-docs",
    title: "Docker Documentation",
    itemTypeId: "type-link",
    url: "https://docs.docker.com/",
    description: "Official Docker documentation",
    collectionIds: ["demo-col-devops"],
    tags: ["docker", "docs"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-27T10:00:00Z",
  },
  {
    id: "demo-item-gha-docs",
    title: "GitHub Actions Documentation",
    itemTypeId: "type-link",
    url: "https://docs.github.com/en/actions",
    description: "Official GitHub Actions documentation",
    collectionIds: ["demo-col-devops"],
    tags: ["ci-cd", "github"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-19T10:00:00Z",
  },
  {
    id: "demo-item-note-zero-downtime-migration",
    title: "Zero-downtime migration checklist",
    itemTypeId: "type-note",
    content: `Expand / contract, never rename in place:\n\n1. **Expand** — add the new nullable column / table in its own migration. Deploy.\n2. **Backfill** — copy data in batches; keep writing to both old and new from the app.\n3. **Switch reads** — point the app at the new column. Deploy. Watch metrics.\n4. **Stop writing the old one.** Deploy.\n5. **Contract** — drop the old column in a later migration, once you're sure no rollback needs it.\n\nA column rename = drop + add, so it's steps 1-5, not a one-liner.`,
    collectionIds: ["demo-col-devops"],
    tags: ["database", "deployment", "postgres"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-06-12T10:00:00Z",
  },

  // ── Shell & Git ───────────────────────────────────────────────────────────
  {
    id: "demo-item-kill-port",
    title: "Kill Process on Port",
    itemTypeId: "type-command",
    content: "lsof -ti:3000 | xargs kill -9",
    collectionIds: ["demo-col-shell-git"],
    tags: ["shell", "process-management"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-08-22T10:00:00Z",
  },
  {
    id: "demo-item-git-reset-hard",
    title: "Discard last commit and all changes",
    itemTypeId: "type-command",
    content: "git reset --hard HEAD~1",
    collectionIds: ["demo-col-shell-git"],
    tags: ["git", "dangerous"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-13T10:00:00Z",
  },
  {
    id: "demo-item-git-undo-soft",
    title: "Undo last commit, keep the changes staged",
    itemTypeId: "type-command",
    content: "git reset --soft HEAD~1",
    collectionIds: ["demo-col-shell-git"],
    tags: ["git"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-08-01T10:00:00Z",
  },
  {
    id: "demo-item-git-rebase-interactive",
    title: "Interactive rebase last 3 commits",
    itemTypeId: "type-command",
    content: "git rebase -i HEAD~3",
    collectionIds: ["demo-col-shell-git"],
    tags: ["git", "rebase"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "demo-item-find-large-files",
    title: "Find the biggest files under a directory",
    itemTypeId: "type-command",
    content: "du -ah . | sort -rh | head -20",
    collectionIds: ["demo-col-shell-git"],
    tags: ["shell", "disk"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-07T10:00:00Z",
  },
  {
    id: "demo-item-npm-clean-install",
    title: "npm Clean Install",
    itemTypeId: "type-command",
    content: "rm -rf node_modules package-lock.json && npm install",
    collectionIds: ["demo-col-shell-git", "demo-col-devops"],
    tags: ["npm", "package-manager"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-24T10:00:00Z",
  },
  {
    id: "demo-item-note-git-bisect",
    title: "git bisect quick reference",
    itemTypeId: "type-note",
    content: `Find the commit that introduced a bug by binary search:\n\n\`\`\`\ngit bisect start\ngit bisect bad                 # current commit is broken\ngit bisect good v1.4.0         # this tag was fine\n# git checks out a commit halfway between — test it, then:\ngit bisect good   # or: git bisect bad\n# repeat until it prints "<sha> is the first bad commit"\ngit bisect reset              # back to where you started\n\`\`\`\n\nAutomate it: \`git bisect run npm test\`.`,
    collectionIds: ["demo-col-shell-git"],
    tags: ["git", "debugging"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-09T10:00:00Z",
  },

  // ── Design Resources ──────────────────────────────────────────────────────
  {
    id: "demo-item-tailwind-docs",
    title: "Tailwind CSS Documentation",
    itemTypeId: "type-link",
    url: "https://tailwindcss.com/docs",
    description: "Official Tailwind CSS documentation",
    collectionIds: ["demo-col-design-resources", "demo-col-react-patterns"],
    tags: ["css", "tailwind"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-08-16T10:00:00Z",
  },
  {
    id: "demo-item-shadcn-ui",
    title: "shadcn/ui",
    itemTypeId: "type-link",
    url: "https://ui.shadcn.com/",
    description: "Component library built on Radix UI and Tailwind CSS",
    collectionIds: ["demo-col-design-resources"],
    tags: ["components", "ui"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-06T10:00:00Z",
  },
  {
    id: "demo-item-radix-primitives",
    title: "Radix Primitives",
    itemTypeId: "type-link",
    url: "https://www.radix-ui.com/primitives",
    description: "Unstyled, accessible components for building design systems",
    collectionIds: ["demo-col-design-resources"],
    tags: ["design-system", "accessibility"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-23T10:00:00Z",
  },
  {
    id: "demo-item-lucide-icons",
    title: "Lucide Icons",
    itemTypeId: "type-link",
    url: "https://lucide.dev/icons/",
    description: "Beautiful and consistent open-source icon set",
    collectionIds: ["demo-col-design-resources"],
    tags: ["icons"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-09T10:00:00Z",
  },
  {
    id: "demo-item-oklch-picker",
    title: "OKLCH Color Picker & Converter",
    itemTypeId: "type-link",
    url: "https://oklch.com/",
    description: "Pick and convert OKLCH colors — the model Tailwind v4 uses by default",
    collectionIds: ["demo-col-design-resources"],
    tags: ["color", "css"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-06-16T10:00:00Z",
  },

  // ── TypeScript Notes ──────────────────────────────────────────────────────
  {
    id: "demo-item-note-satisfies",
    title: "satisfies vs as vs plain annotation",
    itemTypeId: "type-note",
    content: `\`\`\`ts\nconst config = {\n  port: 3000,\n  host: "localhost",\n} satisfies Record<string, string | number>;\n\`\`\`\n\n- **\`: T\`** — widens the value to T. You lose the literal types (\`config.port\` becomes \`number\`).\n- **\`as T\`** — an assertion. No check that the value actually fits; can hide bugs.\n- **\`satisfies T\`** — checks the value against T **and keeps the narrow inferred type**. \`config.port\` stays \`3000\`, \`config.host\` stays \`"localhost"\`.\n\nRule of thumb: reach for \`satisfies\` whenever you want validation without losing inference.`,
    collectionIds: ["demo-col-typescript-notes"],
    tags: ["typescript"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-08-26T10:00:00Z",
  },
  {
    id: "demo-item-note-discriminated-unions",
    title: "Model state with discriminated unions",
    itemTypeId: "type-note",
    content: `Instead of a bag of optional fields:\n\n\`\`\`ts\n// ❌ every combination is representable, including the impossible ones\ntype State = { loading: boolean; data?: User; error?: Error };\n\`\`\`\n\nuse a tagged union so illegal states don't typecheck:\n\n\`\`\`ts\ntype State =\n  | { status: "idle" }\n  | { status: "loading" }\n  | { status: "success"; data: User }\n  | { status: "error"; error: Error };\n\`\`\`\n\nNow \`if (state.status === "success")\` narrows \`state.data\` to \`User\` with no \`!\`.`,
    collectionIds: ["demo-col-typescript-notes"],
    tags: ["typescript", "patterns"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-08-09T10:00:00Z",
  },
  {
    id: "demo-item-prettify-type",
    title: "Prettify<T> utility type",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `// Flattens intersections and expands mapped types so tooltips show\n// the resolved shape instead of "A & B & C".\ntype Prettify<T> = {\n  [K in keyof T]: T[K];\n} & {};\n\ntype Messy = { a: number } & { b: string } & { c: boolean };\ntype Clean = Prettify<Messy>; // { a: number; b: string; c: boolean }`,
    collectionIds: ["demo-col-typescript-notes", "demo-col-react-patterns"],
    tags: ["typescript", "types"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-07-30T10:00:00Z",
  },
  {
    id: "demo-item-deeppartial-type",
    title: "DeepPartial<T> utility type",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `type DeepPartial<T> = T extends object\n  ? { [K in keyof T]?: DeepPartial<T[K]> }\n  : T;\n\n// Handy for test fixtures and partial config overrides:\nfunction makeUser(overrides: DeepPartial<User> = {}): User {\n  return merge(structuredClone(DEFAULT_USER), overrides);\n}`,
    collectionIds: ["demo-col-typescript-notes"],
    tags: ["typescript", "types", "testing"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-07-13T10:00:00Z",
  },
  {
    id: "demo-item-note-type-predicates",
    title: "Narrowing with type predicates",
    itemTypeId: "type-note",
    content: `A function returning \`x is T\` teaches the compiler how to narrow:\n\n\`\`\`ts\nfunction isNonNull<T>(value: T | null | undefined): value is T {\n  return value != null;\n}\n\nconst names = users.map((u) => u.name).filter(isNonNull); // string[], not (string | null)[]\n\`\`\`\n\nCaveat: the compiler trusts you. If the predicate body is wrong, the narrowing is wrong — no check.`,
    collectionIds: ["demo-col-typescript-notes"],
    tags: ["typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-05T10:00:00Z",
  },
];

function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "yes");
    });
  });
}

async function main() {
  const dbHost = new URL(process.env.DATABASE_URL ?? "").host;
  console.log(`Target database: ${dbHost}`);
  console.log(
    `About to upsert the demo account (${DEMO_EMAIL}, Pro), ` +
      `${collections.length} collections and ${items.length} items.`,
  );

  const skipPrompt = process.argv.includes("--yes") || process.env.SEED_DEMO_YES === "1";
  const confirmed = skipPrompt || (await confirm('\nType "yes" to continue: '));
  if (!confirmed) {
    console.log("Aborted.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const dbUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      name: "Demo User",
      password: passwordHash,
      isPro: true,
      emailVerified: new Date(),
    },
    create: {
      email: DEMO_EMAIL,
      name: "Demo User",
      password: passwordHash,
      isPro: true,
      emailVerified: new Date(),
    },
  });

  for (const itemType of itemTypes) {
    await prisma.itemType.upsert({
      where: { id: itemType.id },
      update: { name: itemType.name, icon: itemType.icon, color: itemType.color, isSystem: true },
      create: {
        id: itemType.id,
        name: itemType.name,
        icon: itemType.icon,
        color: itemType.color,
        isSystem: true,
      },
    });
  }

  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { id: collection.id },
      update: {
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite,
      },
      create: {
        id: collection.id,
        name: collection.name,
        description: collection.description,
        isFavorite: collection.isFavorite,
        userId: dbUser.id,
      },
    });
  }

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        content: item.content ?? null,
        url: item.url ?? null,
        description: item.description ?? null,
        language: item.language ?? null,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        itemTypeId: item.itemTypeId,
        tags: {
          set: [],
          connectOrCreate: item.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      create: {
        id: item.id,
        title: item.title,
        contentType: "TEXT",
        content: item.content ?? null,
        url: item.url ?? null,
        description: item.description ?? null,
        language: item.language ?? null,
        isFavorite: item.isFavorite,
        isPinned: item.isPinned,
        createdAt: new Date(item.createdAt),
        userId: dbUser.id,
        itemTypeId: item.itemTypeId,
        tags: {
          connectOrCreate: item.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    // item.upsert only runs the nested "collections: create" on first insert, so
    // re-seeding an existing item would skip its links. Upsert them directly.
    for (const collectionId of item.collectionIds) {
      await prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId } },
        update: {},
        create: { itemId: item.id, collectionId },
      });
    }
  }

  console.log(`\nDemo seed complete — ${collections.length} collections, ${items.length} items.`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
