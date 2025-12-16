import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { MainLayout } from '@/shared/components/layout/MainLayout';
import { ChefLayout } from '@/shared/components/layout/ChefLayout';
import { AdminLayout } from '@/shared/components/layout/AdminLayout';
import { DeliveryLayout } from '@/shared/components/layout/DeliveryLayout';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/features/customer/pages/HomePage'));
const BrowseChefsPage = lazy(() => import('@/features/customer/pages/BrowseChefsPage'));
const ChefDetailPage = lazy(() => import('@/features/customer/pages/ChefDetailPage'));
const CartPage = lazy(() => import('@/features/customer/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/features/customer/pages/CheckoutPage'));
const OrdersPage = lazy(() => import('@/features/customer/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/customer/pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('@/features/customer/pages/ProfilePage'));
const SocialFeedPage = lazy(() => import('@/features/social/pages/SocialFeedPage'));
const CateringRequestPage = lazy(() => import('@/features/catering/pages/CateringRequestPage'));
const CateringQuotesPage = lazy(() => import('@/features/catering/pages/CateringQuotesPage'));

// Auth pages
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

// Chef pages
const ChefDashboardPage = lazy(() => import('@/features/chef/pages/DashboardPage'));
const ChefMenuPage = lazy(() => import('@/features/chef/pages/MenuPage'));
const ChefOrdersPage = lazy(() => import('@/features/chef/pages/OrdersPage'));
const ChefEarningsPage = lazy(() => import('@/features/chef/pages/EarningsPage'));
const ChefProfilePage = lazy(() => import('@/features/chef/pages/ProfilePage'));
const ChefSocialPage = lazy(() => import('@/features/chef/pages/SocialPage'));
const ChefCateringPage = lazy(() => import('@/features/chef/pages/CateringPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/DashboardPage'));
const AdminUsersPage = lazy(() => import('@/features/admin/pages/UsersPage'));
const AdminChefsPage = lazy(() => import('@/features/admin/pages/ChefsPage'));
const AdminOrdersPage = lazy(() => import('@/features/admin/pages/OrdersPage'));
const AdminAnalyticsPage = lazy(() => import('@/features/admin/pages/AnalyticsPage'));
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/SettingsPage'));

// Delivery pages
const DeliveryDashboardPage = lazy(() => import('@/features/delivery/pages/DashboardPage'));
const DeliveryOrdersPage = lazy(() => import('@/features/delivery/pages/OrdersPage'));
const DeliveryEarningsPage = lazy(() => import('@/features/delivery/pages/EarningsPage'));

// Protected route wrapper
function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
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

        {/* Customer routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="chefs" element={<BrowseChefsPage />} />
          <Route path="chefs/:id" element={<ChefDetailPage />} />
          <Route path="feed" element={<SocialFeedPage />} />
          <Route
            path="cart"
            element={
              <ProtectedRoute roles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="checkout"
            element={
              <ProtectedRoute roles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ProtectedRoute roles={['customer']}>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="orders/:id"
            element={
              <ProtectedRoute roles={['customer']}>
                <OrderDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute roles={['customer']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="catering"
            element={
              <ProtectedRoute roles={['customer']}>
                <CateringRequestPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="catering/quotes"
            element={
              <ProtectedRoute roles={['customer']}>
                <CateringQuotesPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Chef routes */}
        <Route
          path="chef"
          element={
            <ProtectedRoute roles={['chef']}>
              <ChefLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ChefDashboardPage />} />
          <Route path="menu" element={<ChefMenuPage />} />
          <Route path="orders" element={<ChefOrdersPage />} />
          <Route path="earnings" element={<ChefEarningsPage />} />
          <Route path="profile" element={<ChefProfilePage />} />
          <Route path="social" element={<ChefSocialPage />} />
          <Route path="catering" element={<ChefCateringPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin', 'super_admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="chefs" element={<AdminChefsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Delivery partner routes */}
        <Route
          path="delivery"
          element={
            <ProtectedRoute roles={['delivery']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboardPage />} />
          <Route path="orders" element={<DeliveryOrdersPage />} />
          <Route path="earnings" element={<DeliveryEarningsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
