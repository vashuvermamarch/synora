import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Clock, MailOpen } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fetchNotifications = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Fetch notifications failed:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch(`http://localhost:8000/api/notifications/${id}/read/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/notifications/read-all/', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white/60 hover:text-white transition-colors duration-300 relative group"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-pink-500 rounded-full border-2 border-black group-hover:scale-125 transition-transform animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 bg-black/40 backdrop-blur-[100px] border border-white/20 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold text-sm tracking-tight text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-black uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center text-white/20 italic text-xs">
                    No notifications yet.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div 
                        key={n.id}
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-5 border-b border-white/5 hover:bg-white/[0.05] transition-all cursor-pointer group/item ${!n.is_read ? 'bg-violet-500/[0.05]' : ''}`}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110 ${
                            !n.is_read ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30' : 'bg-white/5 text-white/20'
                          }`}>
                            {n.is_read ? <MailOpen className="w-4 h-4" /> : <Bell className="w-4 h-4 animate-pulse" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs font-bold truncate ${!n.is_read ? 'text-white' : 'text-white/60'}`}>{n.title || 'Notification'}</h4>
                            <p className="text-[10px] text-white/40 line-clamp-2 mt-1 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-2 mt-3">
                              <Clock className="w-3 h-3 text-white/20" />
                              <span className="text-[9px] text-white/20 font-medium">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 shadow-[0_0_10px_#ec4899]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 bg-black/20 text-center border-t border-white/10">
                <button className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                  View All Activity
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
