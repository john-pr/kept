import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPro: boolean;
    } & DefaultSession["user"];
  }
}

// Augments @auth/core/jwt (not next-auth/jwt) deliberately: next-auth/jwt.d.ts only
// re-exports (`export * from "@auth/core/jwt"`), and TS module augmentation doesn't
// merge through a re-export — targeting next-auth/jwt here silently types token.isPro
// as `{}` instead of `boolean`. If this stops compiling after a next-auth/@auth/core
// upgrade, check whether that re-export chain changed before "fixing" it back.
declare module "@auth/core/jwt" {
  interface JWT {
    isPro?: boolean;
  }
}
