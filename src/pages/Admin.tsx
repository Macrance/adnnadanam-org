import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, Package, Heart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPage() {
  const { profile, donations, allProfiles, updateDonationStatus } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  if (!profile || profile.role !== 'admin') return null;

  const pending = donations.filter(d => d.status === 'pending').length;
  const delivered = donations.filter(d => d.status === 'delivered').length;
  const totalServings = donations.reduce((s, d) => s + d.quantity, 0);

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container">
        <h1 className="text-2xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mb-8">Manage donations, users, and platform operations</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Users', value: allProfiles.length, color: 'text-accent' },
            { icon: Package, label: 'Total Donations', value: donations.length, color: 'text-primary' },
            { icon: AlertCircle, label: 'Pending', value: pending, color: 'text-secondary' },
            { icon: Heart, label: 'Servings Shared', value: totalServings, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card p-5 rounded-lg border border-border">
              <s.icon className={`h-6 w-6 ${s.color} mb-2`} />
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-lg border border-border p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">All Users</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">City</th>
                </tr>
              </thead>
              <tbody>
                {allProfiles.map(u => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-3">{u.name}</td>
                    <td className="py-3 text-muted-foreground">{u.email}</td>
                    <td className="py-3 capitalize">{u.role}</td>
                    <td className="py-3 text-muted-foreground">{u.city || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <h2 className="font-semibold text-lg mb-4">All Donations</h2>
          {donations.length === 0 ? (
            <p className="text-muted-foreground">No donations yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 font-medium">Donor</th>
                    <th className="pb-3 font-medium">Food</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map(d => (
                    <tr key={d.id} className="border-b border-border/50">
                      <td className="py-3">{d.donor_name}</td>
                      <td className="py-3 capitalize">{d.food_type}</td>
                      <td className="py-3">{d.quantity}</td>
                      <td className="py-3 capitalize">{d.status.replace('_', ' ')}</td>
                      <td className="py-3">
                        {d.status !== 'delivered' && (
                          <div className="flex gap-1">
                            {d.status === 'pending' && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateDonationStatus(d.id, 'picked')}>
                                Mark Picked
                              </Button>
                            )}
                            {d.status === 'picked' && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateDonationStatus(d.id, 'in_transit')}>
                                In Transit
                              </Button>
                            )}
                            {d.status === 'in_transit' && (
                              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updateDonationStatus(d.id, 'delivered')}>
                                Delivered
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
