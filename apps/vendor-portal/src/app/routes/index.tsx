import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { VendorLayout } from '@/shared/components/layout/VendorLayout';

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

// Feature pages
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const MenuPage = lazy(() => import('@/features/menu/pages/MenuPage'));
const MenuItemFormPage = lazy(() => import('@/features/menu/pages/MenuItemFormPage'));
const LiveOrdersPage = lazy(() => import('@/features/orders/pages/LiveOrdersPage'));
const OrderHistoryPage = lazy(() => import('@/features/orders/pages/OrderHistoryPage'));
const EarningsPage = lazy(() => import('@/features/earnings/pages/EarningsPage'));
const PayoutsPage = lazy(() => import('@/features/earnings/pages/PayoutsPage'));
const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const KitchenSetupPage = lazy(() => import('@/features/profile/pages/KitchenSetupPage'));
const ReviewsPage = lazy(() => import('@/features/reviews/pages/ReviewsPage'));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected vendor routes */}
        <Route
          element={
            <ProtectedRoute>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="menu/new" element={<MenuItemFormPage />} />
          <Route path="menu/:id/edit" element={<MenuItemFormPage />} />
          <Route path="orders" element={<LiveOrdersPage />} />
          <Route path="orders/history" element={<OrderHistoryPage />} />
          <Route path="earnings" element={<EarningsPage />} />
          <Route path="earnings/payouts" element={<PayoutsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/kitchen" element={<KitchenSetupPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
