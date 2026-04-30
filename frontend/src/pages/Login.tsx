import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Both email and password are required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store tokens
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        setMessage('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        // Handle specific error messages from Django Rest Framework
        const errorMsg = data.non_field_errors?.[0] || data.detail || data.error || 'Invalid email or password.';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col pointer-events-none">
      
      {/* Top Navigation (Minimal for Login) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-8 pointer-events-none"
      >
        <nav className="flex items-center justify-between pointer-events-auto">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <Logo />
            <span className="text-white font-bold tracking-tight text-xl">Synora</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-300">
              Back to Home
            </Link>
            <Link to="/signup" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Sign Up
            </Link>
          </div>
        </nav>
      </motion.div>

      {/* Glassy Centered Login Card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-4 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="w-full max-w-md bg-white/[0.05] backdrop-blur-3xl border-t border-white/40 border-l border-white/20 border-b border-white/10 border-r border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),0_16px_48px_rgba(0,0,0,0.6)] rounded-3xl p-8 pointer-events-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Login to continue learning, teaching, and growing with Synora.
            </p>
          </div>

          {/* Messages */}
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-xs text-center">{error}</div>}
          {message && <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs text-center">{message}</div>}

          {/* Form Content */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-white/70 text-xs font-semibold uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="Enter your email" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.03] transition-all duration-300 shadow-inner"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-white/70 text-xs font-semibold uppercase tracking-wider ml-1">Password</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password" 
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.03] transition-all duration-300 shadow-inner"
              />
            </div>

            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139,92,246,0.5)" }}
              whileTap={{ scale: 0.98 }}
              className={`w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl py-3.5 mt-4 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </motion.button>
          </form>

          {/* Support Section */}
          <div className="mt-6 text-center">
            <p className="text-white/40 text-xs">
              Having trouble logging in? <a href="#" className="text-white/70 hover:text-white transition-colors underline underline-offset-2">Contact support</a> for help.
            </p>
          </div>

          {/* Footer Helper */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm">
              Don't have an account? <Link to="/signup" className="text-white font-medium hover:text-violet-400 transition-colors">Sign Up</Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
