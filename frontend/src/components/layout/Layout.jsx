import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const location = useLocation();
  const basePath = location.pathname.startsWith('/superadmin') ? '/superadmin'
    : location.pathname.startsWith('/admin') ? '/admin' : '/erp';

  // Monitor sahifasida sidebar yashirinadi (to'liq ekran)
  const isMonitor = location.pathname === '/erp/monitor';

  if (isMonitor) {
    return (
      <div className="h-screen overflow-hidden">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar basePath={basePath} />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
