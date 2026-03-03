import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Utensils, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DonateFoodPage() {
  const { profile, addDonation } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    foodType: '', quantity: '', pickupTime: '', address: '', specialInstructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!profile) { navigate('/login'); return null; }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.foodType) e.foodType = 'Select food type';
    if (!form.quantity || parseInt(form.quantity) < 1) e.quantity = 'Enter valid quantity';
    if (!form.pickupTime) e.pickupTime = 'Select pickup time';
    if (!form.address.trim()) e.address = 'Enter pickup address';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    await addDonation({
      donor_id: profile.id,
      donor_name: profile.name,
      food_type: form.foodType,
      quantity: parseInt(form.quantity),
      pickup_time: form.pickupTime,
      address: form.address,
      special_instructions: form.specialInstructions,
      image_url: imagePreview || undefined,
    });
    setSubmitting(false);
    toast.success('Food donation posted! Volunteers nearby will be notified.');
    navigate('/track');
  };

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container max-w-2xl">
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Donate Food</h1>
              <p className="text-muted-foreground text-sm">Help us redirect surplus food to those in need</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Food Photo (optional)</Label>
              <div
                className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Food preview" className="max-h-48 mx-auto rounded" />
                ) : (
                  <div className="text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Click to upload food photo</p>
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
              </div>
            </div>

            <div>
              <Label>Type of Food</Label>
              <Select value={form.foodType} onValueChange={v => set('foodType', v)}>
                <SelectTrigger><SelectValue placeholder="Select food type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresh">Fresh Produce</SelectItem>
                  <SelectItem value="cooked">Cooked Food</SelectItem>
                  <SelectItem value="packaged">Packaged Food</SelectItem>
                  <SelectItem value="baked">Baked Goods</SelectItem>
                  <SelectItem value="dairy">Dairy Products</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.foodType && <p className="text-destructive text-xs mt-1">{errors.foodType}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Quantity (servings)</Label>
                <Input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 50" />
                {errors.quantity && <p className="text-destructive text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <Label>Preferred Pickup Time</Label>
                <Input type="datetime-local" value={form.pickupTime} onChange={e => set('pickupTime', e.target.value)} />
                {errors.pickupTime && <p className="text-destructive text-xs mt-1">{errors.pickupTime}</p>}
              </div>
            </div>

            <div>
              <Label>Pickup Address</Label>
              <Textarea value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address for food pickup" rows={3} />
              {errors.address && <p className="text-destructive text-xs mt-1">{errors.address}</p>}
            </div>

            <div>
              <Label>Special Instructions (optional)</Label>
              <Textarea value={form.specialInstructions} onChange={e => set('specialInstructions', e.target.value)} placeholder="Allergies, handling requirements, etc." rows={3} />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground" size="lg" disabled={submitting}>
              {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Donation'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
