import { useEffect, useState } from 'react';
import { useAuth, Donation } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Package, Truck, CheckCircle, AlertCircle, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const statusConfig: Record<Donation['status'], { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Pickup', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  picked: { label: 'Picked Up', color: 'bg-blue-100 text-blue-800', icon: Package },
  in_transit: { label: 'In Transit', color: 'bg-accent/20 text-accent', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-primary/20 text-primary', icon: CheckCircle },
};

const statusSteps: Donation['status'][] = ['pending', 'picked', 'in_transit', 'delivered'];

interface TrackingPoint {
  donation_id: string;
  latitude: number;
  longitude: number;
}

function FlyToVolunteer({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15);
  }, [position, map]);
  return null;
}

export default function TrackPage() {
  const { profile, donations, updateDonationStatus } = useAuth();
  const navigate = useNavigate();
  const [liveTracking, setLiveTracking] = useState<Record<string, TrackingPoint>>({});
  const [sharingLocation, setSharingLocation] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);

  const myDonations = profile
    ? (profile.role === 'admin'
        ? donations
        : donations.filter(d =>
            d.donor_id === profile.id ||
            d.recipient_id === profile.id ||
            d.volunteer_id === profile.id
          ))
    : [];

  // Subscribe to realtime tracking updates
  useEffect(() => {
    if (!profile) return;
    const donationIds = myDonations.map(d => d.id);
    if (donationIds.length === 0) return;

    const channel = supabase
      .channel('tracking-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donation_tracking',
      }, (payload) => {
        const data = payload.new as any;
        if (data && donationIds.includes(data.donation_id)) {
          setLiveTracking(prev => ({
            ...prev,
            [data.donation_id]: {
              donation_id: data.donation_id,
              latitude: data.latitude,
              longitude: data.longitude,
            },
          }));
        }
      })
      .subscribe();

    const fetchLatest = async () => {
      for (const id of donationIds) {
        const { data } = await supabase
          .from('donation_tracking')
          .select('*')
          .eq('donation_id', id)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data && data.length > 0) {
          setLiveTracking(prev => ({
            ...prev,
            [id]: {
              donation_id: data[0].donation_id,
              latitude: data[0].latitude,
              longitude: data[0].longitude,
            },
          }));
        }
      }
    };
    fetchLatest();

    return () => { supabase.removeChannel(channel); };
  }, [donations.length, profile?.id]);

  // Redirect if not logged in (after hooks)
  useEffect(() => {
    if (!profile) navigate('/login');
  }, [profile, navigate]);

  if (!profile) return null;

  const startSharing = (donationId: string) => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }
    setSharingLocation(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        await supabase.from('donation_tracking').insert({
          donation_id: donationId,
          volunteer_id: profile.id,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        toast.error('Location error: ' + err.message);
        setSharingLocation(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
    toast.success('Live location sharing started!');
  };

  const stopSharing = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setSharingLocation(false);
    toast.info('Location sharing stopped');
  };

  const demoCenter: [number, number] = [19.076, 72.8777];
  const firstLive = Object.values(liveTracking)[0];
  const flyTarget: [number, number] | null = firstLive
    ? [firstLive.latitude, firstLive.longitude]
    : null;

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Track Donations</h1>
            <p className="text-muted-foreground text-sm">Monitor your food donations in real-time</p>
          </div>
          <Button onClick={() => navigate('/donate-food')} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            + New Donation
          </Button>
        </div>

        <div className="mb-8 rounded-lg overflow-hidden border border-border shadow-sm" style={{ height: 350 }}>
          <MapContainer center={demoCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <FlyToVolunteer position={flyTarget} />
            {Object.entries(liveTracking).map(([donationId, track]) => {
              const donation = donations.find(d => d.id === donationId);
              return (
                <Marker key={donationId} position={[track.latitude, track.longitude]} icon={volunteerIcon}>
                  <Popup>
                    <strong>🚚 Volunteer Live Location</strong><br />
                    {donation?.food_type} · {donation?.quantity} servings<br />
                    Status: {donation ? statusConfig[donation.status].label : 'Unknown'}
                  </Popup>
                </Marker>
              );
            })}
            {myDonations.filter(d => !liveTracking[d.id]).map((d, i) => (
              <Marker key={d.id} position={[demoCenter[0] + (i * 0.01 - 0.02), demoCenter[1] + (i * 0.015 - 0.03)]}>
                <Popup>
                  <strong>{d.donor_name}</strong><br />
                  {d.food_type} · {d.quantity} servings<br />
                  Status: {statusConfig[d.status].label}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {myDonations.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No donations yet</h3>
            <p className="text-muted-foreground mb-4">Start by donating food to make a difference</p>
            <Button onClick={() => navigate('/donate-food')} className="bg-primary text-primary-foreground">Donate Food</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myDonations.map(d => {
              const cfg = statusConfig[d.status];
              const StatusIcon = cfg.icon;
              const currentStep = statusSteps.indexOf(d.status);
              const isVolunteerForThis = d.volunteer_id === profile.id;
              const canShareLocation = profile.role === 'volunteer' && isVolunteerForThis && (d.status === 'picked' || d.status === 'in_transit');

              return (
                <div key={d.id} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {d.image_url && (
                      <img src={d.image_url} alt="Food" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold capitalize">{d.food_type} Food</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                        {liveTracking[d.id] && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary animate-pulse">
                            <Navigation className="h-3 w-3" /> Live
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{d.quantity} servings</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{d.pickup_time ? new Date(d.pickup_time).toLocaleString() : '-'}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d.address.slice(0, 30)}...</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {statusSteps.map((step, i) => (
                          <div key={step} className="flex items-center flex-1">
                            <div className={`h-2 rounded-full flex-1 ${i <= currentStep ? 'bg-primary' : 'bg-border'}`} />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Pending</span><span>Picked</span><span>In Transit</span><span>Delivered</span>
                      </div>

                      {canShareLocation && (
                        <div className="mt-4">
                          {sharingLocation ? (
                            <Button size="sm" variant="destructive" onClick={stopSharing} className="text-xs">
                              <Navigation className="h-3.5 w-3.5 mr-1" /> Stop Sharing Location
                            </Button>
                          ) : (
                            <Button size="sm" className="text-xs bg-primary text-primary-foreground" onClick={() => startSharing(d.id)}>
                              <Navigation className="h-3.5 w-3.5 mr-1" /> Share Live Location
                            </Button>
                          )}
                        </div>
                      )}

                      {profile.role === 'admin' && d.status !== 'delivered' && (
                        <div className="mt-4 flex gap-2">
                          {statusSteps.slice(currentStep + 1).map(nextStatus => (
                            <Button
                              key={nextStatus}
                              size="sm"
                              variant="outline"
                              onClick={() => updateDonationStatus(d.id, nextStatus)}
                              className="text-xs"
                            >
                              Mark as {statusConfig[nextStatus].label}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
