import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

interface SwapRequest {
  id: number;
  sender: number;
  sender_name: string;
  receiver: number;
  receiver_name: string;
  sender_avatar_seed?: string;
  receiver_avatar_seed?: string;
  status: string;
  created_at: string;
}

interface Session {
  id: number;
  user1_name: string;
  user2_name: string;
  user1_avatar_seed?: string;
  user2_avatar_seed?: string;
  date: string;
  time: string;
  status: string;
  jitsi_url: string;
}

export default function Sessions() {
  const navigate = useNavigate();
  const [incomingRequests, setIncomingRequests] = useState<SwapRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);
  const [sessionForm, setSessionForm] = useState({
    date: '',
    time: '',
    duration: 60
  });

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [ratingForm, setRatingForm] = useState({
    score: 5,
    comment: ''
  });

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
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatar_seed || 'Felix'}`} alt="Profile" className="w-full h-full object-cover" />
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

  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const [reqsRes, sessRes] = await Promise.all([
        fetch('http://localhost:8000/api/sessions/requests/?mode=received', { headers }),
        fetch('http://localhost:8000/api/sessions/', { headers })
      ]);

      if (reqsRes.ok) setIncomingRequests(await reqsRes.json());
      if (sessRes.ok) setActiveSessions(await sessRes.json());

      const profileRes = await fetch('http://localhost:8000/api/users/profile/', { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAcceptClick = (req: SwapRequest) => {
    setSelectedRequest(req);
    setShowModal(true);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    const token = localStorage.getItem('access_token');
    setActionLoading(selectedRequest.id);
    
    try {
      const res = await fetch('http://localhost:8000/api/sessions/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user2: selectedRequest.sender, // The person who sent the request
          date: sessionForm.date,
          time: sessionForm.time,
          duration: sessionForm.duration,
          swap_request_id: selectedRequest.id
        })
      });

      if (res.ok) {
        setShowModal(false);
        setIncomingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
        fetchData();
        alert("Session scheduled successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || data.detail || "Failed to create session.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Error connecting to server. Please ensure the backend is running.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResponse = async (id: number, status: 'declined') => {
    const token = localStorage.getItem('access_token');
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:8000/api/sessions/requests/respond/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setIncomingRequests(prev => prev.filter(r => r.id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || data.detail || "Failed to update request.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Connection error. Please ensure the backend is running.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteSession = async (sessionId: number) => {
    const token = localStorage.getItem('access_token');
    setActionLoading(sessionId);
    try {
      const res = await fetch(`http://localhost:8000/api/sessions/${sessionId}/complete/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        fetchData();
        alert("Session marked as completed!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to complete session.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRateClick = (sess: Session) => {
    setSelectedSession(sess);
    setShowRatingModal(true);
  };

  const handleRatingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession) return;

    const token = localStorage.getItem('access_token');
    setActionLoading(selectedSession.id);
    try {
      const res = await fetch('http://localhost:8000/api/sessions/rating/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: selectedSession.id,
          score: ratingForm.score,
          comment: ratingForm.comment
        })
      });

      if (res.ok) {
        setShowRatingModal(false);
        fetchData();
        alert("Rating submitted successfully!");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to submit rating.");
      }
    } catch (err) {
      alert("Connection error.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white selection:bg-violet-500/30 overflow-x-hidden pointer-events-none">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 pointer-events-auto space-y-12">
        
        {/* Modal for Scheduling */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Schedule <span className="text-violet-400">Session</span></h2>
                <p className="text-white/40 text-sm">Pick a time to meet with <span className="text-white font-bold">{selectedRequest?.sender_name}</span>.</p>
              </div>

              <form onSubmit={handleCreateSession} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-4">Preferred Date</label>
                    <input 
                      required
                      type="date" 
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-4">Preferred Time</label>
                    <input 
                      required
                      type="time" 
                      value={sessionForm.time}
                      onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-4">Duration (Minutes)</label>
                    <select 
                      value={sessionForm.duration}
                      onChange={(e) => setSessionForm({...sessionForm, duration: parseInt(e.target.value)})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                    >
                      <option value="30" className="bg-black text-white">30 Minutes</option>
                      <option value="60" className="bg-black text-white">1 Hour</option>
                      <option value="90" className="bg-black text-white">1.5 Hours</option>
                      <option value="120" className="bg-black text-white">2 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading !== null}
                    className="flex-1 py-4 bg-white text-black font-black rounded-2xl hover:bg-violet-400 transition-all shadow-xl disabled:opacity-50"
                  >
                    Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Modal for Rating */}
        {showRatingModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowRatingModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="relative w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-10 shadow-2xl space-y-8"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-bold tracking-tight">Rate <span className="text-violet-400">Partner</span></h2>
                <p className="text-white/40 text-sm">How was your session with <span className="text-white font-bold">{selectedSession?.user1_name || selectedSession?.user2_name}</span>?</p>
              </div>

              <form onSubmit={handleRatingSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star}
                        type="button"
                        onClick={() => setRatingForm({...ratingForm, score: star})}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          ratingForm.score >= star ? 'bg-amber-400 text-black scale-110' : 'bg-white/5 text-white/30'
                        }`}
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-4">Feedback (Optional)</label>
                    <textarea 
                      value={ratingForm.comment}
                      onChange={(e) => setRatingForm({...ratingForm, comment: e.target.value})}
                      placeholder="Share your experience..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-violet-500/50 transition-colors h-32 resize-none text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl"
                  >
                    Skip
                  </button>
                  <button 
                    type="submit"
                    disabled={actionLoading !== null}
                    className="flex-1 py-4 bg-white text-black font-black rounded-2xl hover:bg-violet-400 transition-all shadow-xl disabled:opacity-50"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Your <span className="text-violet-400">Sessions</span></h1>
          <p className="text-white/40">Manage your skill swap requests and upcoming video sessions.</p>
        </header>

        {/* Incoming Swap Requests */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold uppercase tracking-widest text-white/60">Incoming Requests</h2>
            <span className="text-xs px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-full text-violet-400 font-bold">
              {incomingRequests.filter(r => r.status === 'pending').length} New
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomingRequests.filter(r => r.status === 'pending').map((req) => (
              <motion.div 
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender_avatar_seed || req.sender_name}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-white/90">{req.sender_name}</h4>
                    <p className="text-xs text-white/40">wants to swap skills with you</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAcceptClick(req)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleResponse(req.id, 'declined')}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/60 hover:text-red-400 text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </motion.div>
            ))}
            {incomingRequests.filter(r => r.status === 'pending').length === 0 && !loading && (
              <div className="col-span-full p-12 bg-white/2 border border-dashed border-white/10 rounded-[2rem] text-center text-white/20 italic">
                No pending requests. Check back later!
              </div>
            )}
          </div>
        </section>

        {/* Active Sessions */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold uppercase tracking-widest text-white/60">Active Sessions</h2>
          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
              <thead className="border-b border-white/5 bg-white/[0.02]">
                <tr>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Partner</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Schedule</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-white/40">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeSessions.map((sess) => {
                  const isUser1 = sess.user1_name === currentUser?.username;
                  const partnerName = isUser1 ? sess.user2_name : sess.user1_name;
                  const partnerAvatar = isUser1 ? sess.user2_avatar_seed : sess.user1_avatar_seed;

                  return (
                    <tr key={sess.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center overflow-hidden shadow-inner">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerAvatar || partnerName}`} 
                              alt="Partner" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-white/90">{partnerName}</span>
                            <span className="text-[10px] text-white/20 uppercase tracking-widest font-black">Skill Partner</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-white/90">{sess.date}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">{sess.time}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          sess.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/50 border border-white/10'
                        }`}>
                          {sess.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex gap-2">
                          {/* Show Join Call for pending, accepted or completed (in case they need to return) */}
                          {(sess.status === 'accepted' || sess.status === 'pending') && (
                            <div className="flex gap-2">
                              <a 
                                href={sess.jitsi_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase rounded-lg hover:bg-violet-400 transition-all inline-block shadow-lg"
                              >
                                Join Call
                              </a>
                              {(sess.status === 'accepted' || sess.status === 'pending') && (
                                <button 
                                  onClick={() => handleCompleteSession(sess.id)}
                                  disabled={actionLoading === sess.id}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg transition-all shadow-lg disabled:opacity-50"
                                >
                                  {actionLoading === sess.id ? '...' : 'Complete'}
                                </button>
                              )}
                            </div>
                          )}
                          {(sess.status === 'accepted' || sess.status === 'completed') && (
                            <button 
                              onClick={() => handleRateClick(sess)}
                              className="px-4 py-2 bg-violet-600/20 border border-violet-500/50 text-violet-400 text-[10px] font-black uppercase rounded-lg hover:bg-violet-600 hover:text-white transition-all"
                            >
                              {sess.status === 'completed' ? 'Update Rating' : 'Rate Partner'}
                            </button>
                          )}
                          {sess.status === 'declined' && (
                            <span className="text-xs text-red-400/60 italic font-medium">Session Declined</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {activeSessions.length === 0 && !loading && (
              <div className="p-12 text-center text-white/20 italic">
                No sessions scheduled yet. Accept a request to get started!
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
