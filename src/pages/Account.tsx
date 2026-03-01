import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, MapPin, Heart, Package, LogOut } from 'lucide-react';

export default function AccountPage() {
  const { user, logout, donations } = useAuth();
  const navigate = useNavigate();

  if (!user) { navigate('/login'); return null; }

  const myDonations = donations.filter(d => d.donorId === user.id);
  const delivered = myDonations.filter(d => d.status === 'delivered').length;
  const totalServings = myDonations.reduce((s, d) => s + d.quantity, 0);

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container max-w-2xl">
        <div className="bg-card p-8 rounded-lg border border-border shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <Package className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{myDonations.length}</div>
              <p className="text-xs text-muted-foreground">Total Donations</p>
            </div>
            <div className="bg-secondary/5 p-4 rounded-lg text-center">
              <Heart className="h-6 w-6 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-secondary">{delivered}</div>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
            <div className="bg-accent/5 p-4 rounded-lg text-center">
              <User className="h-6 w-6 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-accent">{totalServings}</div>
              <p className="text-xs text-muted-foreground">Servings Shared</p>
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone}</span>
            </div>
            {user.city && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{user.city}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={() => navigate('/donate-food')} className="bg-primary text-primary-foreground">Donate Food</Button>
            <Button onClick={() => navigate('/track')} variant="outline">Track Donations</Button>
            <Button variant="destructive" onClick={() => { logout(); navigate('/'); }} className="ml-auto">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
