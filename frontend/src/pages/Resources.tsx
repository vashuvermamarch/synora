import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Bookmark, ArrowUpCircle, ChevronLeft, ChevronRight, Settings2 } from 'lucide-react';
import api from '../api/client';
import type { Resource } from '../types';

const ResourceCard = ({
  r,
  isYellowCard,
  interaction,
  onInteract
}: {
  r: Resource;
  isYellowCard: boolean;
  interaction?: { liked: boolean; bookmarked: boolean };
  onInteract: (id: string | number, type: 'like' | 'bookmark', value: boolean) => void;
}) => {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<{text: string; user: string}[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const liked = interaction?.liked || false;
  const bookmarked = interaction?.bookmarked || false;

  const primaryTag = r.tags_list && r.tags_list.length > 0 ? r.tags_list[0] : 'RESOURCE';

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInteract(r.id, 'like', !liked);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInteract(r.id, 'bookmark', !bookmarked);
  };

  const handleCommentToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCommentsOpen(!commentsOpen);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newComment.trim()) return;
    setComments([...comments, { text: newComment, user: 'You' }]);
    setNewComment('');
  };

  return (
    <div className={`resource-card ${isYellowCard ? 'yellow' : ''}`}>
      <a href={r.link || '#'} target="_blank" rel="noreferrer" className="block flex-grow flex flex-col" style={{ textDecoration: 'none' }}>
        <div className="resource-card-image-container">
          {r.image ? (
            <img src={r.image} alt={r.title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-grid" style={{ backgroundColor: '#1A1A1A' }}>
              <span className="text-white font-black opacity-20 text-6xl" style={{ fontFamily: 'var(--font-head)' }}>DATA</span>
            </div>
          )}
          <div className="resource-card-badge">
            {primaryTag}
          </div>
        </div>

        <div className="resource-card-content">
          <h3 className="resource-card-title">
            {r.title}
          </h3>
          <p className="resource-card-desc">
            {r.description}
          </p>
        </div>
      </a>

      <div className="resource-card-actions mt-auto">
        <button className={`resource-card-action-btn ${liked ? 'active' : ''}`} onClick={handleLike}>
          <Heart size={24} strokeWidth={3} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <button className={`resource-card-action-btn ${commentsOpen ? 'active' : ''}`} onClick={handleCommentToggle}>
          <MessageSquare size={24} strokeWidth={3} fill={commentsOpen ? 'currentColor' : 'none'} />
        </button>
        <button className={`resource-card-action-btn ${bookmarked ? 'active' : ''}`} onClick={handleBookmark}>
          <Bookmark size={24} strokeWidth={3} fill={bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t-[6px] border-secondary bg-white p-5" onClick={e => e.stopPropagation()}>
          <div className="max-h-[150px] overflow-y-auto mb-4 flex flex-col gap-2 pr-2" style={{ scrollbarWidth: 'thin' }}>
            {comments.length === 0 ? (
              <p className="text-secondary opacity-50 font-mono text-sm uppercase font-bold text-center py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="border-l-[4px] border-primary pl-3 py-1">
                  <span className="font-black font-mono text-xs uppercase block mb-1">{c.user}</span>
                  <p className="text-sm font-medium leading-tight">{c.text}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="ADD A COMMENT..."
              className="flex-1 bg-surface border-[4px] border-secondary p-2 font-mono text-xs font-bold uppercase outline-none focus:bg-white transition-colors"
            />
            <button type="submit" className="bg-primary border-[4px] border-secondary px-4 font-black uppercase text-sm hover:bg-secondary hover:text-white transition-colors">
              POST
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');
  
  const [interactions, setInteractions] = useState<Record<string, {liked: boolean, bookmarked: boolean}>>({});
  const [filterType, setFilterType] = useState<'ALL' | 'BOOKMARKED' | 'LIKED'>('ALL');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // const [currentPage, setCurrentPage] = useState(1); // Aesthetic pagination for now
  const tags = ['ALL', 'DESIGN', 'CODING', 'BUSINESS', 'PHOTOGRAPHY', 'WRITING'];

  useEffect(() => { api.get('/resources/list/').then(r => setResources(r.data)).catch(() => { }); }, []);

  const handleInteract = (id: string | number, type: 'like' | 'bookmark', value: boolean) => {
    setInteractions(prev => ({
      ...prev,
      [String(id)]: {
        ...(prev[String(id)] || { liked: false, bookmarked: false }),
        [type === 'like' ? 'liked' : 'bookmarked']: value
      }
    }));
  };

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === 'ALL' || r.tags_list.some(t => t.toLowerCase().includes(activeTag.toLowerCase()));
    
    let matchFilterType = true;
    if (filterType === 'BOOKMARKED') {
      matchFilterType = interactions[String(r.id)]?.bookmarked === true;
    } else if (filterType === 'LIKED') {
      matchFilterType = interactions[String(r.id)]?.liked === true;
    }

    return matchSearch && matchTag && matchFilterType;
  });

  return (
    <div className="w-full min-h-screen bg-surface" style={{ padding: '6rem 2rem' }}>
      <div className="max-w-[1400px] mx-auto">

        {/* Header Search & Filter */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 relative z-50">
          <div className="flex-1 bg-white border-[8px] border-secondary flex items-center relative" style={{ boxShadow: '10px 10px 0px 0px #000' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-transparent p-6 md:p-8 font-black text-2xl md:text-3xl uppercase outline-none placeholder:text-[#A0A0A0]"
              placeholder="SEARCH FOR KNOWLEDGE..."
            />
          </div>

          <div className="relative flex shrink-0">
            <button 
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="bg-primary border-[8px] border-secondary flex items-center justify-center gap-4 hover:bg-secondary hover:text-white transition-colors h-full w-full md:w-auto" 
              style={{ padding: '0 4rem', boxShadow: '10px 10px 0px 0px #000' }}
            >
              <span className="font-black uppercase tracking-widest text-2xl md:text-3xl">
                {filterType === 'ALL' ? 'FILTER' : filterType}
              </span>
              <Settings2 size={32} strokeWidth={3} />
            </button>
            
            {/* Dropdown */}
            {isFilterDropdownOpen && (
              <div className="absolute top-full right-0 mt-6 bg-white border-[6px] border-secondary flex flex-col w-full md:w-[340px]" style={{ boxShadow: '10px 10px 0px 0px #000' }}>
                <button 
                  onClick={() => { setFilterType('ALL'); setIsFilterDropdownOpen(false); }}
                  className={`text-left font-black uppercase tracking-widest p-5 border-b-[6px] border-secondary hover:bg-secondary hover:text-white transition-colors ${filterType === 'ALL' ? 'bg-secondary text-primary' : 'text-secondary'}`}
                >
                  ALL RESOURCES
                </button>
                <button 
                  onClick={() => { setFilterType('BOOKMARKED'); setIsFilterDropdownOpen(false); }}
                  className={`text-left font-black uppercase tracking-widest p-5 border-b-[6px] border-secondary hover:bg-secondary hover:text-white transition-colors ${filterType === 'BOOKMARKED' ? 'bg-secondary text-primary' : 'text-secondary'}`}
                >
                  BOOKMARKED
                </button>
                <button 
                  onClick={() => { setFilterType('LIKED'); setIsFilterDropdownOpen(false); }}
                  className={`text-left font-black uppercase tracking-widest p-5 hover:bg-secondary hover:text-white transition-colors ${filterType === 'LIKED' ? 'bg-secondary text-primary' : 'text-secondary'}`}
                >
                  LIKED
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-6 my-24" style={{ marginTop: '40px', marginBottom: '40px' }}>
          {tags.map(t => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`font-mono font-bold uppercase tracking-widest border-[3px] border-secondary transition-colors m-3 ${activeTag === t ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-[#E5E7EB]'}`}
              style={{ padding: '8px 16px', fontSize: '0.75rem' }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-16 relative z-0">
          {filtered.map((r, index) => (
            <ResourceCard key={r.id} r={r} isYellowCard={index % 3 === 2} interaction={interactions[String(r.id)]} onInteract={handleInteract} />
          ))}

          {/* CTA Card (Always displayed at the end) */}
          <Link to="/resources/create" className="cta-card">
            <div className="cta-icon-wrapper">
              <ArrowUpCircle size={40} strokeWidth={3} />
            </div>
            <h3 className="cta-title">
              HAVE A<br />RESOURCE TO<br />SHARE?
            </h3>
            <p className="cta-subtitle">
              SUBMIT YOUR KNOWLEDGE TO THE SWAP BASE.
            </p>
            <div className="cta-button">
              SUBMIT NOW
            </div>
          </Link>
        </div>

        {/* Pagination */}
        <div className="mt-24 flex justify-center gap-4" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <button className="w-14 h-14 bg-black text-white border-[4px] border-secondary flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
            <ChevronLeft size={24} strokeWidth={3} />
          </button>
          <button className="w-14 h-14 bg-primary text-secondary border-[4px] border-secondary font-black text-xl flex items-center justify-center">
            1
          </button>
          <button className="w-14 h-14 bg-white text-secondary border-[4px] border-secondary font-black text-xl flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
            2
          </button>
          <button className="w-14 h-14 bg-white text-secondary border-[4px] border-secondary font-black text-xl flex items-center justify-center hover:bg-[#E5E7EB] transition-colors">
            3
          </button>
          <button className="w-14 h-14 bg-black text-white border-[4px] border-secondary flex items-center justify-center hover:bg-secondary hover:text-primary transition-colors">
            <ChevronRight size={24} strokeWidth={3} />
          </button>
        </div>

      </div>
    </div>
  );
}
