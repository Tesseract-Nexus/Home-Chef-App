import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Activity, Users, ChefHat, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/components/ui/Button';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';

const FEATURES = [
  { icon: Users, text: 'User & role management' },
  { icon: ChefHat, text: 'Chef verification & approvals' },
  { icon: ShoppingBag, text: 'Order monitoring & refunds' },
  { icon: Activity, text: 'Platform analytics & insights' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const authError = searchParams.get('error');
  const accessDenied = authError === 'access-denied';
  const sessionExpired = authError === 'session_expired' || authError === 'invalid_state';

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="relative hidden flex-1 bg-sidebar lg:flex lg:flex-col lg:justify-center lg:px-14 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-primary">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-sidebar-foreground font-display">Fe3dr</span>
          </div>

          <h2 className="max-w-md text-3xl font-bold leading-tight text-sidebar-foreground font-display xl:text-4xl">
            Platform Administration
          </h2>
          <p className="mt-3 max-w-md text-base text-sidebar-foreground/70">
            Manage users, chefs, orders, and analytics for the Fe3dr platform.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
                  <Icon className="h-5 w-5 text-sidebar-primary" />
                </div>
                <span className="text-sm text-sidebar-foreground/80">{text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side - Login */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:max-w-xl lg:px-16 xl:px-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-sm"
        >
          {/* Logo (mobile) */}
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground font-display">Fe3dr</h1>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground font-display sm:text-3xl">
              Admin Sign In
            </h2>
            <p className="mt-2 text-muted-foreground">
              Access the administration dashboard with your internal credentials
            </p>
          </motion.div>

          {/* Error messages */}
          {accessDenied && (
            <motion.div
              variants={fadeInUp}
              className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              Access denied. Only administrators can sign in to this portal.
            </motion.div>
          )}

          {sessionExpired && (
            <motion.div
              variants={fadeInUp}
              className="mb-6 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-warning"
            >
              Your session has expired. Please sign in again.
            </motion.div>
          )}

          {authError && !accessDenied && !sessionExpired && (
            <motion.div
              variants={fadeInUp}
              className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
            >
              Something went wrong. Please try again.
            </motion.div>
          )}

          {/* Login button */}
          <motion.div variants={fadeInUp}>
            <Button
              variant="default"
              size="xl"
              fullWidth
              leftIcon={<Lock className="h-5 w-5" />}
              onClick={() => login()}
              className="justify-center rounded-xl"
            >
              Sign in with Internal Credentials
            </Button>
          </motion.div>

          {/* Security notice */}
          <motion.div variants={fadeInUp} className="mt-8">
            <div className="rounded-xl border border-border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Secure Access</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This portal uses a separate identity provider from the customer-facing platform.
                    Only authorized administrators can access this system.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-12">
            <p className="text-center text-xs text-muted-foreground">
              Fe3dr Administration Portal &middot; Internal Use Only
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
