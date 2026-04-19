import { useState, useEffect } from 'react';
import { Video, Check, X, Clock } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Session } from '../types';

export default function Sessions() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ user2: '', date: '', time: '10:00', duration: 60 });

  useEffect(() => { loadSessions(); }, []);

  const loadSessions = () => { api.get('/sessions/').then(r=>setSessions(r.data)).catch(()=>{}); };

  const handleRespond = async (id: number, status: string) => {
    await api.patch(`/sessions/respond/${id}/`, { status });
    loadSessions();
  };

  const handleCreate = async () => {
    try {
      await api.post('/sessions/create/', { user2: parseInt(form.user2), date: form.date, time: form.time, duration: form.duration });
      setShowModal(false); loadSessions();
    } catch { alert('Failed to create session'); }
  };

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-4xl font-bold">SESSIONS</h1><p className="text-muted">Manage your skill swap sessions</p></div>
        <button onClick={()=>setShowModal(true)} className="btn btn-primary">+ NEW SESSION</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all','pending','accepted','completed','declined','cancelled'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className={`badge cursor-pointer ${filter===f?'badge-primary':'badge-outlined'}`}>{f.toUpperCase()}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length===0 ? <div className="card p-8 text-center text-muted">No sessions found.</div> :
        filtered.map(s=>(
          <div key={s.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4 animate-slide-up">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{s.user1_name} ↔ {s.user2_name}</h3>
              <div className="flex flex-wrap gap-3 text-sm text-muted mt-1">
                <span className="flex items-center gap-1"><Clock size={14}/> {s.date} at {s.time}</span>
                <span>{s.duration} min</span>
              </div>
            </div>
            <span className={`badge ${s.status==='accepted'?'badge-primary':s.status==='pending'?'badge-outlined':s.status==='completed'?'badge-dark':'bg-danger/10 text-danger border-danger'}`}>
              {s.status.toUpperCase()}
            </span>
            <div className="flex gap-2">
              {s.status==='pending' && s.user2===user?.id && (
                <><button onClick={()=>handleRespond(s.id,'accepted')} className="btn btn-primary py-1 px-3 text-xs"><Check size={14}/> ACCEPT</button>
                <button onClick={()=>handleRespond(s.id,'declined')} className="btn btn-danger py-1 px-3 text-xs"><X size={14}/> DECLINE</button></>
              )}
              {s.status==='accepted' && (
                <a href={s.jitsi_url} target="_blank" rel="noreferrer" className="btn btn-primary py-1 px-3 text-xs"><Video size={14}/> JOIN</a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setShowModal(false)}>
          <div className="card p-8 w-full max-w-md animate-bounce-in" onClick={e=>e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">SCHEDULE SESSION</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-bold uppercase mb-1">Partner User ID</label><input type="number" value={form.user2} onChange={e=>setForm({...form,user2:e.target.value})} className="input" placeholder="User ID"/></div>
              <div><label className="block text-sm font-bold uppercase mb-1">Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} className="input"/></div>
              <div><label className="block text-sm font-bold uppercase mb-1">Time</label><input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})} className="input"/></div>
              <div><label className="block text-sm font-bold uppercase mb-1">Duration (min)</label><input type="number" value={form.duration} onChange={e=>setForm({...form,duration:parseInt(e.target.value)})} className="input"/></div>
              <div className="flex gap-3">
                <button onClick={()=>setShowModal(false)} className="btn btn-outlined flex-1">CANCEL</button>
                <button onClick={handleCreate} className="btn btn-primary flex-1">CREATE</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
