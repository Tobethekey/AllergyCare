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
        
        {/* Stem: beige (#fffaef) */}
        <rect x="11.5" y="14" width="1" height="5" fill="#fffaef" rx="0.5"/>

        {/* Flower Bud: beige (#fffaef) */}
        {/* Path M(top-point) Q(control-left, base-left-center) C(control-left-base, control-right-base, base-right-center) Q(control-right, top-point) Z */}
        <path d="M12 7 Q9.5 9 9.5 11.5 C9.5 13.5 10.5 14.5 12 14.5 C13.5 14.5 14.5 13.5 14.5 11.5 Q14.5 9 12 7 Z" fill="#fffaef"/>

        {/* Cross inside bud: green (#809580) */}
        {/* Horizontal bar */}
        <rect x="10.25" y="10.75" width="3.5" height="1.5" fill="#809580" rx="0.3"/>
        {/* Vertical bar */}
        <rect x="11.25" y="9.75" width="1.5" height="3.5" fill="#809580" rx="0.3"/>
      </svg>
      <span className="font-headline text-2xl font-semibold text-primary">AllergyCare</span>
    </div>
  );
};

export default AppLogo;