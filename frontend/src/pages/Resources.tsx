import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

interface Resource {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string;
  created_by_name: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

export default function Resources() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Resource Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    link: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categories = ["All", "Liked", "Saved", "React", "Python", "UI Design", "Public Speaking", "Excel", "Photography"];

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

  const fetchResources = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    let url = 'http://localhost:8000/api/resources/list/';
    const params = new URLSearchParams();
    
    if (activeCategory === 'Liked') {
      params.append('filter', 'liked');
    } else if (activeCategory === 'Saved') {
      params.append('filter', 'bookmarked');
    } else if (activeCategory !== 'All') {
      params.append('tag', activeCategory);
    }
    
    if (searchQuery) params.append('search', searchQuery);
    if (params.toString()) url += `?${params.toString()}`;

    const headers = { 'Authorization': `Bearer ${token}` };

    try {
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }

      const profileRes = await fetch('http://localhost:8000/api/users/profile/', { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error("Fetch resources failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/api/resources/${id}/like/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(prev => prev.map(r => 
          r.id === id ? { ...r, is_liked: data.liked, likes_count: data.likes_count } : r
        ));
      }
    } catch (err) {
      console.error("Toggle like failed:", err);
    }
  };

  const handleToggleBookmark = async (id: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8000/api/resources/${id}/bookmark/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(prev => prev.map(r => 
          r.id === id ? { ...r, is_bookmarked: data.bookmarked } : r
        ));
      }
    } catch (err) {
      console.error("Toggle bookmark failed:", err);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchResources();
  }, [activeCategory]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setFormLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('tags', formData.tags);
    data.append('link', formData.link);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      const res = await fetch('http://localhost:8000/api/resources/create/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', tags: '', link: '' });
        setImageFile(null);
        setImagePreview(null);
        fetchResources(); // Refresh list
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to create resource.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResources();
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden selection:bg-violet-500/30">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto relative z-10 pointer-events-auto space-y-16">
        
        {/* Header Section */}
        <header className="space-y-8 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-tight">
              Learning <span className="text-violet-400">Resources</span>
            </h1>
            <p className="text-white/40 text-lg">Discover curated notes, guides, tutorials, and learning materials shared by verified users.</p>
          </motion.div>

          <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
            <div className="absolute inset-0 bg-violet-500/20 blur-2xl group-hover:bg-violet-500/30 transition-all opacity-0 group-hover:opacity-100"></div>
            <div className="relative flex gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-violet-400 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources by topic, skill, or keyword..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-xl"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-8 bg-white text-black font-black rounded-2xl hover:bg-violet-400 transition-colors shadow-xl"
              >
                Search
              </motion.button>
            </div>
          </form>
        </header>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-3 rounded-full text-xs font-bold transition-all border ${
                activeCategory === cat 
                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/20' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>


        {/* Main Grid: Feed & Sidebar */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Recent <span className="text-violet-400">Additions</span></h2>
          {user?.role === 'intermediate' && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-violet-500/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
              Add Resource
            </motion.button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Feed */}
          <div className="lg:col-span-12 space-y-8">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                [1,2,3,4].map(i => <div key={i} className="h-[400px] bg-white/5 rounded-[2.5rem] animate-pulse" />)
              ) : resources.length === 0 ? (
                <div className="col-span-full py-20 text-center text-white/20 italic bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem]">
                  No resources found for this category.
                </div>
              ) : (
                resources.map((res) => (
                  <motion.div 
                    key={res.id}
                    whileHover={{ y: -8 }}
                    onClick={() => res.link && window.open(res.link, '_blank')}
                    className="group bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl cursor-pointer"
                  >
                    <div className="h-48 overflow-hidden relative">
                      <img src={res.image || `https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=1000`} alt={res.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute top-4 left-4 flex gap-2">
                        {res.tags.split(',').map(tag => (
                          <span key={tag} className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase border border-white/10">{tag.trim()}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-8 flex-1 flex flex-col space-y-4">
                      <h3 className="text-xl font-bold leading-snug group-hover:text-violet-400 transition-colors">{res.title}</h3>
                      <p className="text-white/40 text-sm line-clamp-2">{res.description}</p>
                      
                      <div className="pt-4 mt-auto flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden border border-violet-500/30">
                            <img 
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${res.created_by_avatar_seed || res.created_by_name}`} 
                              alt="Creator" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white/80">{res.created_by_name}</p>
                            <p className="text-[8px] text-white/30 uppercase tracking-widest">{new Date(res.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLike(res.id);
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${res.is_liked ? 'text-pink-500' : 'text-white/20 hover:text-pink-500'}`}
                          >
                            <svg className={`w-5 h-5 ${res.is_liked ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                            <span className="text-[10px] font-bold">{res.likes_count}</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleBookmark(res.id);
                            }}
                            className={`transition-colors ${res.is_bookmarked ? 'text-violet-400' : 'text-white/20 hover:text-violet-400'}`}
                          >
                            <svg className={`w-5 h-5 ${res.is_bookmarked ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
            
            {!loading && resources.length > 0 && (
              <div className="text-center pt-8">
                <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">Load More Resources</button>
              </div>
            )}
          </div>


        </div>
      </main>

      {/* Create Resource Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-black/40 backdrop-blur-[100px] border border-white/20 rounded-[3rem] p-12 shadow-2xl overflow-y-auto max-h-[90vh] pointer-events-auto custom-scrollbar"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <svg className="w-48 h-48 text-violet-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2z"/></svg>
              </div>

              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-2">Share a <span className="text-violet-400">Resource</span></h2>
                <p className="text-white/40 text-sm mb-10 font-medium tracking-wide">Contribute to the community by sharing valuable learning materials.</p>

                <form onSubmit={handleCreateResource} className="space-y-6">
                  {/* Image Upload Area */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Cover Image</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full h-40 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 transition-all group-hover:border-violet-500/50 group-hover:bg-violet-500/5 ${imagePreview ? 'border-none p-0' : 'p-6'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-violet-400 transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </div>
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Click to upload cover image</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Resource Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g. Mastering React Hooks"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-md"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Briefly describe what this resource covers..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all h-28 resize-none backdrop-blur-md"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Tags</label>
                      <input 
                        type="text" 
                        value={formData.tags}
                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                        placeholder="React, Frontend"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-md"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">URL Link</label>
                      <input 
                        type="url" 
                        value={formData.link}
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                        placeholder="https://..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-all backdrop-blur-md"
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={formLoading}
                      className="flex-[2] py-4 bg-white text-black font-black rounded-2xl hover:bg-violet-400 hover:text-white transition-all shadow-2xl disabled:opacity-50 text-sm uppercase tracking-widest"
                    >
                      {formLoading ? 'Publishing...' : 'Publish Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-20 py-20 border-t border-white/5 bg-black/40 backdrop-blur-3xl relative z-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 shadow-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 22h20L12 2z"/></svg>
              </div>
              <span className="text-white font-bold text-xl tracking-tight">Synora</span>
            </div>
            <p className="text-white/30 text-xs leading-relaxed">Empowering creators and learners through a decentralized skill-swapping ecosystem.</p>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-6">Explore</h4>
            <ul className="space-y-3 text-xs text-white/40 font-bold">
              <li><a href="/explore" className="hover:text-violet-400 transition-colors">Find Mentors</a></li>
              <li><a href="/resources" className="hover:text-violet-400 transition-colors">Learning Hub</a></li>
              <li><a href="/community" className="hover:text-violet-400 transition-colors">Community</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-6">Support</h4>
            <ul className="space-y-3 text-xs text-white/40 font-bold">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Safety Guides</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/80 mb-6">Stay Connected</h4>
            <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-violet-600 transition-all cursor-pointer">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-20 pt-8 border-t border-white/5 text-[10px] text-white/20 flex justify-between uppercase tracking-widest font-black">
          <span>&copy; 2025 Synora Platform. All Rights Reserved.</span>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
