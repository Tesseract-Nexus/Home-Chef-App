import { useState, useEffect } from 'react';
import { Crown, Check, Loader2, Shield } from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import { toast } from 'sonner';

interface Plan {
  interval: string;
  amount: number;
  currency: string;
  savingsPercent?: number;
}

interface PlansResponse {
  plans: Plan[];
  trialDays: number;
  currency: string;
  paymentGateway: string;
}

interface StepSubscriptionPlanProps {
  onComplete: () => void;
  onBack: () => void;
}

const INTERVAL_LABELS: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const INTERVAL_DESCRIPTIONS: Record<string, string> = {
  monthly: 'Billed every month',
  quarterly: 'Billed every 3 months',
  yearly: 'Billed once a year',
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

export function StepSubscriptionPlan({ onComplete, onBack }: StepSubscriptionPlanProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trialDays, setTrialDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedInterval, setSelectedInterval] = useState('monthly');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await apiClient.get<PlansResponse>('/driver/subscription/plans');
        setPlans(data.plans ?? []);
        setTrialDays(data.trialDays ?? 0);
      } catch {
        toast.error('Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/driver/subscription/choose-plan', {
        interval: selectedInterval,
      });
      toast.success('Subscription plan selected');
      onComplete();
    } catch {
      toast.error('Failed to select plan. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const selectedPlan = plans.find((p) => p.interval === selectedInterval);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Subscription Plan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your plan — billing starts only after you begin earning
        </p>
      </div>

      {/* Trial Banner */}
      {trialDays > 0 && (
        <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {trialDays}-day free trial included
              </p>
              <p className="text-xs text-muted-foreground">
                No charges during trial. You keep 100% of your earnings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className="space-y-3">
        {plans.map((plan) => (
          <button
            key={plan.interval}
            type="button"
            onClick={() => setSelectedInterval(plan.interval)}
            className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
              selectedInterval === plan.interval
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                    selectedInterval === plan.interval
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}
                >
                  {selectedInterval === plan.interval && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {INTERVAL_LABELS[plan.interval] || plan.interval}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {INTERVAL_DESCRIPTIONS[plan.interval] || ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(plan.amount, plan.currency)}
                </p>
                {plan.savingsPercent && plan.savingsPercent > 0 && (
                  <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    Save {Math.round(plan.savingsPercent)}%
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Payment Info */}
      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Payments are securely processed via <span className="font-medium text-foreground">Razorpay</span>.
              Your subscription fee is auto-deducted once you start earning above the minimum threshold.
            </p>
            <p className="text-xs text-muted-foreground">
              You can update your payment method or change plans anytime from your dashboard.
            </p>
          </div>
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
          disabled={submitting || !selectedPlan}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : `Start with ${INTERVAL_LABELS[selectedInterval] || selectedInterval} Plan`}
        </button>
      </div>
    </div>
  );
}
