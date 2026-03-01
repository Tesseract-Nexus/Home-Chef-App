import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ChefHat } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/components/ui/Button';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const accessDenied = searchParams.get('error') === 'access-denied';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data);
      toast.success('Welcome back to your kitchen!');
    } catch (error: unknown) {
      const apiError = error as { error?: { message?: string } };
      toast.error(apiError?.error?.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-md"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500">
                <ChefHat className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fe3dr</h1>
                <p className="text-sm text-gray-500">Vendor Portal</p>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in to your kitchen
            </h2>
            <p className="mt-2 text-gray-600">
              Manage your menu, orders, and earnings
            </p>
          </motion.div>

          {accessDenied && (
            <motion.div
              variants={fadeInUp}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              This portal is only for vendor accounts. Please use the Fe3dr customer app.
            </motion.div>
          )}

          {/* Form */}
          <motion.form
            variants={fadeInUp}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('email')}
                  type="email"
                  placeholder="chef@example.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </motion.form>

          {/* Register link */}
          <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-gray-600">
            Want to start selling?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
              Register as a vendor
            </Link>
          </motion.p>

          {/* Demo credentials */}
          <motion.div
            variants={fadeInUp}
            className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4"
          >
            <p className="mb-2 text-xs font-medium text-gray-500">Demo Credentials</p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Email:</span> meena@example.com
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Password:</span> password123
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Image */}
      <div className="hidden flex-1 lg:block">
        <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-brand-500 to-brand-700 p-12">
          <div className="max-w-lg text-white">
            <ChefHat className="mb-6 h-16 w-16 opacity-80" />
            <h2 className="text-3xl font-bold">Grow your home kitchen business</h2>
            <p className="mt-4 text-lg opacity-90">
              Manage menus, track orders in real-time, view earnings analytics, and connect with customers — all from one dashboard.
            </p>
            <div className="mt-8 space-y-3">
              {['Real-time order management', 'Earnings & analytics dashboard', 'Menu management with categories', 'Customer reviews & ratings'].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <span className="text-xs font-bold">&#10003;</span>
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
