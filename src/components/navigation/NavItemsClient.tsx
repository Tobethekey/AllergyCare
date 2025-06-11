'use client';

import { usePathname } from 'next/navigation';
import NavItems from './NavItems';
import type React from 'react';

const NavItemsClient: React.FC = () => {
  const pathname = usePathname();
  return <NavItems pathname={pathname} />;
};

export default NavItemsClient;
