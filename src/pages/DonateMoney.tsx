import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function DonateMoneyPage() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', cardNumber: '', expiry: '', cvv: '', upiId: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const presets = [100, 500, 1000, 5000];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim() || !/^(\+91)?[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Valid phone required';
    if (!amount || parseInt(amount) < 1) e.amount = 'Enter amount';
    if (!method) e.method = 'Select payment method';
    if (method === 'card') {
      if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) e.cardNumber = 'Enter valid 16-digit card number';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = 'Format: MM/YY';
      if (!/^\d{3}$/.test(form.cvv)) e.cvv = 'Enter 3-digit CVV';
    }
    if (method === 'upi' && !form.upiId.includes('@')) e.upiId = 'Enter valid UPI ID';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    toast.success(`Thank you for donating ₹${amount}! Your contribution will help feed those in need.`);
    setForm({ name: '', email: '', phone: '', cardNumber: '', expiry: '', cvv: '', upiId: '' });
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
            <p className="text-muted-foreground text-sm mt-1">Every rupee counts in our fight against hunger</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <Label>Donation Amount (₹)</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {presets.map(p => (
                  <Button
                    type="button"
                    key={p}
                    variant={amount === String(p) ? 'default' : 'outline'}
                    className={amount === String(p) ? 'bg-primary text-primary-foreground' : ''}
                    size="sm"
                    onClick={() => setAmount(String(p))}
                  >
                    ₹{p}
                  </Button>
                ))}
              </div>
              <Input className="mt-2" type="number" min="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Or enter custom amount" />
              {errors.amount && <p className="text-destructive text-xs mt-1">{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
                {errors.name && <p className="text-destructive text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 9876543210" />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>

            <div>
              <Label>Payment Method</Label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger><SelectValue placeholder="Choose payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="card"><span className="flex items-center gap-2"><CreditCard className="h-4 w-4" />Credit/Debit Card</span></SelectItem>
                  <SelectItem value="upi"><span className="flex items-center gap-2"><Smartphone className="h-4 w-4" />UPI</span></SelectItem>
                </SelectContent>
              </Select>
              {errors.method && <p className="text-destructive text-xs mt-1">{errors.method}</p>}
            </div>

            {method === 'card' && (
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label>Card Number</Label>
                  <Input value={form.cardNumber} onChange={e => set('cardNumber', e.target.value)} placeholder="1234 5678 9012 3456" maxLength={19} />
                  {errors.cardNumber && <p className="text-destructive text-xs mt-1">{errors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Expiry</Label>
                    <Input value={form.expiry} onChange={e => set('expiry', e.target.value)} placeholder="MM/YY" maxLength={5} />
                    {errors.expiry && <p className="text-destructive text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <Label>CVV</Label>
                    <Input type="password" value={form.cvv} onChange={e => set('cvv', e.target.value)} placeholder="•••" maxLength={3} />
                    {errors.cvv && <p className="text-destructive text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            {method === 'upi' && (
              <div className="p-4 bg-muted rounded-lg">
                <Label>UPI ID</Label>
                <Input value={form.upiId} onChange={e => set('upiId', e.target.value)} placeholder="yourname@upi" />
                {errors.upiId && <p className="text-destructive text-xs mt-1">{errors.upiId}</p>}
              </div>
            )}

            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" size="lg">
              Donate {amount ? `₹${amount}` : ''}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
