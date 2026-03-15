import { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import { useAuthStore } from '@/app/store/auth-store';

interface DocumentSlot {
  type: string;
  label: string;
  required: boolean;
  accept: string;     // file input accept attribute
  hint: string;       // helper text
  maxSizeMB: number;  // max file size in MB
}

const photoSlot: DocumentSlot = {
  type: 'photo', label: 'Profile Photo', required: true,
  accept: 'image/jpeg,image/png,.jpg,.jpeg,.png',
  hint: 'JPEG or PNG only, max 5MB',
  maxSizeMB: 5,
};

const docSlotDefaults = {
  accept: 'image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf',
  hint: 'JPEG, PNG, WebP, or PDF, max 10MB',
  maxSizeMB: 10,
};

const motorVehicleDocSlots: DocumentSlot[] = [
  { type: 'driving_license', label: 'Driving License', required: true, ...docSlotDefaults },
  { type: 'vehicle_rc', label: 'Vehicle RC', required: true, ...docSlotDefaults },
  { type: 'insurance', label: 'Insurance', required: true, ...docSlotDefaults },
  { type: 'aadhaar', label: 'Aadhaar Card', required: true, ...docSlotDefaults },
  { type: 'pan_card', label: 'PAN Card', required: false, ...docSlotDefaults },
  photoSlot,
  { type: 'police_verification', label: 'Police Verification', required: false, ...docSlotDefaults },
];

const bicycleDocSlots: DocumentSlot[] = [
  { type: 'aadhaar', label: 'Aadhaar Card', required: true, ...docSlotDefaults },
  photoSlot,
  { type: 'pan_card', label: 'PAN Card', required: false, ...docSlotDefaults },
  { type: 'police_verification', label: 'Police Verification', required: false, ...docSlotDefaults },
];

interface UploadedDoc {
  id: string;
  type: string;
  fileName: string;
  status: string;
}

interface StepDocumentsProps {
  vehicleType?: string;
  onComplete: () => void;
  onBack: () => void;
}

export function StepDocuments({ vehicleType, onComplete, onBack }: StepDocumentsProps) {
  const isBicycle = vehicleType === 'bicycle';
  const documentSlots = isBicycle ? bicycleDocSlots : motorVehicleDocSlots;

  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchDocs = async () => {
    try {
      const result = await apiClient.get<{ data: UploadedDoc[] }>('/driver/onboarding/documents');
      const docsArray = Array.isArray(result) ? result : (result?.data ?? []);
      setDocs(docsArray);
    } catch {
      // No docs uploaded yet
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const uploadDocument = async (type: string, file: File) => {
    setUploading(type);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('file', file);

      const csrfToken = useAuthStore.getState().csrfToken;
      const headers: HeadersInit = {};
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }

      const authMode = localStorage.getItem('fe3dr-auth-mode');
      const bffPath = authMode === 'driver' ? '/driver-bff' : '/bff';
      const response = await fetch(
        `${window.location.origin}${bffPath}/api/v1/driver/onboarding/documents`,
        {
          method: 'POST',
          credentials: 'include',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success(`${documentSlots.find((s) => s.type === type)?.label} uploaded`);
      await fetchDocs();
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleFileSelect = (slot: DocumentSlot, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Client-side size check
      const maxBytes = slot.maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        toast.error(`File too large. Max ${slot.maxSizeMB}MB for ${slot.label}`);
        e.target.value = '';
        return;
      }
      uploadDocument(slot.type, file);
    }
    e.target.value = '';
  };

  const getDocForType = (type: string) => docs.find((d) => d.type === type);

  const requiredSlots = documentSlots.filter((s) => s.required);
  const allRequiredUploaded = requiredSlots.every((slot) => getDocForType(slot.type));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Documents</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload required documents for verification
        </p>
        {isBicycle && (
          <p className="mt-1 text-xs text-muted-foreground">
            Since you're using a bicycle, driving license and vehicle RC are not required.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {documentSlots.map((slot) => {
          const uploaded = getDocForType(slot.type);
          const isUploading = uploading === slot.type;

          return (
            <div
              key={slot.type}
              className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3">
                {uploaded ? (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {slot.label}
                    {slot.required && <span className="ml-1 text-destructive">*</span>}
                  </p>
                  {uploaded && (
                    <p className="text-xs text-muted-foreground">{uploaded.fileName}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {uploaded && (
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {uploaded.status === 'verified' ? 'Verified' : 'Uploaded'}
                  </span>
                )}
                <input
                  ref={(el) => { fileInputRefs.current[slot.type] = el; }}
                  type="file"
                  accept={slot.accept}
                  className="hidden"
                  onChange={(e) => handleFileSelect(slot, e)}
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[slot.type]?.click()}
                  disabled={isUploading}
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary disabled:opacity-50"
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : uploaded ? (
                    'Replace'
                  ) : (
                    <span className="flex items-center gap-1">
                      <Upload className="h-3 w-3" />
                      Upload
                    </span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {!allRequiredUploaded && (
        <p className="text-sm text-muted-foreground">
          Upload all required documents (marked with *) to continue.
        </p>
      )}

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
          onClick={onComplete}
          disabled={!allRequiredUploaded}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
