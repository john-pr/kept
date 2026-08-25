import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollFadeIn } from "./ScrollFadeIn";
import { ScrollableCodeBlock } from "./ScrollableCodeBlock";

const AI_CHECKLIST = [
  "Auto-tag suggestions",
  "Smart content summaries",
  '"Explain this code" on demand',
  "Prompt optimizer",
];

export function AiSection() {
  return (
    <section className="border-y border-border bg-gradient-to-b from-transparent via-primary/[0.04] to-transparent px-6 py-24">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-14 lg:grid-cols-2">
        <ScrollFadeIn>
          <Badge variant="outline" className="mb-4 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
            Pro Feature
          </Badge>
          <h2 className="mb-3.5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Let AI do the busywork
          </h2>
          <p className="mb-6 text-muted-foreground">
            Kept Pro uses AI to keep everything organized without the manual effort.
          </p>
          <ul className="flex flex-col gap-3">
            {AI_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm">
                <Check className="size-4.5 shrink-0 text-primary" strokeWidth={2.5} />
                {item}
              </li>
            ))}
          </ul>
        </ScrollFadeIn>

        <ScrollFadeIn>
          <div className="overflow-hidden rounded-2xl border border-border bg-[#0d0d13]">
            <div className="flex items-center gap-1.5 border-b border-border bg-[#14141c] px-3.5 py-3">
              <span className="size-2.5 rounded-full bg-[#ff5f56]" />
              <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="size-2.5 rounded-full bg-[#27c93f]" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                use-debounce.ts
              </span>
            </div>
            <ScrollableCodeBlock>
              <code>
                <span className="text-pink-400">function</span>{" "}
                <span className="text-blue-400">useDebounce</span>
                {"<T>(value: T, delay: "}
                <span className="text-emerald-400">number</span>
                {") {\n  "}
                <span className="text-pink-400">const</span>
                {" [debounced, setDebounced] = useState(value);\n\n  useEffect(() => {\n    "}
                <span className="text-pink-400">const</span>
                {" timer = setTimeout(() => {\n      setDebounced(value);\n    }, delay);\n    "}
                <span className="text-pink-400">return</span>
                {" () => clearTimeout(timer);\n  }, [value, delay]);\n\n  "}
                <span className="text-pink-400">return</span>
                {" debounced;\n}"}
              </code>
            </ScrollableCodeBlock>
            <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-border px-5 py-4">
              <span className="mr-1 text-[0.78rem] font-semibold text-amber-500">
                ✨ AI Generated Tags
              </span>
              {["react", "hooks", "typescript", "debounce"].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] tracking-[0.08em] text-muted-foreground uppercase"
                >
                  [{tag}]
                </span>
              ))}
            </div>
          </div>
        </ScrollFadeIn>
      </div>
    </section>
  );
}
