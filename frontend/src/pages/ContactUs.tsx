import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import Navbar from '../components/Navbar';
import { Mail, MessageSquare, Send, AlertCircle, LifeBuoy } from 'lucide-react';
import { useState } from 'react';

export default function ContactUs() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    problem_description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/users/contact/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSubmitted(true);
        setFormData({ full_name: '', email: '', problem_description: '' });
      }
    } catch (err) {
      console.error("Failed to submit support request:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-hidden">
      <Navbar />

      {/* Background Spline */}
      <div className="fixed top-0 right-0 w-full h-full z-0 opacity-30 pointer-events-none scale-125">
        <Spline scene="https://prod.spline.design/L0wKT2RzDcHntkhx/scene.splinecode" />
      </div>

      <main className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
        
        {/* Left Side: Text Content */}
        <div className="flex-1 space-y-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <LifeBuoy className="w-3 h-3" /> Support Center
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              RAISE A <br/> <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent italic">PROBLEM.</span>
            </h1>
            <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">
              Encountering an issue in the ecosystem? Tell us about it. Our team is dedicated to maintaining the synergy of Synora.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-2">
              <Mail className="w-5 h-5 text-violet-400" />
              <h4 className="font-bold">Email Us</h4>
              <p className="text-xs text-white/30">support@synora.com</p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Glass Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="flex-1 w-full max-w-xl"
        >
          <div className="relative group">
            {/* Form Background Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            
            <form 
              onSubmit={handleSubmit}
              className="relative bg-black/40 backdrop-blur-[100px] border border-white/20 rounded-[3rem] p-10 md:p-12 space-y-8"
            >
              {submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center space-y-6"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-3xl font-bold italic tracking-tight">Report Received!</h3>
                  <p className="text-white/40 max-w-xs mx-auto text-sm leading-relaxed font-medium">
                    Thank you for helping us grow. Our team will review your problem and get back to you within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-violet-400 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                  >
                    Send another report
                  </button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                        placeholder="John Doe"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all placeholder:text-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john@example.com"
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all placeholder:text-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Describe the Problem</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.problem_description}
                        onChange={(e) => setFormData({...formData, problem_description: e.target.value})}
                        placeholder="Explain what happened..."
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all placeholder:text-white/10 resize-none text-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                    <AlertCircle className="w-4 h-4 text-amber-500/50 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-500/50 leading-relaxed font-medium uppercase tracking-wider">
                      Please include any error messages or steps to reproduce the issue for a faster resolution.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full py-5 bg-white text-black font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-violet-400 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </motion.button>
                </>
              )}
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 py-12 px-6 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.5em]">
        Synora Ecosystem Security & Support • 2024
      </footer>
    </div>
  );
}
