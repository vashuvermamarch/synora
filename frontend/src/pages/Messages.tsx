import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';

interface Conversation {
  user_id: number;
  username: string;
  avatar_seed?: string;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
}

interface Message {
  id: number;
  sender: number;
  sender_name: string;
  receiver: number;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export default function Messages() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const dashboardLinks = [
    { name: "DASHBOARD", href: "/dashboard" },
    { name: "EXPLORE", href: "/explore" },
    { name: "MESSAGES", href: "/messages" },
    { name: "SESSIONS", href: "/sessions" },
    { name: "RESOURCES", href: "/resources" },
    { name: "AI LAB", href: "/ai-lab" },
  ];

  const fetchConversations = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/api/chat/messages/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }

      const profileRes = await fetch('http://localhost:8000/api/users/profile/', { headers });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setCurrentUser(profileData);
      }
    } catch (err) {
      console.error("Fetch conversations failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setMsgLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/chat/messages/${userId}/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Fetch messages failed:", err);
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000); // Polling for new conversations
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
    }
  }, [selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:8000/api/chat/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver: selectedUser.user_id,
          content: newMessage
        })
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages(prev => [...prev, msg]);
        setNewMessage('');
        fetchConversations(); // Update sidebar
      }
    } catch (err) {
      alert("Failed to send message.");
    }
  };

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

  return (
    <div className="relative w-full h-screen text-white overflow-hidden selection:bg-violet-500/30">
      <Navbar links={dashboardLinks} rightContent={rightNavContent} />

      <main className="pt-28 pb-6 px-4 md:px-8 max-w-7xl mx-auto h-full relative z-10 flex gap-6 pointer-events-auto">
        
        {/* Sidebar: Conversations */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 h-[calc(100vh-160px)] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold tracking-tight">Messages</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-white/20 italic text-sm">No conversations yet. Start exploring!</div>
            ) : (
              conversations.map((conv) => (
                <button 
                  key={conv.user_id}
                  onClick={() => setSelectedUser(conv)}
                  className={`w-full p-4 rounded-[1.5rem] flex items-center gap-4 transition-all ${
                    selectedUser?.user_id === conv.user_id 
                    ? 'bg-violet-600/20 border border-violet-500/50 shadow-lg' 
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex-shrink-0 overflow-hidden border border-white/5">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conv.avatar_seed || conv.username}`} alt="Avatar" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-white/90 truncate">{conv.username}</h4>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-violet-500 rounded-full text-[10px] flex items-center justify-center font-black">{conv.unread_count}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 truncate mt-0.5">{conv.last_message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Chat Window */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-[calc(100vh-160px)] bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden"
        >
          {selectedUser ? (
            <>
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.avatar_seed || selectedUser.username}`} alt="Avatar" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-none">{selectedUser.username}</h3>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_name !== selectedUser.username;
                    return (
                      <motion.div 
                        key={msg.id || i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] p-4 rounded-2xl text-sm leading-relaxed shadow-xl ${
                          isMe 
                          ? 'bg-violet-600 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-none'
                        }`}>
                          {msg.content}
                          <div className={`text-[10px] mt-2 opacity-40 font-medium ${isMe ? 'text-right' : 'text-left'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSendMessage} className="p-6 bg-white/[0.02] border-t border-white/5 flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center hover:bg-violet-400 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                </motion.button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" /></svg>
              </div>
              <h3 className="text-2xl font-bold tracking-tight">Your Inbox</h3>
              <p className="max-w-xs text-sm italic">Select a conversation to start chatting with your skill swap partners.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
