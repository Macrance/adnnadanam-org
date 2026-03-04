import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (profile) { navigate('/'); return null; }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      toast.success('Welcome back!');
      navigate('/');
    } else {
      toast.error('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent/60" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zM20 20h20v20H20z\' fill=\'%23fff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' }} />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">Annadanam</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Feed the hungry.<br />
            <span className="text-primary-foreground/70">Reduce waste.</span>
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md leading-relaxed">
            Join thousands of donors, volunteers, and recipients working together to ensure no meal goes to waste.
          </p>

          <div className="mt-12 flex gap-8">
            {[
              { num: '10K+', label: 'Meals Shared' },
              { num: '500+', label: 'Active Donors' },
              { num: '50+', label: 'Cities' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold">{s.num}</p>
                <p className="text-sm text-primary-foreground/60">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <UtensilsCrossed className="h-6 w-6 text-primary" />
            <span className="text-xl font-extrabold text-foreground">Annadanam</span>
          </div>

          <h2 className="text-3xl font-extrabold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Log in to continue your mission</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-colors"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-colors pr-12"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl text-base font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl group"
            >
              {submitting ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Logging in...</>
              ) : (
                <>Log In <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
