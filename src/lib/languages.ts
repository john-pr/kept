/**
 * Common programming languages for the snippet/command "Language" dropdown.
 * Values are Monaco editor language ids, passed straight through to
 * `CodeEditor`'s `language` prop for syntax highlighting.
 */
export interface LanguageOption {
  value: string;
  label: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "typescript", label: "TypeScript" },
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "shell", label: "Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "scss", label: "SCSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "xml", label: "XML" },
  { value: "graphql", label: "GraphQL" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "plaintext", label: "Plain Text" },
];
