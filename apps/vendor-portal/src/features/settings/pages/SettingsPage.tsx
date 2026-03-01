import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Power, Lock, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import { Button } from '@/shared/components/ui/Button';
import { staggerContainer, fadeInUp } from '@/shared/utils/animations';

interface SettingsData {
  notifications: {
    pushNewOrder: boolean;
    pushOrderUpdate: boolean;
    emailDailySummary: boolean;
    emailWeeklyReport: boolean;
    smsNewOrder: boolean;
  };
  autoAcceptOrders: boolean;
  autoAcceptThreshold: number;
  acceptingOrders: boolean;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['chef-settings'],
    queryFn: () => apiClient.get<SettingsData>('/chef/settings'),
  });

  const [localSettings, setLocalSettings] = useState<SettingsData | null>(null);

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: SettingsData) => apiClient.put('/chef/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-settings'] });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  if (isLoading || !localSettings) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const toggleNotification = (key: keyof SettingsData['notifications']) => {
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: !localSettings.notifications[key],
      },
    });
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp} className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-description">Manage your vendor preferences</p>
      </motion.div>

      {/* Accepting Orders */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Power className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Order Acceptance</h2>
        </div>
        <div className="mt-4 space-y-4">
          <ToggleRow
            label="Accepting Orders"
            description="Master toggle - turn off to stop receiving new orders"
            checked={localSettings.acceptingOrders}
            onChange={() =>
              setLocalSettings({ ...localSettings, acceptingOrders: !localSettings.acceptingOrders })
            }
          />
          <ToggleRow
            label="Auto-accept Orders"
            description="Automatically accept orders below a threshold"
            checked={localSettings.autoAcceptOrders}
            onChange={() =>
              setLocalSettings({ ...localSettings, autoAcceptOrders: !localSettings.autoAcceptOrders })
            }
          />
          {localSettings.autoAcceptOrders && (
            <div className="ml-8">
              <label className="block text-sm font-medium text-gray-700">
                Auto-accept threshold ($)
              </label>
              <input
                type="number"
                value={localSettings.autoAcceptThreshold}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    autoAcceptThreshold: Number(e.target.value),
                  })
                }
                className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                Orders under this amount will be auto-accepted
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        </div>
        <div className="mt-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Push Notifications</h3>
          <ToggleRow
            label="New order alerts"
            description="Get notified when a new order comes in"
            checked={localSettings.notifications.pushNewOrder}
            onChange={() => toggleNotification('pushNewOrder')}
          />
          <ToggleRow
            label="Order updates"
            description="Notifications for order status changes"
            checked={localSettings.notifications.pushOrderUpdate}
            onChange={() => toggleNotification('pushOrderUpdate')}
          />
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-500">Email</h3>
          </div>
          <ToggleRow
            label="Daily summary"
            description="Receive a daily email with order and earnings summary"
            checked={localSettings.notifications.emailDailySummary}
            onChange={() => toggleNotification('emailDailySummary')}
          />
          <ToggleRow
            label="Weekly report"
            description="Weekly performance report with analytics"
            checked={localSettings.notifications.emailWeeklyReport}
            onChange={() => toggleNotification('emailWeeklyReport')}
          />
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-500">SMS</h3>
          </div>
          <ToggleRow
            label="New order SMS"
            description="Get an SMS for each new order"
            checked={localSettings.notifications.smsNewOrder}
            onChange={() => toggleNotification('smsNewOrder')}
          />
        </div>
      </motion.div>

      {/* Change Password */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-brand-500" />
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
        </div>
        <div className="mt-4 max-w-md space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <Button
            size="sm"
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            onClick={() => {
              toast.success('Password updated successfully');
              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
          >
            Update Password
          </Button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={fadeInUp} className="rounded-xl border border-red-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Trash2 className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Deactivating your account will hide your kitchen from customers and pause all orders.
        </p>
        <Button
          variant="danger"
          size="sm"
          className="mt-4"
          onClick={() => toast.error('Account deactivation is not available in demo mode')}
        >
          Deactivate Account
        </Button>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={fadeInUp} className="flex justify-end">
        <Button
          size="lg"
          onClick={() => saveMutation.mutate(localSettings)}
          isLoading={saveMutation.isPending}
        >
          Save Settings
        </Button>
      </motion.div>
    </motion.div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-500' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
