import { toast as sonnerToast, type ExternalToast } from "sonner";

/**
 * The status words used as every toast's title ("Success"/"Error"). Localized:
 * `ToastI18nProvider` (mounted in the root layout, inside `NextIntlClientProvider`)
 * pushes the translated strings here on the client. `toast` is a plain module —
 * not a React component — so it can't call `useTranslations()` itself; this small
 * mutable holder bridges the two. Defaults to English for the first server render
 * and any pre-hydration call.
 */
const statusLabels = { success: "Success", error: "Error" };

export function setToastStatusLabels(labels: { success: string; error: string }) {
  statusLabels.success = labels.success;
  statusLabels.error = labels.error;
}

/**
 * Wraps sonner's `toast` so success/error toasts follow the "Ledger" design system
 * convention: the toast's title is always the generic status word ("Success"/"Error"),
 * and the caller's message becomes the description below it — e.g.
 * `toast.success("Collection created")` renders "SUCCESS" / "Collection created",
 * instead of "COLLECTION CREATED" with no detail line.
 *
 * Call sites are unchanged (`toast.success(message, options)`, same as calling sonner
 * directly) — this is the one place that owns the "status word / message" mapping
 * instead of every call site doing it by hand. Import `toast` from here instead of
 * `sonner` directly.
 */
function withMessage(message: string, options?: ExternalToast): ExternalToast {
  const { description, ...rest } = options ?? {};
  return {
    ...rest,
    // A handful of call sites already pass a `description` (extra detail beyond the
    // message itself, e.g. "Reset link sent" + "Check x@y.com for the link.") — fold
    // the two into one description rather than dropping either.
    description: description ? `${message}. ${description}` : message,
  };
}

export const toast = {
  ...sonnerToast,
  success: (message: string, options?: ExternalToast) =>
    sonnerToast.success(statusLabels.success, withMessage(message, options)),
  error: (message: string, options?: ExternalToast) =>
    sonnerToast.error(statusLabels.error, withMessage(message, options)),
};
