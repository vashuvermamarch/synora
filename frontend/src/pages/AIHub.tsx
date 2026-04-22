import { useState, useEffect } from 'react';
import { MessageSquare, Plus } from 'lucide-react';
import api from '../api/client';

interface ChatMsg { role: 'user' | 'ai'; content: string; }

export default function AIHub() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', content: 'Hello! I am **Synora Opal AI**, your skill-swap assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // Fetch conversations list on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await api.get('/ai/conversations/');
      setConversations(res.data);
    } catch (err) { console.error(err); }
  };

  const loadHistory = async (id: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/ai/chat/history/${id}/`);
      const historyMsgs = res.data.flatMap((c: any) => [
        { role: 'user', content: c.message },
        { role: 'ai', content: c.response }
      ]);
      setMessages(historyMsgs.length > 0 ? historyMsgs : [
        { role: 'ai', content: 'This conversation has no messages yet. Ask me something!' }
      ]);
      setActiveConvId(id);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([{ role: 'ai', content: 'Hello! This is a **new conversation**. What would you like to learn about?' }]);
  };

  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post('/ai/chat/', { 
        message: text,
        conversation_id: activeConvId 
      });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
      if (!activeConvId) {
        setActiveConvId(res.data.conversation_id);
        loadConversations();
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  const renderMessageContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.replace(/```(.*?)\n/, '').replace(/```$/, '');
        return (
          <pre key={index} className="bg-black text-white p-6 my-6 overflow-x-auto border-l-[6px] border-primary brutal-shadow-sm">
            <code className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{code}</code>
          </pre>
        );
      }
      
      // Basic Markdown Replacement Logic
      let processed = part
        .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-black uppercase mt-8 mb-4">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-black uppercase mt-10 mb-6">$2</h2>')
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-secondary underline decoration-primary decoration-[3px]">$1</strong>')
        .replace(/^\* (.*$)/gim, '<div class="flex gap-4 mb-2"><span class="text-secondary font-black">→</span><span>$1</span></div>')
        .replace(/^(\d+)\. (.*$)/gim, '<div class="flex gap-4 mb-2"><span class="text-secondary font-black font-mono">$1.</span><span>$2</span></div>')
        .replace(/^---$/gim, '<hr class="border-t-[4px] border-secondary border-dashed my-8" />')
        .replace(/\n/g, '<br />');

      return (
        <div 
          key={index} 
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: processed }} 
        />
      );
    });
  };

  return (
    <div className="flex w-full bg-[#F5F5F0] border-t-[8px] border-secondary" style={{ height: 'calc(100vh - 80px)' }}>
      {/* Sidebar */}
      <div className="w-[320px] flex-shrink-0 border-r-[8px] border-secondary bg-[#F5F5F0] flex flex-col hidden lg:flex">
        <div className="p-8 border-b-[8px] border-secondary bg-white">
          <h2 className="font-black text-2xl uppercase tracking-tighter">Learning Log</h2>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted mt-1">Your Knowledge Graph</p>
        </div>

        <div className="p-8 border-b-[8px] border-secondary">
          <button
            onClick={startNewChat}
            className="w-full bg-primary border-[4px] border-secondary font-black uppercase tracking-widest py-4 text-lg hover:bg-secondary hover:text-primary transition-colors flex items-center justify-center gap-3"
            style={{ boxShadow: '6px 6px 0px 0px #000', margin: '20px auto', width: 'calc(100% - 40px)' }}
          >
            <Plus size={24} strokeWidth={3} /> NEW CHAT
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-grid">
          {conversations.length === 0 ? (
            <div className="text-center p-8 border-[4px] border-secondary border-dashed text-muted font-mono text-xs uppercase tracking-widest bg-white">
              No chat history yet
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = activeConvId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => loadHistory(c.id)}
                  className={`w-full text-left p-5 font-mono font-bold text-xs flex items-center gap-4 transition-all brutal-border ${isActive ? 'bg-primary brutal-shadow-sm' : 'bg-white hover:bg-surface'}`}
                >
                  <MessageSquare size={18} strokeWidth={3} className={isActive ? 'text-secondary' : 'text-muted'} />
                  <span className="truncate">{c.title}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F5F5F0]">
        <div className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16 space-y-12">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`flex items-center gap-3 mb-3 ${m.role === 'user' ? 'justify-end' : ''}`}
                style={{ 
                  marginLeft: m.role === 'ai' ? '60px' : '0',
                  marginRight: m.role === 'user' ? '60px' : '0'
                }}
              >
                {m.role === 'ai' ? (
                  <>
                    <div className="bg-secondary text-primary font-black px-2 py-1 text-xs leading-none">AI</div>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest">SkillSwap Tutor • 09:41</div>
                  </>
                ) : (
                  <>
                    <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-right">You • 09:42</div>
                    <div className="bg-primary text-secondary border-[2px] border-secondary font-black px-2 py-1 text-xs leading-none">ME</div>
                  </>
                )}
              </div>
              <div
                className={`max-w-[95%] md:max-w-[85%] border-[4px] border-secondary p-8 font-medium text-lg leading-relaxed ${m.role === 'user' ? 'bg-white' : 'bg-primary'}`}
                style={{ 
                  boxShadow: '8px 8px 0px 0px #000',
                  marginLeft: m.role === 'ai' ? '60px' : '0',
                  marginRight: m.role === 'user' ? '60px' : '0'
                }}
              >
                {m.role === 'ai' ? renderMessageContent(m.content) : <div className="whitespace-pre-wrap">{m.content}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-3 mb-3" style={{ marginLeft: '60px' }}>
                <div className="bg-secondary text-primary font-black px-2 py-1 text-xs leading-none">AI</div>
                <div className="font-mono text-[10px] font-bold uppercase tracking-widest">SkillSwap Tutor • Typing...</div>
              </div>
              <div className="border-[4px] border-secondary p-6 font-medium text-lg bg-primary animate-pulse" style={{ boxShadow: '6px 6px 0px 0px #000', marginLeft: '60px' }}>
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-8 border-t-[8px] border-secondary bg-[#F5F5F0]">
          <div className="flex flex-wrap gap-4 mb-6">
            {['Explain React Hooks', 'Debug my Python code', 'Summarize UX Principles'].map(btn => (
              <button
                key={btn}
                onClick={() => setInput(btn)}
                className="bg-white border-[2px] border-secondary font-mono text-[10px] font-bold uppercase tracking-widest px-4 py-3 hover:bg-secondary hover:text-white transition-colors"
              >
                {btn}
              </button>
            ))}
          </div>

          <div className="flex border-[4px] border-secondary" style={{ boxShadow: '8px 8px 0px 0px #000' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-white p-6 font-black text-xl md:text-2xl outline-none placeholder:text-[#A0A0A0]"
              placeholder="ASK ANYTHING..."
            />
            <button
              onClick={() => sendMessage()}
              className="bg-primary border-l-[4px] border-secondary font-black text-xl uppercase px-8 md:px-12 hover:bg-secondary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              SEND <span className="text-2xl">&gt;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
