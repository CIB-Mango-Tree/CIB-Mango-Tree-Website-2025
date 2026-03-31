export function usingMobilePointer(): boolean {
  return window.matchMedia("(pointer: coarse)").matches;
}
