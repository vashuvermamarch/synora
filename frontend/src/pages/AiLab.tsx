import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import Navbar from '../components/Navbar';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  History, 
  Bot, 
  User, 
  Loader2, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';

interface Conversation {
  id: number;
  title: string;
  updated_at: string;
}

interface Message {
  id: number;
  message: string;
  response: string;
  created_at: string;
}

export default function AiLab() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const rightNavContent = (
    <div className="flex items-center gap-4">
      <NotificationDropdown />

      <Link to="/profile" className="w-9 h-9 rounded-full border border-white/20 overflow-hidden hover:border-white/40 transition-all duration-300">
        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.avatar_seed || 'Felix'}`} alt="Profile" className="w-full h-full object-cover" />
      </Link>
      <motion.button 
        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(255,255,255,0.2)" }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold tracking-widest uppercase px-5 py-2.5 rounded-full border border-white/10 transition-all duration-300"
      >
        Logout
      </motion.button>
    </div>
  );

  const fetchConversations = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/ai/conversations/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }

      const profileRes = await fetch('http://localhost:8000/api/users/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error("Fetch conversations failed:", err);
    }
  };

  const fetchHistory = async (convId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/api/ai/chat/history/${convId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        setCurrentConvId(convId);
      }
    } catch (err) {
      console.error("Fetch history failed:", err);
    }
  };

  const handleNewChat = () => {
    setCurrentConvId(null);
    setMessages([]);
    setInput('');
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const userMsg = input;
    setInput('');
    setIsLoading(true);

    // Optimistically add message placeholder (or just wait for response since backend handles storage)
    // Actually, backend returns the response and the conversation details.
    
    try {
      const res = await fetch('http://localhost:8000/api/ai/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          conversation_id: currentConvId
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Refresh history to show the new message and response
        await fetchHistory(data.conversation_id);
        if (!currentConvId) {
          fetchConversations(); // Refresh sidebar for new convs
        }
      }
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="relative w-full h-screen text-white overflow-hidden pointer-events-none">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-24 h-full flex relative z-10 pointer-events-auto">
        
        {/* Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="w-80 h-full border-r border-white/10 bg-black/10 backdrop-blur-[100px] flex flex-col p-6 space-y-6 shadow-2xl"
            >
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-3 bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-violet-500/20"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest mb-4 ml-2">
                  <History className="w-3 h-3" />
                  Recent Conversations
                </div>
                {conversations.length === 0 ? (
                  <div className="text-center py-10 text-white/20 italic text-sm">No history yet.</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => fetchHistory(conv.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all border ${
                        currentConvId === conv.id 
                        ? 'bg-white/10 border-white/20 text-white shadow-xl' 
                        : 'bg-transparent border-transparent text-white/40 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium truncate">{conv.title}</span>
                    </button>
                  ))
                )}
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl">
                  <div className="flex items-center gap-2 text-violet-400 font-bold text-xs mb-1">
                    <Sparkles className="w-3 h-3" />
                    Pro Tip
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">Opal AI can help you find learning materials, explain complex topics, and suggest skills to master.</p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <section className="flex-1 flex flex-col relative h-full">
          
          {/* Header */}
          <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between bg-black/5 backdrop-blur-[50px]">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <ChevronLeft className={`w-5 h-5 transition-transform ${isSidebarOpen ? '' : 'rotate-180'}`} />
              </button>
              <div>
                <h2 className="font-bold text-lg">
                  {currentConvId ? conversations.find(c => c.id === currentConvId)?.title : 'New Chat Session'}
                </h2>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Opal AI Online</span>
                </div>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {messages.length === 0 && !isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/20">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Synora <span className="text-violet-400">Opal AI</span></h3>
                  <p className="text-white/40 text-sm leading-relaxed">Your intelligent companion for decentralized skill swapping and collaborative learning. Ask me anything about skills, resources, or mentor matching.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {["How does skill swapping work?", "Find me a Python mentor", "Explain UI Design basics", "Sync my dashboard"].map((q) => (
                    <button 
                      key={q}
                      onClick={() => setInput(q)}
                      className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold text-white/40 hover:bg-white/10 hover:text-white transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-8">
                    {/* User Message */}
                    <div className="flex justify-end items-start gap-4">
                      <div className="max-w-[70%] bg-violet-600 text-white p-5 rounded-2xl rounded-tr-none shadow-xl shadow-violet-500/10 text-sm leading-relaxed">
                        {msg.message}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                        <User className="w-4 h-4 text-white/60" />
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center shrink-0 shadow-lg">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="max-w-[80%] bg-white/[0.03] backdrop-blur-2xl border border-white/10 text-white/90 p-6 rounded-2xl rounded-tl-none shadow-2xl prose prose-invert prose-sm">
                        <ReactMarkdown>{msg.response}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl rounded-tl-none flex items-center gap-3 shadow-xl">
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                      <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Opal is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="p-8 pt-0">
            <form 
              onSubmit={handleSendMessage}
              className="relative max-w-4xl mx-auto group"
            >
              <div className="absolute inset-0 bg-violet-500/20 blur-3xl group-focus-within:bg-violet-500/30 transition-all opacity-0 group-focus-within:opacity-100" />
              <div className="relative flex items-center bg-black/10 border border-white/20 rounded-[2rem] p-2 backdrop-blur-[80px] focus-within:border-violet-500/50 transition-all shadow-2xl">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message to Opal AI..."
                  className="flex-1 bg-transparent border-none px-6 py-4 text-sm text-white focus:outline-none placeholder:text-white/20"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-violet-400 hover:text-white transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="text-center mt-4 text-[9px] text-white/20 uppercase font-black tracking-[0.2em]">
                Opal AI may produce inaccurate information. Powered by Google Gemini.
              </div>
            </form>
          </div>

        </section>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .prose pre {
          background: rgba(255, 255, 255, 0.05) !important;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 1rem;
        }
        .prose code {
          color: #a78bfa;
          background: transparent;
        }
      `}</style>
    </div>
  );
}
