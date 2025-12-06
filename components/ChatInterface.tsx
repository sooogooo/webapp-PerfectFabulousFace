
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles } from 'lucide-react';
import { ChatSession, ChatMessage, AppSettings } from '../types';
import { generateChatResponse } from '../services/geminiService';
import MarkdownView from './MarkdownView';

interface ChatInterfaceProps {
  settings: AppSettings;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ settings }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: '您好！我是您的美学顾问。关于面部美学、医美项目或日常保养，您有什么想问的吗？', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isLoading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
       const history = messages.map(m => ({ role: m.role, text: m.text }));
       const { text: responseText, suggestedQuestions } = await generateChatResponse(history, text, settings);
       
       const botMsg: ChatMessage = { 
         id: (Date.now()+1).toString(), 
         role: 'model', 
         text: responseText, 
         timestamp: Date.now(),
         suggestedQuestions
       };
       setMessages(prev => [...prev, botMsg]);
    } catch (e) {
       console.error(e);
    } finally {
       setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
       <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((msg) => (
             <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-surface' : 'bg-accent text-white'}`}>
                   {msg.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
                </div>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-surface'}`}>
                   {msg.role === 'user' ? <p className="text-sm">{msg.text}</p> : <MarkdownView content={msg.text} />}
                   
                   {/* Suggested Questions */}
                   {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                     <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-2">
                        {msg.suggestedQuestions.map((q, idx) => (
                           <button 
                             key={idx} 
                             onClick={() => handleSend(q)}
                             className="text-left text-xs text-accent hover:text-primary transition-colors flex items-center gap-1"
                           >
                             <Sparkles size={10} /> {q}
                           </button>
                        ))}
                     </div>
                   )}
                </div>
             </div>
          ))}
          {isLoading && (
             <div className="flex gap-3">
               <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"><Bot size={16} className="text-white"/></div>
               <div className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                 <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
               </div>
             </div>
          )}
          <div ref={bottomRef} />
       </div>

       {/* Input Area */}
       <div className="p-4 bg-surface border-t border-gray-100 no-capture">
          <div className="flex items-center gap-2 bg-background rounded-full px-4 py-2 border border-gray-200">
             <input 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="咨询任何美学问题..."
               className="flex-1 bg-transparent border-none outline-none text-sm"
             />
             <button onClick={() => handleSend()} disabled={!input.trim()} className="text-primary disabled:text-gray-300">
                <Send size={18} />
             </button>
          </div>
       </div>
    </div>
  );
};

export default ChatInterface;
