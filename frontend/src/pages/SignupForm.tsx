import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

export default function SignupForm() {
  const { role } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
  });
  
  const [skillsToLearn, setSkillsToLearn] = useState<string[]>([]);
  const [skillsToTeach, setSkillsToTeach] = useState<string[]>([]);
  const [skillInputLearn, setSkillInputLearn] = useState('');
  const [skillInputTeach, setSkillInputTeach] = useState('');
  const [certificate, setCertificate] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  const addSkill = (type: 'learn' | 'teach') => {
    const input = type === 'learn' ? skillInputLearn : skillInputTeach;
    const currentSkills = type === 'learn' ? skillsToLearn : skillsToTeach;
    const setFunc = type === 'learn' ? setSkillsToLearn : setSkillsToTeach;
    const clearInput = type === 'learn' ? setSkillInputLearn : setSkillInputTeach;

    if (input.trim() && !currentSkills.includes(input.trim().toUpperCase())) {
      setFunc([...currentSkills, input.trim().toUpperCase()]);
      clearInput('');
    }
  };

  const removeSkill = (type: 'learn' | 'teach', skillToRemove: string) => {
    if (type === 'learn') setSkillsToLearn(skillsToLearn.filter(s => s !== skillToRemove));
    else setSkillsToTeach(skillsToTeach.filter(s => s !== skillToRemove));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');

    // Use FormData for file upload support
    const submitData = new FormData();
    submitData.append('username', formData.username);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('password', formData.password);
    submitData.append('confirm_password', formData.confirm_password);
    submitData.append('role', role || 'beginner');
    
    // Add skills
    skillsToLearn.forEach(skill => submitData.append('skills_to_learn', skill));
    skillsToTeach.forEach(skill => submitData.append('skills_to_teach', skill));
    
    // Add certificate if intermediate
    if (role === 'intermediate' && certificate) {
      submitData.append('certificate', certificate);
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/signup/', {
        method: 'POST',
        body: submitData, // Browser sets multipart/form-data automatically
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
        setMessage('Account created! Please verify your email.');
      } else {
        setError(JSON.stringify(data));
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/verify-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp_code: otpCode }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Verification successful!');
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || 'Invalid OTP.');
      }
    } catch (err) {
      setError('Network error during verification.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/auth/resend-otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      setTimer(60);
      setMessage('OTP resent.');
    } catch (err) {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-20 px-6 pointer-events-auto">
      
      {/* Top Navigation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-8 pointer-events-none"
      >
        <nav className="flex items-center justify-between pointer-events-auto">
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <Logo />
            <span className="text-white font-bold tracking-tight text-xl">Synora</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/signup" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-300">
              Change Path
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300">
              Login
            </Link>
          </div>
        </nav>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div 
            key="signup-form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]"
          >
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight uppercase">
                {role} <span className="text-violet-500">Registration</span>
              </h2>
              <p className="text-white/40 text-sm tracking-wide">Enter your credentials to initialize the system handshake.</p>
            </div>

            {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] break-words">{error}</div>}
            {message && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs">{message}</div>}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1">Username</label>
                  <input required value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm" placeholder="system_admin" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1">Email</label>
                  <input required type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm" placeholder="protocol@synora.io" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1">Phone Number</label>
                  <input required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1">Password</label>
                  <input required type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm" placeholder="••••••••" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1">Confirm Password</label>
                <input required type="password" value={formData.confirm_password} onChange={(e) => setFormData({...formData, confirm_password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors text-sm" placeholder="••••••••" />
              </div>

              {/* Tag Systems */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                {/* Skills to Learn */}
                <div className="space-y-3">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1 block">Skills to Learn</label>
                  <div className="flex gap-2">
                    <input value={skillInputLearn} onChange={(e) => setSkillInputLearn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('learn'))} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors text-xs" placeholder="e.g. PYTHON" />
                    <button type="button" onClick={() => addSkill('learn')} className="bg-white/10 text-white font-bold px-4 rounded-xl text-[10px] hover:bg-violet-500 transition-all uppercase">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                    {skillsToLearn.map(skill => (
                      <motion.div key={skill} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 bg-violet-500/20 border border-violet-500/40 text-violet-300 px-2 py-1 rounded-md text-[10px] font-bold">
                        {skill}
                        <button type="button" onClick={() => removeSkill('learn', skill)}>×</button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Skills to Teach (Intermediate Only) */}
                {role === 'intermediate' && (
                  <div className="space-y-3">
                    <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1 block">Skills to Teach</label>
                    <div className="flex gap-2">
                      <input value={skillInputTeach} onChange={(e) => setSkillInputTeach(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('teach'))} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500 transition-colors text-xs" placeholder="e.g. REACT" />
                      <button type="button" onClick={() => addSkill('teach')} className="bg-white/10 text-white font-bold px-4 rounded-xl text-[10px] hover:bg-fuchsia-500 transition-all uppercase">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 min-h-[60px] p-2 bg-white/[0.02] border border-dashed border-white/10 rounded-xl">
                      {skillsToTeach.map(skill => (
                        <motion.div key={skill} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="flex items-center gap-1.5 bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 px-2 py-1 rounded-md text-[10px] font-bold">
                          {skill}
                          <button type="button" onClick={() => removeSkill('teach', skill)}>×</button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Certificate Upload (Intermediate Only) */}
              {role === 'intermediate' && (
                <div className="space-y-2 pt-4 border-t border-white/5">
                  <label className="text-white/50 text-[10px] font-mono tracking-widest uppercase ml-1 block">Upload Certificate (Optional)</label>
                  <div className="relative group">
                    <input type="file" onChange={(e) => setCertificate(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full bg-white/5 border border-dashed border-white/20 rounded-xl px-4 py-4 text-center group-hover:border-violet-500 transition-all">
                      <span className="text-white/40 text-xs font-medium">
                        {certificate ? certificate.name : 'Click to browse or drag and drop certificate file'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(139,92,246,0.3)" }} whileTap={{ scale: 0.98 }} className={`w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black py-3.5 rounded-xl mt-4 transition-all tracking-widest ${loading ? 'opacity-50' : ''}`}>
                {loading ? 'PROCESSING...' : 'OTP (INITIALIZE)'}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          /* OTP Verification Card - Exactly as before but within AnimatePresence */
          <motion.div 
            key="otp-step"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-white/[0.05] backdrop-blur-3xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.6)] text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/20 blur-[100px] -z-10" />
            <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Verification Required</h2>
            <p className="text-white/50 text-xs leading-relaxed mb-10 px-4">We've sent a 6-digit code to your registered email.</p>
            <div className="flex justify-center gap-3 mb-10">
              {otp.map((digit, index) => (
                <input key={index} ref={(el) => (otpRefs.current[index] = el)} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} className="w-12 h-16 bg-black/40 border border-white/10 rounded-2xl text-center text-2xl font-bold text-white focus:outline-none focus:border-violet-500 focus:bg-white/[0.05] transition-all" />
              ))}
            </div>
            <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                <motion.circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="276" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: 276 - (276 * timer) / 60 }} className="text-fuchsia-500" />
              </svg>
              <span className="absolute text-xl font-mono text-white font-bold">{formatTime(timer)}</span>
            </div>
            <p className="text-[10px] text-white/30 tracking-[0.2em] font-mono mb-10 uppercase">Time Remaining</p>
            <motion.button onClick={handleVerifyOtp} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-500/20 mb-6">Verify Identity</motion.button>
            <button onClick={handleResendOtp} disabled={timer > 0 || loading} className={`flex items-center justify-center gap-2 mx-auto text-xs font-medium transition-colors ${timer > 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/60 hover:text-white'}`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Resend Code
            </button>
            <AnimatePresence>{(error || message) && (<motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-6 text-[10px] ${error ? 'text-red-400' : 'text-emerald-400'}`}>{error || message}</motion.p>)}</AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
