import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heart, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DonateMoneyPage() {
  const { user, addMoneyDonation } = useAuth();

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  const presets = [100, 500, 1000, 5000];

  const validate = () => {
    const e: Record<string, string> = {};

    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Valid email required';
    if (!form.phone.trim())
      e.phone = 'Phone required';

    if (!amount || parseInt(amount) < 1)
      e.amount = 'Enter valid amount';

    if (!method)
      e.method = 'Select payment method';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (!user) {
      toast.error('Please login first');
      return;
    }

    addMoneyDonation(parseInt(amount), method);

    toast.success(`₹${amount} donation successful! Thank you ❤️`);

    setForm({
      name: '',
      email: '',
      phone: '',
      cardNumber: '',
      expiry: '',
      cvv: '',
      upiId: '',
    });

    setAmount('');
    setMethod('');
  };

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container max-w-xl">
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Heart className="h-7 w-7 text-secondary" />
            </div>
            <h1 className="text-2xl font-bold">Make a Donation</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Every rupee counts in our fight against hunger
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <Label>Donation Amount (₹)</Label>

              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.map((p) => (
                  <Button
                    type="button"
                    key={p}
                    variant={amount === String(p) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAmount(String(p))}
                  >
                    ₹{p}
                  </Button>
                ))}
              </div>

              <Input
                className="mt-2"
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Or enter custom amount"
              />

              {errors.amount && (
                <p className="text-destructive text-xs mt-1">
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Personal Info */}
            <div>
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="text-destructive text-xs mt-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label>Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 9876543210"
              />
              {errors.phone && (
                <p className="text-destructive text-xs mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Credit/Debit Card
                    </span>
                  </SelectItem>

                  <SelectItem value="upi">
                    <span className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      UPI
                    </span>
                  </SelectItem>

                  <SelectItem value="bank">
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Bank Transfer
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>

              {errors.method && (
                <p className="text-destructive text-xs mt-1">
                  {errors.method}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              size="lg"
            >
              Donate {amount ? `₹${amount}` : ''}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
