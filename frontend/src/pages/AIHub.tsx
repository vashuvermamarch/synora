import { useState } from 'react';

import api from '../api/client';

interface ChatMsg { role: 'user' | 'ai'; content: string; }

export default function AIHub() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', content: 'hello how can i help you to learn skills' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Dynamic Chat History state
  const [chatHistory] = useState<{ id: number; name: string; icon: any }[]>([]);

  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post('/ai/chat/', { message: text });
      setMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
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
          <pre key={index} className="bg-black text-white p-6 my-6 overflow-x-auto">
            <code className="font-mono text-sm leading-relaxed whitespace-pre-wrap">{code}</code>
          </pre>
        );
      }
      return <span key={index}>{part}</span>;
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
            onClick={() => setMessages([{ role: 'ai', content: 'hello how can i help you to learn skills' }])}
            className="bg-primary border-[4px] border-secondary font-black uppercase tracking-widest py-4 text-lg hover:bg-secondary hover:text-primary transition-colors block"
            style={{
              boxShadow: '6px 6px 0px 0px #000',
              margin: '20px auto',
              width: 'calc(100% - 40px)'
            }}
          >
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="text-center p-6 border-[4px] border-secondary border-dashed text-muted font-mono text-xs uppercase tracking-widest">
              No recent chats
            </div>
          ) : (
            chatHistory.map((t, index) => {
              const Icon = t.icon;
              const isActive = index === 0;
              return (
                <button
                  key={t.id}
                  onClick={() => sendMessage(`Tell me about ${t.name}`)}
                  className={`w-full text-left p-4 font-mono font-bold text-sm flex items-center gap-4 transition-all ${isActive ? 'bg-primary border-[4px] border-secondary' : 'bg-transparent border-[4px] border-transparent hover:bg-white hover:border-secondary'}`}
                  style={isActive ? { boxShadow: '4px 4px 0px 0px #000' } : {}}
                >
                  <Icon size={20} strokeWidth={3} /> {t.name}
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
