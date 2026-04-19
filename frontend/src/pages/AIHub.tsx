import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import api from '../api/client';

interface ChatMsg { role: 'user'|'ai'; content: string; }

export default function AIHub() {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'ai', content: 'Welcome to the Synora AI Lab! I\'m ready to help you master new design systems or debug your latest build. What are we diving into today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const topics = ['React Patterns','Neo-Brutalist CSS','Python for AI','History of Print','User Research'];

  const sendMessage = async (msg?: string) => {
    const text = msg || input;
    if (!text.trim()) return;
    setMessages(prev=>[...prev, { role: 'user', content: text }]);
    setInput(''); setLoading(true);
    try {
      const res = await api.post('/ai/chat/', { message: text });
      setMessages(prev=>[...prev, { role: 'ai', content: res.data.response }]);
    } catch {
      setMessages(prev=>[...prev, { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-primary border-3 border-secondary flex items-center justify-center"><Sparkles size={24}/></div>
        <div><h1 className="text-4xl font-bold">AI LEARNING LAB</h1><p className="text-muted">Your AI-powered learning companion</p></div>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-0 card p-0 overflow-hidden" style={{height:'calc(100vh - 14rem)'}}>
        {/* Sidebar */}
        <div className="border-r-3 border-secondary bg-background overflow-y-auto">
          <div className="p-4 border-b-3 border-secondary bg-secondary text-white"><h3 className="font-bold text-sm">LEARNING LOG</h3></div>
          <div className="p-3"><button onClick={()=>setMessages([{role:'ai',content:'Starting a new chat! What would you like to learn?'}])} className="btn btn-primary w-full text-xs py-2">NEW CHAT</button></div>
          <div className="px-3 pb-3 space-y-1">
            {topics.map(t=>(<button key={t} onClick={()=>sendMessage(`Tell me about ${t}`)} className="w-full text-left p-2 text-sm hover:bg-surface transition-all border-b border-secondary/10">{t}</button>))}
          </div>
        </div>

        {/* Chat */}
        <div className="flex flex-col bg-surface">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m,i)=>(
              <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[80%] p-3 border-3 border-secondary ${m.role==='user'?'bg-primary text-secondary':'bg-background'}`}>
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="p-3 border-3 border-secondary bg-background text-sm animate-pulse">Thinking...</div></div>}
          </div>
          <div className="p-4 border-t-3 border-secondary bg-background flex gap-3">
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMessage()} className="input flex-1" placeholder="Ask anything..."/>
            <button onClick={()=>sendMessage()} className="btn btn-primary px-6"><Send size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
