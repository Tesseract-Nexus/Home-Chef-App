import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OnboardingData, KitchenAddress, OperatingHours, DocumentUpload } from '@/shared/types';
import { createTTLStorage } from '@/shared/hooks/useDraftForm';

const TOTAL_STEPS = 5;

const DEFAULT_HOURS: OperatingHours = {
  monday: { open: '09:00', close: '21:00' },
  tuesday: { open: '09:00', close: '21:00' },
  wednesday: { open: '09:00', close: '21:00' },
  thursday: { open: '09:00', close: '21:00' },
  friday: { open: '09:00', close: '21:00' },
  saturday: { open: '09:00', close: '21:00' },
  sunday: { open: '09:00', close: '21:00' },
};

interface OnboardingState {
  currentStep: number;
  data: OnboardingData;
  totalSteps: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  updateAddress: (partial: Partial<KitchenAddress>) => void;
  updateHours: (day: keyof OperatingHours, hours: { open: string; close: string } | undefined) => void;
  addDocument: (doc: DocumentUpload) => void;
  removeDocument: (type: DocumentUpload['type']) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  fullName: '',
  phone: '',
  email: '',
  kitchenAddress: { line1: '', country: 'IN', city: '', state: '', postalCode: '' },
  businessName: '',
  description: '',
  kitchenType: 'home_kitchen',
  cuisines: [],
  specialties: [],
  yearsOfExperience: '',
  mealsPerDay: '',
  prepTime: '30-45 min',
  serviceRadius: 5,
  minimumOrder: 0,
  deliveryFee: 30,
  operatingHours: DEFAULT_HOURS,
  documents: [],
  acceptedTerms: false,
  acceptedHygienePolicy: false,
  acceptedCancellationPolicy: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      currentStep: 0,
      data: { ...initialData },
      totalSteps: TOTAL_STEPS,

      setStep: (step) => set({ currentStep: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS - 1) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 0) })),

      updateData: (partial) =>
        set((s) => ({ data: { ...s.data, ...partial } })),

      updateAddress: (partial) =>
        set((s) => ({
          data: { ...s.data, kitchenAddress: { ...s.data.kitchenAddress, ...partial } },
        })),

      updateHours: (day, hours) =>
        set((s) => ({
          data: {
            ...s.data,
            operatingHours: { ...s.data.operatingHours, [day]: hours },
          },
        })),

      addDocument: (doc) =>
        set((s) => ({
          data: {
            ...s.data,
            documents: [...s.data.documents.filter((d) => d.type !== doc.type), doc],
          },
        })),

      removeDocument: (type) =>
        set((s) => ({
          data: {
            ...s.data,
            documents: s.data.documents.filter((d) => d.type !== type),
          },
        })),

      reset: () => {
        localStorage.removeItem('vendor-onboarding');
        set({ currentStep: 0, data: { ...initialData } });
      },
    }),
    {
      name: 'vendor-onboarding',
      storage: createTTLStorage(),
      partialize: (state) => ({ currentStep: state.currentStep, data: state.data }),
    }
  )
);
