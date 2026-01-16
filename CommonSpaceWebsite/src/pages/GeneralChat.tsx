import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  user: string;
  text: string;
  timestamp: Date;
  profilePicture?: string;
}

function GeneralChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [userProfilePic, setUserProfilePic] = useState('😀');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load username and profile from localStorage
    const savedUsername = localStorage.getItem('username') || 'Anonymous';
    setUsername(savedUsername);
    
    const profileSettings = localStorage.getItem('profileSettings');
    if (profileSettings) {
      const settings = JSON.parse(profileSettings);
      setUserProfilePic(settings.profilePicture || '😀');
    }

    // Load messages from localStorage
    const savedMessages = localStorage.getItem('generalChatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages).map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    }
  }, []);

  useEffect(() => {
    // Save messages to localStorage
    if (messages.length > 0) {
      localStorage.setItem('generalChatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now(),
        user: username,
        text: newMessage.trim(),
        timestamp: new Date(),
        profilePicture: userProfilePic
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const deleteMessage = (messageId: number) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    localStorage.setItem('generalChatMessages', JSON.stringify(updatedMessages));
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <h1 className="text-2xl font-bold text-purple-400">💬 General Chat</h1>
        <p className="text-slate-400 text-sm">Chatta med alla i utrymmet</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 mt-8">
            <p className="text-lg">Inga meddelanden än</p>
            <p className="text-sm">Var först att säga hej! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.user === username ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-md">
                {msg.user !== username && (
                  <button
                    onClick={() => {
                      localStorage.setItem('dmTarget', msg.user);
                      navigate('/directmessages');
                    }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                    title={`Chatta med ${msg.user}`}
                  >
                    {msg.profilePicture || '😀'}
                  </button>
                )}
                <div
                  className={`px-4 py-2 rounded-lg relative group ${
                    msg.user === username
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <button
                      onClick={() => {
                        if (msg.user !== username) {
                          localStorage.setItem('dmTarget', msg.user);
                          navigate('/directmessages');
                        }
                      }}
                      className={`font-semibold text-sm ${
                        msg.user !== username ? 'hover:underline cursor-pointer' : ''
                      }`}
                    >
                      {msg.user}
                    </button>
                    <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="break-words">{msg.text}</p>
                  {msg.user === username && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      title="Ta bort meddelande"
                    >
                      ×
                    </button>
                  )}
                </div>
                {msg.user === username && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0">
                    {msg.profilePicture || '😀'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="bg-slate-800 border-t border-slate-700 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Skriv ett meddelande..."
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Skicka
          </button>
        </div>
      </form>
    </div>
  );
}

export default GeneralChat;
