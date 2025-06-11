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
        className="text-primary"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2C12 2 4 5 4 11C4 17.6667 7.66667 21 12 22C16.3333 21 20 17.6667 20 11C20 5 12 2 12 2ZM13 7H11V10H8V12H11V15H13V12H16V10H13V7Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-headline text-2xl font-semibold text-primary">AllergyCare</span>
    </div>
  );
};

export default AppLogo;
