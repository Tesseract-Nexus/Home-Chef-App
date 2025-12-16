import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  MapPin,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Camera,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/AuthProvider';
import type { Address } from '@/shared/types';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payment Methods', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-app max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Account Settings</h1>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <div className="lg:w-64">
            <div className="rounded-xl bg-white p-4 shadow-sm">
              {/* User Info */}
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-brand-100 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.firstName}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-brand-600">
                        {user?.firstName?.charAt(0)}
                        {user?.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="mt-4 space-y-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-50 text-brand-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Log Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && <ProfileTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'payments' && <PaymentsTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'security' && <SecurityTab />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-brand-600 hover:text-brand-700"
          >
            Edit
          </button>
        )}
      </div>

      {/* Avatar */}
      <div className="mt-6 flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 rounded-full bg-brand-100 flex items-center justify-center">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.firstName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-brand-600">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <button className="absolute bottom-0 right-0 rounded-full bg-white p-1.5 shadow-md hover:bg-gray-50">
            <Camera className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div>
          <p className="font-medium text-gray-900">Profile Photo</p>
          <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size 5MB.</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">First name</label>
            <input
              {...register('firstName')}
              disabled={!isEditing}
              className="input-base mt-1 disabled:bg-gray-50"
            />
            {errors.firstName && (
              <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Last name</label>
            <input
              {...register('lastName')}
              disabled={!isEditing}
              className="input-base mt-1 disabled:bg-gray-50"
            />
            {errors.lastName && (
              <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register('email')}
            type="email"
            disabled={!isEditing}
            className="input-base mt-1 disabled:bg-gray-50"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            {...register('phone')}
            type="tel"
            disabled={!isEditing}
            className="input-base mt-1 disabled:bg-gray-50"
          />
        </div>

        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                reset();
                setIsEditing(false);
              }}
              className="btn-outline"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function AddressesTab() {
  const [showForm, setShowForm] = useState(false);

  // Mock addresses
  const addresses: Address[] = [
    {
      id: '1',
      userId: '1',
      label: 'Home',
      line1: '123 Main Street',
      line2: 'Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94102',
      country: 'USA',
      isDefault: true,
    },
    {
      id: '2',
      userId: '1',
      label: 'Work',
      line1: '456 Market Street',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'USA',
      isDefault: false,
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Saved Addresses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-outline"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between rounded-lg border p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{address.label}</span>
                {address.isDefault && (
                  <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600">
                {address.line1}
                {address.line2 && `, ${address.line2}`}
              </p>
              <p className="text-sm text-gray-600">
                {address.city}, {address.state} {address.postalCode}
              </p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Edit2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentsTab() {
  const paymentMethods = [
    { id: '1', type: 'visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'mastercard', last4: '8888', expiry: '06/26', isDefault: false },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
        <button className="btn-outline">
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-16 items-center justify-center rounded bg-gray-100">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {method.type} •••• {method.last4}
                  </span>
                  {method.isDefault && (
                    <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Expires {method.expiry}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Edit2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    orderUpdates: true,
    promotions: true,
    newChefs: false,
    reviews: true,
    email: true,
    push: true,
    sms: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>

      <div className="mt-6 space-y-6">
        <div>
          <h3 className="font-medium text-gray-900">What to notify about</h3>
          <div className="mt-4 space-y-4">
            {[
              { key: 'orderUpdates', label: 'Order updates', desc: 'Get notified about order status changes' },
              { key: 'promotions', label: 'Promotions & offers', desc: 'Receive special deals and discounts' },
              { key: 'newChefs', label: 'New chefs nearby', desc: 'When new chefs join in your area' },
              { key: 'reviews', label: 'Review reminders', desc: 'Reminders to review past orders' },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={settings[item.key as keyof typeof settings]}
                  onChange={() => toggleSetting(item.key as keyof typeof settings)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-medium text-gray-900">How to notify</h3>
          <div className="mt-4 space-y-4">
            {[
              { key: 'email', label: 'Email notifications' },
              { key: 'push', label: 'Push notifications' },
              { key: 'sms', label: 'SMS notifications' },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between">
                <span className="text-gray-700">{item.label}</span>
                <button
                  onClick={() => toggleSetting(item.key as keyof typeof settings)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings[item.key as keyof typeof settings] ? 'bg-brand-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      settings[item.key as keyof typeof settings] ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Password</h2>
        <p className="mt-1 text-sm text-gray-500">
          Change your password to keep your account secure
        </p>

        {showPasswordForm ? (
          <form className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Current password
              </label>
              <input type="password" className="input-base mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New password
              </label>
              <input type="password" className="input-base mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm new password
              </label>
              <input type="password" className="input-base mt-1" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Update Password
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="btn-outline mt-4"
          >
            Change Password
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h2>
        <p className="mt-1 text-sm text-gray-500">
          Add an extra layer of security to your account
        </p>
        <button className="btn-outline mt-4">
          Enable 2FA
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Connected Accounts</h2>
        <p className="mt-1 text-sm text-gray-500">
          Manage your connected social accounts
        </p>

        <div className="mt-4 space-y-3">
          {[
            { name: 'Google', connected: true },
            { name: 'Facebook', connected: false },
            { name: 'Apple', connected: false },
          ].map((account) => (
            <div
              key={account.name}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <span className="font-medium text-gray-900">{account.name}</span>
              {account.connected ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <Check className="h-4 w-4" />
                  Connected
                </span>
              ) : (
                <button className="text-sm text-brand-600 hover:text-brand-700">
                  Connect
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-800">Delete Account</h2>
        <p className="mt-1 text-sm text-red-600">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button className="btn-base mt-4 bg-red-600 text-white hover:bg-red-700">
          Delete Account
        </button>
      </div>
    </div>
  );
}
