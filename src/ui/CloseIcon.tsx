/** Hand-inked × used on the round close buttons of the Decorate and Outfits panels. */
export function CloseIcon() {
  return (
    <svg className="hud-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.6 6.4c3.4 3.2 7.4 7.6 10.9 11.2M17.4 6.2c-3.3 3.5-7.2 7.6-10.9 11.4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Stops pointer events from reaching the room camera (pan / dismiss) behind a panel. */
export const stopPointer = (e: React.SyntheticEvent) => e.stopPropagation();
