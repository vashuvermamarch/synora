import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import type { Conversation, Message } from '../types';

export default function Chat() {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<number|null>(userId ? parseInt(userId) : null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { api.get('/chat/messages/').then(r=>setConversations(r.data)).catch(()=>{}); }, []);
  useEffect(() => { if(activeChat) loadMsgs(); }, [activeChat]);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

  const loadMsgs = () => { if(activeChat) api.get(`/chat/messages/${activeChat}/`).then(r=>setMessages(r.data)).catch(()=>{}); };

  const sendMsg = async () => {
    if(!input.trim()||!activeChat) return;
    try {
      await api.post('/chat/messages/', { receiver: activeChat, content: input });
      setInput(''); loadMsgs();
    } catch {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">MESSAGES</h1>
      <div className="grid md:grid-cols-[320px_1fr] gap-0 card p-0 overflow-hidden" style={{height:'calc(100vh - 12rem)'}}>
        {/* Sidebar */}
        <div className="border-r-3 border-secondary overflow-y-auto bg-background">
          <div className="p-4 border-b-3 border-secondary bg-secondary text-white"><h3 className="font-bold text-sm">ACTIVE CHATS</h3></div>
          {conversations.length===0 ? <p className="p-4 text-muted text-sm">No conversations yet</p> :
          conversations.map(c=>(
            <button key={c.user_id} onClick={()=>setActiveChat(c.user_id)} className={`w-full text-left p-4 border-b-2 border-secondary/10 hover:bg-surface transition-all ${activeChat===c.user_id?'bg-primary/10 border-l-4 border-l-primary':''}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary text-white border-2 border-secondary flex items-center justify-center font-bold">{c.username.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between"><span className="font-bold text-sm">@{c.username}</span>{c.unread_count>0&&<span className="badge badge-primary text-xs px-1.5">{c.unread_count}</span>}</div>
                  <p className="text-xs text-muted truncate">{c.last_message}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex flex-col bg-surface">
          {!activeChat ? (
            <div className="flex-1 flex items-center justify-center text-muted"><p>Select a conversation</p></div>
          ) : (
            <>
              <div className="p-4 border-b-3 border-secondary bg-secondary text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-primary text-secondary border-2 border-secondary flex items-center justify-center font-bold text-sm">
                  {conversations.find(c=>c.user_id===activeChat)?.username.charAt(0).toUpperCase()||'?'}
                </div>
                <span className="font-bold">@{conversations.find(c=>c.user_id===activeChat)?.username||'User'}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(m=>(
                  <div key={m.id} className={`flex ${m.sender===user?.id?'justify-end':'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 border-3 border-secondary ${m.sender===user?.id?'bg-primary text-secondary':'bg-background'}`}>
                      <p className="text-sm">{m.content}</p>
                      <p className="text-xs mt-1 opacity-60">{new Date(m.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef}/>
              </div>
              <div className="p-4 border-t-3 border-secondary bg-background flex gap-3">
                <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendMsg()} className="input flex-1" placeholder="Type your message..."/>
                <button onClick={sendMsg} className="btn btn-primary px-6"><Send size={18}/> SEND</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
