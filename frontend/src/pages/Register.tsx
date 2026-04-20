import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Upload, X, Check, GraduationCap, Network, Eye, EyeOff } from 'lucide-react';
import api from '../api/client';

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [role, setRole] = useState<'beginner' | 'intermediate'>('beginner');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
                <span className="bg-primary px-4 py-1 inline-block mt-2 border-4 border-secondary">PATH</span>
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
                <div className="absolute inset-0 bg-secondary translate-x-4 translate-y-4"></div>
                {/* Content Box */}
                <div
                  className="relative bg-white border-4 border-secondary h-full flex flex-col items-start cursor-pointer hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                  style={{ padding: '3.5rem' }}
                >
                  <div
                    className="w-14 h-14 bg-secondary flex items-center justify-center shrink-0"
                    style={{ marginBottom: '4rem' }}
                  >
                    <GraduationCap size={28} className="text-primary" />
                  </div>

                  <div className="w-full" style={{ marginBottom: '2.5rem' }}>
                    <h2 className="text-4xl md:text-[2.5rem] font-black uppercase tracking-tighter leading-none" style={{ marginBottom: '1rem' }}>BEGINNER</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-0.5 h-5 bg-primary shrink-0"></div>
                      <p className="font-mono text-sm uppercase tracking-wider text-muted m-0">I WANT TO LEARN SKILLS</p>
                    </div>
                  </div>

                  <p className="text-muted leading-relaxed font-medium flex-grow m-0">
                    Access the database of elite mentors and start your skill acquisition journey with verified protocols.
                  </p>

                  <div className="w-full flex justify-between items-center gap-4" style={{ marginTop: '5rem' }}>
                    <span className="font-mono text-[10px] md:text-xs text-muted uppercase tracking-wider">[ CODE: 001_STUDENT ]</span>
                    <button
                      className="bg-secondary text-white font-black uppercase text-sm border-2 border-secondary hover:bg-primary hover:text-secondary hover:border-secondary transition-colors whitespace-nowrap"
                      style={{ padding: '16px 32px' }}
                    >
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
                <div className="absolute inset-0 bg-primary border-4 border-secondary translate-x-4 translate-y-4"></div>
                {/* Content Box */}
                <div
                  className="relative bg-white border-4 border-secondary h-full flex flex-col items-start cursor-pointer hover:-translate-y-1 hover:-translate-x-1 transition-transform"
                  style={{ padding: '3.5rem' }}
                >
                  <div
                    className="w-14 h-14 bg-primary border-4 border-secondary flex items-center justify-center shrink-0"
                    style={{ marginBottom: '4rem' }}
                  >
                    <Network size={28} className="text-secondary" />
                  </div>

                  <div className="w-full" style={{ marginBottom: '2.5rem' }}>
                    <h2 className="text-4xl md:text-[2.5rem] font-black uppercase tracking-tighter leading-none" style={{ marginBottom: '1rem' }}>INTERMEDIATE</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-0.5 h-5 bg-secondary shrink-0"></div>
                      <p className="font-mono text-sm uppercase tracking-wider text-muted m-0">I CAN TEACH AND LEARN</p>
                    </div>
                  </div>

                  <p className="text-muted leading-relaxed font-medium flex-grow m-0">
                    Engage in bidirectional data transfer. Monetize your expertise while bridging your own knowledge gaps.
                  </p>

                  <div className="w-full flex justify-between items-center gap-4" style={{ marginTop: '5rem' }}>
                    <span className="font-mono text-[10px] md:text-xs text-muted uppercase tracking-wider">[ CODE: 002_HYBRID ]</span>
                    <button
                      className="bg-primary text-secondary font-black uppercase text-sm border-4 border-secondary hover:bg-secondary hover:text-white transition-colors whitespace-nowrap"
                      style={{ padding: '16px 32px' }}
                    >
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
          <div className="max-w-3xl mx-auto animate-slide-up" style={{ padding: '3rem 0' }}>
            <button onClick={() => setStep(1)} className="flex items-center gap-2 font-mono text-sm font-black uppercase hover:text-primary transition-colors" style={{ marginBottom: '2rem' }}>
              <ArrowLeft size={18} /> [ BACK_TO_SELECTION ]
            </button>

            <div className="relative">
              {/* Main Form Box */}
              <div
                className="relative bg-white border-[6px] border-secondary overflow-hidden"
                style={{ padding: '3rem', boxShadow: '16px 16px 0px 0px #000' }}
              >
                {/* Yellow Corner Flag */}
                <div
                  className="absolute bg-primary border-l-[6px] border-b-[6px] border-secondary"
                  style={{ top: '-40px', right: '-40px', width: '120px', height: '120px', transform: 'rotate(15deg)' }}
                ></div>

                {/* Header */}
                <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 10 }}>
                  <h2 className="font-black uppercase tracking-tighter leading-none" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    COMPLETE<br />YOUR PROFILE
                  </h2>
                  <div className="inline-block bg-secondary text-white font-mono uppercase tracking-widest" style={{ padding: '6px 16px', fontSize: '0.65rem' }}>
                    SYSTEM STATUS: ONBOARDING_ACTIVE
                  </div>
                </div>

                <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {error && <div className="bg-danger text-white p-4 font-black uppercase border-4 border-secondary shadow-brutal-sm">{error}</div>}

                  {/* Section: Basic Identity */}
                  <div style={{ paddingBottom: '2.5rem', borderBottom: '3px solid #000', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="grid md:grid-cols-2" style={{ gap: '1.5rem' }}>
                      <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                        <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>USERNAME</label>
                        <input
                          type="text"
                          value={username}
                          onChange={e => setUsername(e.target.value)}
                          className="input"
                          style={{ padding: '1rem', fontSize: '0.875rem', border: '2px solid #000' }}
                          placeholder="USER_ID_88"
                          pattern="^[a-zA-Z0-9.@+-_]+$"
                          title="Username can only contain letters, numbers, and @/./+/-/_ characters."
                          required
                        />
                      </div>
                      <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                        <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>EMAIL</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="input"
                          style={{ padding: '1rem', fontSize: '0.875rem', border: '2px solid #000' }}
                          placeholder="PROTO@DOMAIN.COM"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                      <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>PHONE NUMBER</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="input"
                        style={{ padding: '1rem', fontSize: '0.875rem', border: '2px solid #000' }}
                        placeholder="+00 123 456 789"
                        required
                      />
                    </div>

                    <div className="flex flex-col" style={{ gap: '0.5rem' }}>
                      <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>ACCESS KEY (PASSWORD)</label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="input"
                          style={{ padding: '1rem', paddingRight: '3rem', fontSize: '0.875rem', border: '2px solid #000', width: '100%' }}
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 text-secondary hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section: Skills to Learn */}
                  <div style={{ paddingBottom: '2.5rem', borderBottom: '3px solid #000' }}>
                    <div className="flex flex-col" style={{ gap: '1rem' }}>
                      <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>SKILLS TO LEARN</label>
                      <div className="flex flex-wrap gap-2">
                        {skillsToLearn.map(s => (
                          <div key={s} className="bg-primary border-[2px] border-secondary flex items-center font-black uppercase" style={{ padding: '4px 8px', fontSize: '0.65rem', gap: '8px' }}>
                            {s} <X size={12} className="cursor-pointer hover:text-white" onClick={() => removeSkill(s, 'learn')} />
                          </div>
                        ))}
                      </div>
                      <div className="flex w-full">
                        <input
                          type="text"
                          value={newSkill}
                          onChange={e => setNewSkill(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill(newSkill, 'learn'))}
                          className="input font-mono uppercase"
                          style={{ padding: '1rem', fontSize: '0.875rem', flex: 1, border: '3px solid #000', borderRight: 'none' }}
                          placeholder="ADD_SKILL"
                        />
                        <button type="button" onClick={() => handleAddSkill(newSkill, 'learn')} className="bg-secondary text-white font-black uppercase tracking-widest hover:bg-primary hover:text-secondary border-[3px] border-secondary" style={{ padding: '0 2rem', fontSize: '0.8rem' }}>ADD</button>
                      </div>
                    </div>
                  </div>

                  {/* Section: Skills to Teach */}
                  {role === 'intermediate' && (
                    <div style={{ paddingBottom: '2.5rem', borderBottom: '3px solid #000' }}>
                      <div className="flex flex-col" style={{ gap: '1rem' }}>
                        <label className="font-black uppercase tracking-widest" style={{ fontSize: '0.8rem' }}>SKILLS TO TEACH</label>
                        <div className="flex flex-wrap gap-2">
                          {skillsToTeach.map(s => (
                            <div key={s} className="bg-white border-[2px] border-secondary flex items-center font-black uppercase" style={{ padding: '4px 8px', fontSize: '0.65rem', gap: '8px' }}>
                              {s} <X size={12} className="cursor-pointer hover:text-primary" onClick={() => removeSkill(s, 'teach')} />
                            </div>
                          ))}
                        </div>
                        <div className="flex w-full">
                          <input
                            type="text"
                            placeholder="OFFER_SKILL"
                            className="input font-mono uppercase"
                            style={{ padding: '1rem', fontSize: '0.875rem', flex: 1, border: '3px solid #000', borderRight: 'none' }}
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
                          }} className="bg-secondary text-white font-black uppercase tracking-widest hover:bg-primary hover:text-secondary border-[3px] border-secondary" style={{ padding: '0 2rem', fontSize: '0.8rem' }}>ADD</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Verification */}
                  {role === 'intermediate' && (
                    <div style={{ paddingBottom: '2rem' }}>
                      <label className="font-black uppercase tracking-widest block" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>CERTIFICATION UPLOAD</label>
                      <div className="relative border-[2px] border-dashed border-secondary bg-surface text-center flex flex-col justify-center items-center" style={{ padding: '3rem' }}>
                        <input
                          type="file"
                          onChange={e => setCertificate(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload size={32} className="text-secondary" style={{ marginBottom: '1rem' }} />
                        <p className="font-mono uppercase text-muted tracking-widest" style={{ fontSize: '0.65rem', marginBottom: '1rem' }}>
                          {certificate ? certificate.name : 'DRAG & DROP CREDENTIALS HERE OR CLICK BUTTON'}
                        </p>
                        <button type="button" className="bg-secondary text-white font-black uppercase border-2 border-secondary" style={{ padding: '8px 24px', fontSize: '0.75rem' }}>
                          UPLOAD_FILES
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Final Action */}
                  <div style={{ marginTop: '1rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary border-[4px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors"
                      style={{ padding: '1.5rem', fontSize: '1.25rem', boxShadow: '12px 12px 0px 0px #000' }}
                    >
                      {loading ? 'INITIALIZING...' : 'INITIALIZE PROFILE'}
                    </button>
                    <p className="text-center font-mono uppercase text-muted" style={{ fontSize: '0.5rem', marginTop: '1rem', letterSpacing: '1px' }}>
                      BY CLICKING INITIALIZE, YOU AGREE TO OUR TERMS_OF_SERVICE.DAT
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
