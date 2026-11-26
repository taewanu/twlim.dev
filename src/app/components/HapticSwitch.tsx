/** Android: the Vibration API, callable from code on every snap. */
export function vibrateTick() {
  navigator.vibrate?.(4);
}

/**
 * iOS has no vibration API, but Safari taps the Taptic Engine when a person toggles a switch input.
 * A script's click() doesn't count, so this transparent label over the parent turns the person's
 * own tap into that toggle.
 */
export function HapticSwitch() {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- hidden from assistive tech; it only turns a tap into a toggle.
    <label
      aria-hidden="true"
      className="absolute inset-0 touch-none [-webkit-tap-highlight-color:transparent]"
    >
      <input
        type="checkbox"
        tabIndex={-1}
        ref={(input) => input?.setAttribute('switch', '')}
        onClick={(event) => event.stopPropagation()}
        className="invisible absolute m-0 size-px"
      />
    </label>
  );
}
