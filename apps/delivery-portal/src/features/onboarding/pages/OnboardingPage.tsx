import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Bike, Car } from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import { toast } from 'sonner';

const vehicleTypes = [
  { value: 'bike', label: 'Bicycle', icon: Bike },
  { value: 'scooter', label: 'Scooter/Motorcycle', icon: Bike },
  { value: 'car', label: 'Car', icon: Car },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleType || !vehicleNumber || !licenseNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/delivery/onboarding', {
        vehicleType,
        vehicleNumber,
        licenseNumber,
      });
      toast.success('Profile created! Pending verification.');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <Truck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Become a Delivery Partner</h1>
          <p className="mt-2 text-muted-foreground">Tell us about your vehicle to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-border bg-card p-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Vehicle Type</label>
            <div className="grid grid-cols-3 gap-3">
              {vehicleTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setVehicleType(type.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${
                      vehicleType === type.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Vehicle Number</label>
            <input
              type="text"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              placeholder="e.g., KA01AB1234"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">License Number</label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="e.g., DL1234567890"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !vehicleType || !vehicleNumber || !licenseNumber}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
