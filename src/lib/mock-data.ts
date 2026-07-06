export interface User {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  tier: "free" | "pro";
}

export interface Item {
  id: string;
  title: string;
  content: string;
  itemTypeId: string;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  collectionIds: string[];
  createdAt: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
}

export const user: User = {
  id: "user-1",
  name: "John Doe",
  email: "john@example.com",
  isPro: true,
};

export const itemTypes: ItemType[] = [
  { id: "type-snippet", name: "Snippet", slug: "snippets", icon: "Code", color: "#3b82f6", tier: "free" },
  { id: "type-prompt", name: "Prompt", slug: "prompts", icon: "Sparkles", color: "#8b5cf6", tier: "free" },
  { id: "type-command", name: "Command", slug: "commands", icon: "Terminal", color: "#f97316", tier: "free" },
  { id: "type-note", name: "Note", slug: "notes", icon: "StickyNote", color: "#fde047", tier: "free" },
  { id: "type-link", name: "Link", slug: "links", icon: "Link", color: "#10b981", tier: "free" },
  { id: "type-file", name: "File", slug: "files", icon: "File", color: "#6b7280", tier: "pro" },
  { id: "type-image", name: "Image", slug: "images", icon: "Image", color: "#ec4899", tier: "pro" },
];

export const collections: Collection[] = [
  { id: "col-react-patterns", name: "React Patterns", description: "Common patterns and best practices for React", isFavorite: true },
  { id: "col-ai-prompts", name: "AI Prompts", description: "Collection of useful AI prompts for development", isFavorite: false },
  { id: "col-shell-commands", name: "Shell Commands", description: "Frequently used terminal commands", isFavorite: true },
  { id: "col-project-notes", name: "Project Notes", description: "Important notes and documentation", isFavorite: false },
  { id: "col-useful-links", name: "Useful Links", description: "Bookmarked resources and references", isFavorite: false },
  { id: "col-interview-prep", name: "Interview Prep", description: "Code snippets and notes for interviews", isFavorite: true },
];

export const items: Item[] = [
  {
    id: "item-usedebounce",
    title: "useDebounce Hook",
    content: `const useDebounce = (value, delay) => {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  useEffect(() => {\n    ...\n  });\n};`,
    itemTypeId: "type-snippet",
    tags: ["react", "hooks", "performance"],
    isFavorite: true,
    isPinned: true,
    collectionIds: ["col-react-patterns", "col-interview-prep"],
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "item-code-review-prompt",
    title: "Code Review Prompt",
    content: "Review this code for potential bugs, security issues, and performance improvements.",
    itemTypeId: "type-prompt",
    tags: ["ai", "code-review"],
    isFavorite: true,
    isPinned: false,
    collectionIds: ["col-ai-prompts"],
    createdAt: "2026-06-28T10:00:00Z",
  },
  {
    id: "item-git-reset-hard",
    title: "Git Reset Hard",
    content: "git reset --hard HEAD~1",
    itemTypeId: "type-command",
    tags: ["git", "dangerous"],
    isFavorite: false,
    isPinned: true,
    collectionIds: ["col-shell-commands"],
    createdAt: "2026-06-25T10:00:00Z",
  },
  {
    id: "item-project-architecture",
    title: "Project Architecture",
    content: "# Architecture Overview\n\n## Frontend\n...",
    itemTypeId: "type-note",
    tags: ["architecture", "documentation"],
    isFavorite: false,
    isPinned: false,
    collectionIds: ["col-project-notes"],
    createdAt: "2026-06-20T10:00:00Z",
  },
  {
    id: "item-react-documentation",
    title: "React Documentation",
    content: "https://react.dev",
    itemTypeId: "type-link",
    tags: ["react", "docs"],
    isFavorite: true,
    isPinned: false,
    collectionIds: ["col-useful-links"],
    createdAt: "2026-06-18T10:00:00Z",
  },
  {
    id: "item-usestate-objects",
    title: "useState with Objects",
    content: `const [state, setState] = useState({ name: '', email: '' });\nconst updateField = (field, value) => {\n  ...\n};`,
    itemTypeId: "type-snippet",
    tags: ["react", "state"],
    isFavorite: false,
    isPinned: false,
    collectionIds: ["col-react-patterns", "col-interview-prep"],
    createdAt: "2026-06-15T10:00:00Z",
  },
];