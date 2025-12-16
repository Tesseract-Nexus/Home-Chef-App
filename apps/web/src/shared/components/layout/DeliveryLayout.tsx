import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  DollarSign,
  User,
  Navigation,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';

const navigation = [
  { name: 'Dashboard', href: '/delivery/dashboard', icon: LayoutDashboard },
  { name: 'Orders', href: '/delivery/orders', icon: Package },
  { name: 'Earnings', href: '/delivery/earnings', icon: DollarSign },
];

export function DeliveryLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/delivery/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500">
              <span className="text-lg font-bold text-white">H</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">HomeChef</span>
              <p className="text-xs text-gray-500">Delivery</p>
            </div>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Online toggle */}
            <button className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              Online
            </button>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* User */}
            <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100">
                  <User className="h-4 w-4 text-brand-600" />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="sticky bottom-0 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around py-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-4 py-2 ${
                  isActive(item.href)
                    ? 'text-brand-600'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-gray-500 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
