/** Where a press started, as a React or DOM pointer event gives it. */
export interface PointerPress {
  clientX: number;
  clientY: number;
  pointerId: number;
  currentTarget: EventTarget | null;
}

/**
 * Follows a pointer (mouse, pen or finger) from a press until it is released or cancelled, reporting how far it
 * has moved. The pointer is captured, so the drag keeps going when it leaves the element or the browser window.
 * Returns a function that ends the drag early.
 */
export const trackPointer = (
  press: PointerPress,
  onMove: (dx: number, dy: number, at: { x: number; y: number }) => void,
  onEnd?: () => void,
) => {
  const startX = press.clientX;
  const startY = press.clientY;
  (press.currentTarget as Element | null)?.setPointerCapture?.(press.pointerId);

  const move = (e: PointerEvent) => onMove(e.clientX - startX, e.clientY - startY, { x: e.clientX, y: e.clientY });
  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    onEnd?.();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  return end;
};
