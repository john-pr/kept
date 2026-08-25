"use client";

import { useEffect, useRef } from "react";
import {
  Notebook,
  MessagesSquare,
  Code2,
  AppWindow,
  Terminal,
  FileText,
  Bookmark,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { GitHubIcon } from "@/components/auth/GitHubIcon";

interface ChaosTool {
  label: string;
  icon: LucideIcon | typeof GitHubIcon;
  bg: string;
  color: string;
}

const CHAOS_TOOLS: ChaosTool[] = [
  { label: "Notion", icon: Notebook, bg: "#2a2a2a", color: "#ffffff" },
  { label: "GitHub", icon: GitHubIcon, bg: "#24292e", color: "#ffffff" },
  { label: "Slack", icon: MessagesSquare, bg: "#4a154b", color: "#ffffff" },
  { label: "VS Code", icon: Code2, bg: "#0066b8", color: "#ffffff" },
  { label: "Browser Tabs", icon: AppWindow, bg: "#334155", color: "#e2e8f0" },
  { label: "Terminal", icon: Terminal, bg: "#0f172a", color: "#22c55e" },
  { label: "Text File", icon: FileText, bg: "#1e293b", color: "#94a3b8" },
  { label: "Bookmark", icon: Bookmark, bg: "#1e293b", color: "#fbbf24" },
];

const SIDEBAR_ITEMS = [
  { label: "Snippets", color: "#3b82f6", active: true },
  { label: "Prompts", color: "#8b5cf6", active: false },
  { label: "Commands", color: "#f97316", active: false },
  { label: "Notes", color: "#fde047", active: false },
  { label: "Links", color: "#10b981", active: false },
];

const DASH_CARD_ACCENTS = ["#3b82f6", "#8b5cf6", "#f97316", "#fde047", "#6b7280", "#ec4899"];

const ICON_SIZE = 42;
const REPEL_RADIUS = 90;
const REPEL_STRENGTH = 900;
const MAX_SPEED = 0.9;
const COLS = 4;

interface IconState {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotOffset: number;
  rotSpeed: number;
  pulseOffset: number;
}

/**
 * Hero visual: a "chaos to order" concept — a box of floating tool icons
 * (animated via requestAnimationFrame, repelled by the mouse), an arrow,
 * and a simplified dashboard mockup.
 */
export function ChaosToOrder() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    let fieldWidth = 0;
    let fieldHeight = 0;
    let mouseX = -9999;
    let mouseY = -9999;
    let mouseActive = false;

    const measure = () => {
      const rect = field.getBoundingClientRect();
      fieldWidth = rect.width;
      fieldHeight = rect.height;
    };
    measure();
    window.addEventListener("resize", measure);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = field.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };
    const handleMouseLeave = () => {
      mouseActive = false;
      mouseX = -9999;
      mouseY = -9999;
    };
    field.addEventListener("mousemove", handleMouseMove);
    field.addEventListener("mouseleave", handleMouseLeave);

    const state: IconState[] = iconRefs.current.flatMap((el, i) => {
      if (!el) return [];
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      return [
        {
          el,
          x: 30 + col * ((fieldWidth - 80) / (COLS - 1 || 1)) + (Math.random() * 20 - 10),
          y: 40 + row * 110 + (Math.random() * 20 - 10),
          vx: (Math.random() - 0.5) * MAX_SPEED,
          vy: (Math.random() - 0.5) * MAX_SPEED,
          rotOffset: Math.random() * Math.PI * 2,
          rotSpeed: 0.0004 + Math.random() * 0.0006,
          pulseOffset: Math.random() * Math.PI * 2,
        },
      ];
    });

    let lastTime = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;

      for (const s of state) {
        if (mouseActive) {
          const dx = s.x - mouseX;
          const dy = s.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = (REPEL_STRENGTH * (1 - dist / REPEL_RADIUS)) / dist;
            s.vx += (dx / dist) * force * (dt / 1000);
            s.vy += (dy / dist) * force * (dt / 1000);
          }
        }

        s.vx += (Math.random() - 0.5) * 0.02;
        s.vy += (Math.random() - 0.5) * 0.02;

        const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
        if (speed > MAX_SPEED * 3) {
          s.vx = (s.vx / speed) * MAX_SPEED * 3;
          s.vy = (s.vy / speed) * MAX_SPEED * 3;
        }

        s.vx *= 0.985;
        s.vy *= 0.985;

        s.x += s.vx * dt;
        s.y += s.vy * dt;

        const maxX = fieldWidth - ICON_SIZE;
        const maxY = fieldHeight - ICON_SIZE;
        if (s.x < 0) {
          s.x = 0;
          s.vx *= -1;
        }
        if (s.x > maxX) {
          s.x = maxX;
          s.vx *= -1;
        }
        if (s.y < 0) {
          s.y = 0;
          s.vy *= -1;
        }
        if (s.y > maxY) {
          s.y = maxY;
          s.vy *= -1;
        }

        const rotation = Math.sin(now * s.rotSpeed + s.rotOffset) * 10;
        const scale = 1 + Math.sin(now * 0.0018 + s.pulseOffset) * 0.06;

        s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rotation}deg) scale(${scale})`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
      field.removeEventListener("mousemove", handleMouseMove);
      field.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
      {/* Chaos */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <span className="mb-3.5 block text-center text-[0.82rem] font-semibold text-muted-foreground">
          Your knowledge today...
        </span>
        <div
          ref={fieldRef}
          className="relative h-65 overflow-hidden rounded-lg border border-dashed border-border/70 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.08),transparent_50%)] bg-background"
        >
          {CHAOS_TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.label}
                ref={(el) => {
                  iconRefs.current[i] = el;
                }}
                className="absolute top-0 left-0 will-change-transform"
                title={tool.label}
              >
                <div
                  className="flex size-[42px] items-center justify-center rounded-[10px] shadow-lg ring-1 ring-white/5"
                  style={{ backgroundColor: tool.bg, color: tool.color }}
                >
                  <Icon className="size-4.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex animate-pulse items-center justify-center px-1 py-2">
        <ArrowRight className="size-10 rotate-90 text-primary md:rotate-0" strokeWidth={2.5} />
      </div>

      {/* Dashboard */}
      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <span className="mb-3.5 block text-center text-[0.82rem] font-semibold text-muted-foreground">
          ...with Kept
        </span>
        <div className="grid h-65 grid-cols-[76px_1fr] gap-3 rounded-lg border border-border/70 bg-background p-3 sm:grid-cols-[100px_1fr]">
          <div className="flex flex-col gap-1.5">
            {SIDEBAR_ITEMS.map((item) => (
              <div
                key={item.label}
                className={
                  item.active
                    ? "flex items-center gap-1.5 rounded-md bg-card px-2 py-1.5 text-[0.68rem] text-foreground"
                    : "flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[0.68rem] text-muted-foreground"
                }
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 grid-rows-2 gap-2">
            {DASH_CARD_ACCENTS.map((accent, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-card"
                style={{ borderTop: `3px solid ${accent}` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
