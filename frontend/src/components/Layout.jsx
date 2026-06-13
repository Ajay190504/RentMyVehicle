import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Home, Calendar, Car, CreditCard, ShieldAlert, Info, MessageSquare, HelpCircle, LayoutDashboard } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const getNavLinks = () => {
    const publicLinks = [
      { label: 'Rent', path: '/search', icon: Car },
      { label: 'About', path: '/about', icon: Info },
      { label: 'Contact', path: '/contact', icon: MessageSquare },
      { label: 'Help', path: '/help', icon: HelpCircle },
    ];

    if (!user) return publicLinks;

    if (user.role === 'CUSTOMER') {
      return [
        { label: 'Rent', path: '/search', icon: Car },
        { label: 'Bookings', path: '/bookings', icon: Calendar },
        { label: 'About', path: '/about', icon: Info },
        { label: 'Contact', path: '/contact', icon: MessageSquare },
        { label: 'Help', path: '/help', icon: HelpCircle },
      ];
    } else if (user.role === 'OWNER') {
      return [
        { label: 'Dashboard', path: '/owner', icon: LayoutDashboard },
        { label: 'Rentals', path: '/owner/bookings', icon: Calendar },
        { label: 'Rent', path: '/search', icon: Car },
        { label: 'My Bookings', path: '/bookings', icon: Calendar },
        { label: 'Subscriptions', path: '/plans', icon: CreditCard },
        { label: 'About', path: '/about', icon: Info },
        { label: 'Contact', path: '/contact', icon: MessageSquare },
        { label: 'Help', path: '/help', icon: HelpCircle },
      ];
    } else if (user.role === 'ADMIN') {
      return [
        { label: 'Admin Panel', path: '/admin', icon: ShieldAlert },
        { label: 'Rent', path: '/search', icon: Car },
        { label: 'Bookings', path: '/bookings', icon: Calendar },
        { label: 'About', path: '/about', icon: Info },
        { label: 'Contact', path: '/contact', icon: MessageSquare },
        { label: 'Help', path: '/help', icon: HelpCircle },
      ];
    }
    return publicLinks;
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-brand-canvas text-brand-ink">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-brand-canvas border-b border-brand-canvas-soft px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold tracking-tight hover:opacity-80 transition text-brand-ink">
            RentMyVehicle
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 border-l border-brand-canvas-soft pl-6">
            {navLinks.map((link) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 text-xs uppercase font-extrabold tracking-wider transition-colors duration-150 ${
                    isActive(link.path)
                      ? 'text-brand-ink border-b-2 border-brand-primary pb-1'
                      : 'text-brand-body hover:text-brand-ink pb-1'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-4">
              <Link
                to="/profile"
                className="flex items-center gap-1.5 text-xs font-bold text-brand-ink hover:opacity-85 transition pb-0.5 border-b border-transparent hover:border-brand-ink"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse inline-block mr-1"></span>
                {user.name}
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2 border border-brand-surface-pressed text-brand-ink text-xs font-medium rounded-pill hover:bg-brand-canvas-soft transition duration-150"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 border border-brand-surface-pressed text-brand-ink text-xs font-medium rounded-pill hover:bg-brand-canvas-soft transition duration-150"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-brand-black text-brand-white text-xs font-medium rounded-pill hover:bg-brand-black-elevated transition duration-150"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 mb-20 md:mb-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-brand-black text-brand-white py-12 px-4 md:px-8 border-t border-brand-black-elevated">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold tracking-tight text-brand-white">
              RentMyVehicle
            </Link>
            <p className="text-brand-mute text-xs font-normal max-w-xs leading-relaxed">
              Monetize your fleet or rent premium, specialized vehicles. Anytime, anywhere.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-mute">Company</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/about" className="hover:text-brand-mute transition">About us</Link></li>
              <li><Link to="/contact" className="hover:text-brand-mute transition">Contact us</Link></li>
              <li><a href="#" className="hover:text-brand-mute transition">Careers</a></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-mute">Products</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/" className="hover:text-brand-mute transition">Rent vehicles</Link></li>
              <li><Link to="/register?role=OWNER" className="hover:text-brand-mute transition">List vehicles</Link></li>
              <li><Link to="/plans" className="hover:text-brand-mute transition">Host plans</Link></li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-brand-mute">Support</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/help" className="hover:text-brand-mute transition">Help / FAQs</Link></li>
              <li><a href="#" className="hover:text-brand-mute transition">Safety</a></li>
              <li><a href="#" className="hover:text-brand-mute transition">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-brand-black-elevated mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-brand-mute">
          <p>© {new Date().getFullYear()} RentMyVehicle Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
            <a href="#" className="hover:underline">Accessibility</a>
          </div>
        </div>
      </footer>

      {/* Bottom Nav Bar (Mobile-Only) */}
      {navLinks.length > 0 && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-canvas border-t border-brand-canvas-soft flex items-center justify-around py-3 z-50">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider ${
                  isActive(link.path) ? 'text-brand-ink' : 'text-brand-body'
                }`}
              >
                <IconComponent className="w-4.5 h-4.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
