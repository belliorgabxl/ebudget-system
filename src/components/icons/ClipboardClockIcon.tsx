import * as React from "react";

export type LucideLikeIconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export function ClipboardClockIcon({
  size = 24,
  width,
  height,
  ...props
}: LucideLikeIconProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* clipboard */}
      <path d="M16 4h-1a3 3 0 0 0-6 0H8" />
      <path d="M16 4h2a2 2 0 0 1 2 2v4" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />

      {/* clock */}
      <circle cx="16" cy="16" r="6" />
      <path d="M16 14v3l2 1" />
    </svg>
  );
}
