
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

        {/* Stem: beige (#fffaef) */}
        <rect x="11.5" y="14" width="1" height="5" fill="#fffaef" rx="0.5"/>

        {/* Leaves: beige (#fffaef) */}
        {/* Left Leaf */}
        <path d="M11.5 16.5 C10 16.7 9 17.3 9.5 18.5 L11.5 17.5 Z" fill="#fffaef"/>
        {/* Right Leaf */}
        <path d="M12.5 16.5 C14 16.7 15 17.3 14.5 18.5 L12.5 17.5 Z" fill="#fffaef"/>
        
        {/* Artichoke-style Flower: beige (#fffaef) - More prominent */}
        {/* Lower layer of bracts - forms a wider base */}
        <path d="M12 14.5 L10 13.5 L9 11 L10.5 10 L12 11 L13.5 10 L15 11 L14 13.5 Z" fill="#fffaef"/>
        
        {/* Middle layer of bracts - slightly smaller and on top */}
        <path d="M12 13 L10.5 12 L10 10 L11 8.5 L12 9.5 L13 8.5 L14 10 L13.5 12 Z" fill="#fffaef"/>

        {/* Top/central part of flower - smallest layer */}
        <path d="M12 11 L11 9.5 L11.5 7.5 L12.5 7.5 L13 9.5 Z" fill="#fffaef"/>

        {/* Cross inside flower: green (#809580) - Placed on the top central part */}
        <rect x="11.25" y="8.25" width="1.5" height="0.5" fill="#809580" rx="0.1"/> {/* Horizontal bar */}
        <rect x="11.75" y="7.75" width="0.5" height="1.5" fill="#809580" rx="0.1"/> {/* Vertical bar */}
      </svg>
      <span className="font-headline text-2xl font-semibold text-primary">AllergyCare</span>
    </div>
  );
};

export default AppLogo;
