
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Mic, WifiOff, RefreshCw, StopCircle } from 'lucide-react';
import { ChatMessage } from '../types';
import { chatWithAssistant } from '../services/geminiService';

// Helper for Web Speech API
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('krishi_chat_history');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      role: 'model',
      text: 'Namaste! I am your Kisan Sahayak. Ask me anything about your crops, mandi prices, or government schemes.',
      timestamp: new Date().toISOString()
    }];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    localStorage.setItem('krishi_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const handleStatusChange = () => {
      const online = navigator.onLine;
      setIsOffline(!online);
      if (online) syncPendingMessages();
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    if (navigator.onLine) syncPendingMessages();

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-IN'; // Default to Indian English, could be made dynamic
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput(''); // Optional: clear input before listening or append
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const syncPendingMessages = async () => {
    const currentMsgs = JSON.parse(localStorage.getItem('krishi_chat_history') || '[]') as ChatMessage[];
    const pendingMsgs = currentMsgs.filter(m => m.pending && m.role === 'user');

    if (pendingMsgs.length === 0) return;

    setIsLoading(true);
    let updatedMsgs = [...currentMsgs];
    
    for (const msg of pendingMsgs) {
        try {
            const responseText = await chatWithAssistant(msg.text, []);
            const botMsg: ChatMessage = {
                id: Date.now().toString() + Math.random(),
                role: 'model',
                text: responseText,
                timestamp: new Date().toISOString()
            };
            updatedMsgs = updatedMsgs.map(m => m.id === msg.id ? { ...m, pending: false } : m);
            updatedMsgs.push(botMsg);
            setMessages(updatedMsgs);
            localStorage.setItem('krishi_chat_history', JSON.stringify(updatedMsgs));
        } catch (e) {
            console.error("Sync failed for message", msg.id);
        }
    }
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date().toISOString(),
      pending: isOffline
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    if (isOffline) return;

    setIsLoading(true);
    try {
        const responseText = await chatWithAssistant(userMsg.text, []);
        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-leaf-600 p-4 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <div>
            <h2 className="font-bold">Kisan Sahayak</h2>
            {isOffline && <span className="text-xs text-red-200 flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline (Queued)</span>}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded text-white ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}>
            {isOffline ? 'Offline' : 'Online'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] p-3 rounded-xl shadow-sm text-sm relative ${
              msg.role === 'user' 
                ? 'bg-leaf-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              {msg.text}
              <div className={`text-[10px] mt-1 text-right flex justify-end gap-1 items-center ${msg.role === 'user' ? 'text-green-100' : 'text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {msg.pending && <RefreshCw className="w-3 h-3 animate-spin" />}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-3 rounded-xl rounded-bl-none border border-gray-100 flex gap-2 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <button 
            onClick={toggleListening}
            className={`p-3 rounded-full transition flex items-center justify-center ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-500 hover:bg-gray-100'}`}
            title="Voice Input"
        >
            {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <input 
          type="text" 
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-leaf-500 focus:ring-1 focus:ring-leaf-500"
          placeholder={isListening ? "Listening..." : (isOffline ? "Type message (will send when online)..." : "Ask in Hindi, Punjabi, English...")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button 
          onClick={handleSend}
          disabled={(isLoading && !isOffline) || !input.trim()}
          className="bg-leaf-600 text-white p-2 rounded-full hover:bg-leaf-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isOffline ? <RefreshCw className="w-5 h-5" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};
