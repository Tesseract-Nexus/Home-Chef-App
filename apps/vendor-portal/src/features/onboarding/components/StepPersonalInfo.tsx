import { useOnboardingStore } from '@/app/store/onboarding-store';
import { Input } from '@/shared/components/ui/Input';
import { Card } from '@/shared/components/ui/Card';
import { User, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  errors: Record<string, string>;
}

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];

export function StepPersonalInfo({ errors }: Props) {
  const { data, updateData, updateAddress } = useOnboardingStore();

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-foreground">Personal Details</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about yourself. This information helps verify your identity.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Meena Sharma"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
            leftIcon={<User className="h-4 w-4" />}
            error={errors.fullName}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
              leftIcon={<Phone className="h-4 w-4" />}
              error={errors.phone}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="meena@example.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email}
              hint="Pre-filled from your login"
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Kitchen Address</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Where your kitchen is located. This is used for delivery radius and customer visibility.
        </p>

        <div className="mt-6 space-y-4">
          <Input
            label="Address Line 1"
            placeholder="House/Flat No., Building Name, Street"
            value={data.kitchenAddress.line1}
            onChange={(e) => updateAddress({ line1: e.target.value })}
            error={errors['kitchenAddress.line1']}
          />
          <Input
            label="Address Line 2 (Optional)"
            placeholder="Area, Colony, Landmark"
            value={data.kitchenAddress.line2 || ''}
            onChange={(e) => updateAddress({ line2: e.target.value })}
          />
          <Input
            label="Landmark (Optional)"
            placeholder="Near or opposite..."
            value={data.kitchenAddress.landmark || ''}
            onChange={(e) => updateAddress({ landmark: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              placeholder="e.g. Mumbai"
              value={data.kitchenAddress.city}
              onChange={(e) => updateAddress({ city: e.target.value })}
              error={errors['kitchenAddress.city']}
            />
            <div className="w-full">
              <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
              <select
                value={data.kitchenAddress.state}
                onChange={(e) => updateAddress({ state: e.target.value })}
                className="w-full rounded-lg border-2 border-input bg-background px-4 py-2.5 text-sm shadow-sm transition-all hover:border-primary/30 focus:border-ring focus:outline-none focus:ring-4 focus:ring-ring/20"
              >
                <option value="">Select state</option>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors['kitchenAddress.state'] && (
                <p className="mt-1.5 text-sm text-destructive">{errors['kitchenAddress.state']}</p>
              )}
            </div>
            <Input
              label="PIN Code"
              placeholder="400001"
              value={data.kitchenAddress.postalCode}
              onChange={(e) => updateAddress({ postalCode: e.target.value })}
              error={errors['kitchenAddress.postalCode']}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
