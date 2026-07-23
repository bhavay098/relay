"use client";

import { getDeterministicHue } from "./colorUtils";

const AVATAR_HUES = [210, 260, 320, 20, 160, 190, 280, 40];

/**
 * Returns just the first letter of a name (or email if no name) as an initial.
 */
function getInitials(name) {
  if (!name) return "?";
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed[0].toUpperCase();
}

/**
 * Reusable avatar circle with initials and a deterministic gradient color.
 */
export function Avatar({ name, email, size = 36 }) {
  const label = name || email;
  const hue = getDeterministicHue(email || name || "", AVATAR_HUES);
  const initials = getInitials(name || email);

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-[family:var(--font-inter)] font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${hue + 24} 70% 38%))`,
      }}
      aria-hidden="true"
      title={label}
    >
      {initials}
    </div>
  );
}
