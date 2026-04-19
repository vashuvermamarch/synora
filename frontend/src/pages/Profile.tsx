import { useState, useEffect } from 'react';
import { Edit3, MapPin, Save } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Profile as ProfileType, Skill } from '../types';

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileType|null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [learn, setLearn] = useState<number[]>([]);
  const [teach, setTeach] = useState<number[]>([]);

  useEffect(() => {
    api.get('/users/profile/').then(r=>{setProfile(r.data);setBio(r.data.bio);setLocation(r.data.location);setLearn(r.data.skills_to_learn);setTeach(r.data.skills_to_teach)}).catch(()=>{});
    api.get('/skills/').then(r=>setAllSkills(r.data)).catch(()=>{});
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile/', { bio, location, skills_to_learn: learn, skills_to_teach: teach });
      setProfile(res.data); setEditing(false);
    } catch { alert('Failed to update profile'); }
  };

  const toggleSkill = (id: number, list: number[], set: (v:number[])=>void) => {
    set(list.includes(id) ? list.filter(x=>x!==id) : [...list, id]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">PROFILE</h1>
        <button onClick={()=>editing?handleSave():setEditing(true)} className={`btn ${editing?'btn-primary':'btn-outlined'}`}>
          {editing?<><Save size={16}/> SAVE</>:<><Edit3 size={16}/> EDIT</>}
        </button>
      </div>

      <div className="card p-8 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary border-3 border-secondary flex items-center justify-center text-4xl font-bold">{user?.username?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="text-2xl font-bold">@{user?.username}</h2>
            <p className="text-muted">{user?.email}</p>
            <span className="badge badge-dark mt-1">{user?.role?.toUpperCase()}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold uppercase mb-1">Bio</label>
            {editing ? <textarea value={bio} onChange={e=>setBio(e.target.value)} className="input min-h-[100px] resize-y" placeholder="Tell others about yourself..."/> : <p className="text-sm">{profile?.bio || 'No bio yet.'}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold uppercase mb-1"><MapPin size={14} className="inline"/> Location</label>
            {editing ? <input value={location} onChange={e=>setLocation(e.target.value)} className="input" placeholder="City, Country"/> : <p className="text-sm">{profile?.location || 'Not set'}</p>}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-3">🎯 LEARNING</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">{allSkills.map(s=>(<button key={s.id} onClick={()=>toggleSkill(s.id,learn,setLearn)} className={`badge cursor-pointer ${learn.includes(s.id)?'badge-primary':'badge-outlined'}`}>{s.name}</button>))}</div>
          ) : (
            <div className="flex flex-wrap gap-2">{profile?.skills_to_learn_names.length?profile.skills_to_learn_names.map(s=><span key={s} className="badge badge-primary">{s}</span>):<p className="text-muted text-sm">None yet</p>}</div>
          )}
        </div>
        <div className="card p-6">
          <h3 className="font-bold text-lg mb-3">🧠 TEACHING</h3>
          {editing ? (
            <div className="flex flex-wrap gap-2">{allSkills.map(s=>(<button key={s.id} onClick={()=>toggleSkill(s.id,teach,setTeach)} className={`badge cursor-pointer ${teach.includes(s.id)?'badge-dark':'badge-outlined'}`}>{s.name}</button>))}</div>
          ) : (
            <div className="flex flex-wrap gap-2">{profile?.skills_to_teach_names.length?profile.skills_to_teach_names.map(s=><span key={s} className="badge badge-dark">{s}</span>):<p className="text-muted text-sm">None yet</p>}</div>
          )}
        </div>
      </div>
    </div>
  );
}
