import * as React from "react";

export function FundedSpreadLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M12 2 L9.143 5.571 L12 7 L14.857 5.571 Z" />
      <path d="M8.286 6.643 L12 8.5 L15.714 6.643 L18.571 10.214 L12 13.5 L5.429 10.214 Z" />
      <path d="M4.571 11.286 L12 15 L19.429 11.286 L22.286 14.857 L12 20 L1.714 14.857 Z" />
    </svg>
  );
}
