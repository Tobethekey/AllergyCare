import type React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle: --primary color (#809580) */}
        <circle cx="12" cy="12" r="11.5" fill="#809580"/>
        
        {/* Mound/base shape: --accent color (#093a72) */}
        {/* Path M(start) C(control1x, control1y, control2x, control2y, endx, endy) ... Z(close) */}
        {/* This creates the three-lobed heart/mound shape */}
        <path d="M5,20 C5,16.5 6.5,15 8.5,15 C10.5,15 11,15.5 12,16 C13,15.5 13.5,15 15.5,15 C17.5,15 19,16.5 19,20Z" fill="#093a72"/>

        {/* Plus sign: white (#FFFFFF) */}
        <rect x="10.75" y="17.15" width="2.5" height="1.2" fill="#FFFFFF" rx="0.3"/>
        <rect x="11.4" y="16.2" width="1.2" height="3" fill="#FFFFFF" rx="0.3"/>

        {/* Plant: --background color from light theme (#fffaef) */}
        {/* Stem */}
        <rect x="11.6" y="12.5" width="0.8" height="3.5" fill="#fffaef" rx="0.4"/>
        {/* Bud - simplified closed tulip/rose bud shape */}
        {/* Path: M(start tip) C(control left-mid, control left-base, actual left-base point) L(right-base point) C(control right-base, control right-mid, start tip again) Z */}
        <path d="M12,9.2 C10.5,10.2 10.2,11.8 11.5,12.6 L12.5,12.6 C13.8,11.8 13.5,10.2 12,9.2 Z" fill="#fffaef"/>
        {/* Leaves on stem */}
        <ellipse cx="10.8" cy="14" rx="1.3" ry="0.7" fill="#fffaef" transform="rotate(-45 10.8 14)"/>
        <ellipse cx="13.2" cy="14" rx="1.3" ry="0.7" fill="#fffaef" transform="rotate(45 13.2 14)"/>
      </svg>
      <span className="font-headline text-2xl font-semibold text-primary">AllergyCare</span>
    </div>
  );
};

export default AppLogo;
