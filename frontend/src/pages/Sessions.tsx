import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Check, X, Clock, CalendarDays, User, Star } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Session } from '../types';
import ScheduleModal from '../components/ScheduleModal';
import RatingModal from '../components/RatingModal';

export default function Sessions() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [swapRequests, setSwapRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [ratingSession, setRatingSession] = useState<Session | null>(null);

  useEffect(() => { loadSessions(); loadRequests(); }, []);

  const loadSessions = () => { api.get('/sessions/').then(r => setSessions(r.data)).catch(() => { }); };
  const loadRequests = () => { api.get('/sessions/requests/?mode=received').then(r => setSwapRequests(r.data)).catch(() => { }); };

  const handleRespond = async (id: number, status: string) => {
    await api.patch(`/sessions/respond/${id}/`, { status });
    loadSessions();
  };

  const openScheduleForRequest = (req: any) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.status === filter);
  const pendingRequests = swapRequests.filter(r => r.status === 'pending');

  return (
    <div className="w-full min-h-screen bg-surface" style={{ padding: '6rem 2rem' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* ... existing header code ... */}
        <div className="mb-8 relative">
          <h1 className="text-[5rem] md:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase mb-6">
            MANAGE<br />SESSIONS
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="bg-black text-white font-mono tracking-widest inline-block" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Total Sessions: {sessions.length}
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="bg-primary border-[6px] border-secondary font-black uppercase tracking-widest hover:-translate-y-1 hover:-translate-x-1 transition-transform"
              style={{ padding: '1rem 2rem', fontSize: '1rem', boxShadow: '8px 8px 0px 0px #000' }}
            >
              + NEW SESSION
            </button>
          </div>
        </div>

        {/* Thick Horizontal Divider */}
        <div className="w-full border-b-[8px] border-secondary mb-12"></div>

        {/* Incoming Swap Requests Section */}
        {pendingRequests.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter bg-primary px-4 py-2 brutal-border brutal-shadow-sm">
                INCOMING_REQUESTS
              </h2>
              <div className="flex-1 border-b-[4px] border-secondary border-dashed"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {pendingRequests.map(req => (
                <div key={req.id} className="resource-card yellow group">
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-white border-[4px] border-secondary flex items-center justify-center brutal-shadow-sm group-hover:bg-secondary group-hover:text-white transition-colors">
                        <User size={32} strokeWidth={3} />
                      </div>
                      <div className="badge badge-dark text-[10px] tracking-[0.2em]">
                        NEW_SWAP
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-secondary opacity-70 mb-2 font-bold">
                        Request From:
                      </p>
                      <h4 className="text-3xl font-black uppercase leading-tight tracking-tighter">
                        {req.sender_name}
                      </h4>
                    </div>

                    <div className="mt-auto pt-6 border-t-[4px] border-secondary border-dotted">
                      <button
                        onClick={() => openScheduleForRequest(req)}
                        className="w-full btn btn-white flex items-center justify-center gap-3 font-black text-sm"
                        style={{ boxShadow: '6px 6px 0px 0px #000' }}
                      >
                        <CalendarDays size={20} />
                        SCHEDULE_NOW
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-16" style={{ marginTop: '40px', marginBottom: '40px' }}>
          {['all', 'pending', 'accepted', 'completed', 'declined', 'cancelled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`font-black uppercase tracking-widest border-[4px] border-secondary transition-colors ${filter === f ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-[#E5E7EB]'}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem', boxShadow: filter === f ? '2px 2px 0px 0px #000' : '6px 6px 0px 0px #000' }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Session Cards Grid */}
        <div className="flex flex-col gap-10">
          {filtered.length === 0 ? (
            <div className="bg-white border-[6px] border-secondary p-12 text-center" style={{ boxShadow: '12px 12px 0px 0px #000' }}>
              <p className="font-mono uppercase text-secondary font-black tracking-widest text-xl">NO SESSIONS FOUND.</p>
            </div>
          ) : filtered.map(s => {
            const partnerName = s.user1_name === user?.username ? s.user2_name : s.user1_name;
            const badgeBg = s.status === 'accepted' ? 'bg-primary text-secondary' :
              s.status === 'pending' ? 'bg-white text-secondary' :
                s.status === 'completed' ? 'bg-secondary text-white' :
                  'bg-[#EF4444] text-white'; // Red for declined/cancelled

            return (
              <div key={s.id} className="bg-white border-[6px] border-secondary flex flex-col md:flex-row overflow-hidden hover:-translate-y-1 hover:-translate-x-1 transition-transform" style={{ boxShadow: '12px 12px 0px 0px #000' }}>

                {/* Left Block (Partner Initial) */}
                <div className="w-full md:w-[150px] bg-[#1A1A1A] border-b-[4px] md:border-b-0 md:border-r-[6px] border-secondary flex items-center justify-center shrink-0" style={{ minHeight: '150px' }}>
                  <span className="font-black text-white opacity-20" style={{ fontSize: '5rem' }}>{partnerName?.charAt(0).toUpperCase()}</span>
                </div>

                {/* Middle Content */}
                <div className="flex-1 flex flex-col justify-center" style={{ padding: '2rem' }}>
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <h3 className="font-black uppercase tracking-tighter text-3xl md:text-4xl leading-none">
                      {s.user1_name} <span className="text-primary mx-2">↔</span> {s.user2_name}
                    </h3>
                    <span className={`${badgeBg} border-[3px] border-secondary font-black uppercase tracking-widest px-3 py-1 text-xs`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-6 mt-8 font-mono uppercase text-muted tracking-widest font-bold text-sm">
                    <span className="flex items-center gap-2"><CalendarDays size={18} className="text-secondary" /> {s.date}</span>
                    <span className="flex items-center gap-2"><Clock size={18} className="text-secondary" /> {s.time} ({s.duration} MIN)</span>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex flex-col justify-center gap-4 border-t-[4px] md:border-t-0 md:border-l-[6px] border-secondary bg-[#F9FAFB] p-6 shrink-0 md:w-[250px]">

                  {s.status === 'pending' && s.user2 === user?.id && (
                    <>
                      <button onClick={() => handleRespond(s.id, 'accepted')} className="w-full bg-primary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors py-3 flex justify-center items-center gap-2" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
                        <Check size={20} /> ACCEPT
                      </button>
                      <button onClick={() => handleRespond(s.id, 'declined')} className="w-full bg-white border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-[#EF4444] hover:text-white transition-colors py-3 flex justify-center items-center gap-2" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
                        <X size={20} /> DECLINE
                      </button>
                    </>
                  )}

                  {s.status === 'pending' && s.user1 === user?.id && (
                    <div className="text-center font-mono font-bold text-muted text-sm tracking-widest uppercase">
                      WAITING FOR PARTNER...
                    </div>
                  )}

                  {s.status === 'accepted' && (
                    <>
                      <Link to={`/session/${s.room_name}`} className="w-full bg-primary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors py-4 flex justify-center items-center gap-2 text-lg" style={{ boxShadow: '6px 6px 0px 0px #000' }}>
                        <Video size={24} /> JOIN CALL
                      </Link>
                      <button 
                        onClick={() => setRatingSession(s)}
                        className="w-full bg-white border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-primary transition-colors py-2 flex justify-center items-center gap-2 text-xs" 
                        style={{ boxShadow: '4px 4px 0px 0px #000' }}
                      >
                        <Star size={16} /> RATE & COMPLETE
                      </button>
                    </>
                  )}

                  {s.status === 'completed' && !s.has_rated && (
                    <button 
                      onClick={() => setRatingSession(s)}
                      className="w-full bg-primary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors py-4 flex justify-center items-center gap-2 text-lg" 
                      style={{ boxShadow: '6px 6px 0px 0px #000' }}
                    >
                      <Star size={24} fill="currentColor" /> RATE NOW
                    </button>
                  )}

                  {((s.status === 'completed' && s.has_rated) || s.status === 'declined' || s.status === 'cancelled') && (
                    <div className="text-center font-mono font-bold text-muted text-sm tracking-widest uppercase">
                      SESSION {s.status}
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>

        {/* Create Session Modal */}
        {showModal && (
          <ScheduleModal 
            isOpen={showModal}
            onClose={() => { setShowModal(false); setSelectedRequest(null); }}
            userId={selectedRequest?.sender}
            userName={selectedRequest?.sender_name}
            swapRequestId={selectedRequest?.id}
            onSuccess={() => { loadSessions(); loadRequests(); }}
          />
        )}

        {/* Rating Modal */}
        {ratingSession && (
          <RatingModal
            isOpen={!!ratingSession}
            onClose={() => setRatingSession(null)}
            sessionId={ratingSession.id}
            partnerName={ratingSession.user1_name === user?.username ? ratingSession.user2_name : ratingSession.user1_name}
            onSuccess={() => {
              loadSessions();
              setRatingSession(null);
            }}
          />
        )}

      </div>
    </div>
  );
}
