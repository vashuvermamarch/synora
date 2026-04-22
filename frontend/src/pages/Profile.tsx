import { useState, useEffect } from 'react';
import { Edit3, MapPin, Save, X, Search, Plus } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Profile as ProfileType, Skill } from '../types';

export default function Profile() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [learn, setLearn] = useState<(number | string)[]>([]);
  const [teach, setTeach] = useState<(number | string)[]>([]);
  const [learnSearch, setLearnSearch] = useState('');
  const [teachSearch, setTeachSearch] = useState('');

  useEffect(() => {
    api.get('/users/profile/').then(r => {
      setProfile(r.data);
      setBio(r.data.bio);
      setLocation(r.data.location);
      setLearn(r.data.skills_to_learn || []);
      setTeach(r.data.skills_to_teach || []);
    }).catch(() => { });
    api.get('/skills/').then(r => setAllSkills(r.data)).catch(() => { });
  }, []);

  const handleSave = async () => {
    try {
      const res = await api.put('/users/profile/', { bio, location, skills_to_learn: learn, skills_to_teach: teach });
      setProfile(res.data); setEditing(false);
    } catch { alert('Failed to update profile'); }
  };

  const toggleSkill = (val: number | string, list: (number | string)[], set: (v: (number | string)[]) => void) => {
    set(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
  };

  const handleAddSkill = (type: 'learn' | 'teach') => {
    const search = type === 'learn' ? learnSearch : teachSearch;
    const list = type === 'learn' ? learn : teach;
    const set = type === 'learn' ? setLearn : setTeach;
    const setSearch = type === 'learn' ? setLearnSearch : setTeachSearch;

    const trimmed = search.trim();
    if (!trimmed) return;

    const exists = list.some(item => {
      const name = typeof item === 'number' ? allSkills.find(x => x.id === item)?.name : item;
      return name?.toLowerCase() === trimmed.toLowerCase();
    });

    if (!exists) {
      const match = allSkills.find(s => s.name.toLowerCase() === trimmed.toLowerCase());
      if (match) {
        set([...list, match.id]);
      } else {
        set([...list, trimmed]);
      }
    }
    setSearch('');
  };

  const filteredSkills = (search: string, currentList: (number | string)[]) => {
    if (!search) return [];
    return allSkills.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      !currentList.includes(s.id)
    ).slice(0, 5);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1 className="profile-title">PROFILE</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)} className={`btn ${editing ? 'btn-primary' : 'btn-white'}`}>
          {editing ? <><Save size={16} /> SAVE</> : <><Edit3 size={16} /> EDIT</>}
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
            {editing ? <textarea value={bio} onChange={e => setBio(e.target.value)} className="input profile-textarea" placeholder="Tell others about yourself..." /> : <p className="profile-text-value">{profile?.bio || 'No bio yet.'}</p>}
          </div>
          <div className="profile-form-group" style={{ marginBottom: 0 }}>
            <label className="profile-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> Location</label>
            {editing ? <input value={location} onChange={e => setLocation(e.target.value)} className="input" placeholder="City, Country" /> : <p className="profile-text-value">{profile?.location || 'Not set'}</p>}
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="profile-grid">
        {/* Learning Section */}
        <div className="card profile-section-card">
          <h3 className="profile-section-title">🎯 LEARNING</h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="profile-tags-container">
                {learn.map((item, idx) => {
                  const name = typeof item === 'number' ? allSkills.find(x => x.id === item)?.name : item;
                  return name ? (
                    <button key={idx} onClick={() => toggleSkill(item, learn, setLearn)} className="badge badge-primary cursor-pointer flex items-center gap-1">
                      {name} <X size={10} />
                    </button>
                  ) : null;
                })}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                      value={learnSearch}
                      onChange={e => setLearnSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('learn'))}
                      className="input"
                      placeholder="Type a skill..."
                      style={{ paddingLeft: '32px', width: '100%' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill('learn')}
                    className="btn btn-dark"
                    style={{ padding: '0 1.5rem', fontSize: '0.85rem' }}
                  >
                    ADD
                  </button>
                </div>
                {learnSearch && (
                  <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '4px', padding: '0.5rem' }}>
                    {filteredSkills(learnSearch, learn).length > 0 ? (
                      filteredSkills(learnSearch, learn).map(s => (
                        <button
                          key={s.id}
                          onClick={() => { toggleSkill(s.id, learn, setLearn); setLearnSearch(''); }}
                          className="btn btn-white w-full text-left flex items-center justify-between"
                          style={{ border: 'none', boxShadow: 'none', padding: '0.5rem' }}
                        >
                          {s.name} <Plus size={14} />
                        </button>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.75rem', padding: '0.5rem', textAlign: 'center', opacity: 0.5 }}>No matching skills found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="profile-tags-container">
              {profile?.skills_to_learn_names.length ? profile.skills_to_learn_names.map(s => <span key={s} className="badge badge-primary">{s}</span>) : <p className="profile-email" style={{ fontSize: '0.875rem' }}>None yet</p>}
            </div>
          )}
        </div>

        {/* Teaching Section */}
        <div className="card profile-section-card">
          <h3 className="profile-section-title">🧠 TEACHING</h3>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="profile-tags-container">
                {teach.map((item, idx) => {
                  const name = typeof item === 'number' ? allSkills.find(x => x.id === item)?.name : item;
                  return name ? (
                    <button key={idx} onClick={() => toggleSkill(item, teach, setTeach)} className="badge badge-dark cursor-pointer flex items-center gap-1">
                      {name} <X size={10} />
                    </button>
                  ) : null;
                })}
              </div>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input
                      value={teachSearch}
                      onChange={e => setTeachSearch(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill('teach'))}
                      className="input"
                      placeholder="Type a skill..."
                      style={{ paddingLeft: '32px', width: '100%' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddSkill('teach')}
                    className="btn btn-dark"
                    style={{ padding: '0 1.5rem', fontSize: '0.85rem' }}
                  >
                    ADD
                  </button>
                </div>
                {teachSearch && (
                  <div className="card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: '4px', padding: '0.5rem' }}>
                    {filteredSkills(teachSearch, teach).length > 0 ? (
                      filteredSkills(teachSearch, teach).map(s => (
                        <button
                          key={s.id}
                          onClick={() => { toggleSkill(s.id, teach, setTeach); setTeachSearch(''); }}
                          className="btn btn-white w-full text-left flex items-center justify-between"
                          style={{ border: 'none', boxShadow: 'none', padding: '0.5rem' }}
                        >
                          {s.name} <Plus size={14} />
                        </button>
                      ))
                    ) : (
                      <p style={{ fontSize: '0.75rem', padding: '0.5rem', textAlign: 'center', opacity: 0.5 }}>No matching skills found.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="profile-tags-container">
              {profile?.skills_to_teach_names.length ? profile.skills_to_teach_names.map(s => <span key={s} className="badge badge-dark">{s}</span>) : <p className="profile-email" style={{ fontSize: '0.875rem' }}>None yet</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
