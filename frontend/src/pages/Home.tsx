import Navbar from '../components/Navbar';
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Home() {
  const homeLinks = [
    { name: "Explore", href: "/#explore" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Community", href: "/community" },
    { name: "Contact Us", href: "/contact-us" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 20 } }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-violet-500/30">
      <Navbar links={homeLinks} />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="absolute top-1/2 left-4 md:left-8 lg:left-12 -translate-y-1/2 z-10 pointer-events-none flex flex-col gap-6 max-w-3xl"
      >
        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-bold tracking-tighter leading-[1.1] text-white">
          <motion.div variants={itemVariants}>
            Learn <span className="text-violet-500">.</span> Teach <span className="text-fuchsia-500">.</span>
          </motion.div>
          <motion.div variants={itemVariants}>
            Grow <span className="text-purple-600">.</span> <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 bg-clip-text text-transparent">Together.</span>
          </motion.div>
        </h1>
        <motion.p 
          variants={itemVariants}
          className="text-white/50 text-sm md:text-sm font-medium tracking-[0.15em] leading-relaxed uppercase max-w-lg"
        >
          The skill swap platform built for real human-to-human learning. Trade your expertise for the knowledge you crave. No subscriptions, just synergy.
        </motion.p>
      </motion.div>
      
      <motion.main 
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
        id="spline-container" 
        className="absolute top-0 right-0 w-full lg:w-[50%] h-full translate-x-[10%] lg:translate-x-[20%] scale-[1.15]"
      >
        <Spline
          scene="https://prod.spline.design/L0wKT2RzDcHntkhx/scene.splinecode" 
        />
      </motion.main>
    </div>
  );
}
