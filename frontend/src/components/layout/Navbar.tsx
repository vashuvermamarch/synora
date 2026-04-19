import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Menu, X, Bell, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/client';
import type { Notification as NotifType } from '../../types';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifType[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications/').then(r => setNotifications(r.data)).catch(() => { });
    }
  }, [isAuthenticated, location.pathname]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/dashboard', label: 'DASHBOARD' },
    { to: '/explore', label: 'EXPLORE' },
    { to: '/sessions', label: 'SESSIONS' },
    { to: '/chat', label: 'MESSAGES' },
    { to: '/resources', label: 'RESOURCES' },
    { to: '/ai', label: 'AI LAB' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="w-full bg-white border-b-4 border-secondary sticky top-0 z-50">
        <div className="w-full px-6 md:px-12 h-20 flex items-center justify-around">
          <Link to="/" className="text-3xl font-black tracking-tighter flex items-center gap-1">
            <span className="bg-secondary text-primary px-2">SKILL</span>SWAP
          </Link>

          <div className="hidden lg:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.2em] ">
            <Link to="/explore" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">EXPLORE</Link>
            <Link to="/how-it-works" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">HOW IT WORKS</Link>
            <Link to="/community" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">COMMUNITY</Link>
            <Link to="/contact" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">CONTACT US</Link>
          </div>

          <div className="flex items-center gap-6 ">
            <Link to="/login" className="btn btn-white inline-block bg-white border-4 border-secondary px-10 py-4 font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_black] transition-all">
              LOGIN
            </Link>
            <Link to="/register" className="btn btn-primary inline-block bg-primary border-4 border-secondary px-10 py-4 font-black text-sm uppercase tracking-widest shadow-[6px_6px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_black] transition-all">
              JOIN NOW
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full bg-secondary text-white border-b-4 border-primary sticky top-0 z-50 shadow-brutal">
      <div className="w-full px-6 md:px-12 h-16 flex items-center justify-between">
        <Link to="/dashboard" className="text-2xl font-black tracking-tighter flex items-center gap-1">
          <span className="text-primary">SYN</span>ORA
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center h-full">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`h-full px-6 flex items-center text-[10px] font-black uppercase tracking-widest transition-all border-x-2 border-transparent ${isActive(link.to)
                ? 'bg-primary text-secondary border-secondary'
                : 'hover:bg-white/5'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white/10 transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary border-2 border-secondary" />
            )}
          </button>

          <div className="hidden sm:block h-8 w-px bg-white/20 mx-2" />

          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:text-primary transition-colors"
          >
            <LogOut size={16} />
            [ LOGOUT ]
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="md:hidden bg-secondary border-t-4 border-primary animate-slide-up">
          <div className="flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-white/5 ${isActive(link.to) ? 'bg-primary text-secondary' : 'hover:bg-white/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="px-8 py-6 text-xs font-black uppercase tracking-widest text-primary hover:bg-white/5 flex items-center gap-4"
            >
              <LogOut size={18} />
              TERMINATE_SESSION
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
