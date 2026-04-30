import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';

export default function Dashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [community, setCommunity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }
      const headers = { 'Authorization': `Bearer ${token}` };
      try {
        const [profileRes, sessionsRes, requestsRes, notifyRes, communityRes] = await Promise.all([
          fetch('http://localhost:8000/api/users/profile/', { headers }),
          fetch('http://localhost:8000/api/sessions/', { headers }),
          fetch('http://localhost:8000/api/sessions/request/sent/', { headers }),
          fetch('http://localhost:8000/api/notifications/', { headers }),
          fetch('http://localhost:8000/api/skills/match/', { headers })
        ]);

        if (profileRes.ok) setProfile(await profileRes.json());
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
        if (requestsRes.ok) setRequests(await requestsRes.json());
        if (notifyRes.ok) setActivities(await notifyRes.json());
        if (communityRes.ok) setCommunity(await communityRes.json());

      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const rightNavContent = (
    <div className="flex items-center gap-4">
      <NotificationDropdown />

      <Link to="/profile" className="w-9 h-9 rounded-full border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-300">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.avatar_seed || 'Felix'}`} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </Link>

      <motion.button 
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full border border-white/10 transition-all duration-300"
      >
        Logout
      </motion.button>
    </div>
  );

  if (loading) return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>;

  return (
    <div className="relative w-full min-h-screen text-white selection:bg-violet-500/30 overflow-x-hidden pointer-events-none">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      {/* Main Content Layout */}
      <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto relative z-10 pointer-events-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDE: Major Content (col-span-8) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{profile?.username || 'Creative Mind'}</span>
              </h1>
              <p className="text-white/40 mt-2 text-lg">Here's what's happening with your learning journey today.</p>
            </motion.div>

            {/* Active Sessions Card */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Active Sessions
                </h2>
                <Link to="/sessions" className="text-white/40 hover:text-white text-sm transition-colors">View All</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessions.filter(s => s.status === 'accepted').length === 0 ? (
                  <div className="col-span-2 p-10 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl text-center text-white/20 italic">
                    No active sessions found.
                  </div>
                ) : (
                  sessions.filter(s => s.status === 'accepted').slice(0, 2).map((sess) => {
                    const isUser1 = sess.user1_name === profile?.username;
                    const partnerName = isUser1 ? sess.user2_name : sess.user1_name;
                    const partnerAvatar = isUser1 ? sess.user2_avatar_seed : sess.user1_avatar_seed;
                    return (
                      <motion.div 
                        key={sess.id}
                        whileHover={{ y: -5 }}
                        onClick={() => navigate('/sessions')}
                        className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerAvatar || partnerName}`} alt="Avatar" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white/90">Skill Swap Session</h4>
                            <p className="text-xs text-white/40">with {partnerName} • {sess.date}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Global Rating Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent border border-white/10 p-10 h-72 flex items-center justify-between group"
            >
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <svg className="w-64 h-64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              </div>

              <div className="relative z-10 space-y-6 flex-1">
                <div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-400">Community Choice</span>
                  <h2 className="text-4xl font-bold mt-4 leading-tight tracking-tight text-white">Global Rating <br/> Performance</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {community.slice(0, 4).map((user) => (
                      <div key={user.id} className="w-10 h-10 rounded-full border-2 border-black bg-white/10 overflow-hidden shadow-xl">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar_seed || user.username}`} alt="User" />
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-black bg-violet-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                      +{community.length > 4 ? community.length - 4 : 0}
                    </div>
                  </div>
                  <p className="text-white/40 text-xs font-medium max-w-[150px]">
                    Join {community.length}+ active lifelong learners.
                  </p>
                </div>
              </div>

              <div className="relative z-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center shadow-2xl">
                <div className="text-5xl font-black bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent mb-2">
                  {profile?.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '0.0'}
                </div>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className={`w-4 h-4 ${s <= Math.round(profile?.average_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-white/10 fill-white/10'}`} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 whitespace-nowrap">Your Personal Rating</p>
              </div>
            </motion.div>

            {/* Message Sent Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Sent Requests</h2>
              <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden">
                <table className="w-full text-left">
                  <thead className="border-b border-white/5 bg-white/[0.02]">
                    <tr>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Recipient</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                      <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-white/20 italic">No sent requests yet.</td>
                      </tr>
                    ) : (
                      requests.slice(0, 3).map((req) => (
                        <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/20 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.receiver_avatar_seed || req.receiver_name}`} alt="Avatar" />
                              </div>
                              <span className="font-medium text-white/80">{req.receiver_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${req.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : req.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-sm text-white/40 font-medium">{new Date(req.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Activity Log Major Card */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Activity Log</h2>
              <div className="p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] space-y-8">
                {activities.length === 0 ? (
                  <div className="text-center text-white/20 italic text-sm py-4">No recent activity.</div>
                ) : (
                  activities.slice(0, 3).map((log, i) => {
                    const color = log.type === 'session' ? 'bg-violet-500' : log.type === 'request' ? 'bg-fuchsia-500' : 'bg-blue-500';
                    return (
                      <div key={log.id} className="flex gap-6 relative group">
                        {i !== Math.min(activities.length, 3) - 1 && <div className="absolute left-3 top-8 bottom-[-24px] w-[1px] bg-white/10"></div>}
                        <div className={`w-6 h-6 rounded-full ${color} flex-shrink-0 mt-1 shadow-[0_0_15px_${color}40] z-10 border-4 border-black`}></div>
                        <div>
                          <h4 className="font-semibold text-white/90 leading-none">{log.title}</h4>
                          <p className="text-sm text-white/40 mt-1">{log.message}</p>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white/20 block mt-2">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

          </div>

          {/* RIGHT SIDE: Sidebar (col-span-4) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Shortcuts Section */}
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">Shortcuts</h2>
              <div className="space-y-3">
                {[
                  { name: "Schedule New Session", icon: "M12 5v14M5 12h14", color: "from-violet-600 to-indigo-600" },
                  { name: "Browse Skills", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", color: "from-emerald-600 to-teal-600" },
                  { name: "Update Profile", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", color: "from-amber-600 to-orange-600" },
                ].map((shortcut, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.06)' }}
                    className="w-full flex items-center gap-4 p-4 bg-white/[0.03] border border-white/10 rounded-2xl transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${shortcut.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d={shortcut.icon} /></svg>
                    </div>
                    <span className="font-semibold text-white/80">{shortcut.name}</span>
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Next Session Card */}
            <section className="space-y-4 pt-4">
              <h2 className="text-xl font-semibold">Next Session</h2>
              {sessions.filter(s => s.status === 'accepted').length === 0 ? (
                <div className="p-8 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] text-center text-white/20 italic text-sm">
                  No upcoming sessions.
                </div>
              ) : (() => {
                const nextSession = [...sessions]
                  .filter(s => s.status === 'accepted')
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
                
                const isUser1 = nextSession.user1_name === profile?.username;
                const partnerName = isUser1 ? nextSession.user2_name : nextSession.user1_name;
                const partnerAvatar = isUser1 ? nextSession.user2_avatar_seed : nextSession.user1_avatar_seed;

                return (
                  <div 
                    onClick={() => navigate('/sessions')}
                    className="relative overflow-hidden p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-[2.5rem] group cursor-pointer"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <svg className="w-32 h-32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-600 to-orange-500 p-[1px]">
                          <div className="w-full h-full bg-black rounded-[15px] flex items-center justify-center overflow-hidden italic font-black text-xl text-white">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerAvatar || partnerName}`} alt="Tutor" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight text-white leading-tight">Skill Swap</h3>
                          <p className="text-xs text-white/40 font-medium">with {partnerName}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                          <span className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Date</span>
                          <span className="text-sm font-bold text-white">{new Date(nextSession.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                          <span className="block text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Time</span>
                          <span className="text-sm font-bold text-white">{nextSession.time}</span>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-violet-400 transition-colors"
                      >
                        Join Call
                      </motion.button>
                    </div>
                  </div>
                );
              })()}
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
