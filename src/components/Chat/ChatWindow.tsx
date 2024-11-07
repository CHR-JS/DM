import React, { useState, useRef, useEffect } from 'react';
import { Send, Image, Paperclip, Smile } from 'lucide-react';
import { Profile, Message } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface ChatWindowProps {
  profile: Profile;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

const MOCK_MESSAGES: Message[] = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    content: "Salut ! Comment vas-tu ?",
    timestamp: new Date(Date.now() - 3600000),
    read: true
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    content: "Hey ! Ça va bien merci, et toi ?",
    timestamp: new Date(Date.now() - 3500000),
    read: true
  },
  {
    id: 3,
    senderId: 1,
    receiverId: 2,
    content: "Super ! J'ai vu que tu étudiais à Sciences Po. Quel master fais-tu ?",
    timestamp: new Date(Date.now() - 3400000),
    read: true
  },
  {
    id: 4,
    senderId: 2,
    receiverId: 1,
    content: "Je suis en master de Relations Internationales ! C'est vraiment passionnant, on étudie les enjeux géopolitiques actuels.",
    timestamp: new Date(Date.now() - 3300000),
    read: true
  },
  {
    id: 5,
    senderId: 1,
    receiverId: 2,
    content: "Ça a l'air super intéressant ! J'aimerais beaucoup en savoir plus. Tu voudrais qu'on en discute autour d'un café ?",
    timestamp: new Date(Date.now() - 3200000),
    read: true
  }
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  profile,
  onSendMessage,
}) => {
  const { user } = useAuthStore();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const message: Message = {
        id: Date.now(),
        senderId: user.id,
        receiverId: profile.id,
        content: newMessage.trim(),
        timestamp: new Date(),
        read: false
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      onSendMessage(newMessage);

      // Simulate typing response
      setIsTyping(true);
      setTimeout(() => {
        const response: Message = {
          id: Date.now() + 1,
          senderId: profile.id,
          receiverId: user.id,
          content: "Je réponds bientôt à ton message !",
          timestamp: new Date(),
          read: false
        };
        setMessages(prev => [...prev, response]);
        setIsTyping(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="px-6 py-4 bg-white border-b">
        <div className="flex items-center gap-4">
          <img
            src={profile.photo}
            alt={profile.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-900">{profile.name}</h2>
            <p className="text-sm text-gray-500">{profile.university}</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-6 py-8"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${
                  message.senderId === profile.id ? 'justify-start' : 'justify-end'
                }`}
              >
                <div
                  className={`max-w-[70%] ${
                    message.senderId === profile.id
                      ? 'bg-white'
                      : 'bg-purple-600 text-white'
                  } rounded-2xl px-6 py-3 shadow-sm`}
                >
                  <p className="break-words text-base">{message.content}</p>
                  <p 
                    className={`text-xs mt-2 ${
                      message.senderId === profile.id
                        ? 'text-gray-500'
                        : 'text-purple-100'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                    {!message.read && message.senderId !== profile.id && (
                      <span className="ml-2">✓</span>
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-6 py-3 shadow-sm">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Form */}
      <div className="bg-white border-t p-6">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-end gap-4">
            <div className="flex-1 bg-gray-50 rounded-2xl">
              <div className="flex items-center px-4 py-2 border-b border-gray-100">
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Image className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-end gap-2 p-2">
                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    adjustTextareaHeight();
                  }}
                  placeholder="Écrivez votre message..."
                  className="flex-1 bg-transparent resize-none outline-none max-h-32 min-h-[3rem] p-2"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-4 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;