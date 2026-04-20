import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Users, Video, BarChart3, ShieldCheck, Quote } from 'lucide-react';
import heroTech from '../assets/hero-tech.png';
import heroStudent from '../assets/hero-student.png';

export default function Landing() {
  return (
    <main className="bg-white selection:bg-primary selection:text-secondary w-full overflow-x-hidden">
      {/* ═══ HERO SECTION ═══ */}
      <section className="border-b-4 border-secondary w-full flex justify-center bg-white">
        <div className="flex flex-col md:flex-row min-h-[90vh] w-full max-w-[1440px]">

          {/* Left Column */}
          <div className="flex-1 p-8 md:p-20 pt-24 md:pt-40 pr-16 md:pr-32 flex flex-col justify-start gap-6 border-r-4 border-secondary bg-grid relative overflow-hidden">
            <h1 className="text-[clamp(3rem,8vw,8.5rem)] font-black leading-none tracking-tight uppercase animate-slide-up">
              LEARN.<br />
              TEACH.<br />
              <span className="bg-primary px-4 inline-block transform -rotate-1 shadow-brutal">GROW</span><br />
              TOGETHER
            </h1>

            <div className="max-w-xl border-l-8 border-secondary pl-8 py-4">
              <p className="text-2xl font-black text-secondary uppercase leading-tight">
                THE SKILL SWAP PLATFORM BUILT FOR REAL HUMAN-TO-HUMAN LEARNING. TRADE YOUR EXPERTISE FOR THE KNOWLEDGE YOU CRAVE. NO SUBSCRIPTIONS, JUST SYNERGY.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 py-4">
              <Link to="/register" className="btn btn-primary text-2xl px-12 py-5 shadow-brutal-lg">
                GET STARTED
              </Link>
              <Link to="/explore" className="btn btn-white text-2xl px-12 py-5 shadow-brutal-lg">
                EXPLORE SKILLS
              </Link>
            </div>

            {/* Sub-text from reference */}
            <div className="max-w-sm hidden lg:block">
              <p className="font-black text-xs uppercase tracking-widest leading-loose text-secondary/60">
                OUR TOOLS ARE BUILT FOR THE MODERN POLYMATH. DIRECT, EFFECTIVE, AND UNMISTAKABLY FUNCTIONAL.
              </p>
            </div>
          </div>

          {/* Right Column (The Precise Modular Grid) */}
          <div className="flex-1 grid grid-cols-2 grid-rows-2 bg-primary">
            <div className="border-b-4 border-r-4 border-secondary bg-secondary overflow-hidden relative group">
              <img src={heroTech} alt="Abstract Tech" className="w-full h-full object-cover grayscale invert opacity-80 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
            </div>
            <div className="border-b-4 border-secondary bg-white p-12 flex flex-col justify-end relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <div className="w-16 h-16 border-4 border-secondary rounded-full flex items-center justify-center font-black text-2xl">+</div>
              </div>
              <h3 className="text-6xl font-black tracking-tighter">SWAP+</h3>
            </div>
            <div className="border-r-4 border-secondary bg-white overflow-hidden relative group">
              <img src={heroStudent} alt="Student" className="w-full h-full object-cover grayscale group-hover:scale-110 transition-transform duration-700" />
            </div>
            <div className="bg-secondary flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-20"></div>
              <div className="flex gap-8 relative z-10">
                <ArrowRight size={80} className="text-primary transform -rotate-180 animate-pulse" />
                <ArrowRight size={80} className="text-primary animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ CHAOS & CLARITY SECTION ═══ */}
      <section className="bg-white border-b-4 border-secondary pt-32 md:pt-48 pb-64 md:pb-96 px-10 w-full flex justify-center">
        <div className="w-full max-w-[1440px]">





          <div className="flex flex-col md:flex-row justify-between items-start mb-32 gap-10">
            <h2 className="text-6xl md:text-8xl font-black max-w-2xl leading-[0.85]">
              POWERED BY <span className="bg-secondary text-white px-4">CHAOS</span> & CLARITY
            </h2>
            <p className="max-w-sm font-bold text-secondary text-lg uppercase pt-4">
              Our tools are built for the modern polymath. Direct, effective, and unmistakably functional.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 my-32">
            {/* Card 1 */}
            <div className="card p-12 flex flex-col gap-6 h-full hover:-translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-primary border-4 border-secondary flex items-center justify-center shadow-brutal-sm">
                <Zap size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4">AI MENTOR</h3>
                <p className="font-bold text-muted uppercase text-sm leading-relaxed">
                  Our proprietary algorithm doesn't just match tags; it understands your learning velocity and pairs you with the perfect pedagogical partner.
                </p>
              </div>
              <div className="mt-auto border-t-4 border-secondary pt-6 flex justify-between font-black text-xs">
                <span>SYSTEM: ACTIVE</span>
              </div>
            </div>

            {/* Card 2 (Yellow) */}
            <div className="card card-yellow p-12 flex flex-col gap-6 h-full shadow-brutal-lg -rotate-1">
              <div className="w-16 h-16 bg-white border-4 border-secondary flex items-center justify-center shadow-brutal-sm">
                <Users size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4">SKILL MATCHING</h3>
                <p className="font-bold text-secondary uppercase text-sm leading-relaxed">
                  Direct barter for the digital age. Give an hour of Python, get an hour of Pottery. Zero fees, maximum growth potential.
                </p>
              </div>
              <div className="mt-auto border-t-4 border-secondary pt-6 flex justify-between font-black text-xs">
                <span>ALGORITHM: V2.4</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card p-12 flex flex-col gap-6 h-full hover:translate-y-2 transition-transform">
              <div className="w-16 h-16 bg-primary border-4 border-secondary flex items-center justify-center shadow-brutal-sm">
                <Video size={32} />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-4">LIVE SESSIONS</h3>
                <p className="font-bold text-muted uppercase text-sm leading-relaxed">
                  Integrated ultra-low latency video and collaborative whiteboards for a seamless knowledge transfer experience.
                </p>
              </div>
              <div className="mt-auto border-t-4 border-secondary pt-6 flex justify-between font-black text-xs text-primary bg-secondary px-2 py-1">
                <span>UPTIME: 99.9%</span>
              </div>
            </div>
          </div>
          {/* Physical spacer to force a vertical gap from the bottom border */}
          <div className="h-12"></div>
        </div>
      </section>

      {/* ═══ THE PROTOCOL ═══ */}
      <section className="bg-surface border-b-4 border-secondary py-48 md:py-72 w-full flex justify-center">
        <div className="w-full max-w-[1440px] px-10">






          <h2 className="text-6xl md:text-[10rem] font-black text-center mb-12 tracking-tighter leading-none">
            THE PROTOCOL
          </h2>
          <div className="h-6"></div>

          <div className="grid md:grid-cols-3 divide-y-4 md:divide-y-0 md:divide-x-4 divide-secondary border-4 border-secondary">
            {[
              { num: '01', title: 'CHOOSE YOUR ROLE', desc: 'Define your masteries and your mysteries. What do you know? What do you want to conquer?' },
              { num: '02', title: 'MATCH WITH USERS', desc: 'Browse our global directory of hackers, makers, and thinkers. Initiate the swap with one click.' },
              { num: '03', title: 'START LEARNING', desc: 'Jump into a session. Record key takeaways. Level up your profile and earn swap credits.' },
            ].map((step, i) => (
              <div key={i} className="p-12 hover:bg-primary transition-colors cursor-default">
                <span className="text-6xl font-black text-secondary/20 block mb-6">{step.num}</span>
                <h3 className="text-3xl font-black mb-4">{step.title}</h3>
                <p className="font-bold text-muted uppercase text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
          {/* Physical spacer to force a vertical gap from the bottom border */}
          <div className="h-6"></div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-48 md:py-72 px-10 bg-secondary overflow-hidden w-full flex justify-center">
        <div className="w-full max-w-[1440px] flex flex-col gap-12">
          <div className="h-2"></div>
          <div className="flex flex-col md:flex-row gap-16">






            <div className="flex-1 card p-12 relative rotate-1">
              <Quote size={48} className="text-primary mb-8" />
              <p className="text-4xl font-black mb-12 leading-tight uppercase">
                "I TAUGHT REACT AND LEARNED ITALIAN COOKING IN TWO WEEKS. SKILLSWAP IS THE MOST EFFICIENT HUMAN NETWORK I'VE EVER SEEN."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary border-4 border-secondary"></div>
                <div>
                  <p className="font-black text-xl uppercase">MARCO ROSSI</p>
                  <p className="text-xs font-bold text-muted uppercase">FULL STACK CHEF</p>
                </div>
              </div>
            </div>

            <div className="flex-1 card card-yellow p-12 relative -rotate-1 shadow-brutal-lg">
              <Quote size={48} className="text-secondary mb-8" />
              <p className="text-4xl font-black mb-12 leading-tight uppercase text-secondary">
                "THE BARTER ECONOMY IS BACK. I SWAPPED MY MARKETING KNOWLEDGE FOR UI DESIGN TIPS. NO MONEY CHANGED HANDS, JUST VALUE."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border-4 border-secondary"></div>
                <div>
                  <p className="font-black text-xl uppercase">SARAH JENSEN</p>
                  <p className="text-xs font-bold text-secondary uppercase">GROWTH HACKER</p>
                </div>
              </div>
            </div>
          </div>
          <div className="h-2"></div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-secondary text-white py-16 px-10 border-t-4 border-primary w-full flex justify-center">
        <div className="w-full max-w-[1440px] flex flex-col md:flex-row justify-between items-center gap-12">






          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">SKILL/SWAP</h2>
            <p className="font-bold text-white/40 text-xs uppercase">© 2026 SKILL/SWAP. NO RIGHTS RESERVED.</p>
          </div>

          <div className="flex gap-12 font-black text-sm uppercase tracking-widest text-white/60">
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Terms</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Status</a>
            <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Twitter</a>
          </div>

          <div className="flex gap-4">
            <div className="w-6 h-6 bg-primary shadow-brutal-sm"></div>
            <div className="w-6 h-6 bg-white shadow-brutal-sm"></div>
            <div className="w-6 h-6 border-2 border-white shadow-brutal-sm"></div>
          </div>
        </div>
      </footer>
    </main>
  );
}

