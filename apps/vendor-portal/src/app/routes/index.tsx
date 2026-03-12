import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { VendorLayout } from '@/shared/components/layout/VendorLayout';

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));

// Onboarding
const OnboardingPage = lazy(() => import('@/features/onboarding/pages/OnboardingPage'));

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

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Onboarding - authenticated but no layout (standalone fullscreen wizard) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

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
