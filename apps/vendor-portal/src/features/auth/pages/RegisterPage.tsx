import { motion } from 'framer-motion';
import { ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/shared/components/ui/Button';
import { fadeInUp, staggerContainer } from '@/shared/utils/animations';

export default function RegisterPage() {
  const { register, login } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Left side - Benefits */}
      <div className="hidden flex-1 lg:block">
        <div className="relative flex h-full items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-12">
          <div className="max-w-lg text-primary-foreground">
            <ChefHat className="mb-6 h-16 w-16 opacity-80" />
            <h2 className="text-3xl font-bold font-display">
              Start selling from your kitchen
            </h2>
            <p className="mt-4 text-lg opacity-90">
              Join thousands of home chefs earning with Fe3dr. Zero setup cost,
              your kitchen, your rules.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { title: 'Zero commission first month', desc: 'Get started risk-free' },
                { title: 'Easy menu management', desc: 'Upload photos, set prices, manage availability' },
                { title: 'Real-time order tracking', desc: 'Never miss an order with live updates' },
                { title: 'Weekly payouts', desc: 'Get paid directly to your bank account' },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                    <span className="text-xs font-bold">&#10003;</span>
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm opacity-75">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration options */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full max-w-md"
        >
          {/* Logo */}
          <motion.div variants={fadeInUp} className="mb-10">
            <div className="logo">
              <div className="logo-icon">
                <span><ChefHat className="h-5 w-5" /></span>
              </div>
              <div>
                <h1 className="logo-text">Fe3dr</h1>
                <p className="logo-tagline">Vendor Portal</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeInUp} className="mb-8">
            <h2 className="text-display-xs font-bold tracking-tight text-foreground font-display">
              Register your kitchen
            </h2>
            <p className="mt-2 text-muted-foreground">
              Create your vendor account to start selling home-cooked meals
            </p>
          </motion.div>

          {/* Social registration */}
          <motion.div variants={fadeInUp} className="space-y-3">
            <Button
              variant="outline"
              size="xl"
              fullWidth
              onClick={() => login('google')}
              className="justify-center border-border hover:bg-secondary/60"
            >
              Sign up with Google
            </Button>

            <Button
              variant="outline"
              size="xl"
              fullWidth
              onClick={() => login('facebook')}
              className="justify-center border-border hover:bg-secondary/60"
            >
              Sign up with Meta
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div variants={fadeInUp} className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </motion.div>

          {/* Email registration */}
          <motion.div variants={fadeInUp}>
            <Button
              variant="default"
              size="xl"
              fullWidth
              onClick={() => register()}
              className="justify-center"
            >
              Register with Email
            </Button>
          </motion.div>

          {/* Login link */}
          <motion.div variants={fadeInUp} className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeInUp} className="mt-12">
            <p className="text-xs text-muted-foreground text-center">
              By registering, you agree to Fe3dr's Vendor Terms and Privacy Policy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
