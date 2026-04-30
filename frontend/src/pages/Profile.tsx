import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import Navbar from '../components/Navbar';
import { 
  User, 
  Mail, 
  MapPin, 
  BookOpen, 
  Award, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface ProfileData {
  id: number;
  username: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  avatar: string;
  avatar_seed: string;
  skills_to_learn: number[];
  skills_to_teach: number[];
  skills_to_learn_names: string[];
  skills_to_teach_names: string[];
  average_rating: string;
  rating_count: number;
}

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    avatar_seed: '',
    skills_to_learn: '',
    skills_to_teach: ''
  });

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          bio: data.bio || '',
          location: data.location || '',
          avatar_seed: data.avatar_seed || 'Felix',
          skills_to_learn: data.skills_to_learn_names.join(', '),
          skills_to_teach: data.skills_to_teach_names.join(', ')
        });
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSave = async () => {
    const token = localStorage.getItem('access_token');
    setSaving(true);
    
    // Process skills into arrays
    const learnArray = formData.skills_to_learn.split(',').map(s => s.trim()).filter(s => s !== '');
    const teachArray = formData.skills_to_teach.split(',').map(s => s.trim()).filter(s => s !== '');

    try {
      const res = await fetch('http://localhost:8000/api/users/profile/', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          bio: formData.bio,
          location: formData.location,
          avatar_seed: formData.avatar_seed,
          skills_to_learn: learnArray,
          skills_to_teach: teachArray
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditing(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const shuffleAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setFormData(prev => ({ ...prev, avatar_seed: randomSeed }));
    if (!isEditing) setIsEditing(true);
  };

  const rightNavContent = (
    <div className="flex items-center gap-4">
      <NotificationDropdown />

      <button className="w-9 h-9 rounded-full border border-white/20 overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-black/50">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatar_seed || profile?.avatar_seed || 'Felix'}`} 
          alt="Profile" 
          className="w-full h-full object-cover"
        />
      </button>
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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen text-white selection:bg-violet-500/30 overflow-x-hidden pointer-events-none">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto relative z-10 pointer-events-auto">
        
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-28 left-1/2 -translate-x-1/2 bg-emerald-500/20 backdrop-blur-xl border border-emerald-500/50 px-6 py-3 rounded-2xl flex items-center gap-3 text-emerald-400 font-bold z-[60] shadow-2xl"
            >
              <CheckCircle2 className="w-5 h-5" />
              Profile Updated Successfully
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Side: Avatar Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="bg-white/[0.03] backdrop-blur-[100px] border border-white/10 rounded-[3rem] p-8 flex flex-col items-center text-center shadow-2xl">
              <div className="relative group">
                <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-tr from-violet-600 to-pink-500 p-1 shadow-2xl transition-transform duration-500 group-hover:scale-105">
                  <div className="w-full h-full rounded-[2.3rem] bg-black overflow-hidden relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatar_seed || profile?.avatar_seed || 'Felix'}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <button 
                  onClick={shuffleAvatar}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:bg-violet-400 hover:text-white transition-all group/cam"
                >
                  <Sparkles className="w-5 h-5 group-hover/cam:rotate-12 transition-transform" />
                </button>
              </div>

              <div className="mt-8 space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{profile?.username}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${profile?.role === 'intermediate' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' : 'bg-white/10 text-white/40 border border-white/10'}`}>
                    {profile?.role}
                  </span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white">{profile?.average_rating}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Avg Rating</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-black text-white">{profile?.rating_count}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest text-white/30">Sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] backdrop-blur-[100px] border border-white/10 rounded-[2.5rem] p-6 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Account Info</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <Mail className="w-4 h-4 text-violet-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Email Address</p>
                    <p className="text-sm font-medium text-white/80 truncate">{profile?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                  <User className="w-4 h-4 text-violet-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">User ID</p>
                    <p className="text-sm font-medium text-white/80 truncate">#{profile?.id.toString().padStart(5, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side: Details Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="bg-white/[0.03] backdrop-blur-[100px] border border-white/10 rounded-[3rem] p-10 shadow-2xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-bold tracking-tight">Profile <span className="text-violet-400">Settings</span></h3>
                {!isEditing ? (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-violet-400 hover:text-white transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 bg-violet-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-xl hover:bg-violet-500 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-8 flex-1">
                {/* Location */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-white/2 border border-white/5 rounded-2xl text-sm text-white/80">
                      {profile?.location || "Not specified"}
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">
                    <Edit3 className="w-3 h-3" /> About Me
                  </label>
                  {isEditing ? (
                    <textarea 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      placeholder="Tell us about yourself, your goals, and your journey..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all h-32 resize-none"
                    />
                  ) : (
                    <div className="px-6 py-4 bg-white/2 border border-white/5 rounded-2xl text-sm text-white/80 leading-relaxed min-h-[128px]">
                      {profile?.bio || "No bio yet. Add one to let people know more about you!"}
                    </div>
                  )}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Skills to Teach */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 ml-2">
                      <Award className="w-3 h-3" /> Skills I Can Teach
                    </label>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={formData.skills_to_teach}
                        onChange={(e) => setFormData({...formData, skills_to_teach: e.target.value})}
                        placeholder="e.g. React, UI Design, Python"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 px-2">
                        {profile?.skills_to_teach_names.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                        {profile?.skills_to_teach_names.length === 0 && <span className="text-xs text-white/20 italic ml-2">No skills listed</span>}
                      </div>
                    )}
                  </div>

                  {/* Skills to Learn */}
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 ml-2">
                      <BookOpen className="w-3 h-3" /> Skills I Want to Learn
                    </label>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={formData.skills_to_learn}
                        onChange={(e) => setFormData({...formData, skills_to_learn: e.target.value})}
                        placeholder="e.g. Public Speaking, Photography"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2 px-2">
                        {profile?.skills_to_learn_names.map(skill => (
                          <span key={skill} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-lg text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                            {skill}
                          </span>
                        ))}
                        {profile?.skills_to_learn_names.length === 0 && <span className="text-xs text-white/20 italic ml-2">No skills listed</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/20">
                  <Loader2 className="w-4 h-4" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Last updated {profile ? new Date(profile.updated_at).toLocaleDateString() : 'recently'}</span>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest text-white/10">Synora Platform Security Verified</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
