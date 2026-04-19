import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../api/client';
import type { Profile } from '../types';
import { useAuthStore } from '../store/authStore';

export default function Browse() {
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');
  const categories = ['ALL','DESIGN','CODING','BUSINESS','PHOTOGRAPHY','MUSIC','WRITING','DATA','COOKING'];

  useEffect(() => {
    api.get('/skills/match/').then(r => setProfiles(r.data)).catch(()=>{});
  }, []);

  const filtered = profiles.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      return p.username.toLowerCase().includes(q) || p.skills_to_teach_names.some(s=>s.toLowerCase().includes(q)) || p.skills_to_learn_names.some(s=>s.toLowerCase().includes(q));
    }
    if (activeTag !== 'ALL') return p.skills_to_teach_names.some(s => s.toLowerCase().includes(activeTag.toLowerCase())) || p.skills_to_learn_names.some(s => s.toLowerCase().includes(activeTag.toLowerCase()));
    return true;
  });

  const handleRequest = async (profileUserId: number) => {
    try {
      await api.post('/sessions/create/', { user2: profileUserId, date: new Date().toISOString().split('T')[0], time: '10:00', duration: 60 });
      alert('Session request sent!');
    } catch { alert('Failed to send request'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">SKILL EXCHANGE</h1>
      <p className="text-muted mb-6">Discover users with complementary skills</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="input pl-12 text-base" placeholder="Search skills or users..."/>
      </div>

      {/* Category Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c=>(
          <button key={c} onClick={()=>setActiveTag(c)} className={`badge cursor-pointer transition-all ${activeTag===c?'badge-primary':'badge-outlined hover:bg-surface'}`}>{c}</button>
        ))}
      </div>

      {/* User Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full card p-8 text-center"><p className="text-muted">No matches found. Try adjusting your skills!</p></div>
        ) : filtered.map(p => (
          <div key={p.id} className="card card-hover p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary border-3 border-secondary flex items-center justify-center font-bold text-xl">
                {p.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg">@{p.username}</h3>
                <p className="text-muted text-xs">{p.location || 'Location not set'} • {p.role}</p>
              </div>
            </div>
            {p.bio && <p className="text-sm text-muted mb-4 line-clamp-2">{p.bio}</p>}
            <div className="mb-3">
              <p className="text-xs font-bold text-muted mb-1">TEACHES:</p>
              <div className="flex flex-wrap gap-1">{p.skills_to_teach_names.length>0 ? p.skills_to_teach_names.map(s=><span key={s} className="badge badge-dark text-xs">{s}</span>) : <span className="text-xs text-muted">None yet</span>}</div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-bold text-muted mb-1">WANTS TO LEARN:</p>
              <div className="flex flex-wrap gap-1">{p.skills_to_learn_names.length>0 ? p.skills_to_learn_names.map(s=><span key={s} className="badge badge-primary text-xs">{s}</span>) : <span className="text-xs text-muted">None yet</span>}</div>
            </div>
            <button onClick={()=>handleRequest(parseInt(String(p.id)))} className="btn btn-primary w-full py-2 text-sm">REQUEST SWAP</button>
          </div>
        ))}
      </div>
    </div>
  );
}
