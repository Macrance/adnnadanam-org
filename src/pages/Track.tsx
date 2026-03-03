import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { useEffect } from 'react';

export default function TrackPage() {
  const { user, moneyDonations } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;

  const myDonations =
    user.role === 'admin'
      ? moneyDonations
      : moneyDonations.filter(d => d.donorId === user.id);

  return (
    <div className="min-h-[80vh] py-12">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Track Money Donations</h1>
            <p className="text-muted-foreground text-sm">
              View your contribution history
            </p>
          </div>
          <Button
            onClick={() => navigate('/donate-money')}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
          >
            + New Donation
          </Button>
        </div>

        {myDonations.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-lg border border-border">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">
              No money donations yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by making a contribution
            </p>
            <Button
              onClick={() => navigate('/donate-money')}
              className="bg-primary text-primary-foreground"
            >
              Donate Now
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {myDonations.map(d => (
              <div
                key={d.id}
                className="bg-card p-6 rounded-lg border border-border shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">₹{d.amount}</h3>
                    <p className="text-sm text-muted-foreground">
                      Paid via {d.paymentMethod}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(d.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <Badge className="bg-green-100 text-green-800">
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
