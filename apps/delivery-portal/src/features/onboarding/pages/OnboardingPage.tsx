import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Loader2 } from 'lucide-react';
import { apiClient } from '@/shared/services/api-client';
import { StepProgress } from '../components/StepProgress';
import { StepPersonalInfo } from '../components/StepPersonalInfo';
import { StepVehicleDetails } from '../components/StepVehicleDetails';
import { StepDocuments } from '../components/StepDocuments';
import { StepPayoutDetails } from '../components/StepPayoutDetails';
import { StepReview } from '../components/StepReview';

interface OnboardingStatusResponse {
  step: number;
  status: string;
  profile?: Record<string, unknown>;
  documentCount?: number;
  payoutMethodSet?: boolean;
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await apiClient.get<OnboardingStatusResponse>(
          '/driver/onboarding/status'
        );

        if (status.status === 'approved') {
          navigate('/dashboard', { replace: true });
          return;
        }

        if (status.status === 'submitted' || status.status === 'in_review' || status.status === 'rejected') {
          navigate('/onboarding/status', { replace: true });
          return;
        }

        // Resume from current step
        if (status.step && status.step > 0) {
          setCurrentStep(Math.min(status.step, 5));
        }

        if (status.profile) {
          setProfileData(status.profile);
        }
      } catch {
        // Not started — stay at step 1
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [navigate]);

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  const handleStepComplete = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSubmitComplete = () => {
    navigate('/onboarding/status', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Become a Delivery Partner</h1>
            <p className="text-xs text-muted-foreground">Complete your profile to start delivering</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {/* Step Progress */}
        <div className="mb-8">
          <StepProgress currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="rounded-2xl border border-border bg-card p-6">
          {currentStep === 1 && (
            <StepPersonalInfo
              initialData={profileData as Record<string, string>}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 2 && (
            <StepVehicleDetails
              initialData={profileData as Record<string, string>}
              onComplete={handleStepComplete}
              onBack={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StepDocuments
              onComplete={handleStepComplete}
              onBack={() => goToStep(2)}
            />
          )}
          {currentStep === 4 && (
            <StepPayoutDetails
              initialData={profileData as Record<string, string>}
              onComplete={handleStepComplete}
              onBack={() => goToStep(3)}
            />
          )}
          {currentStep === 5 && (
            <StepReview
              onComplete={handleSubmitComplete}
              onBack={() => goToStep(4)}
              onGoToStep={goToStep}
            />
          )}
        </div>
      </div>
    </div>
  );
}
