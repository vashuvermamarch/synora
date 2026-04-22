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
  const [notifOpen, setNotifOpen] = useState(false);

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

  const markAsRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch { }
  };

  const navLinks = [
    { to: '/dashboard', label: 'DASHBOARD' },
    { to: '/explore', label: 'EXPLORE' },
    { to: '/chat', label: 'MESSAGES' },
    { to: '/sessions', label: 'SESSIONS' },
    { to: '/resources', label: 'RESOURCES' },
    { to: '/ai', label: 'AI LAB' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) {
    return (
      <nav className="w-full bg-white border-b-4 border-secondary sticky top-0 z-50">
        <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="text-3xl font-black tracking-tighter flex items-center gap-1">
            <span className="bg-secondary text-primary px-2">SKILL</span>SWAP
          </Link>

          <div className="hidden lg:flex items-center gap-10 font-black text-[10px] uppercase tracking-[0.2em]">
            <Link to="/explore" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">EXPLORE</Link>
            <Link to="/how-it-works" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">HOW IT WORKS</Link>
            <Link to="/community" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">COMMUNITY</Link>
            <Link to="/contact" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">CONTACT US</Link>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="btn btn-white inline-block bg-white border-4 border-secondary px-8 py-3 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_black] transition-all">
              LOGIN
            </Link>
            <Link to="/register" className="btn btn-primary inline-block bg-primary border-4 border-secondary px-8 py-3 font-black text-xs uppercase tracking-widest shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-[0px_0px_0px_black] transition-all">
              JOIN NOW
            </Link>
            {/* Mobile Menu Toggle for Unauthenticated */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 hover:text-primary transition-colors text-secondary"
            >
              {mobileOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Overlay for Unauthenticated */}
        {mobileOpen && (
          <div className="lg:hidden bg-white border-t-4 border-secondary animate-slide-up text-secondary">
            <div className="flex flex-col">
              <Link to="/explore" onClick={() => setMobileOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 hover:bg-primary/5">EXPLORE</Link>
              <Link to="/how-it-works" onClick={() => setMobileOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 hover:bg-primary/5">HOW IT WORKS</Link>
              <Link to="/community" onClick={() => setMobileOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 hover:bg-primary/5">COMMUNITY</Link>
              <Link to="/contact" onClick={() => setMobileOpen(false)} className="px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 hover:bg-primary/5">CONTACT US</Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  return (
    <nav className="w-full bg-white border-b-4 border-secondary sticky top-0 z-50">
      <div className="w-full px-6 md:px-12 h-20 flex items-center justify-around">
        {/* Left: Logo */}
        <Link to="/dashboard" className="text-3xl font-black tracking-tighter flex items-center gap-1 text-secondary">
          <span className="bg-secondary text-primary px-2">SKILL</span>SWAP
        </Link>

        {/* Middle: Links */}
        <div className="hidden lg:flex items-center gap-8 font-black text-[10px] uppercase tracking-[0.2em] text-secondary">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`hover:text-primary transition-colors border-b-[3px] pb-1 ${isActive(link.to) ? 'border-primary text-primary' : 'border-transparent hover:border-primary'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2 transition-colors ${notifOpen ? 'text-primary' : 'hover:text-primary text-secondary'}`}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-primary border-2 border-secondary rounded-full" />
              )}
            </button>

            {/* Notification Dropdown */}
            {notifOpen && (
              <div 
                className="absolute right-0 mt-4 w-80 bg-white border-4 border-secondary shadow-[8px_8px_0px_black] z-50 animate-slide-up"
                style={{ top: '100%' }}
              >
                <div className="p-4 border-b-4 border-secondary bg-secondary text-primary font-black uppercase text-xs tracking-widest flex justify-between items-center">
                  <span>NOTIFICATIONS</span>
                  {unreadCount > 0 && <span className="bg-primary text-secondary px-2">{unreadCount} NEW</span>}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-[10px] font-bold text-muted uppercase tracking-widest">
                      SYSTEM CLEAR. NO NEW DATA.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`p-4 border-b-2 border-secondary/10 hover:bg-primary/5 cursor-pointer transition-colors ${!n.is_read ? 'border-l-4 border-l-primary' : ''}`}
                      >
                        <p className="text-xs font-bold leading-relaxed mb-1">{n.message}</p>
                        <p className="text-[10px] font-mono text-muted uppercase">
                          {new Date(n.created_at).toLocaleDateString()} • {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 0 && (
                  <button 
                    className="w-full py-3 bg-white border-t-4 border-secondary font-black text-[10px] uppercase tracking-[0.2em] hover:bg-secondary hover:text-white transition-colors"
                    onClick={() => setNotifOpen(false)}
                  >
                    CLOSE_SYSTEM_PANEL
                  </button>
                )}
              </div>
            )}
          </div>

          <Link to="/profile" className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-secondary hover:text-primary transition-colors">
            <div className="w-10 h-10 bg-secondary flex items-center justify-center border-2 border-secondary text-primary">
              <User size={20} />
            </div>
            <span className="hidden sm:inline-block">PROFILE</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 hover:text-primary transition-colors text-secondary"
          >
            {mobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t-4 border-secondary animate-slide-up text-secondary">
          <div className="flex flex-col">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 ${isActive(link.to) ? 'bg-primary text-secondary' : 'hover:bg-primary/5'
                  }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="px-8 py-4 text-xs font-black uppercase tracking-widest border-b-2 border-secondary/10 hover:bg-primary/5 flex items-center gap-4"
            >
              <User size={18} />
              PROFILE
            </Link>
            <button
              onClick={handleLogout}
              className="px-8 py-6 text-xs font-black uppercase tracking-widest text-secondary hover:text-white hover:bg-secondary flex items-center gap-4 w-full text-left transition-colors"
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
