import { Outlet } from 'react-router';

import { NetworkStatusBanner } from '@/shared/components/network-status-banner/network-status-banner';

export function RootLayout() {
  return (
    <>
      <NetworkStatusBanner />
      <Outlet />
    </>
  );
}
