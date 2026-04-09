import React from "react";

export const SpainFlag = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={`rounded-[2px] object-cover ${className}`}>
    <path fill="#c7211e" d="M0 0h60v10H0z" />
    <path fill="#fdb813" d="M0 10h60v20H0z" />
    <path fill="#c7211e" d="M0 30h60v10H0z" />
  </svg>
);

export const USAFlag = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" className={`rounded-[2px] object-cover ${className}`}>
    <g fillRule="evenodd">
      <path fill="#BD3D44" d="M0 0h60v40H0z" />
      <path stroke="#fff" strokeWidth="3" d="M0 5.5h60M0 11.5h60M0 17.5h60M0 23.5h60M0 29.5h60M0 35.5h60" />
      <path fill="#192F5D" d="M0 0h27v21H0z" />
      <path fill="#fff" d="M3 2h2v2H3zm6 0h2v2H9zm6 0h2v2h-2zm6 0h2v2h-2zm3 3h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2H6zm-3 3h2v2H3zm6 0h2v2H9zm6 0h2v2h-2zm6 0h2v2h-2zm3 3h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2H6zm-3 3h2v2H3zm6 0h2v2H9zm6 0h2v2h-2zm6 0h2v2h-2zm3 3h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2h-2zm-6 0h2v2H6z" />
    </g>
  </svg>
);
