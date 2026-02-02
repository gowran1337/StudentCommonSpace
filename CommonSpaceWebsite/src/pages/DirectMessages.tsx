import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { directMessagesApi, profilesApi, type DirectMessage as ApiDirectMessage, type Profile } from '../services/api';

interface Message {
  id: number;
  sender_id: string;
  sender_username: string;
  receiver_id: string;
  receiver_username: string;
  text: string;
  timestamp: Date;
}

interface Contact {
  id: string;
  name: string;
  profilePicture: string;
  lastMessage?: string;
  unread?: number;
}

function DirectMessages() {
  const { user, flatCode } = useAuth();
  const profileSettings = localStorage.getItem('profileSettings');
  const settings = profileSettings ? JSON.parse(profileSettings) : null;
  const username = settings?.username || user?.email?.split('@')[0] || 'You';
  
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load contacts from profiles
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const profiles = await profilesApi.getFlatMembers();
        const contactsList: Contact[] = profiles.map((p: Profile) => ({
          id: p.id,
          name: p.email?.split('@')[0] || 'Unknown',
          profilePicture: p.profile_picture || '😀'
        }));
        setContacts(contactsList);
        
        // Check if there's a dmTarget from general chat
        const dmTarget = localStorage.getItem('dmTarget');
        if (dmTarget) {
          localStorage.removeItem('dmTarget');
          const targetContact = contactsList.find(c => c.name === dmTarget);
          if (targetContact) {
            setSelectedContact(targetContact);
          }
        }
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Load messages when contact is selected
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedContact) {
        setMessages([]);
        return;
      }
      
      try {
        const data = await directMessagesApi.getConversation(selectedContact.id);
        setMessages(data.map((msg: ApiDirectMessage) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_username: msg.sender_username,
          receiver_id: msg.receiver_id,
          receiver_username: msg.receiver_username,
          text: msg.text,
          timestamp: new Date(msg.created_at)
        })));
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedContact]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!flatCode || !user) return;

    const channel = directMessagesApi.subscribe(flatCode, user.id, (newMsg: ApiDirectMessage) => {
      // Only add if relevant to current conversation
      if (selectedContact && 
          (newMsg.sender_id === selectedContact.id || newMsg.receiver_id === selectedContact.id)) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, {
            id: newMsg.id,
            sender_id: newMsg.sender_id,
            sender_username: newMsg.sender_username,
            receiver_id: newMsg.receiver_id,
            receiver_username: newMsg.receiver_username,
            text: newMsg.text,
            timestamp: new Date(newMsg.created_at)
          }];
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [flatCode, user, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact || !user) return;

    try {
      await directMessagesApi.create({
        receiver_id: selectedContact.id,
        receiver_username: selectedContact.name,
        text: newMessage.trim(),
        sender_username: username
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
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
        <p className="text-white">Laddar kontakter...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      {/* Contacts Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-purple-400">💬 Direktmeddelanden</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="p-4 text-center text-slate-400">
              <p>Inga rumskamrater än</p>
              <p className="text-sm mt-2">
                {flatCode 
                  ? `Dela din lägenhetskod "${flatCode}" med dina rumskamrater!` 
                  : 'Ange en lägenhetskod i din profil först.'}
              </p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left p-4 border-b border-slate-700 transition-colors ${
                  selectedContact?.id === contact.id
                    ? 'bg-slate-700'
                    : 'hover:bg-slate-750'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                      {contact.profilePicture || contact.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-100">{contact.name}</p>
                      <p className="text-sm text-slate-400 truncate max-w-[180px]">
                        {contact.lastMessage || 'Starta en konversation'}
                      </p>
                    </div>
                  </div>
                  {contact.unread && (
                    <span className="bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {contact.unread}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="bg-slate-800 border-b border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {selectedContact.profilePicture || selectedContact.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedContact.name}</h2>
                  <p className="text-sm text-slate-400">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-8">
                  <p className="text-lg">Inga meddelanden än</p>
                  <p className="text-sm">Starta en konversation med {selectedContact.name}! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      <p className="break-words">{msg.text}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {formatTime(msg.timestamp)}
                      </span>
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
                  placeholder={`Skicka meddelande till ${selectedContact.name}...`}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            <div className="text-center">
              <p className="text-2xl mb-2">💬</p>
              <p className="text-lg">Välj en kontakt för att börja chatta</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectMessages;
