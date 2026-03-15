import { useState } from 'react';
import { apiClient } from '@/shared/services/api-client';
import { toast } from 'sonner';

interface VehicleData {
  vehicleType: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  vehicleNumber: string;
  licenseNumber: string;
}

interface StepVehicleDetailsProps {
  initialData?: Partial<VehicleData>;
  onComplete: () => void;
  onBack: () => void;
}

export function StepVehicleDetails({ initialData, onComplete, onBack }: StepVehicleDetailsProps) {
  const [form, setForm] = useState<VehicleData>({
    vehicleType: initialData?.vehicleType ?? '',
    vehicleMake: initialData?.vehicleMake ?? '',
    vehicleModel: initialData?.vehicleModel ?? '',
    vehicleYear: initialData?.vehicleYear ?? '',
    vehicleColor: initialData?.vehicleColor ?? '',
    vehicleNumber: initialData?.vehicleNumber ?? '',
    licenseNumber: initialData?.licenseNumber ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof VehicleData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.vehicleNumber.trim() || !form.licenseNumber.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/driver/onboarding/vehicle', {
        vehicleType: form.vehicleType || undefined,
        vehicleMake: form.vehicleMake || undefined,
        vehicleModel: form.vehicleModel || undefined,
        vehicleYear: form.vehicleYear ? Number(form.vehicleYear) : undefined,
        vehicleColor: form.vehicleColor || undefined,
        vehicleNumber: form.vehicleNumber,
        licenseNumber: form.licenseNumber,
      });
      toast.success('Vehicle details saved');
      onComplete();
    } catch {
      toast.error('Failed to save. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = form.vehicleNumber.trim() && form.licenseNumber.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Vehicle Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Tell us about your vehicle</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Make</label>
            <input
              type="text"
              value={form.vehicleMake}
              onChange={(e) => updateField('vehicleMake', e.target.value)}
              placeholder="e.g., Honda, Bajaj"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Model</label>
            <input
              type="text"
              value={form.vehicleModel}
              onChange={(e) => updateField('vehicleModel', e.target.value)}
              placeholder="e.g., Activa 6G"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Year</label>
            <input
              type="number"
              value={form.vehicleYear}
              onChange={(e) => updateField('vehicleYear', e.target.value)}
              placeholder="e.g., 2022"
              min="1990"
              max="2030"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Color</label>
            <input
              type="text"
              value={form.vehicleColor}
              onChange={(e) => updateField('vehicleColor', e.target.value)}
              placeholder="e.g., Black"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Vehicle Registration Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form.vehicleNumber}
            onChange={(e) => updateField('vehicleNumber', e.target.value)}
            placeholder="e.g., KA01AB1234"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Driving License Number <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={form.licenseNumber}
            onChange={(e) => updateField('licenseNumber', e.target.value)}
            placeholder="e.g., DL1234567890"
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !isValid}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
