import { motion, useScroll, useTransform } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import Navbar from '../components/Navbar';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare, Video, Star, Zap, Users, ShieldCheck, Globe } from 'lucide-react';

export default function HowItWorks() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const steps = [
    {
      title: "Create Your Identity",
      desc: "Set up your profile with your unique character avatar. List the skills you've mastered and the ones you're hungry to learn.",
      icon: <Users className="w-8 h-8" />,
      color: "from-violet-600 to-indigo-600",
      delay: 0.2
    },
    {
      title: "Smart Matching",
      desc: "Our ecosystem finds the perfect mentors for you. See live who teaches what you need and who wants your expertise.",
      icon: <Search className="w-8 h-8" />,
      color: "from-fuchsia-600 to-pink-600",
      delay: 0.4
    },
    {
      title: "Human Connection",
      desc: "Send a swap request and start a conversation. No subscriptions or payments—just pure, human-to-human knowledge exchange.",
      icon: <MessageSquare className="w-8 h-8" />,
      color: "from-amber-500 to-orange-500",
      delay: 0.6
    },
    {
      title: "Master New Skills",
      desc: "Join a live session with integrated video calls. Learn, teach, and grow together in our premium glassmorphic environment.",
      icon: <Video className="w-8 h-8" />,
      color: "from-emerald-500 to-teal-500",
      delay: 0.8
    }
  ];

  return (
    <div ref={containerRef} className="relative w-full min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />

      {/* Persistent Spline Background */}
      <div className="fixed top-0 right-0 w-full h-full z-0 opacity-40 pointer-events-none scale-125">
        <Spline scene="https://prod.spline.design/L0wKT2RzDcHntkhx/scene.splinecode" />
      </div>

      <main className="relative z-10 pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Hero Section with Parallax */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-32 space-y-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            The Ecosystem
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
            HOW IT <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">WORKS.</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Synora is built on the principle of synergy. We've simplified the learning process into four elegant steps.
          </p>
        </motion.div>

        {/* Steps Grid with Staggered Reveal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block" />
          
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 50, damping: 20, delay: 0.1 }}
              className={`relative p-12 bg-white/[0.03] backdrop-blur-[50px] border border-white/10 rounded-[3rem] group hover:bg-white/[0.06] transition-all duration-700 ${i % 2 === 1 ? 'lg:mt-32' : ''}`}
            >
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-150 transition-transform duration-1000 rotate-12">
                {step.icon}
              </div>

              <div className="space-y-8 relative z-10">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl shadow-black/50 group-hover:rotate-[10deg] transition-transform duration-500`}>
                  {step.icon}
                </div>

                <div className="space-y-4">
                  <div className="text-white/20 font-black text-6xl tracking-tighter mb-2 italic">0{i + 1}</div>
                  <h3 className="text-3xl font-bold tracking-tight text-white">{step.title}</h3>
                  <p className="text-white/40 leading-relaxed font-medium">
                    {step.desc}
                  </p>
                </div>
                
                <div className="pt-6">
                   <div className="h-px w-full bg-white/5" />
                   <div className="flex items-center gap-4 mt-6">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(j => (
                          <div key={j} className="w-8 h-8 rounded-full border-2 border-black bg-white/10 overflow-hidden">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=step${i}${j}`} alt="User" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Verified Users</span>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic CTA Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-64 relative py-24 px-12 rounded-[4rem] overflow-hidden text-center"
        >
          {/* Animated Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-fuchsia-600/10 to-transparent blur-[100px] animate-pulse" />
          
          <div className="relative z-10 space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              READY TO JOIN THE <br/> <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent italic">SYNERGY?</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto font-medium tracking-wide">
              Start trading your knowledge today. Join thousands of creators, developers, and designers swapping expertise globally.
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(167, 139, 250, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-5 bg-white text-black font-black rounded-full text-sm uppercase tracking-[0.3em] shadow-2xl transition-all"
              >
                Get Started Now
              </motion.button>
            </Link>
          </div>
        </motion.section>

        {/* Feature Highlights with Floating Cards */}
        <div className="mt-64 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Zero Fees", desc: "Pure knowledge exchange without middleman costs.", icon: <Zap className="text-amber-400" /> },
             { title: "Verified Skills", desc: "Trust-based system with peer reviews and ratings.", icon: <ShieldCheck className="text-emerald-400" /> },
             { title: "Global Network", desc: "Connect with experts from all around the world.", icon: <Globe className="text-blue-400" /> }
           ].map((feat, i) => (
             <motion.div
               key={i}
               whileHover={{ y: -10 }}
               className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6"
             >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  {feat.icon}
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold">{feat.title}</h4>
                  <p className="text-white/30 text-sm leading-relaxed">{feat.desc}</p>
                </div>
             </motion.div>
           ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 px-6 mt-32 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center">
             <svg className="w-4 h-4 text-white" viewBox="0 0 100 100" fill="none">
                <circle cx="32" cy="52" r="14" stroke="currentColor" strokeWidth="7" />
                <path d="M12 88C12 76 20 68 32 68C44 68 52 76 52 88" stroke="currentColor" strokeWidth="7" />
                <circle cx="68" cy="28" r="17" fill="currentColor" />
                <path d="M50 62C50 48 58 40 68 40C78 40 86 48 86 62" fill="currentColor" />
             </svg>
          </div>
          <span className="font-bold tracking-tighter text-xl">Synora</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Empowering Human Knowledge • 2024</p>
      </footer>
    </div>
  );
}
