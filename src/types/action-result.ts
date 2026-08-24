/** Shared return shape for all server actions in `src/actions/`. */
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
