import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from './Logo';

interface NavbarProps {
  links?: { name: string; href: string }[];
  showActions?: boolean;
  rightContent?: React.ReactNode;
}

export default function Navbar({ links, showActions = true, rightContent }: NavbarProps) {
  const defaultLinks = [
    { name: "Explore", href: "/#explore" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Community", href: "/community" },
    { name: "Contact Us", href: "/contact-us" }
  ];

  const navLinks = links || defaultLinks;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4 pointer-events-none"
    >
      <nav className="flex items-center justify-between px-6 py-3.5 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-3xl border-t border-white/40 border-l border-white/20 border-b border-white/10 border-r border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[inset_0_2px_6px_rgba(255,255,255,0.6),0_16px_48px_rgba(0,0,0,0.7)] rounded-full pointer-events-auto transition-all duration-500">
        
        {/* Left Section: Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 cursor-pointer group pointer-events-auto">
          <Logo />
          <span className="text-white font-bold tracking-tight text-xl">Synora</span>
        </Link>

        {/* Center Section: Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href}
              className="text-white/60 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] text-xs font-bold tracking-widest uppercase transition-colors duration-300 pointer-events-auto"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                {link.name}
              </motion.span>
            </Link>
          ))}
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-5 pointer-events-auto">
          {rightContent ? (
            rightContent
          ) : (
            showActions && (
              <>
                <Link to="/login" className="text-white/70 hover:text-white text-sm font-medium transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                  Login
                </Link>
                <Link to="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-black text-sm font-semibold px-6 py-2.5 rounded-full transition-colors duration-300 hover:bg-white/90"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )
          )}
        </div>

      </nav>
    </motion.div>
  );
}
