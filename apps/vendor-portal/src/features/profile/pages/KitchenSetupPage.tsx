import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Clock,
  Image as ImageIcon,
  CreditCard,
  Plus,
  X,
  Landmark,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import { staggerContainer, fadeInUp } from '@/shared/utils/animations';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Input } from '@/shared/components/ui/Input';
import type { Chef, OperatingHours, DayHours } from '@/shared/types';

const dayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
}).optional();

const kitchenSchema = z.object({
  operatingHours: z.object({
    monday: dayHoursSchema,
    tuesday: dayHoursSchema,
    wednesday: dayHoursSchema,
    thursday: dayHoursSchema,
    friday: dayHoursSchema,
    saturday: dayHoursSchema,
    sunday: dayHoursSchema,
  }),
  kitchenPhotos: z.array(z.string()),
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

type KitchenFormData = z.infer<typeof kitchenSchema>;

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

type DayKey = (typeof DAYS_OF_WEEK)[number]['key'];

const DEFAULT_HOURS: DayHours = { open: '09:00', close: '21:00' };

export default function KitchenSetupPage() {
  const queryClient = useQueryClient();
  const [enabledDays, setEnabledDays] = useState<Record<DayKey, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
  });
  const [newPhotoUrl, setNewPhotoUrl] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['chef-profile'],
    queryFn: () => apiClient.get<Chef>('/chef/profile'),
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<KitchenFormData>({
    resolver: zodResolver(kitchenSchema),
    defaultValues: {
      operatingHours: {
        monday: DEFAULT_HOURS,
        tuesday: DEFAULT_HOURS,
        wednesday: DEFAULT_HOURS,
        thursday: DEFAULT_HOURS,
        friday: DEFAULT_HOURS,
        saturday: DEFAULT_HOURS,
        sunday: undefined,
      },
      kitchenPhotos: [],
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  useEffect(() => {
    if (profile) {
      const hours = profile.operatingHours || {};
      const newEnabledDays: Record<DayKey, boolean> = {
        monday: !!hours.monday,
        tuesday: !!hours.tuesday,
        wednesday: !!hours.wednesday,
        thursday: !!hours.thursday,
        friday: !!hours.friday,
        saturday: !!hours.saturday,
        sunday: !!hours.sunday,
      };
      setEnabledDays(newEnabledDays);

      reset({
        operatingHours: {
          monday: hours.monday || DEFAULT_HOURS,
          tuesday: hours.tuesday || DEFAULT_HOURS,
          wednesday: hours.wednesday || DEFAULT_HOURS,
          thursday: hours.thursday || DEFAULT_HOURS,
          friday: hours.friday || DEFAULT_HOURS,
          saturday: hours.saturday || DEFAULT_HOURS,
          sunday: hours.sunday || undefined,
        },
        kitchenPhotos: [],
        bankName: '',
        accountNumber: '',
        ifscCode: '',
      });
    }
  }, [profile, reset]);

  const kitchenPhotos = watch('kitchenPhotos') || [];

  const updateMutation = useMutation({
    mutationFn: (data: KitchenFormData) => {
      const operatingHours: OperatingHours = {};
      for (const day of DAYS_OF_WEEK) {
        if (enabledDays[day.key]) {
          operatingHours[day.key] = data.operatingHours[day.key] || DEFAULT_HOURS;
        }
      }

      return apiClient.put('/chef/profile', {
        operatingHours,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chef-profile'] });
      toast.success('Kitchen setup saved successfully');
    },
    onError: () => {
      toast.error('Failed to save kitchen setup');
    },
  });

  const toggleDay = (day: DayKey) => {
    setEnabledDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const addPhoto = () => {
    const trimmed = newPhotoUrl.trim();
    if (trimmed && !kitchenPhotos.includes(trimmed)) {
      setValue('kitchenPhotos', [...kitchenPhotos, trimmed], { shouldDirty: true });
      setNewPhotoUrl('');
    }
  };

  const removePhoto = (url: string) => {
    setValue(
      'kitchenPhotos',
      kitchenPhotos.filter((p) => p !== url),
      { shouldDirty: true }
    );
  };

  const onSubmit = (data: KitchenFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Page Header */}
      <motion.div variants={fadeInUp} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kitchen Setup</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Operating hours, photos, and payout details
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          isLoading={updateMutation.isPending}
          leftIcon={<Save className="h-4 w-4" />}
        >
          Save Changes
        </Button>
      </motion.div>

      {/* Operating Hours */}
      <motion.div variants={fadeInUp}>
        <Card>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Operating Hours</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Set the days and hours your kitchen is open for orders
          </p>

          <div className="mt-6 space-y-3">
            {DAYS_OF_WEEK.map(({ key, label }) => (
              <div
                key={key}
                className={`flex flex-wrap items-center gap-4 rounded-lg border p-3 transition-colors ${
                  enabledDays[key]
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                {/* Day Toggle */}
                <div className="flex w-32 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      enabledDays[key] ? 'bg-brand-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                        enabledDays[key] ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-medium ${
                      enabledDays[key] ? 'text-gray-900' : 'text-gray-400'
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Time Inputs */}
                {enabledDays[key] ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      {...register(`operatingHours.${key}.open`)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                      type="time"
                      {...register(`operatingHours.${key}.close`)}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">Closed</span>
                )}
              </div>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Kitchen Photos */}
      <motion.div variants={fadeInUp}>
        <Card>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Kitchen Photos</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Add photos of your kitchen to build trust with customers
          </p>

          {/* Photo Grid */}
          {kitchenPhotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {kitchenPhotos.map((url, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                >
                  <img
                    src={url}
                    alt={`Kitchen photo ${index + 1}`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(url)}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {kitchenPhotos.length === 0 && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-10 text-center">
              <ImageIcon className="h-10 w-10 text-gray-300" />
              <p className="mt-2 text-sm font-medium text-gray-500">No photos added</p>
              <p className="text-xs text-gray-400">Add image URLs below</p>
            </div>
          )}

          {/* Add Photo URL */}
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Paste image URL..."
              value={newPhotoUrl}
              onChange={(e) => setNewPhotoUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addPhoto();
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={addPhoto}
              disabled={!newPhotoUrl.trim()}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Payout / Bank Details */}
      <motion.div variants={fadeInUp}>
        <Card>
          <div className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900">Payout Details</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Bank account details for receiving your earnings
          </p>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-sm text-amber-700">
              <CreditCard className="mr-1.5 inline h-4 w-4" />
              Payout integration coming soon. These details are saved locally for now.
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Bank Name"
                placeholder="e.g. State Bank of India"
                {...register('bankName')}
              />
            </div>
            <Input
              label="Account Number"
              placeholder="Enter account number"
              type="text"
              {...register('accountNumber')}
            />
            <Input
              label="IFSC Code"
              placeholder="e.g. SBIN0001234"
              {...register('ifscCode')}
            />
          </div>
        </Card>
      </motion.div>

      {/* Back Link */}
      <motion.div variants={fadeInUp} className="flex justify-start">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </motion.div>
    </motion.div>
  );
}
