/** Android: the Vibration API, callable from code on every snap. iOS uses HapticSwitch instead. */
export function vibrateTick() {
  navigator.vibrate?.(4);
}
