import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAuth } from '@/hooks/useAuth';

const NAV_TO_PATH: Record<string, string> = {
  dashboard: '/dashboard',
  tasks: '/tasks',
  users: '/users',
  settings: '/settings',
};

const PATH_TO_NAV: Record<string, string> = Object.fromEntries(
  Object.entries(NAV_TO_PATH).map(([k, v]) => [v, k]),
);

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeNav = PATH_TO_NAV[location.pathname] ?? 'dashboard';

  function handleNavChange(key: string) {
    const path = NAV_TO_PATH[key];
    if (path) navigate(path);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        activeNav={activeNav}
        onNavChange={handleNavChange}
        user={user ? { name: `${user.firstName} ${user.lastName}`, role: user.role } : undefined}
        onLogout={() => {
          void logout();
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar user={user ? { name: `${user.firstName} ${user.lastName}` } : { name: '' }} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
