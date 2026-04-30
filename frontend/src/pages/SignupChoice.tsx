import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const paths = [
  {
    id: 'beginner',
    title: 'BEGINNER',
    tagline: 'I WANT TO LEARN SKILLS',
    description: 'Access the database of elite mentors and start your skill acquisition journey with verified protocols.',
    code: '[ CODE: @01_STUDENT ]',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
      </svg>
    ),
    color: 'from-violet-500/20 to-fuchsia-500/20',
    border: 'border-violet-500/30'
  },
  {
    id: 'intermediate',
    title: 'INTERMEDIATE',
    tagline: 'I CAN TEACH AND LEARN',
    description: 'Engage in bidirectional data transfer. Monetize your expertise while bridging your own knowledge gaps.',
    code: '[ CODE: @02_HYBRID ]',
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30'
  }
];

const features = [
  { id: '01', title: 'VERIFIED', desc: 'ALL MENTORS ARE SUBJECTED TO RIGOROUS SYSTEM VALIDATION.' },
  { id: '02', title: 'DIRECT', desc: 'NO INTERMEDIARIES. DIRECT P2P SKILL TRANSFER PROTOCOLS.', active: true },
  { id: '03', title: 'GLOBAL', desc: 'ACCESS THE NETWORK FROM ANY TERMINAL WORLDWIDE.' }
];

export default function SignupChoice() {
  const navigate = useNavigate();
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
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <Logo />
            <span className="text-white font-bold tracking-tight text-xl">Synora</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-300">
              Back to Home
            </Link>
            <Link to="/login" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              Login
            </Link>
          </div>
        </nav>
      </motion.div>
      
      {/* Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 max-w-4xl"
      >
        <h1 className="text-6xl md:text-8xl font-black text-white leading-tight tracking-tighter mb-4">
          CHOOSE YOUR <br />
          <span className="bg-white text-black px-4 py-1 inline-block mt-2">PATH</span>
        </h1>
        <p className="text-white/50 font-mono tracking-widest text-sm uppercase mt-6">
          SELECT YOUR OPERATIONAL LEVEL TO BEGIN THE SYSTEM HANDSHAKE.
        </p>
      </motion.div>

      {/* Path Cards */}
      <div className="grid md:grid-cols-2 gap-8 w-full max-w-6xl mb-20">
        {paths.map((path, index) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, scale: 0.9, x: index === 0 ? -30 : 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            whileHover={{ y: -10 }}
            onClick={() => navigate(`/signup/${path.id}`)}
            className={`relative group bg-white/[0.03] backdrop-blur-3xl border ${path.border} p-10 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden cursor-pointer`}
          >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            <div className="relative z-10 flex flex-col h-full">
              {/* Icon Container */}
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:border-violet-500/50 group-hover:bg-violet-500/5 transition-all duration-300">
                <div className="text-white group-hover:text-violet-500 transition-colors duration-300">
                  {path.icon}
                </div>
              </div>

              <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">{path.title}</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-violet-500" />
                <p className="text-white font-semibold text-lg tracking-wide">{path.tagline}</p>
              </div>

              <p className="text-white/50 leading-relaxed mb-10 text-sm md:text-base h-20">
                {path.description}
              </p>

              <div className="mt-auto flex items-center justify-between">
                <span className="font-mono text-[10px] text-white/30 tracking-widest">{path.code}</span>
                <Link 
                  to={`/signup/${path.id}`}
                  className={`bg-white text-black font-black px-8 py-3 rounded-lg text-sm tracking-tighter hover:bg-violet-500 hover:text-white transition-all duration-300`}
                >
                  SELECT_PATH
                </Link>
              </div>
            </div>

            {/* Decorative Edge Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-500" />
          </motion.div>
        ))}
      </div>

    </div>
  );
}
