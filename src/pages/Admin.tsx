import { useEffect, useState } from 'react';
import { useAuth, Profile } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Package, Heart, AlertCircle, TrendingUp, Search,
  ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, Truck, LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  picked: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  in_transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

const PIE_COLORS = ['hsl(146,50%,36%)', 'hsl(213,70%,59%)', 'hsl(18,100%,60%)', 'hsl(280,60%,55%)'];

export default function AdminPage() {
  const { profile, donations, allProfiles, updateDonationStatus, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [userSearch, setUserSearch] = useState('');
  const [donationSearch, setDonationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  if (!profile || profile.role !== 'admin') return null;

  const pending = donations.filter(d => d.status === 'pending').length;
  const delivered = donations.filter(d => d.status === 'delivered').length;
  const inTransit = donations.filter(d => d.status === 'in_transit').length;
  const picked = donations.filter(d => d.status === 'picked').length;
  const totalServings = donations.reduce((s, d) => s + d.quantity, 0);

  // Role distribution for pie chart
  const roleCounts = allProfiles.reduce((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  // Status distribution for bar chart
  const statusData = [
    { name: 'Pending', count: pending, fill: 'hsl(45,93%,47%)' },
    { name: 'Picked', count: picked, fill: 'hsl(213,70%,59%)' },
    { name: 'In Transit', count: inTransit, fill: 'hsl(280,60%,55%)' },
    { name: 'Delivered', count: delivered, fill: 'hsl(146,50%,36%)' },
  ];

  // Donations over time (by date)
  const donationsByDate = donations.reduce((acc, d) => {
    const date = new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const timelineData = Object.entries(donationsByDate).reverse().slice(-10).map(([date, count]) => ({ date, count }));

  // Filtered data
  const filteredUsers = allProfiles.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredDonations = donations.filter(d => {
    const matchSearch = d.donor_name.toLowerCase().includes(donationSearch.toLowerCase()) ||
      d.food_type.toLowerCase().includes(donationSearch.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = [
    { icon: Users, label: 'Total Users', value: allProfiles.length, trend: '+12%', up: true },
    { icon: Package, label: 'Total Donations', value: donations.length, trend: '+8%', up: true },
    { icon: AlertCircle, label: 'Pending', value: pending, trend: pending > 3 ? 'Needs attention' : 'On track', up: pending <= 3 },
    { icon: Heart, label: 'Servings Shared', value: totalServings, trend: '+24%', up: true },
  ];

  return (
    <div className="min-h-[80vh] py-8">
      <div className="container max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage donations, users & platform operations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(s => (
            <Card key={s.label} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className={`text-xs font-medium flex items-center gap-1 ${s.up ? 'text-green-600 dark:text-green-400' : 'text-secondary'}`}>
                    {s.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {s.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2"><TrendingUp className="h-4 w-4" />Overview</TabsTrigger>
            <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="donations" className="gap-2"><Package className="h-4 w-4" />Donations</TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2"><BarChart className="h-4 w-4" />Analytics</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Donation Status Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Donation Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {statusData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {donations.slice(0, 5).map(d => (
                      <div key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {d.donor_name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{d.donor_name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{d.food_type} · {d.quantity} servings</p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-0 ${STATUS_COLORS[d.status]}`}>
                          {d.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    ))}
                    {donations.length === 0 && <p className="text-sm text-muted-foreground">No donations yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base">All Users ({allProfiles.length})</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="pb-3 font-medium text-muted-foreground">User</th>
                        <th className="pb-3 font-medium text-muted-foreground">Email</th>
                        <th className="pb-3 font-medium text-muted-foreground">Role</th>
                        <th className="pb-3 font-medium text-muted-foreground">City</th>
                        <th className="pb-3 font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-muted-foreground">{u.email}</td>
                          <td className="py-3">
                            <Badge variant="outline" className="capitalize text-xs">{u.role}</Badge>
                          </td>
                          <td className="py-3 text-muted-foreground">{u.city || '-'}</td>
                          <td className="py-3 text-muted-foreground text-xs">
                            {u.id ? new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '-'}
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DONATIONS TAB */}
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <CardTitle className="text-base">All Donations ({donations.length})</CardTitle>
                  <div className="flex gap-2">
                    <div className="relative w-full sm:w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={donationSearch}
                        onChange={e => setDonationSearch(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                    <div className="flex gap-1">
                      {['all', 'pending', 'picked', 'in_transit', 'delivered'].map(s => (
                        <Button
                          key={s}
                          size="sm"
                          variant={statusFilter === s ? 'default' : 'outline'}
                          className="text-xs h-9 capitalize"
                          onClick={() => setStatusFilter(s)}
                        >
                          {s === 'all' ? 'All' : s.replace('_', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredDonations.length === 0 ? (
                  <p className="text-muted-foreground py-8 text-center">No donations found</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left">
                          <th className="pb-3 font-medium text-muted-foreground">Donor</th>
                          <th className="pb-3 font-medium text-muted-foreground">Food</th>
                          <th className="pb-3 font-medium text-muted-foreground">Qty</th>
                          <th className="pb-3 font-medium text-muted-foreground">Status</th>
                          <th className="pb-3 font-medium text-muted-foreground">Date</th>
                          <th className="pb-3 font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDonations.map(d => (
                          <tr key={d.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 font-medium">{d.donor_name}</td>
                            <td className="py-3 capitalize text-muted-foreground">{d.food_type}</td>
                            <td className="py-3">{d.quantity}</td>
                            <td className="py-3">
                              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border-0 ${STATUS_COLORS[d.status]}`}>
                                {d.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                {d.status === 'picked' && <Package className="h-3 w-3 mr-1" />}
                                {d.status === 'in_transit' && <Truck className="h-3 w-3 mr-1" />}
                                {d.status === 'delivered' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                {d.status.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="py-3 text-xs text-muted-foreground">
                              {new Date(d.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                            </td>
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* ANALYTICS TAB */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Role Distribution */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">User Roles Distribution</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}`}>
                        {roleData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Donations Over Time */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Donations Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="hsl(146,50%,36%)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Quick Stats Cards */}
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Delivery Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{donations.length > 0 ? Math.round((delivered / donations.length) * 100) : 0}%</div>
                      <p className="text-xs text-muted-foreground mt-1">Delivery Rate</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-accent">{totalServings}</div>
                      <p className="text-xs text-muted-foreground mt-1">Total Servings</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-secondary">{pending}</div>
                      <p className="text-xs text-muted-foreground mt-1">Awaiting Pickup</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{allProfiles.filter(p => p.role === 'volunteer').length}</div>
                      <p className="text-xs text-muted-foreground mt-1">Active Volunteers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
