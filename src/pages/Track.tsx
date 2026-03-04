import { useAuth, Donation } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Truck, CheckCircle2, Clock, MapPin,
  ChevronRight, Navigation, Phone, User, UtensilsCrossed
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, color: 'text-muted-foreground' },
  { key: 'picked', label: 'Picked Up', icon: Package, color: 'text-secondary' },
  { key: 'in_transit', label: 'On the Way', icon: Truck, color: 'text-accent' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, color: 'text-primary' },
] as const;

function getStepIndex(status: string) {
  return STATUS_STEPS.findIndex(s => s.key === status);
}

function StatusTimeline({ donation }: { donation: Donation }) {
  const currentIdx = getStepIndex(donation.status);

  return (
    <div className="flex items-center w-full py-4">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= currentIdx;
        const isCurrent = i === currentIdx;
        const Icon = step.icon;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-grow-0">
            <div className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                  backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10"
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              </motion.div>
              <span className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
              {isCurrent && (
                <motion.div
                  layoutId="pulse"
                  className="absolute -inset-1 rounded-full border-2 border-primary/40"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div className="flex-1 h-1 mx-1 rounded-full overflow-hidden bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: i < currentIdx ? '100%' : '0%' }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DonationCard({
  donation,
  isSelected,
  onClick,
  profile,
}: {
  donation: Donation;
  isSelected: boolean;
  onClick: () => void;
  profile: any;
}) {
  const isVolunteer = profile?.role === 'volunteer';

  const handleStatusUpdate = async (newStatus: Donation['status']) => {
    await supabase.from('donations').update({ status: newStatus }).eq('id', donation.id);
    toast.success(`Status updated to ${newStatus}`);
  };

  const nextStatus: Record<string, Donation['status'] | null> = {
    pending: 'picked',
    picked: 'in_transit',
    in_transit: 'delivered',
    delivered: null,
  };

  const next = nextStatus[donation.status];

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`cursor-pointer rounded-2xl border-2 transition-all p-5 ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-card hover:border-primary/30 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="h-6 w-6 text-secondary" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">{donation.food_type}</h3>
            <p className="text-sm text-muted-foreground">{donation.quantity} servings • {donation.donor_name}</p>
          </div>
        </div>
        <Badge
          className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full ${
            donation.status === 'delivered'
              ? 'bg-primary/10 text-primary'
              : donation.status === 'in_transit'
              ? 'bg-accent/10 text-accent'
              : donation.status === 'picked'
              ? 'bg-secondary/10 text-secondary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {donation.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate">{donation.address}</span>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <StatusTimeline donation={donation} />

            <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground border-t border-border mt-2">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{new Date(donation.created_at).toLocaleString()}</span>
              </div>
              {donation.pickup_time && (
                <div className="flex items-center gap-1.5">
                  <Package className="h-4 w-4" />
                  <span>Pickup: {donation.pickup_time}</span>
                </div>
              )}
            </div>

            {isVolunteer && next && (
              <Button
                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(next); }}
                className="w-full mt-4 h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Mark as {next.replace('_', ' ')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TrackPage() {
  const { profile, donations, refreshDonations } = useAuth();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [volLoc, setVolLoc] = useState<{ lat: number; lng: number } | null>(null);
  const watchRef = useRef<number | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!profile) navigate('/login');
  }, [profile, navigate]);

  // Volunteer live GPS broadcasting
  useEffect(() => {
    if (profile?.role !== 'volunteer') return;

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setVolLoc(loc);

        // Find active assigned donation
        const active = donations.find(
          (d) => d.volunteer_id === profile.id && (d.status === 'picked' || d.status === 'in_transit')
        );
        if (active) {
          await supabase.from('donation_tracking').upsert(
            {
              donation_id: active.id,
              volunteer_id: profile.id,
              latitude: loc.lat,
              longitude: loc.lng,
            },
            { onConflict: 'donation_id,volunteer_id' }
          );
        }
      },
      (err) => console.error('Geo error:', err),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    watchRef.current = watchId;

    return () => navigator.geolocation.clearWatch(watchId);
  }, [profile, donations]);

  // Realtime tracking subscription for donors/recipients
  useEffect(() => {
    if (!selectedId) return;

    const channel = supabase
      .channel(`track-${selectedId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donation_tracking',
        filter: `donation_id=eq.${selectedId}`,
      }, (payload: any) => {
        if (payload.new) {
          const newLoc = { lat: payload.new.latitude, lng: payload.new.longitude };
          setVolLoc(newLoc);
          mapRef.current?.flyTo([newLoc.lat, newLoc.lng], 15, { duration: 1 });
        }
      })
      .subscribe();

    // Fetch latest location
    supabase
      .from('donation_tracking')
      .select('*')
      .eq('donation_id', selectedId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) {
          setVolLoc({ lat: data[0].latitude, lng: data[0].longitude });
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, [selectedId]);

  if (!profile) return null;

  const myDonations =
    profile.role === 'admin'
      ? donations
      : donations.filter(
          (d) =>
            d.donor_id === profile.id ||
            d.recipient_id === profile.id ||
            d.volunteer_id === profile.id
        );

  const selected = myDonations.find((d) => d.id === selectedId);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Navigation className="h-6 w-6 text-primary" />
              Live Tracking
            </h1>
            <p className="text-sm text-muted-foreground">Track your food donations in real-time</p>
          </div>
          <Button
            onClick={() => navigate('/donate-food')}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
          >
            + New Donation
          </Button>
        </div>
      </div>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left — donation list */}
          <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-180px)] overflow-y-auto pr-1">
            {myDonations.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                <h3 className="font-bold text-lg mb-2 text-foreground">No donations yet</h3>
                <p className="text-muted-foreground mb-6 text-sm">Start by donating food or money</p>
                <Button onClick={() => navigate('/donate-food')} className="rounded-xl bg-primary text-primary-foreground">
                  Donate Now
                </Button>
              </div>
            ) : (
              myDonations.map((d) => (
                <DonationCard
                  key={d.id}
                  donation={d}
                  isSelected={selectedId === d.id}
                  onClick={() => setSelectedId(selectedId === d.id ? null : d.id)}
                  profile={profile}
                />
              ))
            )}
          </div>

          {/* Right — live map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border-2 border-border shadow-lg sticky top-28 h-[calc(100vh-200px)]">
            {selected && volLoc ? (
              <MapContainer
                center={[volLoc.lat, volLoc.lng]}
                zoom={15}
                className="w-full h-full"
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[volLoc.lat, volLoc.lng]} icon={volunteerIcon}>
                  <Popup>
                    <div className="text-center">
                      <p className="font-bold text-sm">🚴 Volunteer</p>
                      <p className="text-xs text-gray-600">Delivering: {selected.food_type}</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                >
                  <MapPin className="h-16 w-16 text-primary/30 mb-4" />
                </motion.div>
                <p className="text-muted-foreground font-semibold text-lg">
                  {selected ? 'Waiting for volunteer location…' : 'Select a donation to track'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Live location will appear here
                </p>
              </div>
            )}

            {/* Floating info card */}
            {selected && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-lg rounded-2xl border border-border shadow-xl p-4 z-[1000]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{selected.food_type}</p>
                      <p className="text-xs text-muted-foreground">{selected.quantity} servings</p>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary font-bold rounded-full px-3">
                    {selected.status.replace('_', ' ')}
                  </Badge>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
