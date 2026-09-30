/**
 * Calls `onLost` when pointer capture for `pointerId` is lost anywhere in the document, and
 * returns an unsubscribe function. Needed by the drag-to-resize hooks because when the
 * capturing handle is removed mid-drag (e.g. Escape closes the dialog/drawer), the browser
 * fires `lostpointercapture` at the document, not the element, so React's handler on the
 * handle never runs and the drag would never end.
 */
export function watchCaptureLoss(pointerId: number, onLost: () => void): () => void {
  function handle(event: PointerEvent) {
    if (event.pointerId === pointerId) onLost();
  }
  document.addEventListener("lostpointercapture", handle, true);
  return () => document.removeEventListener("lostpointercapture", handle, true);
}
