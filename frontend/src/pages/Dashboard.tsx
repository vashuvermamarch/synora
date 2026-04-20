import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Search, Pencil, CheckCircle, Award, Star, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import type { Session, Notification as NotifType } from '../types';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [notifications, setNotifications] = useState<NotifType[]>([]);
  const [stats, setStats] = useState({ sessions: 0, matches: 0, messages: 0 });

  useEffect(() => {
    api.get('/sessions/').then(r => { setSessions(r.data.slice(0, 5)); setStats(s => ({...s, sessions: r.data.length})); }).catch(()=>{});
    api.get('/notifications/').then(r => setNotifications(r.data.slice(0, 5))).catch(()=>{});
    api.get('/chat/messages/').then(r => setStats(s => ({...s, messages: r.data.length}))).catch(()=>{});
    api.get('/skills/match/').then(r => setStats(s => ({...s, matches: r.data.length}))).catch(()=>{});
  }, []);

  const nextSession = sessions.find(s => s.status === 'accepted' || s.status === 'pending');

  return (
    <div className="w-full min-h-screen bg-surface" style={{ padding: '3rem 2rem' }}>
      <div className="max-w-[1400px] mx-auto">
        
        {/* Main Grid: Left Column (Stats + Activity), Right Column (Actions + Next Session) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 flex flex-col gap-12">
            
            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Active Sessions */}
              <Link to="/sessions" className="bg-primary border-[6px] border-secondary flex flex-col justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform cursor-pointer block" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <div>
                  <h3 className="font-black uppercase tracking-widest" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>ACTIVE<br/>SESSIONS</h3>
                  <div className="font-black leading-none" style={{ fontSize: '5rem' }}>{stats.sessions}</div>
                </div>
                <div className="inline-flex items-center bg-secondary text-white font-mono uppercase tracking-widest mt-6 w-max" style={{ padding: '6px 12px', fontSize: '0.65rem', gap: '6px' }}>
                  <TrendingUp size={12} /> {stats.matches} MATCHES
                </div>
              </Link>

              {/* Global Rating (Static fallback since backend lacks rating) */}
              <div className="bg-white border-[6px] border-secondary flex flex-col justify-between" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <div>
                  <h3 className="font-black uppercase tracking-widest" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>GLOBAL RATING</h3>
                  <div className="font-black leading-none" style={{ fontSize: '5rem' }}>{stats.sessions > 0 ? '4.9' : 'N/A'}</div>
                </div>
                <div className="flex gap-1 mt-6 text-primary">
                  {[1,2,3,4,5].map(i => <Star key={i} size={24} fill={stats.sessions > 0 ? "currentColor" : "none"} className={stats.sessions > 0 ? "" : "text-muted opacity-30"} />)}
                </div>
              </div>

              {/* Skills Mastered / Messages */}
              <div className="bg-secondary border-[6px] border-secondary flex flex-col justify-between" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-primary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>MESSAGES<br/>SENT</h3>
                  <div className="font-black leading-none text-primary" style={{ fontSize: '5rem' }}>{stats.messages}</div>
                </div>
                <div className="font-mono uppercase text-muted mt-6" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                  CURRENT ROLE:<br/>{user?.role?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Recent Activity Log */}
            <div className="bg-[#E5E7EB] border-[6px] border-secondary" style={{ padding: '2.5rem', boxShadow: '16px 16px 0px 0px #000' }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                <h2 className="font-black uppercase tracking-tighter" style={{ fontSize: '2rem' }}>RECENT_ACTIVITY_LOG</h2>
                <div className="bg-secondary text-white font-mono uppercase tracking-widest" style={{ padding: '4px 12px', fontSize: '0.65rem' }}>LIVE_FEED</div>
              </div>

              <div className="flex flex-col gap-4">
                {notifications.length === 0 ? (
                  <div className="bg-white border-[4px] border-secondary flex items-center justify-center" style={{ padding: '2rem' }}>
                    <p className="font-mono uppercase text-muted" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>NO RECENT ACTIVITY.</p>
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} className="bg-white border-[4px] border-secondary flex items-center justify-between" style={{ padding: '1.25rem' }}>
                    <div className="flex items-center gap-6">
                      <div className={`border-[3px] border-secondary w-16 h-16 flex items-center justify-center shrink-0 ${n.is_read ? 'bg-white text-secondary' : 'bg-secondary text-primary'}`}>
                        {n.is_read ? <CheckCircle size={32} /> : <Award size={32} />}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="font-black uppercase tracking-widest" style={{ fontSize: '1rem' }}>{n.message}</h4>
                        <p className="font-mono uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>STATUS: {n.is_read ? 'READ' : 'UNREAD'}</p>
                      </div>
                    </div>
                    <div className="font-mono uppercase text-muted font-bold" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full bg-transparent border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors" style={{ padding: '1.5rem', fontSize: '1rem', marginTop: '1.5rem' }}>
                VIEW_FULL_LOG_TERMINAL
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:col-span-1 flex flex-col">
            
            {/* Quick Actions Header */}
            <h2 className="font-black uppercase tracking-tighter border-b-[6px] border-secondary" style={{ fontSize: '2rem', paddingBottom: '0.5rem', marginBottom: '2rem' }}>
              QUICK_ACTIONS
            </h2>

            {/* Action Buttons */}
            <div className="flex flex-col gap-6">
              <Link to="/explore#matches" className="bg-white border-[6px] border-secondary flex items-center justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <span className="font-black uppercase tracking-widest" style={{ fontSize: '1.25rem', maxWidth: '150px', lineHeight: '1.2' }}>SCHEDULE NEW SESSION</span>
                <ArrowRight size={32} />
              </Link>
              
              <Link to="/explore" className="bg-primary border-[6px] border-secondary flex items-center justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <span className="font-black uppercase tracking-widest" style={{ fontSize: '1.25rem', maxWidth: '150px', lineHeight: '1.2' }}>BROWSE SKILLS</span>
                <Search size={32} />
              </Link>

              <Link to="/profile" className="bg-white border-[6px] border-secondary flex items-center justify-between hover:-translate-y-1 hover:-translate-x-1 transition-transform" style={{ padding: '2rem', boxShadow: '12px 12px 0px 0px #000' }}>
                <span className="font-black uppercase tracking-widest" style={{ fontSize: '1.25rem', maxWidth: '150px', lineHeight: '1.2' }}>UPDATE PROFILE</span>
                <Pencil size={32} />
              </Link>
            </div>

            {/* Next Session Box */}
            <div className="bg-secondary border-[6px] border-secondary relative overflow-hidden" style={{ padding: '2.5rem', marginTop: '3rem', boxShadow: '12px 12px 0px 0px #000' }}>
              {/* Background Clock Icon */}
              <Clock size={200} className="absolute text-white opacity-5" style={{ top: '-20px', right: '-40px' }} />
              
              <h3 className="font-black uppercase tracking-tighter text-primary" style={{ fontSize: '1.75rem', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>NEXT_SESSION</h3>
              
              {nextSession ? (
                <div className="flex flex-col gap-6" style={{ position: 'relative', zIndex: 10 }}>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>PARTNER</span>
                    <span className="font-black uppercase text-white tracking-widest" style={{ fontSize: '1.25rem' }}>{nextSession.user1_name === user?.username ? nextSession.user2_name : nextSession.user1_name}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <span className="font-mono uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>DATE & DURATION</span>
                    <span className="font-black uppercase text-primary tracking-widest" style={{ fontSize: '1.25rem' }}>{nextSession.date} • {nextSession.duration}M</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="font-mono uppercase text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>TIME</span>
                    <span className="font-black uppercase text-white tracking-widest" style={{ fontSize: '2rem' }}>{nextSession.time}</span>
                  </div>

                  <Link to={`/sessions`} className="w-full bg-primary text-secondary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-white transition-colors text-center block" style={{ padding: '1rem', fontSize: '0.85rem', marginTop: '1rem' }}>
                    PREPARE_WORKSPACE
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-6" style={{ position: 'relative', zIndex: 10 }}>
                  <p className="font-mono uppercase text-white font-black" style={{ fontSize: '1rem' }}>NO UPCOMING SESSIONS SCHEDULED.</p>
                  <Link to="/explore" className="w-full bg-primary text-secondary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-white transition-colors text-center block" style={{ padding: '1rem', fontSize: '0.85rem', marginTop: '1rem' }}>
                    FIND MATCHES
                  </Link>
                </div>
              )}
            </div>



          </div>

        </div>

      </div>
    </div>
  );
}
