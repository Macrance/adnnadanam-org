import { useAuth, Donation } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Package, Truck, CheckCircle, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const statusConfig: Record<Donation['status'], { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending Pickup', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  picked: { label: 'Picked Up', color: 'bg-blue-100 text-blue-800', icon: Package },
  in_transit: { label: 'In Transit', color: 'bg-accent/20 text-accent', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-primary/20 text-primary', icon: CheckCircle },
};

const statusSteps: Donation['status'][] = ['pending', 'picked', 'in_transit', 'delivered'];

export default function TrackPage() {
  const { user, donations, updateDonationStatus } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const myDonations = user.role === 'admin'
    ? donations
    : donations.filter(d => d.donorId === user.id || d.recipientId === user.id);

  // Demo coordinates for map (Mumbai area)
  const demoCenter: [number, number] = [19.076, 72.8777];

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

        {/* Map */}
        <div className="mb-8 rounded-lg overflow-hidden border border-border shadow-sm" style={{ height: 350 }}>
          <MapContainer center={demoCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {myDonations.map((d, i) => (
              <Marker key={d.id} position={[demoCenter[0] + (i * 0.01 - 0.02), demoCenter[1] + (i * 0.015 - 0.03)]}>
                <Popup>
                  <strong>{d.donorName}</strong><br />
                  {d.foodType} · {d.quantity} servings<br />
                  Status: {statusConfig[d.status].label}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Donations list */}
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

              return (
                <div key={d.id} className="bg-card p-6 rounded-lg border border-border shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {d.imageUrl && (
                      <img src={d.imageUrl} alt="Food" className="w-24 h-24 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold capitalize">{d.foodType} Food</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><Package className="h-3.5 w-3.5" />{d.quantity} servings</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(d.pickupTime).toLocaleString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d.address.slice(0, 30)}...</span>
                      </div>

                      {/* Progress bar */}
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

                      {/* Admin controls */}
                      {user.role === 'admin' && d.status !== 'delivered' && (
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
