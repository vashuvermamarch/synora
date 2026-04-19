import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ExternalLink } from 'lucide-react';
import api from '../api/client';
import type { Resource } from '../types';

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('ALL');
  const tags = ['ALL','DESIGN','CODING','BUSINESS','PHOTOGRAPHY','WRITING'];

  useEffect(() => { api.get('/resources/list/').then(r=>setResources(r.data)).catch(()=>{}); }, []);

  const filtered = resources.filter(r => {
    const matchSearch = !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag==='ALL' || r.tags_list.some(t=>t.toLowerCase().includes(activeTag.toLowerCase()));
    return matchSearch && matchTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-4xl font-bold">RESOURCES</h1><p className="text-muted">Community-shared learning materials</p></div>
        <Link to="/resources/create" className="btn btn-primary"><Plus size={16}/> CREATE</Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} className="input pl-12" placeholder="Search resources..."/>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map(t=>(<button key={t} onClick={()=>setActiveTag(t)} className={`badge cursor-pointer ${activeTag===t?'badge-primary':'badge-outlined'}`}>{t}</button>))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length===0 ? <div className="col-span-full card p-8 text-center text-muted">No resources found.</div> :
        filtered.map(r=>(
          <div key={r.id} className="card card-hover p-0 overflow-hidden animate-slide-up">
            <div className="h-40 bg-secondary flex items-center justify-center">
              {r.image ? <img src={r.image} alt={r.title} className="w-full h-full object-cover"/> : <span className="text-4xl">📚</span>}
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-1 mb-2">{r.tags_list.map(t=><span key={t} className="badge badge-primary text-xs">{t}</span>)}</div>
              <h3 className="font-bold text-lg mb-1">{r.title}</h3>
              <p className="text-muted text-sm mb-3 line-clamp-2">{r.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted">by @{r.created_by_name}</span>
                {r.link && <a href={r.link} target="_blank" rel="noreferrer" className="badge badge-outlined text-xs cursor-pointer"><ExternalLink size={12}/> OPEN</a>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
