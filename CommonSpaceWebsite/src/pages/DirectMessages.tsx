import { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender: string;
  receiver: string;
  text: string;
  timestamp: Date;
}

interface Contact {
  name: string;
  profilePicture: string;
  lastMessage?: string;
  unread?: number;
}

interface User {
  username: string;
  profilePicture: string;
}

function DirectMessages() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username') || 'You';
    setUsername(savedUsername);

    // Load all registered users as potential contacts
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];
    
    // Filter out current user and create contact list
    const contactsList = users
      .filter(u => u.username !== savedUsername)
      .map(u => ({
        name: u.username,
        profilePicture: u.profilePicture
      }));
    
    setContacts(contactsList);

    // Check if we should open a specific DM (from general chat click)
    const dmTarget = localStorage.getItem('dmTarget');
    if (dmTarget && contactsList.some(c => c.name === dmTarget)) {
      setSelectedContact(dmTarget);
      localStorage.removeItem('dmTarget');
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      const savedMessages = localStorage.getItem(`dm_${selectedContact}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        setMessages([]);
      }
    }
  }, [selectedContact]);

  useEffect(() => {
    if (selectedContact && messages.length > 0) {
      localStorage.setItem(`dm_${selectedContact}`, JSON.stringify(messages));
    }
  }, [messages, selectedContact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedContact) {
      const message: Message = {
        id: Date.now(),
        sender: username,
        receiver: selectedContact,
        text: newMessage.trim(),
        timestamp: new Date()
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
              <p>Inga andra användare än</p>
              <p className="text-sm mt-2">Vänta på att fler registrerar sig!</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact.name}
                onClick={() => setSelectedContact(contact.name)}
                className={`w-full text-left p-4 border-b border-slate-700 transition-colors ${
                  selectedContact === contact.name
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
                  {contacts.find(c => c.name === selectedContact)?.profilePicture || selectedContact[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100">{selectedContact}</h2>
                  <p className="text-sm text-slate-400">Online</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-slate-500 mt-8">
                  <p className="text-lg">Inga meddelanden än</p>
                  <p className="text-sm">Starta en konversation med {selectedContact}! 👋</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === username ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === username
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
                  placeholder={`Skicka meddelande till ${selectedContact}...`}
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
