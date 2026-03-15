import { useAuth } from '@/app/providers/AuthProvider';

export default function RegisterPage() {
  const { register } = useAuth();
  register();
  return null;
}
