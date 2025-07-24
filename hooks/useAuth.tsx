import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/apiService';
import { isFeatureEnabled } from '@/config/featureFlags';

export type UserRole = 'customer' | 'chef' | 'admin' | 'delivery_partner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  pincode?: string;
  state?: string;
  isVerified?: boolean;
  vehicleType?: 'bike' | 'scooter' | 'car' | 'bicycle';
  vehicleNumber?: string;
  drivingLicense?: string;
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  isAvailable?: boolean;
  documents?: {
    identity?: string;
    fssai?: string;
    address?: string;
    drivingLicense?: string;
    vehicleRegistration?: string;
    insurance?: string;
  };
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithOTP: (phoneNumber: string, otp: string, role: UserRole) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook' | 'instagram', role: UserRole) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  pincode?: string;
  state?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userRole = user?.role || null;

  useEffect(() => {
    // Simulate checking for existing session
    const checkAuthState = async () => {
      try {
        // In a real app, check AsyncStorage or secure storage
        const savedUser = null; // await AsyncStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password, role);
      
      if (response.success) {
        setUser(response.user as User);
        // Store token if needed
        // await AsyncStorage.setItem('token', response.token);
      } else {
        throw new Error('Login failed');
      }
      // In a real app: await AsyncStorage.setItem('user', JSON.stringify(mockUser));
    } catch (error) {
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOTP = async (phoneNumber: string, otp: string, role: UserRole) => {
    setIsLoading(true);
    try {
      const response = await apiService.verifyOTP(phoneNumber, otp, role);
      if (response.success) {
        setUser(response.user as User);
      }
    } catch (error) {
      throw new Error('OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook' | 'instagram', role: UserRole) => {
    setIsLoading(true);
    try {
      const mockToken = `mock-${provider}-token`;
      const response = await apiService.socialLogin(provider, mockToken, role);
      if (response.success) {
        setUser(response.user as User);
        // Store token if needed
        // await AsyncStorage.setItem('token', response.token);
      } else {
        throw new Error('Social login failed');
      }
    } catch (error) {
      throw new Error('Social login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        address: userData.address,
        pincode: userData.pincode,
        state: userData.state,
        isVerified: userData.role === 'customer', // Auto-verify customers
      };
      
      setUser(newUser);
      // In a real app: await AsyncStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // In a real app: await AsyncStorage.removeItem('user');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      // In a real app: await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error('Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    userRole,
    isLoading,
    login,
    loginWithOTP,
    socialLogin,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};