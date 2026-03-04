import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, Donation } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  message: string;
  icon: string;
  time: Date;
  donationId: string;
  read: boolean;
}

const statusMessages: Record<string, { msg: string; icon: string }> = {
  pending: { msg: 'New food donation available!', icon: '🍽️' },
  picked: { msg: 'Food has been picked up!', icon: '📦' },
  in_transit: { msg: 'Food is on the way!', icon: '🚚' },
  delivered: { msg: 'Food has been delivered!', icon: '✅' },
};

export default function NotificationBell() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!profile) return;

    const channel = supabase
      .channel('notifications-bell')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'donations',
      }, (payload: any) => {
        if (!payload.new) return;
        const d = payload.new as Donation;

        // Notify if user is involved
        const isInvolved =
          d.donor_id === profile.id ||
          d.recipient_id === profile.id ||
          d.volunteer_id === profile.id ||
          (profile.role === 'recipient' && payload.eventType === 'INSERT') ||
          (profile.role === 'volunteer' && d.status === 'pending');

        if (!isInvolved) return;

        const info = statusMessages[d.status] || { msg: `Donation updated`, icon: '🔔' };

        const notif: Notification = {
          id: `${d.id}-${Date.now()}`,
          message: `${info.icon} ${d.food_type}: ${info.msg}`,
          icon: info.icon,
          time: new Date(),
          donationId: d.id,
          read: false,
        };

        setNotifications(prev => [notif, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClick = (notif: Notification) => {
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    navigate('/track');
    setOpen(false);
  };

  if (!profile) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
          <Bell className="h-5 w-5 text-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="font-bold text-sm text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary font-semibold hover:underline">
              Mark all read
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
            No notifications yet
          </div>
        ) : (
          notifications.map(notif => (
            <DropdownMenuItem
              key={notif.id}
              onClick={() => handleClick(notif)}
              className={`flex flex-col items-start gap-1 px-3 py-3 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`}
            >
              <span className={`text-sm leading-tight ${!notif.read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                {notif.message}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {notif.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
