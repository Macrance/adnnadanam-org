import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Heart, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Features', href: '/#features' },
  { label: 'Impact', href: '/#impact' },
  { label: 'About', href: '/#about' },
  { label: 'Donate', href: '/donate-money' },
];

export default function Header() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm border-b border-border">
      <div className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Heart className="h-6 w-6 text-secondary fill-secondary" />
          Annadanam
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="h-4 w-4" />
                  {profile.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/account')}>
                  <User className="mr-2 h-4 w-4" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/donate-food')}>
                  <Heart className="mr-2 h-4 w-4" /> Donate Food
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/track')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Track Donations
                </DropdownMenuItem>
                {profile.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate('/login')}>Login</Button>
          )}
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-3">
          {navItems.map(item => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className="block w-full text-left py-2 text-foreground hover:text-primary font-medium"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-3 border-t border-border space-y-2">
            {profile ? (
              <>
                <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); navigate('/account'); }}>My Account</Button>
                <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); navigate('/track'); }}>Track Donations</Button>
                <Button variant="destructive" className="w-full" onClick={() => { handleLogout(); setMobileOpen(false); }}>Logout</Button>
              </>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => { setMobileOpen(false); navigate('/login'); }}>Login</Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
