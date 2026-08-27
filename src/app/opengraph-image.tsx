import { ImageResponse } from "next/og";

export const alt = "Kept — Keep Everything. Find Anything.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens from the "ledger" design system (src/app/globals.css, dark theme).
const BG = "#191817";
const ACCENT = "#5AA687";
const FG = "#EDEAE6";
const MUTED = "#918B84";
const RULE = "#363330";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: FG,
          padding: "80px",
          borderTop: `10px solid ${ACCENT}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth={1.6}>
            <polygon points="4.5,2.5 19.5,2.5 19.5,21.5 12,16.6 4.5,21.5" />
            <polyline points="8.6,10.4 11.4,13.2 16,7.2" />
          </svg>
          <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: "-0.02em" }}>Kept</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ fontSize: 76, fontWeight: 600, lineHeight: 1.1 }}>
            Keep Everything. Find Anything.
          </div>
          <div style={{ fontSize: 30, color: MUTED, maxWidth: 900, lineHeight: 1.4 }}>
            A searchable, AI-assisted hub for developer snippets, prompts, commands, notes,
            links and files.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            paddingTop: "28px",
            borderTop: `2px solid ${RULE}`,
            fontSize: 24,
            color: MUTED,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Next.js · Prisma · NextAuth · Stripe · OpenAI
        </div>
      </div>
    ),
    size,
  );
}
