import { Heart, Mail, Phone } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const footerLinks = {
  'Quick Links': [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Features', href: '/#features' },
    { label: 'Impact', href: '/#impact' },
    { label: 'About Us', href: '/#about' },
  ],
  'Resources': [
    { label: 'Donate Food', href: '/donate-food' },
    { label: 'Track Donations', href: '/track' },
    { label: 'Donate Money', href: '/donate-money' },
    { label: 'FAQ', href: '/#features' },
  ],
};

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (href: string) => {
    if (href.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' }), 100);
      } else {
        document.getElementById(href.slice(2))?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-footer text-footer-foreground pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-xl font-bold text-primary-foreground mb-4">
              <Heart className="h-5 w-5 text-secondary fill-secondary" />
              Annadanam
            </div>
            <p className="text-sm leading-relaxed">
              Connecting surplus food with hunger needs through technology-driven solutions.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-primary-foreground font-semibold mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <button
                      onClick={() => handleClick(link.href)}
                      className="text-sm hover:text-primary-foreground transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="text-primary-foreground font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@annadanam.org" className="hover:text-primary-foreground transition-colors">info@annadanam.org</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <a href="tel:+918087826047" className="hover:text-primary-foreground transition-colors">+91 8087826047</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-muted-foreground/20 pt-6 text-center text-sm">
          <p>© 2023 Annadanam Platform. All rights reserved. Made by Manjush Pawar</p>
        </div>
      </div>
    </footer>
  );
}
