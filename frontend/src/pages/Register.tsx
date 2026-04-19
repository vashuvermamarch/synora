import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, X, Check, Brain, Rocket } from 'lucide-react';
import api from '../api/client';

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [role, setRole] = useState<'beginner' | 'intermediate'>('beginner');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (skill: string, type: 'learn' | 'teach') => {
    const s = skill.trim().toUpperCase();
    if (!s) return;
    if (type === 'learn') {
      if (!skillsToLearn.includes(s)) setSkillsToLearn([...skillsToLearn, s]);
    } else {
      if (!skillsToTeach.includes(s)) setSkillsToTeach([...skillsToTeach, s]);
    }
    setNewSkill('');
  };

  const removeSkill = (skill: string, type: 'learn' | 'teach') => {
    if (type === 'learn') setSkillsToLearn(skillsToLearn.filter(s => s !== skill));
    else setSkillsToTeach(skillsToTeach.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('email', email.trim());
    formData.append('phone', phone);
    formData.append('password', password);
    formData.append('confirm_password', password); // Simplification: using same for both
    formData.append('role', role);

    skillsToLearn.forEach(s => formData.append('skills_to_learn', s));
    skillsToTeach.forEach(s => formData.append('skills_to_teach', s));

    if (role === 'intermediate' && certificate) {
      formData.append('certificate', certificate);
    }

    try {
      await api.post('/auth/signup/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/verify-otp', { state: { email } });
    } catch (err: any) {
      const d = err.response?.data;
      setError(d ? (typeof d === 'string' ? d : Object.values(d).flat().join(' ')) : 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-4 py-20 bg-grid">
      <div className="w-full max-w-4xl">
        {step === 1 ? (
          <div className="space-y-16 animate-slide-up max-w-6xl mx-auto py-12">
            {/* Header Section */}
            <div className="space-y-6">
              <h1 className="text-[7rem] font-black leading-[0.8] tracking-tighter uppercase">
                CHOOSE YOUR<br />
                <span className="bg-primary px-4 inline-block mt-2 border-4 border-secondary shadow-brutal-sm">PATH</span>
              </h1>
              <p className="font-mono text-lg uppercase tracking-widest text-muted">
                SELECT YOUR OPERATIONAL LEVEL TO BEGIN THE SYSTEM HANDSHAKE.
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid md:grid-cols-2 gap-16 w-full">
              {/* Beginner Card */}
              <div
                onClick={() => { setRole('beginner'); setStep(2); }}
                className="group relative"
              >
                {/* Shadow Box */}
                <div className="absolute inset-0 bg-secondary translate-x-6 translate-y-6"></div>
                {/* Content Box */}
                <div className="relative bg-white border-4 border-secondary p-12 md:p-16 h-full flex flex-col items-start cursor-pointer hover:translate-x-2 hover:translate-y-2 transition-transform gap-8">
                  <div className="w-20 h-20 bg-secondary flex items-center justify-center border-4 border-secondary shadow-brutal-sm">
                    <Brain size={40} className="text-primary" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">BEGINNER</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-primary border-r-2 border-secondary"></div>
                      <p className="font-black uppercase text-lg md:text-xl tracking-tight">I WANT TO LEARN SKILLS</p>
                    </div>
                  </div>

                  <p className="font-bold text-lg md:text-xl text-muted leading-relaxed max-w-sm uppercase">
                    Access the database of elite mentors and start your skill acquisition journey with verified protocols.
                  </p>

                  <div className="mt-12 w-full flex justify-between items-center gap-4">
                    <span className="font-mono text-xs md:text-sm text-muted uppercase tracking-tighter">[ CODE: @01_STUDENT ]</span>
                    <button className="bg-secondary text-white px-6 md:px-10 py-3 md:py-4 font-black uppercase text-sm md:text-lg border-4 border-secondary hover:bg-primary hover:text-secondary transition-all shadow-brutal-sm active:shadow-none active:translate-x-1 active:translate-y-1 whitespace-nowrap">
                      SELECT_PATH
                    </button>
                  </div>
                </div>
              </div>

              {/* Intermediate Card */}
              <div
                onClick={() => { setRole('intermediate'); setStep(2); }}
                className="group relative"
              >
                {/* Shadow Box */}
                <div className="absolute inset-0 bg-primary border-4 border-secondary translate-x-6 translate-y-6"></div>
                {/* Content Box */}
                <div className="relative bg-white border-4 border-secondary p-12 md:p-16 h-full flex flex-col items-start cursor-pointer hover:translate-x-2 hover:translate-y-2 transition-transform gap-8">
                  <div className="w-20 h-20 bg-primary border-4 border-secondary flex items-center justify-center shadow-brutal-sm">
                    <Rocket size={40} className="text-secondary" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">INTERMEDIATE</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-secondary"></div>
                      <p className="font-black uppercase text-lg md:text-xl tracking-tight">I CAN TEACH AND LEARN</p>
                    </div>
                  </div>

                  <p className="font-bold text-lg md:text-xl text-muted leading-relaxed max-w-sm uppercase">
                    Engage in bidirectional data transfer. Monetize your expertise while bridging your own knowledge gaps.
                  </p>

                  <div className="mt-12 w-full flex justify-between items-center gap-4">
                    <span className="font-mono text-xs md:text-sm text-muted uppercase tracking-tighter">[ CODE: @02_HYBRID ]</span>
                    <button className="bg-primary text-secondary px-6 md:px-10 py-3 md:py-4 font-black uppercase text-sm md:text-lg border-4 border-secondary shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:shadow-none whitespace-nowrap">
                      SELECT_PATH
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className='h-6'></div>
            <p className="text-center font-mono text-sm uppercase tracking-wider text-muted">
              ALREADY REGISTERED? <Link to="/login" className="text-secondary border-b-2 border-secondary font-black hover:text-primary transition-colors ml-2">LOGIN_SYSTEM</Link>
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-slide-up py-12">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 font-mono text-sm font-black uppercase mb-8 hover:text-primary transition-colors">
              <ArrowLeft size={18} /> [ BACK_TO_SELECTION ]
            </button>

            <div className="relative group">
              {/* Shadow Box */}
              <div className="absolute inset-0 bg-secondary translate-x-4 translate-y-4"></div>

              {/* Main Form Box */}
              <div className="relative bg-white border-4 border-secondary p-12 md:p-24 overflow-hidden">
                {/* Yellow Corner Flag */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary border-l-4 border-b-4 border-secondary translate-x-12 -translate-y-12 rotate-45"></div>

                {/* Header */}
                <div className="space-y-4 mb-16 relative z-10">
                  <h2 className="text-6xl font-black uppercase tracking-tighter leading-none">COMPLETE<br />YOUR PROFILE</h2>
                  <div className="inline-block bg-secondary text-white px-3 py-1 font-mono text-xs uppercase tracking-widest">
                    SYSTEM STATUS: ONBOARDING_ACTIVE
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-16 relative z-10 py-8">
                  {error && <div className="bg-danger text-white p-4 font-black uppercase border-4 border-secondary shadow-brutal-sm mb-12">{error}</div>}

                  {/* Section: Basic Identity */}
                  <div className="space-y-12 pb-16 border-b-4 border-secondary/10">
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-3">
                        <label className="font-black uppercase text-sm tracking-widest">USERNAME</label>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="input border-4 border-secondary p-6 w-full focus:bg-primary/5 outline-none transition-colors"
                          placeholder="USER_ID_88"
                          pattern="^[a-zA-Z0-9.@+-_]+$"
                          title="Username can only contain letters, numbers, and @/./+/-/_ characters."
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="font-black uppercase text-sm tracking-widest">EMAIL</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input border-4 border-secondary p-6 w-full focus:bg-primary/5 outline-none transition-colors" placeholder="PROTO@DOMAIN.COM" required />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="font-black uppercase text-sm tracking-widest">PHONE NUMBER</label>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input border-4 border-secondary p-6 w-full focus:bg-primary/5 outline-none transition-colors" placeholder="+00 123 456 789" required />
                    </div>

                    <div className="space-y-3">
                      <label className="font-black uppercase text-sm tracking-widest">ACCESS_KEY (PASSWORD)</label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input border-4 border-secondary p-6 w-full focus:bg-primary/5 outline-none transition-colors" placeholder="••••••••" required />
                    </div>
                  </div>

                  {/* Section: Skills Acquisition */}
                  <div className="space-y-12 pb-16 border-b-4 border-secondary/10">
                    <div className="space-y-6">
                      <label className="font-black uppercase text-sm tracking-widest">SKILLS TO LEARN</label>
                      <div className="flex flex-wrap gap-4 mb-6">
                        {skillsToLearn.map(s => (
                          <div key={s} className="bg-primary border-2 border-secondary px-5 py-3 flex items-center gap-3 font-black text-xs uppercase shadow-brutal-xs">
                            {s} <X size={16} className="cursor-pointer hover:text-white" onClick={() => removeSkill(s, 'learn')} />
                          </div>
                        ))}
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={e => setNewSkill(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(newSkill, 'learn'))}
                          className="input border-4 border-secondary p-6 flex-1 outline-none focus:bg-primary/5 uppercase font-mono text-sm"
                          placeholder="ADD_SKILL"
                        />
                        <button type="button" onClick={() => handleAddSkill(newSkill, 'learn')} className="bg-secondary text-white px-12 font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-colors border-y-4 border-r-4 border-secondary">ADD</button>
                      </div>
                    </div>

                    {role === 'intermediate' && (
                      <div className="space-y-6">
                        <label className="font-black uppercase text-sm tracking-widest">SKILLS TO TEACH</label>
                        <div className="flex flex-wrap gap-4 mb-6">
                          {skillsToTeach.map(s => (
                            <div key={s} className="bg-white border-2 border-secondary px-5 py-3 flex items-center gap-3 font-black text-xs uppercase shadow-brutal-xs">
                              {s} <X size={16} className="cursor-pointer hover:text-primary" onClick={() => removeSkill(s, 'teach')} />
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            placeholder="OFFER_SKILL"
                            className="input border-4 border-secondary p-6 flex-1 outline-none focus:bg-primary/5 uppercase font-mono text-sm"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill((e.target as HTMLInputElement).value, 'teach');
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <button type="button" onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            handleAddSkill(input.value, 'teach');
                            input.value = '';
                          }} className="bg-secondary text-white px-12 font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-colors border-y-4 border-r-4 border-secondary">ADD</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section: Verification */}
                  {role === 'intermediate' && (
                    <div className="space-y-8 pb-16 border-b-4 border-secondary/10">
                      <label className="font-black uppercase text-sm tracking-widest">CERTIFICATION UPLOAD</label>
                      <div className="relative border-4 border-dashed border-secondary p-20 text-center group bg-surface">
                        <input
                          type="file"
                          onChange={e => setCertificate(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="space-y-6 flex flex-col items-center justify-center">
                          <Upload size={64} className="text-secondary" />
                          <div className="space-y-2 text-center">
                            <p className="font-mono text-xs uppercase text-muted tracking-[0.2em] leading-relaxed max-w-sm">
                              {certificate ? certificate.name : 'DRAG & DROP CREDENTIALS HERE'}
                            </p>
                            <p className="font-black text-sm uppercase tracking-widest text-secondary opacity-60">
                              [ SYSTEM_READY_FOR_UPLOAD ]
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Final Action */}
                  <div className="pt-8 space-y-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary border-4 border-secondary p-8 text-4xl font-black uppercase tracking-[0.2em] shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-y-2"
                    >
                      {loading ? 'INITIALIZING...' : 'INITIALIZE PROFILE'}
                    </button>
                    <p className="text-center font-mono text-xs uppercase text-muted tracking-[0.3em] opacity-60">
                      BY CLICKING INITIALIZE, YOU AGREE TO OUR TERMS_OF_SERVICE.DAT
                    </p>
                  </div>
                </form>
              </div>
            </div>

            {/* Bottom Features */}
          </div>
        )}
      </div>
    </div>
  );
}
