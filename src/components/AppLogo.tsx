
import type React from 'react';

const AppLogo: React.FC = () => {
  return (
    <div className="flex items-center">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle: primary color */}
        <circle cx="12" cy="12" r="11.5" fill="#809580"/>

        {/* Artichoke-style Flower: beige (#fffaef) - Larger and more central */}
        {/* Base of flower / lowest, widest bracts */}
        <path d="M12 20 L7 18 C7 17, 6 15, 7 14 L9 11.5 L12 13 L15 11.5 L17 14 C18 15, 17 17, 17 18 L12 20Z" fill="#fffaef"/>

        {/* Middle layer of bracts */}
        <path d="M12 17 L8.5 15.5 C8.5 14.5, 7.5 13, 8.5 12 L10 9.5 L12 11 L14 9.5 L15.5 12 C16.5 13, 15.5 14.5, 15.5 15.5 L12 17Z" fill="#fffaef"/>

        {/* Upper-middle layer of bracts */}
        <path d="M12 14.5 L9.5 13 C9.5 12, 8.5 11, 9.5 10 L10.5 8 L12 9.5 L13.5 8 L14.5 10 C15.5 11, 14.5 12, 14.5 13 L12 14.5Z" fill="#fffaef"/>

        {/* Top/central part of flower - smallest layer, forming a tip */}
        <path d="M12 12 L10.5 10.5 C10.5 9.5, 11 8, 11.5 7 L12 6 L12.5 7 C13 8, 13.5 9.5, 13.5 10.5 L12 12Z" fill="#fffaef"/>

        {/* Cross inside flower: green (#809580) - Placed on the top central part */}
        <rect x="11" y="8.25" width="2" height="0.5" fill="#809580" rx="0.1"/> {/* Horizontal bar */}
        <rect x="11.75" y="7.5" width="0.5" height="2" fill="#809580" rx="0.1"/> {/* Vertical bar */}
      </svg>
    </div>
  );
};

export default AppLogo;
