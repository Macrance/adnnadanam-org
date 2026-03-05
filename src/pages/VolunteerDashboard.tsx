import { useAuth, Donation } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Package, Truck, CheckCircle2, Clock, MapPin,
  ChevronRight, Navigation, Bike, Zap, Star,
  UtensilsCrossed, ArrowRight, Timer, Route
} from 'lucide-react';

type Tab = 'available' | 'active' | 'delivered';

const TAB_CONFIG: { key: Tab; label: string; icon: typeof Zap }[] = [
  { key: 'available', label: 'New Requests', icon: Zap },
  { key: 'active', label: 'Active', icon: Bike },
  { key: 'delivered', label: 'Completed', icon: CheckCircle2 },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-500/10', text: 'text-amber-600', label: '⏳ Waiting' },
    picked: { bg: 'bg-blue-500/10', text: 'text-blue-600', label: '📦 Picked Up' },
    in_transit: { bg: 'bg-purple-500/10', text: 'text-purple-600', label: '🚴 On the Way' },
    delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', label: '✅ Delivered' },
  };
  const c = config[status] || config.pending;
  return (
    <Badge className={`${c.bg} ${c.text} font-bold text-xs px-3 py-1 rounded-full border-0`}>
      {c.label}
    </Badge>
  );
}

function RequestCard({
  donation,
  onAccept,
  onUpdateStatus,
  mode,
}: {
  donation: Donation;
  onAccept?: () => void;
  onUpdateStatus?: (status: Donation['status']) => void;
  mode: Tab;
}) {
  const nextStatus: Record<string, Donation['status'] | null> = {
    picked: 'in_transit',
    in_transit: 'delivered',
  };
  const next = nextStatus[donation.status];
  const nextLabel: Record<string, string> = {
    in_transit: '🚴 Start Delivery',
    delivered: '✅ Mark Delivered',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-foreground leading-tight">{donation.food_type}</h3>
            <p className="text-sm text-muted-foreground font-medium">{donation.quantity} servings</p>
          </div>
        </div>
        <StatusBadge status={donation.status} />
      </div>

      {/* Details */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="truncate">{donation.address}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{new Date(donation.created_at).toLocaleDateString()}</span>
          </div>
          {donation.pickup_time && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>Pickup: {donation.pickup_time}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>From: <span className="font-semibold text-foreground">{donation.donor_name}</span></span>
        </div>
        {donation.recipient_name && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Route className="h-4 w-4" />
            <span>To: <span className="font-semibold text-foreground">{donation.recipient_name}</span></span>
          </div>
        )}
      </div>

      {/* Actions */}
      {mode === 'available' && onAccept && (
        <Button
          onClick={onAccept}
          className="w-full mt-4 h-12 rounded-xl font-extrabold text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Zap className="h-5 w-5" /> Accept Pickup <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      )}

      {mode === 'active' && next && onUpdateStatus && (
        <div className="mt-4 space-y-2">
          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {['picked', 'in_transit', 'delivered'].map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-grow-0">
                <div className={`h-2 flex-1 rounded-full ${
                  ['picked', 'in_transit', 'delivered'].indexOf(donation.status) >= i
                    ? 'bg-primary'
                    : 'bg-muted'
                }`} />
              </div>
            ))}
          </div>
          <Button
            onClick={() => onUpdateStatus(next)}
            className="w-full h-12 rounded-xl font-extrabold text-base bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {nextLabel[next] || next} <ChevronRight className="h-5 w-5 ml-auto" />
          </Button>
        </div>
      )}

      {mode === 'delivered' && (
        <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-bold">
          <CheckCircle2 className="h-5 w-5" />
          Successfully delivered
          <Star className="h-4 w-4 ml-auto text-amber-500 fill-amber-500" />
        </div>
      )}
    </motion.div>
  );
}

export default function VolunteerDashboard() {
  const { profile, donations, refreshDonations } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('available');

  useEffect(() => {
    if (!profile) navigate('/login');
    else if (profile.role !== 'volunteer' && profile.role !== 'admin') navigate('/');
  }, [profile, navigate]);

  if (!profile) return null;

  // Available: pending donations with a recipient but no volunteer
  const available = donations.filter(
    (d) => d.status === 'pending' && d.recipient_id && !d.volunteer_id
  );

  // Active: assigned to this volunteer and not yet delivered
  const active = donations.filter(
    (d) => d.volunteer_id === profile.id && d.status !== 'delivered'
  );

  // Delivered: completed by this volunteer
  const delivered = donations.filter(
    (d) => d.volunteer_id === profile.id && d.status === 'delivered'
  );

  const lists: Record<Tab, Donation[]> = { available, active, delivered };
  const currentList = lists[tab];

  const handleAccept = async (donation: Donation) => {
    const { error } = await supabase
      .from('donations')
      .update({ volunteer_id: profile.id, status: 'picked' })
      .eq('id', donation.id);
    if (error) {
      toast.error('Failed to accept pickup');
    } else {
      toast.success(`Accepted: ${donation.food_type}`, { description: 'Head to the pickup location!' });
      await refreshDonations();
    }
  };

  const handleStatusUpdate = async (donation: Donation, newStatus: Donation['status']) => {
    const { error } = await supabase
      .from('donations')
      .update({ status: newStatus })
      .eq('id', donation.id);
    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
      await refreshDonations();
    }
  };

  const stats = [
    { label: 'Available', value: available.length, icon: Zap, color: 'text-amber-500' },
    { label: 'Active', value: active.length, icon: Bike, color: 'text-primary' },
    { label: 'Delivered', value: delivered.length, icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
              <Bike className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold">Hey, {profile.name}! 👋</h1>
              <p className="text-primary-foreground/70 text-sm font-medium">Ready to deliver happiness?</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {stats.map((s) => (
              <motion.div
                key={s.label}
                whileHover={{ scale: 1.03 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-primary-foreground/10"
              >
                <s.icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs font-medium text-primary-foreground/70">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[73px] z-20 bg-background border-b border-border">
        <div className="container flex gap-1 py-2">
          {TAB_CONFIG.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className={`ml-1 text-xs px-2 py-0.5 rounded-full ${
                tab === t.key ? 'bg-primary-foreground/20' : 'bg-muted'
              }`}>
                {lists[t.key].length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="container py-6">
        <AnimatePresence mode="wait">
          {currentList.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                {tab === 'available' ? (
                  <Zap className="h-10 w-10 text-muted-foreground" />
                ) : tab === 'active' ? (
                  <Bike className="h-10 w-10 text-muted-foreground" />
                ) : (
                  <CheckCircle2 className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">
                {tab === 'available' && 'No requests right now'}
                {tab === 'active' && 'No active deliveries'}
                {tab === 'delivered' && 'No deliveries yet'}
              </h3>
              <p className="text-muted-foreground text-sm">
                {tab === 'available' && 'New food donation requests will appear here'}
                {tab === 'active' && 'Accept a request to start delivering'}
                {tab === 'delivered' && 'Completed deliveries will show here'}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {currentList.map((d) => (
                <RequestCard
                  key={d.id}
                  donation={d}
                  mode={tab}
                  onAccept={tab === 'available' ? () => handleAccept(d) : undefined}
                  onUpdateStatus={tab === 'active' ? (s) => handleStatusUpdate(d, s) : undefined}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
