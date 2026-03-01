import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'donor' | 'recipient' | 'admin' | 'volunteer';
  city?: string;
  avatar?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  foodType: string;
  quantity: number;
  pickupTime: string;
  address: string;
  specialInstructions?: string;
  imageUrl?: string;
  status: 'pending' | 'picked' | 'in_transit' | 'delivered';
  createdAt: string;
  recipientId?: string;
  recipientName?: string;
  trackingLat?: number;
  trackingLng?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  signup: (data: Omit<User, 'id'> & { password: string }) => boolean;
  logout: () => void;
  donations: Donation[];
  addDonation: (d: Omit<Donation, 'id' | 'createdAt' | 'status'>) => void;
  updateDonationStatus: (id: string, status: Donation['status']) => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

const USERS_KEY = 'annadanam_users';
const CURRENT_KEY = 'annadanam_current';
const DONATIONS_KEY = 'annadanam_donations';

// Seed admin
const seedUsers = (): (User & { password: string })[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) return JSON.parse(stored);
  const admin = {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@annadanam.org',
    phone: '+918087826047',
    role: 'admin' as const,
    password: 'admin123',
  };
  localStorage.setItem(USERS_KEY, JSON.stringify([admin]));
  return [admin];
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<(User & { password: string })[]>(seedUsers);
  const [user, setUser] = useState<User | null>(() => {
    const c = localStorage.getItem(CURRENT_KEY);
    return c ? JSON.parse(c) : null;
  });
  const [donations, setDonations] = useState<Donation[]>(() => {
    const d = localStorage.getItem(DONATIONS_KEY);
    return d ? JSON.parse(d) : [];
  });

  useEffect(() => { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations)); }, [donations]);

  const login = (email: string, password: string) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      const { password: _, ...u } = found;
      setUser(u);
      localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
      return true;
    }
    return false;
  };

  const signup = (data: Omit<User, 'id'> & { password: string }) => {
    if (users.find(u => u.email === data.email)) return false;
    const newUser = { ...data, id: crypto.randomUUID() };
    setUsers(prev => [...prev, newUser]);
    const { password: _, ...u } = newUser;
    setUser(u);
    localStorage.setItem(CURRENT_KEY, JSON.stringify(u));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(CURRENT_KEY);
  };

  const addDonation = (d: Omit<Donation, 'id' | 'createdAt' | 'status'>) => {
    const donation: Donation = {
      ...d,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    setDonations(prev => [...prev, donation]);
  };

  const updateDonationStatus = (id: string, status: Donation['status']) => {
    setDonations(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const allUsers = users.map(({ password: _, ...u }) => u);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, donations, addDonation, updateDonationStatus, allUsers }}>
      {children}
    </AuthContext.Provider>
  );
};
