import { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['','','','','','']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement|null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(s => s.login);
  const email = (location.state as any)?.email || '';

  const handleChange = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const newOtp = [...otp];
    newOtp[i] = v.slice(-1);
    setOtp(newOtp);
    if (v && i < 5) inputs.current[i+1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) inputs.current[i-1]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) { setError('Enter all 6 digits'); return; }
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp/', { email, otp_code: code });
      login(res.data.tokens, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    try { await api.post('/auth/resend-otp/', { email }); setResent(true); setTimeout(()=>setResent(false),5000); } catch {}
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 bg-grid">
      <div className="w-full max-w-[420px] animate-slide-up">
        <div className="bg-white border-4 border-secondary p-10 md:p-14 shadow-[8px_8px_0px_black] space-y-12">
          
          <div className="space-y-4">
            <div className="inline-block bg-secondary text-surface px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
              VERIFICATION_PROTOCOL
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black uppercase tracking-tight">VERIFY EMAIL</h1>
              <p className="text-[10px] font-mono uppercase text-muted tracking-widest leading-relaxed">
                ENTER THE 6-DIGIT CODE SENT TO <span className="text-secondary font-black">{email}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
              <div className="bg-danger/10 border-4 border-danger p-3 text-danger text-[10px] font-black uppercase tracking-widest animate-shake">
                [ AUTH_ERROR ]: {error}
              </div>
            )}

            <div className="flex justify-between gap-2">
              {otp.map((d,i)=>(
                <input 
                  key={i} 
                  ref={el=>{inputs.current[i]=el}} 
                  type="text" 
                  inputMode="numeric" 
                  maxLength={1} 
                  value={d}
                  onChange={e=>handleChange(i,e.target.value)} 
                  onKeyDown={e=>handleKey(i,e)}
                  className="w-full h-16 text-center text-2xl font-black border-4 border-secondary bg-gray-50 focus:bg-white focus:shadow-[4px_4px_0px_var(--color-primary)] outline-none transition-all font-mono"
                />
              ))}
            </div>

            <div className="space-y-6">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-primary border-4 border-secondary py-4 font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_black] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:translate-x-0 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? 'VALIDATING...' : 'INITIALIZE_AUTH'}
              </button>

              <div className="text-center">
                <button 
                  type="button" 
                  onClick={handleResend} 
                  className="font-mono text-[9px] uppercase text-muted tracking-widest hover:text-secondary hover:underline underline-offset-4 transition-all"
                >
                  {resent ? '[ ✓_OTP_RESENT ]' : "[ DIDN'T_RECEIVE?_RESEND_OTP ]"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
