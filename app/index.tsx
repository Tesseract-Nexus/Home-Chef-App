import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { ChefHat } from 'lucide-react-native';
import { getResponsiveDimensions } from '@/utils/responsive';

export default function App() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { isWeb } = getResponsiveDimensions();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Route based on user role
        switch (user.role) {
          case 'chef':
            router.replace('/(tabs)/chef-home' as any);
            break;
          case 'admin':
            router.replace('/(tabs)/dashboard' as any);
            break;
          case 'delivery_partner':
            router.replace('/(tabs)/delivery-dashboard' as any);
            break;
          case 'customer':
          default:
            router.replace('/(tabs)/home' as any);
            break;
        }
      } else {
        router.replace('/auth/login' as any);
      }
    }
  }, [user, isLoading, router]);

  return (
    <View style={[styles.container, isWeb && styles.webContainer]}>
      <View style={styles.logoContainer}>
        <ChefHat size={60} color="#FF6B35" />
      </View>
      <Text style={styles.title}>HomeChef</Text>
      <Text style={styles.tagline}>Authentic homemade food delivered to your door</Text>
      <ActivityIndicator size="large" color="#FF6B35" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  webContainer: {
    minHeight: '100vh',
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF5F0',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});