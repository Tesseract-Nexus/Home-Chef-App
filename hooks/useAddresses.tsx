import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface Address {
  id: string;
  type: 'home' | 'work' | 'holiday' | 'temporary';
  label: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  isDefault: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  instructions?: string;
  createdAt: Date;
}

interface AddressContextType {
  addresses: Address[];
  defaultAddress: Address | null;
  addAddress: (address: Omit<Address, 'id' | 'createdAt'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getAddressesByType: (type: Address['type']) => Address[];
}

const SAMPLE_ADDRESSES: Address[] = [
  {
    id: '1',
    type: 'home',
    label: 'Home',
    fullAddress: '123, Linking Road, Bandra West',
    landmark: 'Near Bandra Station',
    pincode: '400050',
    city: 'Mumbai',
    state: 'Maharashtra',
    isDefault: true,
    instructions: 'Ring the bell twice',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    type: 'work',
    label: 'Office',
    fullAddress: 'Tower A, Business Park, Andheri East',
    landmark: 'Opposite Metro Station',
    pincode: '400069',
    city: 'Mumbai',
    state: 'Maharashtra',
    isDefault: false,
    instructions: 'Call when you reach the gate',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddresses must be used within an AddressProvider');
  }
  return context;
};

interface AddressProviderProps {
  children: ReactNode;
}

export const AddressProvider: React.FC<AddressProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(SAMPLE_ADDRESSES);

  const defaultAddress = addresses.find(addr => addr.isDefault) || null;

  const addAddress = async (addressData: Omit<Address, 'id' | 'createdAt'>) => {
    const newAddress: Address = {
      ...addressData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    // If this is the first address or marked as default, make it default
    if (addresses.length === 0 || addressData.isDefault) {
      // Remove default from other addresses
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
      newAddress.isDefault = true;
    }

    setAddresses(prev => [...prev, newAddress]);
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    setAddresses(prev => prev.map(addr => {
      if (addr.id === id) {
        return { ...addr, ...updates };
      }
      return addr;
    }));
  };

  const deleteAddress = async (id: string) => {
    const addressToDelete = addresses.find(addr => addr.id === id);
    if (!addressToDelete) return;

    setAddresses(prev => prev.filter(addr => addr.id !== id));

    // If deleted address was default, make the first remaining address default
    if (addressToDelete.isDefault && addresses.length > 1) {
      const remainingAddresses = addresses.filter(addr => addr.id !== id);
      if (remainingAddresses.length > 0) {
        await updateAddress(remainingAddresses[0].id, { isDefault: true });
      }
    }
  };

  const setDefaultAddress = async (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const getAddressesByType = (type: Address['type']) => {
    return addresses.filter(addr => addr.type === type);
  };

  const contextValue: AddressContextType = {
    addresses,
    defaultAddress,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getAddressesByType,
  };

  return (
    <AddressContext.Provider value={contextValue}>
      {children}
    </AddressContext.Provider>
  );
};