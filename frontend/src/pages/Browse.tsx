import { useState, useEffect } from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import api from '../api/client';
import type { Profile } from '../types';
import { useAuthStore } from '../store/authStore';
import ScheduleModal from '../components/ScheduleModal';

export default function Browse() {
  const { user } = useAuthStore();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const categories = ['ALL', 'DESIGN', 'CODING', 'BUSINESS', 'PHOTOGRAPHY', 'MUSIC', 'WRITING', 'DATA', 'COOKING'];

  useEffect(() => {
    api.get('/skills/match/').then(r => setProfiles(r.data)).catch(() => { });
  }, []);

  const filtered = profiles.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      return p.username.toLowerCase().includes(q) || p.skills_to_teach_names.some(s => s.toLowerCase().includes(q)) || p.skills_to_learn_names.some(s => s.toLowerCase().includes(q));
    }
    if (activeTag !== 'ALL') return p.skills_to_teach_names.some(s => s.toLowerCase().includes(activeTag.toLowerCase())) || p.skills_to_learn_names.some(s => s.toLowerCase().includes(activeTag.toLowerCase()));
    return true;
  });

  const handleSwapRequest = async (p: Profile) => {
    try {
      await api.post('/sessions/request/', { receiver: p.id });
      alert(`Swap request sent to ${p.username}!`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send swap request');
    }
  };
  return (
    <div className="w-full min-h-screen bg-surface" style={{ padding: '6rem 2rem' }}>
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section */}
        <div className="mb-8 relative">
          <h1 className="text-[5rem] md:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase mb-6">
            DISCOVER<br />MATCHES
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="bg-black text-white font-mono tracking-widest inline-block" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Found {filtered.length} Skill-Swappers in your area.
            </div>

            <div className="flex gap-4">
              <button onClick={() => setViewMode('grid')} className={`${viewMode === 'grid' ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'} border-[4px] border-secondary flex items-center justify-center transition-colors`} style={{ width: '48px', height: '48px', boxShadow: '4px 4px 0px 0px #000' }}>
                <LayoutGrid size={24} />
              </button>
              <button onClick={() => setViewMode('list')} className={`${viewMode === 'list' ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'} border-[4px] border-secondary flex items-center justify-center transition-colors`} style={{ width: '48px', height: '48px', boxShadow: '4px 4px 0px 0px #000' }}>
                <List size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Thick Horizontal Divider */}
        <div className="w-full border-b-[8px] border-secondary mb-12"></div>

        {/* Filters & Search (Kept functionality but minimal style) */}
        <div className="mb-24 flex flex-col gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)} className="w-full bg-white border-[4px] border-secondary font-mono text-secondary uppercase tracking-widest outline-none focus:bg-[#E5E7EB] transition-colors" style={{ padding: '1rem 1rem 1rem 3rem', boxShadow: '6px 6px 0px 0px #000' }} placeholder="SEARCH SKILLS OR USERS..." />
          </div>
          <div className="flex flex-wrap gap-4">
            {categories.map(c => (
              <button key={c} onClick={() => setActiveTag(c)} className={`font-black uppercase tracking-widest border-[3px] border-secondary transition-all ${activeTag === c ? 'bg-primary text-secondary' : 'bg-white text-secondary hover:bg-[#E5E7EB]'}`} style={{ padding: '6px 12px', fontSize: '0.75rem', boxShadow: activeTag === c ? '2px 2px 0px 0px #000' : '4px 4px 0px 0px #000', marginTop: '40px', marginBottom: '40px' }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Match Cards Grid */}
        <div id="matches" className={`grid gap-16 ${viewMode === 'grid' ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
          {filtered.length === 0 ? (
            <div className="col-span-full bg-white border-[6px] border-secondary p-8 text-center" style={{ boxShadow: '12px 12px 0px 0px #000' }}>
              <p className="font-mono uppercase text-secondary font-black tracking-widest">NO MATCHES FOUND. TRY ADJUSTING YOUR FILTERS.</p>
            </div>
          ) : filtered.map(p => (
            <div key={p.id} className="bg-white border-[6px] border-secondary flex flex-col md:flex-row overflow-hidden hover:-translate-y-1 hover:-translate-x-1 transition-transform" style={{ boxShadow: '12px 12px 0px 0px #000', marginBottom: '40px' }}>

              {/* Left Image Area */}
              <div className="w-full md:w-1/3 bg-[#1A1A1A] border-b-[4px] md:border-b-0 md:border-r-[6px] border-secondary flex items-center justify-center shrink-0" style={{ minHeight: '300px' }}>
                <span className="font-black text-white opacity-20" style={{ fontSize: '8rem' }}>{p.username.charAt(0).toUpperCase()}</span>
              </div>

              {/* Right Content Area */}
              <div className="w-full md:w-2/3 flex flex-col" style={{ padding: '2rem' }}>

                {/* Header: Name and Badge */}
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: '2rem', wordBreak: 'break-word', paddingRight: '1rem' }}>
                    {p.username}
                  </h3>
                  <div className="bg-primary text-secondary font-black uppercase tracking-widest shrink-0 border-[3px] border-secondary" style={{ padding: '4px 8px', fontSize: '0.65rem' }}>
                    {p.role || 'MEMBER'}
                  </div>
                </div>

                {/* Subtitle / Bio */}
                <p className="font-black" style={{ color: '#A67B5B', fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.4' }}>
                  {p.bio || 'Skill-Swapper on Synora'}
                </p>

                <div className="mb-6">
                  <p className="font-mono uppercase text-muted tracking-widest mb-3" style={{ fontSize: '0.65rem' }}>HAS SKILLS:</p>
                  <div className="flex flex-wrap gap-3">
                    {p.skills_to_teach_names.length > 0 ? p.skills_to_teach_names.map(s => (
                      <span key={s} className="bg-white border-[2px] border-secondary font-black uppercase tracking-widest" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{s}</span>
                    )) : <span className="font-mono uppercase text-muted text-xs">NONE</span>}
                  </div>
                </div>

                <div className="mb-8 flex-grow">
                  <p className="font-mono uppercase text-muted tracking-widest mb-3" style={{ fontSize: '0.65rem' }}>WANTS TO LEARN:</p>
                  <div className="flex flex-wrap gap-3">
                    {p.skills_to_learn_names.length > 0 ? p.skills_to_learn_names.map(s => (
                      <span key={s} className="bg-primary border-[2px] border-secondary font-black uppercase tracking-widest" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>{s}</span>
                    )) : <span className="font-mono uppercase text-muted text-xs">NONE</span>}
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleSwapRequest(p)}
                  className="w-full bg-primary text-secondary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors"
                  style={{ padding: '1rem', fontSize: '1rem' }}
                >
                  REQUEST SWAP
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {filtered.length > 0 && (
          <div className="mt-32 flex justify-center">
            <button className="bg-white border-[6px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors" style={{ padding: '1.5rem 3rem', fontSize: '1.25rem', boxShadow: '8px 8px 0px 0px #000' }}>
              LOAD MORE PROFILES
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
