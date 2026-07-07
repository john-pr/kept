import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import ws from "ws";
import { PrismaClient } from "../src/generated/prisma/client";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const itemTypes = [
  { id: "type-snippet", name: "snippet", icon: "Code", color: "#3b82f6" },
  { id: "type-prompt", name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { id: "type-command", name: "command", icon: "Terminal", color: "#f97316" },
  { id: "type-note", name: "note", icon: "StickyNote", color: "#fde047" },
  { id: "type-file", name: "file", icon: "File", color: "#6b7280" },
  { id: "type-image", name: "image", icon: "Image", color: "#ec4899" },
  { id: "type-link", name: "link", icon: "Link", color: "#10b981" },
];

const collections = [
  {
    id: "col-react-patterns",
    name: "React Patterns",
    description: "Reusable React patterns and hooks",
    isFavorite: false,
  },
  {
    id: "col-ai-workflows",
    name: "AI Workflows",
    description: "AI prompts and workflow automations",
    isFavorite: false,
  },
  {
    id: "col-devops",
    name: "DevOps",
    description: "Infrastructure and deployment resources",
    isFavorite: false,
  },
  {
    id: "col-terminal-commands",
    name: "Terminal Commands",
    description: "Useful shell commands for everyday development",
    isFavorite: false,
  },
  {
    id: "col-design-resources",
    name: "Design Resources",
    description: "UI/UX resources and references",
    isFavorite: false,
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
  // React Patterns — 3 TypeScript snippets
  {
    id: "item-usedebounce",
    title: "useDebounce Hook",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n\n  return debounced;\n}`,
    collectionIds: ["col-react-patterns"],
    tags: ["react", "hooks", "typescript"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "item-uselocalstorage",
    title: "useLocalStorage Hook",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `function useLocalStorage<T>(key: string, initialValue: T) {\n  const [value, setValue] = useState<T>(() => {\n    const stored = window.localStorage.getItem(key);\n    return stored ? (JSON.parse(stored) as T) : initialValue;\n  });\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(value));\n  }, [key, value]);\n\n  return [value, setValue] as const;\n}`,
    collectionIds: ["col-react-patterns"],
    tags: ["react", "hooks", "typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-28T10:00:00Z",
  },
  {
    id: "item-context-provider-pattern",
    title: "Typed Context Provider",
    itemTypeId: "type-snippet",
    language: "typescript",
    content: `interface ThemeContextValue {\n  theme: "light" | "dark";\n  toggleTheme: () => void;\n}\n\nconst ThemeContext = createContext<ThemeContextValue | null>(null);\n\nexport function ThemeProvider({ children }: { children: ReactNode }) {\n  const [theme, setTheme] = useState<"light" | "dark">("dark");\n  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));\n\n  return (\n    <ThemeContext.Provider value={{ theme, toggleTheme }}>\n      {children}\n    </ThemeContext.Provider>\n  );\n}\n\nexport function useTheme() {\n  const ctx = useContext(ThemeContext);\n  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");\n  return ctx;\n}`,
    collectionIds: ["col-react-patterns"],
    tags: ["react", "context", "typescript"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-25T10:00:00Z",
  },

  // AI Workflows — 3 prompts
  {
    id: "item-code-review-prompt",
    title: "Code Review Prompt",
    itemTypeId: "type-prompt",
    content:
      "Review this code for potential bugs, security issues, and performance improvements. For each finding, explain the failure scenario and suggest a concrete fix.",
    collectionIds: ["col-ai-workflows"],
    tags: ["ai", "code-review"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: "item-doc-generation-prompt",
    title: "Documentation Generation Prompt",
    itemTypeId: "type-prompt",
    content:
      "Generate concise API documentation for this module. Include a short description, parameters with types, return values, and one usage example per function.",
    collectionIds: ["col-ai-workflows"],
    tags: ["ai", "documentation"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "item-refactoring-prompt",
    title: "Refactoring Assistance Prompt",
    itemTypeId: "type-prompt",
    content:
      "Suggest a refactor of this code that improves readability and removes duplication, without changing its external behavior. List the specific changes and why each one helps.",
    collectionIds: ["col-ai-workflows"],
    tags: ["ai", "refactoring"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-15T10:00:00Z",
  },

  // DevOps — 1 snippet, 1 command, 2 links
  {
    id: "item-docker-multistage",
    title: "Multi-Stage Dockerfile",
    itemTypeId: "type-snippet",
    language: "dockerfile",
    content: `FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nCOPY --from=builder /app/.next ./.next\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package.json ./package.json\nEXPOSE 3000\nCMD ["npm", "start"]`,
    collectionIds: ["col-devops"],
    tags: ["docker", "ci-cd"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-12T10:00:00Z",
  },
  {
    id: "item-deploy-script",
    title: "Deploy to Production",
    itemTypeId: "type-command",
    content: "npm run build && npm run db:migrate:deploy && pm2 restart devstash",
    collectionIds: ["col-devops"],
    tags: ["deployment", "pm2"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-06-10T10:00:00Z",
  },
  {
    id: "item-docker-docs",
    title: "Docker Documentation",
    itemTypeId: "type-link",
    url: "https://docs.docker.com/",
    description: "Official Docker documentation",
    collectionIds: ["col-devops"],
    tags: ["docker", "docs"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-08T10:00:00Z",
  },
  {
    id: "item-github-actions-docs",
    title: "GitHub Actions Documentation",
    itemTypeId: "type-link",
    url: "https://docs.github.com/en/actions",
    description: "Official GitHub Actions documentation",
    collectionIds: ["col-devops"],
    tags: ["ci-cd", "github"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-06T10:00:00Z",
  },

  // Terminal Commands — 4 commands
  {
    id: "item-git-reset-hard",
    title: "Git Reset Hard",
    itemTypeId: "type-command",
    content: "git reset --hard HEAD~1",
    collectionIds: ["col-terminal-commands"],
    tags: ["git", "dangerous"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-06-04T10:00:00Z",
  },
  {
    id: "item-docker-prune",
    title: "Docker System Prune",
    itemTypeId: "type-command",
    content: "docker system prune -af --volumes",
    collectionIds: ["col-terminal-commands"],
    tags: ["docker"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-06-02T10:00:00Z",
  },
  {
    id: "item-kill-port",
    title: "Kill Process on Port",
    itemTypeId: "type-command",
    content: "lsof -ti:3000 | xargs kill -9",
    collectionIds: ["col-terminal-commands"],
    tags: ["process-management"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-05-30T10:00:00Z",
  },
  {
    id: "item-npm-clean-install",
    title: "npm Clean Install",
    itemTypeId: "type-command",
    content: "rm -rf node_modules package-lock.json && npm install",
    collectionIds: ["col-terminal-commands"],
    tags: ["npm", "package-manager"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-05-28T10:00:00Z",
  },

  // Design Resources — 4 links
  {
    id: "item-tailwind-docs",
    title: "Tailwind CSS Documentation",
    itemTypeId: "type-link",
    url: "https://tailwindcss.com/docs",
    description: "Official Tailwind CSS documentation",
    collectionIds: ["col-design-resources"],
    tags: ["css", "tailwind"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-05-25T10:00:00Z",
  },
  {
    id: "item-shadcn-ui",
    title: "shadcn/ui",
    itemTypeId: "type-link",
    url: "https://ui.shadcn.com/",
    description: "Component library built on Radix UI and Tailwind CSS",
    collectionIds: ["col-design-resources"],
    tags: ["components", "ui"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-05-22T10:00:00Z",
  },
  {
    id: "item-radix-primitives",
    title: "Radix Primitives",
    itemTypeId: "type-link",
    url: "https://www.radix-ui.com/primitives",
    description: "Unstyled, accessible components for building design systems",
    collectionIds: ["col-design-resources"],
    tags: ["design-system", "components"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-05-20T10:00:00Z",
  },
  {
    id: "item-lucide-icons",
    title: "Lucide Icons",
    itemTypeId: "type-link",
    url: "https://lucide.dev/icons/",
    description: "Beautiful and consistent open-source icon set",
    collectionIds: ["col-design-resources"],
    tags: ["icons"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-05-18T10:00:00Z",
  },
];

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 12);

  const dbUser = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      password: passwordHash,
      isPro: false,
      emailVerified: new Date(),
    },
  });

  for (const itemType of itemTypes) {
    await prisma.itemType.upsert({
      where: { id: itemType.id },
      update: {},
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
      update: {},
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
      update: {},
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
        collections: {
          create: item.collectionIds.map((collectionId) => ({
            collection: { connect: { id: collectionId } },
          })),
        },
      },
    });

    // item.upsert only runs the nested "collections: create" on first
    // insert, so re-seeding an already-existing item would silently skip
    // its collection links. Upsert them directly to stay idempotent.
    for (const collectionId of item.collectionIds) {
      await prisma.itemCollection.upsert({
        where: { itemId_collectionId: { itemId: item.id, collectionId } },
        update: {},
        create: { itemId: item.id, collectionId },
      });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });