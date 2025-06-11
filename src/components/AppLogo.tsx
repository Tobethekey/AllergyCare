
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
        <defs>
          {/* Defined a more rounded, fuller petal shape */}
          <path id="petal" d="M0 -8 Q-2.5 0 0 1.5 Q2.5 0 0 -8Z" fill="#fffaef"/>
        </defs>
        {/* Outer circle: primary color */}
        <circle cx="12" cy="12" r="11.5" fill="#809580"/>

        {/* Outer Petals - Scaled up for more presence */}
        <use href="#petal" transform="translate(12 12) rotate(0) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(30) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(60) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(90) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(120) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(150) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(180) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(210) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(240) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(270) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(300) scale(1.4)"/>
        <use href="#petal" transform="translate(12 12) rotate(330) scale(1.4)"/>

        {/* Inner Petals - Slightly smaller scale */}
        <use href="#petal" transform="translate(12 12) rotate(15) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(45) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(75) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(105) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(135) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(165) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(195) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(225) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(255) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(285) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(315) scale(1.0)"/>
        <use href="#petal" transform="translate(12 12) rotate(345) scale(1.0)"/>

        {/* Center Circle for Plus background */}
        <circle cx="12" cy="12" r="3" fill="#fffaef" />

        {/* Plus Sign: green (#809580), slightly thicker and with rounded corners */}
        <rect x="10.75" y="9" width="2.5" height="6" fill="#809580" rx="0.5"/>
        <rect x="9" y="10.75" width="6" height="2.5" fill="#809580" rx="0.5"/>
      </svg>
    </div>
  );
};

export default AppLogo;
