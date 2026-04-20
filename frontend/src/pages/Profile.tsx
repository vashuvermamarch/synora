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
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">PROFILE</h1>
        <button onClick={()=>editing?handleSave():setEditing(true)} className={`btn ${editing?'btn-primary':'btn-white'}`}>
          {editing?<><Save size={16}/> SAVE</>:<><Edit3 size={16}/> EDIT</>}
        </button>
      </div>

      <div className="card profile-info-card">
        <div className="profile-info-header">
          <div className="profile-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="profile-username">@{user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="badge badge-dark" style={{ marginTop: '0.25rem' }}>{user?.role?.toUpperCase()}</span>
          </div>
        </div>

        <div>
          <div className="profile-form-group">
            <label className="profile-label">Bio</label>
            {editing ? <textarea value={bio} onChange={e=>setBio(e.target.value)} className="input profile-textarea" placeholder="Tell others about yourself..."/> : <p className="profile-text-value">{profile?.bio || 'No bio yet.'}</p>}
          </div>
          <div className="profile-form-group" style={{ marginBottom: 0 }}>
            <label className="profile-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> Location</label>
            {editing ? <input value={location} onChange={e=>setLocation(e.target.value)} className="input" placeholder="City, Country"/> : <p className="profile-text-value">{profile?.location || 'Not set'}</p>}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="profile-grid">
        <div className="card profile-section-card">
          <h3 className="profile-section-title">🎯 LEARNING</h3>
          {editing ? (
            <div className="profile-tags-container">
              {allSkills.map(s=>(
                <button key={s.id} onClick={()=>toggleSkill(s.id,learn,setLearn)} className={`badge cursor-pointer ${learn.includes(s.id)?'badge-primary':'badge-white'}`}>{s.name}</button>
              ))}
            </div>
          ) : (
            <div className="profile-tags-container">
              {profile?.skills_to_learn_names.length ? profile.skills_to_learn_names.map(s=><span key={s} className="badge badge-primary">{s}</span>) : <p className="profile-email" style={{ fontSize: '0.875rem' }}>None yet</p>}
            </div>
          )}
        </div>
        <div className="card profile-section-card">
          <h3 className="profile-section-title">🧠 TEACHING</h3>
          {editing ? (
            <div className="profile-tags-container">
              {allSkills.map(s=>(
                <button key={s.id} onClick={()=>toggleSkill(s.id,teach,setTeach)} className={`badge cursor-pointer ${teach.includes(s.id)?'badge-dark':'badge-white'}`}>{s.name}</button>
              ))}
            </div>
          ) : (
            <div className="profile-tags-container">
              {profile?.skills_to_teach_names.length ? profile.skills_to_teach_names.map(s=><span key={s} className="badge badge-dark">{s}</span>) : <p className="profile-email" style={{ fontSize: '0.875rem' }}>None yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
