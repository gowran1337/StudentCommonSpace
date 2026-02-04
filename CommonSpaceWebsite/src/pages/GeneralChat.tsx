import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { messagesApi, type Message as ApiMessage } from '../services/api';
import { supabase } from '../lib/supabase';

interface Message {
  id: number;
  user: string;
  user_id: string;
  text: string;
  timestamp: Date;
  profilePicture?: string;
}

function GeneralChat() {
  const { user, flatCode } = useAuth();
  const [userProfilePic, setUserProfilePic] = useState('😀');

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load user profile from Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('profile_picture, email')
          .eq('id', user.id)
          .single();
        
        if (data) {
          const migratedPic = data.profile_picture?.startsWith('data:') ? '😀' : (data.profile_picture || '😀');
          setUserProfilePic(migratedPic);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      }
    };
    
    loadUserProfile();
  }, [user]);

  // Load messages from Supabase
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await messagesApi.getAll();
        setMessages(data.map((msg: ApiMessage) => ({
          id: msg.id,
          user: msg.username,
          user_id: msg.user_id,
          text: msg.text,
          timestamp: new Date(msg.created_at),
          profilePicture: msg.profile_picture
        })));
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && flatCode) {
      loadMessages();
    } else {
      setLoading(false);
    }

    // Cleanup: Clear messages when component unmounts or user changes
    return () => {
      setMessages([]);
    };
  }, [user, flatCode]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!flatCode) return;

    const channel = messagesApi.subscribe(flatCode, (newMsg: ApiMessage) => {
      // Only add if not already in list (avoid duplicates from own messages)
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, {
          id: newMsg.id,
          user: newMsg.username,
          user_id: newMsg.user_id,
          text: newMsg.text,
          timestamp: new Date(newMsg.created_at),
          profilePicture: newMsg.profile_picture
        }];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [flatCode]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    // Always use the email from the authenticated user
    const currentUsername = user.email?.split('@')[0] || 'Anonymous';

    try {
      await messagesApi.create({
        username: currentUsername,
        text: newMessage.trim(),
        profile_picture: userProfilePic,
        user_id: user.id
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      await messagesApi.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <p className="text-white">Laddar meddelanden...</p>
      </div>
    );
  }

  // Show warning if no flatCode
  if (!flatCode) {
    return (
      <div className="flex flex-col h-screen bg-slate-900">
        <div className="bg-slate-800 border-b border-slate-700 p-4">
          <h1 className="text-2xl font-bold text-purple-400">💬 General Chat</h1>
          <p className="text-slate-400 text-sm">Chatta med alla i utrymmet</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-8 max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Lägenhetskod saknas</h2>
            <p className="text-slate-300 mb-6">
              Du måste ange en lägenhetskod i din profil för att kunna chatta med dina rumskamrater.
            </p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
            >
              Gå till Profil
            </button>
          </div>
        </div>
      </div>
    );
  }

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
              className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start gap-2 max-w-md">
                {msg.user_id !== user?.id && (
                  <button
                    onClick={() => {
                      localStorage.setItem('dmTarget', msg.user);
                      navigate('/directmessages');
                    }}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0 hover:scale-110 transition-transform cursor-pointer"
                    title={`Chatta med ${msg.user}`}
                  >
                    {msg.profilePicture?.startsWith('data:') ? '😀' : (msg.profilePicture || '😀')}
                  </button>
                )}
                <div
                  className={`px-4 py-2 rounded-lg relative group ${
                    msg.user_id === user?.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-700 text-slate-100'
                  }`}
                >
                  <div className="flex items-baseline gap-2 mb-1">
                    <button
                      onClick={() => {
                        if (msg.user_id !== user?.id) {
                          localStorage.setItem('dmTarget', msg.user);
                          navigate('/directmessages');
                        }
                      }}
                      className={`font-semibold text-sm ${
                        msg.user_id !== user?.id ? 'hover:underline cursor-pointer' : ''
                      }`}
                    >
                      {msg.user}
                    </button>
                    <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="break-words">{msg.text}</p>
                  {msg.user_id === user?.id && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
                      title="Ta bort meddelande"
                    >
                      ×
                    </button>
                  )}
                </div>
                {msg.user_id === user?.id && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl flex-shrink-0">
                    {msg.profilePicture?.startsWith('data:') ? '😀' : (msg.profilePicture || '😀')}
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
