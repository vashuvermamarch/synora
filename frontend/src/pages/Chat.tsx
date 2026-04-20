import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MessageSquare, Video, MoreVertical, Paperclip, Smile } from 'lucide-react';
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

  const activePartner = conversations.find(c => c.user_id === activeChat);

  return (
    <div className="w-full flex" style={{ height: 'calc(100vh - 80px)' }}> {/* Assuming 80px for standard navbar height */}
      
      {/* LEFT SIDEBAR */}
      <div className="w-[350px] flex-shrink-0 flex flex-col bg-surface border-r-[6px] border-secondary overflow-y-auto">
        
        {/* Profile Block (Omitted PRO and LVL as requested) */}
        <div className="bg-[#E5E7EB] border-b-[6px] border-secondary p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1A1A1A] border-[4px] border-secondary flex items-center justify-center shrink-0">
              <span className="text-white font-black text-2xl">{user?.username?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <span className="font-black uppercase tracking-widest text-xl">@{user?.username}</span>
              <span className="font-mono uppercase text-muted tracking-widest" style={{ fontSize: '0.65rem' }}>{user?.role || 'MEMBER'}</span>
            </div>
          </div>
        </div>

        {/* ACTIVE CHATS HEADER */}
        <div className="bg-secondary text-white flex justify-between items-center p-4 border-b-[6px] border-secondary">
          <h3 className="font-mono uppercase tracking-widest font-bold" style={{ fontSize: '0.75rem' }}>ACTIVE CHATS</h3>
          <MessageSquare size={16} />
        </div>

        {/* Chats List */}
        <div className="flex flex-col flex-1">
          {conversations.length === 0 ? (
            <p className="p-6 font-mono uppercase text-muted text-sm tracking-widest">NO CONVERSATIONS YET.</p>
          ) : (
            conversations.map(c => {
              const isActive = activeChat === c.user_id;
              return (
                <button 
                  key={c.user_id} 
                  onClick={() => setActiveChat(c.user_id)} 
                  className={`w-full text-left p-4 border-b-[4px] border-secondary transition-colors ${isActive ? 'bg-primary' : 'bg-white hover:bg-[#E5E7EB]'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#1A1A1A] border-[3px] border-secondary flex items-center justify-center shrink-0 text-white font-black text-xl">
                      {c.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex justify-between items-end mb-1">
                        <span className="font-black uppercase tracking-widest truncate">{c.username}</span>
                        <span className="font-mono font-bold uppercase text-secondary shrink-0" style={{ fontSize: '0.65rem' }}>
                          {new Date(c.last_timestamp || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className={`font-mono truncate text-xs ${isActive ? 'text-secondary font-bold' : 'text-muted'}`}>{c.last_message}</p>
                        {c.unread_count > 0 && <span className="bg-secondary text-white font-black px-2 py-0.5 text-[0.65rem] border-[2px] border-secondary">{c.unread_count}</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center bg-surface relative" style={{ backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            <div className="bg-white border-[6px] border-secondary p-8" style={{ boxShadow: '12px 12px 0px 0px #000' }}>
              <p className="font-black uppercase tracking-widest text-2xl">SELECT A CONVERSATION</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Header */}
            <div className="bg-white border-b-[6px] border-secondary p-4 flex justify-between items-center z-10 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1A1A1A] border-[3px] border-secondary flex items-center justify-center shrink-0">
                  <span className="text-white font-black text-2xl">{activePartner?.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-black uppercase tracking-tighter text-2xl leading-none">{activePartner?.username}</span>
                  <span className="font-mono uppercase text-muted tracking-widest mt-1" style={{ fontSize: '0.65rem' }}>ACTIVE NOW | MATCH</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="w-12 h-12 bg-white border-[4px] border-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
                  <Video size={24} />
                </button>
                <button className="w-12 h-12 bg-white border-[4px] border-secondary flex items-center justify-center hover:bg-secondary hover:text-white transition-colors" style={{ boxShadow: '4px 4px 0px 0px #000' }}>
                  <MoreVertical size={24} />
                </button>
              </div>
            </div>

            {/* Messages Grid Area */}
            <div className="flex-1 overflow-y-auto p-8 relative flex flex-col gap-8" style={{ backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
              
              {/* Date Separator */}
              <div className="flex justify-center my-4">
                <div className="bg-black text-white font-mono uppercase tracking-widest border-[3px] border-secondary" style={{ padding: '4px 12px', fontSize: '0.65rem' }}>
                  TODAY - {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {messages.map(m => {
                const isMe = m.sender === user?.id;
                return (
                  <div key={m.id} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="relative max-w-[70%]">
                      
                      {/* Name Badge */}
                      <div className={`absolute top-[-10px] ${isMe ? 'right-4 bg-secondary text-white' : 'left-4 bg-black text-white'} border-[2px] border-secondary font-mono uppercase font-bold tracking-widest z-10`} style={{ padding: '2px 6px', fontSize: '0.5rem' }}>
                        {isMe ? 'YOU' : activePartner?.username}
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`${isMe ? 'bg-primary' : 'bg-white'} border-[6px] border-secondary relative z-0 break-words`} style={{ padding: '1.5rem', boxShadow: '12px 12px 0px 0px #000' }}>
                        <p className="font-bold text-lg leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      </div>

                      {/* Timestamp */}
                      <div className={`mt-4 font-mono text-muted uppercase font-bold tracking-widest flex ${isMe ? 'justify-end' : 'justify-start'}`} style={{ fontSize: '0.65rem' }}>
                        {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} {isMe ? ' • READ' : ''}
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef}/>
            </div>

            {/* Input Footer */}
            <div className="bg-white border-t-[6px] border-secondary p-6 z-10 relative">
              <div className="flex gap-4">
                <div className="flex-1 bg-white border-[6px] border-secondary flex items-center relative" style={{ boxShadow: '8px 8px 0px 0px #000' }}>
                  <input 
                    value={input} 
                    onChange={e=>setInput(e.target.value)} 
                    onKeyDown={e=>e.key==='Enter'&&sendMsg()} 
                    className="w-full bg-transparent p-4 font-bold text-lg outline-none placeholder:text-[#A0A0A0]" 
                    placeholder="TYPE YOUR MESSAGE HERE..."
                  />
                  <div className="flex gap-4 px-4 text-secondary absolute right-0">
                    <button className="hover:text-primary transition-colors"><Paperclip size={24} /></button>
                    <button className="hover:text-primary transition-colors"><Smile size={24} /></button>
                  </div>
                </div>
                
                <button 
                  onClick={sendMsg} 
                  className="bg-primary border-[6px] border-secondary font-black uppercase tracking-widest hover:bg-secondary hover:text-white transition-colors" 
                  style={{ padding: '0 2.5rem', fontSize: '1.5rem', boxShadow: '8px 8px 0px 0px #000' }}
                >
                  SEND
                </button>
              </div>

              {/* Status Links */}
              <div className="mt-4 flex gap-6 font-mono uppercase tracking-widest font-bold" style={{ fontSize: '0.65rem', color: '#888' }}>
                <span><span className="inline-block w-2 h-2 bg-[#22C55E] mr-2 border-[1px] border-secondary"></span>{activePartner?.username} IS ONLINE...</span>
                <button className="underline hover:text-secondary">SWAP SETTINGS</button>
                <button className="underline hover:text-secondary">REPORT USER</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
