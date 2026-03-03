import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupaUser } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'donor' | 'recipient' | 'admin' | 'volunteer';
  city?: string;
  avatar_url?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donor_name: string;
  food_type: string;
  quantity: number;
  pickup_time: string;
  address: string;
  special_instructions?: string;
  image_url?: string;
  status: 'pending' | 'picked' | 'in_transit' | 'delivered';
  created_at: string;
  recipient_id?: string;
  recipient_name?: string;
  volunteer_id?: string;
}

interface AuthContextType {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { name: string; email: string; phone: string; password: string; role: string; city: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  donations: Donation[];
  addDonation: (d: Omit<Donation, 'id' | 'created_at' | 'status'>) => Promise<void>;
  updateDonationStatus: (id: string, status: Donation['status']) => Promise<void>;
  allProfiles: Profile[];
  refreshDonations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  // Fetch profile for a user
  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setProfile(data as Profile);
    return data as Profile | null;
  };

  // Fetch donations
  const refreshDonations = async () => {
    const { data } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setDonations(data as Donation[]);
  };

  // Fetch all profiles (for admin)
  const fetchAllProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) setAllProfiles(data as Profile[]);
  };

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await refreshDonations();
          await fetchAllProfiles();
          setLoading(false);
        }, 0);
      } else {
        setProfile(null);
        setDonations([]);
        setAllProfiles([]);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(() => {
          refreshDonations();
          fetchAllProfiles();
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Realtime subscription for donations
  useEffect(() => {
    const channel = supabase
      .channel('donations-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDonations(prev => [payload.new as Donation, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Donation;
          setDonations(prev => prev.map(d => d.id === updated.id ? updated : d));
          // Show toast for status updates
          import('sonner').then(({ toast }) => {
            const statusLabels: Record<string, string> = {
              picked: '📦 Food has been picked up!',
              in_transit: '🚚 Food is in transit!',
              delivered: '✅ Food has been delivered!',
            };
            if (statusLabels[updated.status]) {
              toast.info(statusLabels[updated.status], {
                description: `${updated.food_type} · ${updated.quantity} servings`,
              });
            }
          });
        } else if (payload.eventType === 'DELETE') {
          setDonations(prev => prev.filter(d => d.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  };

  const signup = async (data: { name: string; email: string; phone: string; password: string; role: string; city: string }) => {
    // Block admin role
    const role = data.role === 'admin' ? 'donor' : data.role;
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          role,
          city: data.city,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const addDonation = async (d: Omit<Donation, 'id' | 'created_at' | 'status'>) => {
    await supabase.from('donations').insert({
      donor_id: d.donor_id,
      donor_name: d.donor_name,
      food_type: d.food_type,
      quantity: d.quantity,
      pickup_time: d.pickup_time,
      address: d.address,
      special_instructions: d.special_instructions || null,
      image_url: d.image_url || null,
    });
  };

  const updateDonationStatus = async (id: string, status: Donation['status']) => {
    await supabase.from('donations').update({ status }).eq('id', id);
  };

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      loading,
      login,
      signup,
      logout,
      donations,
      addDonation,
      updateDonationStatus,
      allProfiles,
      refreshDonations,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
