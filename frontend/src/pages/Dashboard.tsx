import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Users, TrendingUp, Clock } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 animate-slide-up">
        <h1 className="text-4xl font-bold">WELCOME BACK,</h1>
        <h2 className="text-5xl font-bold text-primary">@{user?.username?.toUpperCase()}</h2>
        <span className="badge badge-dark mt-2">{user?.role?.toUpperCase()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Calendar size={24}/>, label: 'SESSIONS', value: stats.sessions, color: 'bg-primary' },
          { icon: <Users size={24}/>, label: 'MATCHES', value: stats.matches, color: 'bg-secondary text-white' },
          { icon: <MessageSquare size={24}/>, label: 'CHATS', value: stats.messages, color: 'bg-primary' },
          { icon: <TrendingUp size={24}/>, label: 'LEVEL', value: user?.role === 'intermediate' ? 'INT' : 'BEG', color: 'bg-secondary text-white' },
        ].map((s, i) => (
          <div key={i} className="card p-4 animate-slide-up" style={{animationDelay:`${i*0.1}s`}}>
            <div className={`w-10 h-10 ${s.color} border-2 border-secondary flex items-center justify-center mb-2`}>{s.icon}</div>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="text-xs font-bold text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">UPCOMING SESSIONS</h3>
            <Link to="/sessions" className="badge badge-primary cursor-pointer">VIEW ALL</Link>
          </div>
          {sessions.length === 0 ? (
            <p className="text-muted text-sm">No sessions yet. <Link to="/explore" className="underline font-bold">Find a match!</Link></p>
          ) : sessions.filter(s=>s.status==='accepted'||s.status==='pending').slice(0,3).map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 border-b-2 border-secondary/10 last:border-0">
              <div className="w-10 h-10 bg-primary border-2 border-secondary flex items-center justify-center"><Clock size={16}/></div>
              <div className="flex-1">
                <p className="font-bold text-sm">{s.user1_name} ↔ {s.user2_name}</p>
                <p className="text-muted text-xs">{s.date} at {s.time} • {s.duration}min</p>
              </div>
              <span className={`badge text-xs ${s.status==='accepted'?'badge-primary':'badge-outlined'}`}>{s.status.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {/* Activity Log */}
        <div className="card p-6 bg-secondary text-white">
          <h3 className="text-xl font-bold mb-4 text-primary">ACTIVITY LOG</h3>
          <div className="font-[var(--font-mono)] text-xs space-y-2">
            {notifications.length === 0 ? (
              <p className="text-white/50">No recent activity.</p>
            ) : notifications.map(n => (
              <div key={n.id} className={`p-2 border-b border-white/10 ${!n.is_read ? 'text-primary' : 'text-white/70'}`}>
                <span className="text-white/40">[{new Date(n.created_at).toLocaleTimeString()}]</span> {n.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[
          { to: '/explore', label: 'FIND MATCH', icon: '🔍' },
          { to: '/resources/create', label: 'SHARE RESOURCE', icon: '📚' },
          { to: '/chat', label: 'MESSAGES', icon: '💬' },
          { to: '/ai', label: 'AI LAB', icon: '🤖' },
        ].map((a, i) => (
          <Link key={i} to={a.to} className="card card-hover p-4 text-center" style={{animationDelay:`${i*0.05}s`}}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <p className="font-bold text-sm">{a.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
