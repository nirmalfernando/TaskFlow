import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings } from 'lucide-react';
import { Sidebar, type SidebarNavItem } from './Sidebar';
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

const BASE_NAV_ITEMS: SidebarNavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-[18px] w-[18px]" /> },
  { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-[18px] w-[18px]" /> },
  { key: 'settings', label: 'Settings', icon: <Settings className="h-[18px] w-[18px]" /> },
];

const ADMIN_NAV_ITEM: SidebarNavItem = {
  key: 'users',
  label: 'Users',
  icon: <Users className="h-[18px] w-[18px]" />,
  badge: 'Admin',
};

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeNav = PATH_TO_NAV[location.pathname] ?? 'dashboard';

  const navItems: SidebarNavItem[] =
    user?.role === 'ADMIN'
      ? [BASE_NAV_ITEMS[0], BASE_NAV_ITEMS[1], ADMIN_NAV_ITEM, BASE_NAV_ITEMS[2]]
      : BASE_NAV_ITEMS;

  function handleNavChange(key: string) {
    const path = NAV_TO_PATH[key];
    if (path) navigate(path);
  }

  const fullName = user ? `${user.firstName} ${user.lastName}` : '';

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={handleNavChange}
        user={
          user
            ? { name: fullName, role: user.role, avatarSrc: user.avatarUrl ?? undefined }
            : undefined
        }
        onLogout={() => {
          void logout().then(() => navigate('/login', { replace: true }));
        }}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={{ name: fullName, avatarSrc: user?.avatarUrl ?? undefined }}
          onProfileClick={() => navigate('/settings')}
        />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
