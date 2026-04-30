import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

interface Skill {
  id: number;
  name: string;
}

interface Profile {
  id: number;
  username: string;
  email: string;
  role: string;
  bio: string;
  avatar: string;
  avatar_seed?: string;
  average_rating: string;
  skills_to_teach_names: string[];
  skills_to_learn_names: string[];
}

export default function Explore() {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [requestLoading, setRequestLoading] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      try {
        const [skillsRes, mentorsRes] = await Promise.all([
          fetch('http://localhost:8000/api/skills/', { headers }),
          fetch('http://localhost:8000/api/skills/match/', { headers })
        ]);

        const skillsData = await skillsRes.json();
        setSkills(skillsData);

        if (mentorsRes.ok) {
          const mentorsData = await mentorsRes.json();
          setMentors(mentorsData);
        }

        const profileRes = await fetch('http://localhost:8000/api/users/profile/', { headers });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUser(profileData);
        }
      } catch (err) {
        console.error('Failed to fetch explore data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSendRequest = async (receiverId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert("Please login to send requests.");
      return;
    }

    setRequestLoading(receiverId);
    try {
      const res = await fetch('http://localhost:8000/api/sessions/request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receiver: receiverId })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert("Skill swap request sent successfully!");
      } else {
        alert(data.error || data.detail || "Failed to send request.");
      }
    } catch (err) {
      console.error("Connection error:", err);
      alert("Error connecting to server. Please ensure the backend is running.");
    } finally {
      setRequestLoading(null);
    }
  };

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const rightNavContent = (
    <div className="flex items-center gap-4">
      <NotificationDropdown />

      <Link to="/profile" className="w-9 h-9 rounded-full border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-300">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatar_seed || 'Felix'}`} 
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

  const filteredSkills = Array.isArray(skills) ? skills.filter(s => s?.name?.toLowerCase().includes(search.toLowerCase())) : [];
  const filteredMentors = Array.isArray(mentors) ? mentors.filter(m => 
    search === '' || 
    m?.skills_to_teach_names?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    m?.username?.toLowerCase().includes(search.toLowerCase())
  ) : [];
  const dynamicTags = Array.isArray(skills) ? skills.slice(0, 6).map(s => s?.name) : [];

  return (
    <div className="relative w-full min-h-screen text-white selection:bg-violet-500/30 overflow-x-hidden pointer-events-none">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 pointer-events-auto space-y-24">
        
        {/* Explore Hero */}
        <section className="text-center space-y-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Explore <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">{(skills?.length || 0)}+ Skills</span>
            </h1>
            <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto">
              Find mentors for your favorite topics and start swapping today.
            </p>
          </motion.div>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-2">
              <div className="pl-4 text-white/40">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills (e.g. Python, Beatboxing)..." 
                className="w-full bg-transparent border-none focus:ring-0 px-4 py-3 text-white placeholder-white/20"
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  className="mr-4 text-white/40 hover:text-white transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {dynamicTags.map((tag) => tag && (
              <button 
                key={tag} 
                onClick={() => setSearch(tag)}
                className={`px-4 py-1.5 rounded-full border transition-all text-xs font-bold ${
                  search.toLowerCase() === tag.toLowerCase() 
                  ? 'bg-violet-600 border-violet-500 text-white' 
                  : 'bg-white/5 border-white/10 text-violet-300 hover:bg-white/10'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </section>

        {/* Available Skills */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight italic">Browse Skills</h2>
            <span className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">Click a skill to find mentors</span>
          </div>
          {loading ? (
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 rounded-[2rem] bg-white/5 animate-pulse"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSkills.map((skill, i) => (
                <motion.div 
                  key={skill?.id || i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.06)' }}
                  onClick={() => setSearch(skill.name)}
                  className={`p-8 backdrop-blur-xl border rounded-[2rem] space-y-4 transition-all group cursor-pointer ${
                    search.toLowerCase() === skill.name.toLowerCase() 
                    ? 'bg-violet-600/20 border-violet-500' 
                    : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center text-violet-400 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white/90 uppercase tracking-tighter">{skill?.name}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">Find mentors and master {skill?.name} through peer swap.</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Global Mentors (Dynamic Filtering) */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight italic">Matched Mentors</h2>
            {search && (
              <span className="px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-lg text-xs font-bold text-violet-400">
                Filtering by: {search}
              </span>
            )}
          </div>
          {loading ? (
             <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 animate-pulse"></div>)}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="p-12 bg-white/5 rounded-[2.5rem] text-center text-white/30 border border-white/10 italic">
              {search 
                ? `No mentors found teaching "${search}". Try another skill!`
                : "No active mentors found. Update your profile goals!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredMentors.slice(0, 6).map((mentor, i) => (
                <motion.div 
                  key={mentor?.id || i}
                  whileHover={{ y: -10 }}
                  className="p-8 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] flex flex-col items-center text-center space-y-6 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:rotate-45 transition-transform duration-700">
                    <svg className="w-20 h-20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
                  </div>
                  <div className="w-16 h-16 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.avatar_seed || mentor.username}`} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-4 w-full">
                    <h3 className="text-2xl font-bold text-white">{mentor?.username || 'Anonymous'}</h3>
                    
                    <div className="space-y-3 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-2">Can Teach</span>
                        <div className="flex flex-wrap gap-2">
                          {mentor?.skills_to_teach_names?.slice(0, 3).map((skillName, idx) => (
                            <span 
                              key={idx} 
                              onClick={(e) => { e.stopPropagation(); setSearch(skillName); }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                                search.toLowerCase() === skillName.toLowerCase()
                                ? 'bg-violet-600 text-white border border-violet-400'
                                : 'bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/30'
                              }`}
                            >
                              {skillName}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] block mb-2">Wants to Learn</span>
                        <div className="flex flex-wrap gap-2">
                          {mentor?.skills_to_learn_names?.slice(0, 3).map((skillName, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{skillName}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSendRequest(mentor.id)}
                    disabled={requestLoading === mentor.id}
                    className={`w-full py-4 font-black rounded-2xl transition-all shadow-xl ${
                      requestLoading === mentor.id 
                      ? 'bg-white/20 text-white/40 cursor-not-allowed' 
                      : 'bg-white text-black hover:bg-violet-400 active:scale-95'
                    }`}
                  >
                    {requestLoading === mentor.id ? 'Sending...' : 'Send Request'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
