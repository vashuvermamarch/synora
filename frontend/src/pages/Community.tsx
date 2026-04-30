import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import Navbar from '../components/Navbar';
import { Users, Heart, Zap, Globe, MessageCircle, Star, Quote } from 'lucide-react';

export default function Community() {
  const stats = [
    { label: "Active Swappers", value: "12k+", icon: <Users className="w-5 h-5" /> },
    { label: "Skills Exchanged", value: "450+", icon: <Zap className="w-5 h-5" /> },
    { label: "Countries", value: "85+", icon: <Globe className="w-5 h-5" /> },
    { label: "Average Rating", value: "4.9/5", icon: <Star className="w-5 h-5" /> }
  ];

  const stories = [
    {
      name: "Leo Zhang",
      role: "Creative Director",
      text: "Synora completely changed how I look at networking. I taught UI Design and learned Python in just 3 months through real conversations.",
      avatar: "Leo"
    },
    {
      name: "Sarah Jenkins",
      role: "Fullstack Dev",
      text: "The community here is incredibly supportive. No egos, just pure knowledge exchange. The glassmorphic UI makes every session feel premium.",
      avatar: "Sarah"
    },
    {
      name: "Marcus Thorne",
      role: "3D Artist",
      text: "Finding high-quality mentors for specialized skills used to be expensive. Now, I swap my Blender skills for Marketing expertise for free.",
      avatar: "Marcus"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      <Navbar />

      {/* Background Spline (Consistent Aesthetic) */}
      <div className="fixed top-0 right-0 w-full h-full z-0 opacity-30 pointer-events-none scale-125">
        <Spline scene="https://prod.spline.design/L0wKT2RzDcHntkhx/scene.splinecode" />
      </div>

      <main className="relative z-10 pt-40 pb-24 px-6 max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <div className="text-center space-y-8 mb-40">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-[10px] font-black uppercase tracking-[0.3em]"
          >
            <Heart className="w-3 h-3 fill-fuchsia-400" /> Human-First Ecosystem
          </motion.div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8]">
            THE <br/> <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent italic">SYNERGY</span> <br/> TRIBE.
          </h1>
          
          <p className="text-white/40 text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            A global community of creators, builders, and lifelong learners trading expertise to grow faster together.
          </p>
        </div>

        {/* Stats Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-64"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="p-8 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] text-center space-y-4 hover:bg-white/[0.06] transition-colors group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-white/40 group-hover:text-violet-400">
                {stat.icon}
              </div>
              <div>
                <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Community Voices (Testimonials) */}
        <section className="space-y-20 mb-64">
           <div className="flex items-center gap-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter italic text-white/20">VOICES.</h2>
              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {stories.map((story, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="relative p-10 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-[3rem] group"
                >
                  <Quote className="absolute top-8 right-8 w-12 h-12 text-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl bg-violet-600/20 border border-violet-500/30 overflow-hidden shadow-2xl">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${story.avatar}`} alt={story.name} />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{story.name}</h4>
                        <p className="text-xs text-white/30 font-black uppercase tracking-widest">{story.role}</p>
                      </div>
                    </div>
                    
                    <p className="text-lg text-white/60 leading-relaxed italic">
                      "{story.text}"
                    </p>
                  </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Community Values */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-64">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              OUR <br/> <span className="bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent italic">VALUES.</span>
            </h2>
            <div className="space-y-8">
              {[
                { title: "Radical Trust", desc: "We believe in the power of honest, direct exchange between peers." },
                { title: "Unlimited Growth", desc: "No paywalls, no barriers. Just the skills you need to reach your peak." },
                { title: "True Synergy", desc: "Learning is better when it's shared. Grow yourself by growing others." }
              ].map((value, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-12 h-12 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-400 font-black italic">
                    0{i+1}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-bold">{value.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{value.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, rotate: 10, scale: 0.9 }}
            whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
             <div className="absolute -inset-10 bg-violet-600/20 blur-[120px] animate-pulse rounded-full" />
             <div className="relative aspect-square rounded-[4rem] bg-gradient-to-tr from-violet-600/20 via-white/5 to-transparent border border-white/20 p-12 overflow-hidden flex items-center justify-center">
                <Users className="w-64 h-64 text-white/5" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="text-center space-y-4">
                      <div className="text-8xl font-black tracking-tighter leading-none italic">100%</div>
                      <div className="text-xs font-black uppercase tracking-[0.3em] text-white/30">Community Driven</div>
                   </div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* Global Impact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative py-32 px-12 bg-white/[0.03] backdrop-blur-[100px] border border-white/10 rounded-[4rem] overflow-hidden text-center space-y-12"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/10 blur-[100px]" />
          
          <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter leading-none">
             FIND YOUR <br/> <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">TRIBE.</span>
          </h2>
          
          <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">
             The next skill you master is just one conversation away. Join the world's most synergistic learning network.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(167, 139, 250, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="px-16 py-6 bg-white text-black font-black rounded-full text-sm uppercase tracking-[0.4em] shadow-2xl transition-all"
          >
             Join the Community
          </motion.button>
        </motion.div>

      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <MessageCircle className="w-5 h-5 text-violet-400" />
          <span className="font-bold tracking-tighter text-xl">Synora Synergy</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/10 italic">
          Built with Love by Humans for Humans • 2024
        </p>
      </footer>
    </div>
  );
}
