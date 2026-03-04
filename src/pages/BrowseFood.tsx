import { useAuth, Donation } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  UtensilsCrossed, Clock, MapPin, Star, Search,
  Filter, ChevronRight, Utensils, Package, Timer, Heart
} from 'lucide-react';

const FOOD_CATEGORIES = ['All', 'Cooked Meals', 'Raw Ingredients', 'Packaged Food', 'Beverages', 'Snacks', 'Other'];

function timeSince(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function FoodCard({ donation, onClaim, claiming }: { donation: Donation; onClaim: (id: string) => void; claiming: string | null }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all group"
    >
      {/* Image / placeholder */}
      <div className="relative h-44 bg-muted overflow-hidden">
        {donation.image_url ? (
          <img src={donation.image_url} alt={donation.food_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
            <UtensilsCrossed className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-card/90 text-foreground backdrop-blur-sm font-semibold text-xs px-2.5 py-1 rounded-full shadow-sm">
            <Clock className="h-3 w-3 mr-1" />
            {timeSince(donation.created_at)}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Heart className="h-4 w-4 text-destructive" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-foreground leading-tight">{donation.food_type}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">by {donation.donor_name}</p>
          </div>
          <Badge className="bg-primary/10 text-primary font-bold text-xs px-2 py-0.5 rounded-full shrink-0">
            {donation.quantity} servings
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-secondary" />
          <span className="truncate">{donation.address}</span>
        </div>

        {donation.pickup_time && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Timer className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span>Pickup: {donation.pickup_time}</span>
          </div>
        )}

        {donation.special_instructions && (
          <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 italic">
            "{donation.special_instructions}"
          </p>
        )}

        <Button
          onClick={() => onClaim(donation.id)}
          disabled={claiming === donation.id}
          className="w-full h-11 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 mt-1 text-sm"
        >
          {claiming === donation.id ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Claiming...
            </span>
          ) : (
            <>
              <Package className="h-4 w-4 mr-2" />
              Claim This Food
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function BrowseFoodPage() {
  const { profile, refreshDonations, donations } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) navigate('/login');
  }, [profile, navigate]);

  if (!profile) return null;

  // Only show pending (unclaimed) donations
  const available = donations.filter(d =>
    d.status === 'pending' && !d.recipient_id && d.donor_id !== profile.id
  );

  const filtered = available.filter(d => {
    const matchesSearch = d.food_type.toLowerCase().includes(search.toLowerCase()) ||
      d.donor_name.toLowerCase().includes(search.toLowerCase()) ||
      d.address.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || d.food_type.toLowerCase().includes(category.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleClaim = async (donationId: string) => {
    if (!profile) return;
    setClaiming(donationId);
    try {
      const { error } = await supabase
        .from('donations')
        .update({
          recipient_id: profile.id,
          recipient_name: profile.name,
        })
        .eq('id', donationId)
        .eq('status', 'pending');

      if (error) throw error;

      toast.success('🎉 Food claimed successfully!', {
        description: 'You can track your food delivery in the Track page.',
      });
      await refreshDonations();
    } catch (err: any) {
      toast.error('Failed to claim food', { description: err.message });
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Zomato-style hero header */}
      <div className="bg-gradient-to-br from-primary to-accent py-10 px-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-extrabold text-primary-foreground mb-2">
              Discover Available Food
            </h1>
            <p className="text-primary-foreground/80 text-base">
              Fresh surplus food near you — claim it before it's gone!
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search for food type, donor, or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-13 pl-12 pr-4 rounded-2xl bg-card text-foreground shadow-lg border-0 outline-none text-base font-medium placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category pills */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {FOOD_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  category === cat
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Food grid */}
      <div className="container py-8">
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Utensils className="h-20 w-20 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No food available right now</h3>
            <p className="text-muted-foreground mb-6">Check back soon — new donations appear in real-time!</p>
            <Button onClick={() => navigate('/donate-food')} className="rounded-xl bg-primary text-primary-foreground">
              Donate Food Instead
            </Button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground font-medium">
                <span className="text-foreground font-bold">{filtered.length}</span> food donations available
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence mode="popLayout">
                {filtered.map(d => (
                  <FoodCard key={d.id} donation={d} onClaim={handleClaim} claiming={claiming} />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
