
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
        
        {/* Grass blades: beige (#fffaef) */}
        <path d="M8 23.5 L8.5 22 L9 23.5 Z" fill="#fffaef"/>
        <path d="M11.5 23.5 L12 21.5 L12.5 23.5 Z" fill="#fffaef"/>
        <path d="M15 23.5 L15.5 22 L16 23.5 Z" fill="#fffaef"/>

        {/* Stem: beige (#fffaef) - Adjusted to connect well */}
        <rect x="11.5" y="14.5" width="1" height="4.5" fill="#fffaef" rx="0.5"/>

        {/* Leaves: beige (#fffaef) */}
        {/* Left Leaf */}
        <path d="M11.5 17 C10 17.2 9 17.8 9.5 19 L11.5 18 Z" fill="#fffaef"/>
        {/* Right Leaf */}
        <path d="M12.5 17 C14 17.2 15 17.8 14.5 19 L12.5 18 Z" fill="#fffaef"/>
        
        {/* Flower Bud: beige (#fffaef) - Kept original shape for clarity */}
        <path d="M12 7 Q9.5 9 9.5 11.5 C9.5 13.5 10.5 14.5 12 14.5 C13.5 14.5 14.5 13.5 14.5 11.5 Q14.5 9 12 7 Z" fill="#fffaef"/>

        {/* Cross inside bud: green (#809580) - Slightly refined */}
        {/* Horizontal bar */}
        <rect x="10.5" y="11" width="3" height="1" fill="#809580" rx="0.2"/>
        {/* Vertical bar */}
        <rect x="11.5" y="10" width="1" height="3" fill="#809580" rx="0.2"/>
      </svg>
      <span className="font-headline text-2xl font-semibold text-primary">AllergyCare</span>
    </div>
  );
};

export default AppLogo;
