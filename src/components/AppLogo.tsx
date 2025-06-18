import Link from 'next/link';
import type React from 'react';

export function AppLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-semibold"
      aria-label="Zurück zum Dashboard"
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="12" cy="12" r="11.5" fill="#809580" />

        {/* Filigree Line Symbol Path */}
        <path
          d="M12.0001 5.5C10.5501 6.04002 8.56005 7.98997 7.50005 11.4C6.98005 13.34 7.40006 16.32 9.50006 17.57M14.5001 17.57C16.6001 16.32 17.0201 13.34 16.5001 11.4C15.4401 7.98997 13.4501 6.04002 12.0001 5.5M9.50006 17.57C9.30006 18.01 9.50006 18.91 12.0001 19.5C14.5001 18.91 14.7001 18.01 14.5001 17.57M9.60005 13.3C9.20005 13.11 8.85005 13.36 8.81005 13.78C8.71005 14.92 9.49005 15.86 10.4201 15.98C11.3001 16.09 12.0701 15.42 12.1301 14.6C12.2101 13.57 11.1901 12.86 10.2301 13.06C10.0001 13.11 9.81005 13.2 9.60005 13.3"
          stroke="#fffaef"
          fill="none"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display">AllergyCare</span>
    </Link>
  );
}
