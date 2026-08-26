import { toast as sonnerToast, type ExternalToast } from "sonner";

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
    sonnerToast.success("Success", withMessage(message, options)),
  error: (message: string, options?: ExternalToast) =>
    sonnerToast.error("Error", withMessage(message, options)),
};
