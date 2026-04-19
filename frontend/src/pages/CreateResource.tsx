import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function CreateResource() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      await api.post('/resources/create/', { title, description, link, tags });
      navigate('/resources');
    } catch { alert('Failed to create resource'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">CREATE RESOURCE</h1>
      <form onSubmit={handleSubmit} className="card p-8 space-y-5">
        <div><label className="block text-sm font-bold uppercase mb-1">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} className="input" placeholder="Resource title" required/></div>
        <div><label className="block text-sm font-bold uppercase mb-1">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} className="input min-h-[120px] resize-y" placeholder="What is this resource about?" required/></div>
        <div><label className="block text-sm font-bold uppercase mb-1">Link (optional)</label><input value={link} onChange={e=>setLink(e.target.value)} className="input" placeholder="https://..."/></div>
        <div><label className="block text-sm font-bold uppercase mb-1">Tags (comma-separated)</label><input value={tags} onChange={e=>setTags(e.target.value)} className="input" placeholder="design, coding, tutorial"/></div>
        <div className="flex gap-3">
          <button type="button" onClick={()=>navigate('/resources')} className="btn btn-outlined flex-1">CANCEL</button>
          <button type="submit" disabled={loading} className="btn btn-primary flex-1">{loading?'CREATING...':'PUBLISH RESOURCE'}</button>
        </div>
      </form>
    </div>
  );
}
