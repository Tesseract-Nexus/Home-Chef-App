import { useState, useEffect, useRef } from 'react';
import { Upload, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/shared/services/api-client';
import { useAuthStore } from '@/app/store/auth-store';

interface DocumentSlot {
  type: string;
  label: string;
  required: boolean;
}

const documentSlots: DocumentSlot[] = [
  { type: 'driving_license', label: 'Driving License', required: true },
  { type: 'vehicle_rc', label: 'Vehicle RC', required: true },
  { type: 'insurance', label: 'Insurance', required: true },
  { type: 'aadhaar', label: 'Aadhaar Card', required: true },
  { type: 'pan_card', label: 'PAN Card', required: false },
  { type: 'photo', label: 'Profile Photo', required: true },
  { type: 'police_verification', label: 'Police Verification', required: false },
];

interface UploadedDoc {
  id: string;
  type: string;
  fileName: string;
  status: string;
}

interface StepDocumentsProps {
  onComplete: () => void;
  onBack: () => void;
}

export function StepDocuments({ onComplete, onBack }: StepDocumentsProps) {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const fetchDocs = async () => {
    try {
      const result = await apiClient.get<UploadedDoc[]>('/driver/onboarding/documents');
      setDocs(result ?? []);
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

      const response = await fetch(
        `${window.location.origin}/bff/api/v1/driver/onboarding/documents`,
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

  const handleFileSelect = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadDocument(type, file);
    }
    // Reset input so the same file can be re-selected
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
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => handleFileSelect(slot.type, e)}
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
