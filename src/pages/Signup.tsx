import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '', role: '', city: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: string, val: string) => setForm(p => ({ ...p, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    else if (!/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Invalid Indian phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    if (!form.role) e.role = 'Select a role';
    if (!form.city.trim()) e.city = 'City is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const success = signup({
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role as any,
      city: form.city,
      password: form.password,
    });
    if (success) {
      toast.success('Account created! Welcome to Annadanam.');
      navigate('/');
    } else {
      toast.error('Email already registered');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-card p-8 rounded-lg border border-border shadow-sm">
        <div className="text-center mb-8">
          <Heart className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Join Annadanam</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account to start making a difference</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
            {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label>I want to</Label>
            <Select value={form.role} onValueChange={v => set('role', v)}>
              <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="donor">Donate Food</SelectItem>
                <SelectItem value="recipient">Receive Food</SelectItem>
                <SelectItem value="volunteer">Volunteer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-destructive text-xs mt-1">{errors.role}</p>}
          </div>
          <div>
            <Label>City</Label>
            <Input value={form.city} onChange={e => set('city', e.target.value)} placeholder="Mumbai" />
            {errors.city && <p className="text-destructive text-xs mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min 6 characters" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <Label>Confirm Password</Label>
            <Input type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat password" />
            {errors.confirm && <p className="text-destructive text-xs mt-1">{errors.confirm}</p>}
          </div>
          <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90">Create Account</Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}
