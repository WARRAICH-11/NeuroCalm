import * as React from "react";

export const NeuroCalmIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
    <path d="M12 12s-4-3-4-6" />
    <path d="M12 12s4 3 4 6" />
    <path d="M15 9a3 3 0 0 0-6 0" />
  </svg>
);
