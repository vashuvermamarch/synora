import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';

export default function GlobalLayout() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black selection:bg-violet-500/30">

      {/* Global 3D Spline Scene Background */}
      <motion.main 
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        id="global-spline-container"
        className="fixed inset-0 w-screen h-screen pointer-events-auto z-0 scale-[1.25]"
      >
        <Spline scene="https://prod.spline.design/AdwLJO1hbC4YKWIH/scene.splinecode" />
      </motion.main>

      {/* Child Pages go here */}
      <div className="relative z-10 w-full min-h-screen pointer-events-none">
        <Outlet />
      </div>
    </div>
  );
}
