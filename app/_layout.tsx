import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { RewardsProvider } from '@/hooks/useRewards';
import { AdsProvider } from '@/hooks/useAds';
import { AddressProvider } from '@/hooks/useAddresses';
import { ReviewsProvider } from '@/hooks/useReviews';
import { TippingProvider } from '@/hooks/useTipping';
import { OrderManagementProvider } from '@/hooks/useOrderManagement';
import { ToastProvider } from '@/hooks/useToast';
import { NotificationsProvider } from '@/hooks/useNotifications';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <NotificationsProvider>
        <ToastProvider>
        <AddressProvider>
          <CartProvider>
          <ReviewsProvider>
            <RewardsProvider>
              <AdsProvider>
                <TippingProvider>
                    <OrderManagementProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/register" />
                    <Stack.Screen name="auth/delivery-onboarding" />
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="chef/[id]/menu" />
                    <Stack.Screen name="cart" />
                    <Stack.Screen name="+not-found" />
                  </Stack>
                  <StatusBar style="auto" />
                    </OrderManagementProvider>
                </TippingProvider>
              </AdsProvider>
            </RewardsProvider>
          </ReviewsProvider>
          </CartProvider>
        </AddressProvider>
        </ToastProvider>
      </NotificationsProvider>
    </AuthProvider>
  );
}