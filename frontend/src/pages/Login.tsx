import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { email, password });
      login(res.data.tokens, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F5F5F0',
      backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 16px',
    }}>
      {/* Card wrapper with yellow accent */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>

        {/* Yellow accent box (top-right) */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          backgroundColor: '#FFD100',
          border: '4px solid #000',
          zIndex: 0,
        }} />

        {/* Black shadow box */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: '#000',
          transform: 'translate(8px, 8px)',
          zIndex: 1,
        }} />

        {/* Main white card */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: '#fff',
          border: '4px solid #000',
          padding: '48px',
        }}>

          {/* SECURE GATEWAY tag */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{
              display: 'inline-block',
              backgroundColor: '#000',
              color: '#fff',
              padding: '4px 12px',
              fontSize: '10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
            }}>
              SECURE GATEWAY
            </span>
          </div>

          {/* LOGIN heading */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '64px',
              fontWeight: 900,
              lineHeight: 1,
              textTransform: 'uppercase',
              letterSpacing: '-0.04em',
              color: '#000',
              margin: '0 0 8px 0',
              fontFamily: 'Outfit, sans-serif',
            }}>
              LOGIN
            </h1>
            <p style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'rgba(0,0,0,0.7)',
              margin: 0,
            }}>
              ACCESS THE SKILL SWAP PROTOCOL.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                backgroundColor: 'rgba(229,62,62,0.1)',
                border: '4px solid #E53E3E',
                padding: '12px 16px',
                marginBottom: '24px',
                color: '#E53E3E',
                fontSize: '10px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontFamily: 'JetBrains Mono, monospace',
              }}>
                [ AUTH_ERROR ]: {error}
              </div>
            )}

            {/* USERNAME_ID */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#000',
                marginBottom: '10px',
                fontFamily: 'Outfit, sans-serif',
              }}>
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="USER@SKILLSWAP.ORG"
                style={{
                  width: '100%',
                  border: '4px solid #000',
                  padding: '16px 18px',
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  backgroundColor: '#fff',
                  boxSizing: 'border-box',
                  color: '#000',
                }}
              />
            </div>

            {/* EMAIL_ENDPOINT */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: '#000',
                marginBottom: '10px',
                fontFamily: 'Outfit, sans-serif',
              }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder='enter your password'
                  style={{
                    width: '100%',
                    border: '4px solid #000',
                    padding: '16px 52px 16px 18px',
                    fontSize: '13px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box',
                    color: '#000',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#000',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* SEND OTP Button */}
            <div style={{ marginBottom: '32px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#FFD100',
                  border: '4px solid #000',
                  padding: '18px 24px',
                  fontSize: '16px',
                  fontWeight: 900,
                  fontFamily: 'Outfit, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  boxShadow: '6px 6px 0px #000',
                  transition: 'transform 0.1s, box-shadow 0.1s',
                  color: '#000',
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.target as HTMLButtonElement).style.transform = 'translate(3px, 3px)';
                    (e.target as HTMLButtonElement).style.boxShadow = '3px 3px 0px #000';
                  }
                }}
                onMouseLeave={e => {
                  (e.target as HTMLButtonElement).style.transform = 'translate(0,0)';
                  (e.target as HTMLButtonElement).style.boxShadow = '6px 6px 0px #000';
                }}
              >
                {loading ? 'WAIT...' : 'SIGN IN'}
              </button>
            </div>

            {/* Divider + Footer */}
            <div style={{
              borderTop: '1px solid rgba(0,0,0,0.1)',
              paddingTop: '24px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '11px',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#6B7280',
                margin: 0,
              }}>
                DON'T HAVE AN ACCOUNT?{' '}
                <Link
                  to="/register"
                  style={{
                    color: '#000',
                    fontWeight: 900,
                    textDecoration: 'underline',
                    textUnderlineOffset: '4px',
                  }}
                >
                  SIGN UP
                </Link>
              </p>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
