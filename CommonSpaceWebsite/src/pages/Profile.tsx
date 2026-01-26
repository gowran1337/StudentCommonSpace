import { useState, useEffect } from 'react';

interface ProfileSettings {
  username: string;
  profilePicture: string;
  quote: string;
  backgroundImage: string;
  theme: 'dark' | 'purple' | 'blue' | 'green';
}

const themes = {
  dark: {
    primary: 'purple',
    bg: 'slate-900',
    card: 'slate-800',
  },
  purple: {
    primary: 'purple',
    bg: 'purple-950',
    card: 'purple-900',
  },
  blue: {
    primary: 'blue',
    bg: 'blue-950',
    card: 'blue-900',
  },
  green: {
    primary: 'green',
    bg: 'green-950',
    card: 'green-900',
  },
};

const defaultProfilePics = [
  '😀', '😎', '🤓', '🤖', '👽', '🦄', '🐱', '🐶', '🐼', '🦊',
  '🌟', '⚡', '🔥', '💜', '🎨', '🎮', '🎵', '🚀', '🌈', '✨'
];

function Profile() {
  const savedSettings = localStorage.getItem('profileSettings');
  const initialSettings: ProfileSettings = savedSettings ? JSON.parse(savedSettings) : {
    username: '',
    profilePicture: '😀',
    quote: '',
    backgroundImage: '',
    theme: 'dark',
  };

  const [settings, setSettings] = useState<ProfileSettings>(initialSettings);

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState('');

  useEffect(() => {
    localStorage.setItem('profileSettings', JSON.stringify(settings));
    localStorage.setItem('username', settings.username);
    
    // Also update in users list
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const usersJson = localStorage.getItem('users');
      interface UserInList {
        username: string;
        profilePicture: string;
      }
      const users: UserInList[] = usersJson ? JSON.parse(usersJson) : [];
      const userIndex = users.findIndex((u) => u.username === currentUser);
      
      if (userIndex !== -1) {
        users[userIndex].profilePicture = settings.profilePicture;
        users[userIndex].quote = settings.quote;
        localStorage.setItem('users', JSON.stringify(users));
      }
      
      // Save user-specific settings
      localStorage.setItem(`profileSettings_${currentUser}`, JSON.stringify(settings));
    }
    
    document.body.className = `bg-${themes[settings.theme].bg}`;
  }, [settings]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'profile') {
          setSettings({ ...settings, profilePicture: result });
        } else {
          setSettings({ ...settings, backgroundImage: result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const saveQuote = () => {
    setSettings({ ...settings, quote: tempQuote });
    setIsEditingQuote(false);
  };

  const currentTheme = themes[settings.theme];

  return (
    <div 
      className={`min-h-screen bg-${currentTheme.bg} p-6`}
      style={{
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className={`bg-${currentTheme.card} bg-opacity-95 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-${currentTheme.primary}-500/20`}>
          <h1 className={`text-3xl font-bold text-${currentTheme.primary}-400 mb-6`}>👤 Min Profil</h1>

          {/* Profile Picture Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Profilbild</h2>
            <div className="flex items-center gap-6 mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl overflow-hidden">
                {settings.profilePicture.startsWith('data:') ? (
                  <img src={settings.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{settings.profilePicture}</span>
                )}
              </div>
              <div>
                <label className={`bg-${currentTheme.primary}-600 hover:bg-${currentTheme.primary}-700 text-white px-4 py-2 rounded-lg cursor-pointer inline-block transition-colors`}>
                  Ladda upp bild
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {/* Emoji Selector */}
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">Eller välj en emoji:</p>
              <div className="grid grid-cols-10 gap-2">
                {defaultProfilePics.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSettings({ ...settings, profilePicture: emoji })}
                    className={`text-2xl p-2 rounded hover:bg-slate-600 transition-colors ${
                      settings.profilePicture === emoji ? `bg-${currentTheme.primary}-600` : ''
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Username Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Användarnamn</h2>
            <input
              type="text"
              value={settings.username}
              onChange={(e) => setSettings({ ...settings, username: e.target.value })}
              placeholder="Ange ditt namn..."
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Quote Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Din Quote</h2>
            {isEditingQuote ? (
              <div>
                <textarea
                  value={tempQuote}
                  onChange={(e) => setTempQuote(e.target.value)}
                  placeholder="Skriv din favoritquote..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-400 min-h-[100px]"
                  maxLength={200}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={saveQuote}
                    className={`bg-${currentTheme.primary}-600 hover:bg-${currentTheme.primary}-700 text-white px-4 py-2 rounded-lg transition-colors`}
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingQuote(false);
                      setTempQuote(settings.quote);
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
                onClick={() => {
                  setTempQuote(settings.quote);
                  setIsEditingQuote(true);
                }}
              >
                {settings.quote ? (
                  <p className="text-slate-100 italic">"{settings.quote}"</p>
                ) : (
                  <p className="text-slate-400">Klicka för att lägga till en quote...</p>
                )}
              </div>
            )}
          </div>

          {/* Background Image Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Bakgrundsbild</h2>
            <div className="flex gap-4">
              <label className={`bg-${currentTheme.primary}-600 hover:bg-${currentTheme.primary}-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors`}>
                Ladda upp bakgrund
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'background')}
                  className="hidden"
                />
              </label>
              {settings.backgroundImage && (
                <button
                  onClick={() => setSettings({ ...settings, backgroundImage: '' })}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ta bort bakgrund
                </button>
              )}
            </div>
          </div>

          {/* Theme Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Tema</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(themes).map(([themeName, themeColors]) => (
                <button
                  key={themeName}
                  onClick={() => setSettings({ ...settings, theme: themeName as ProfileSettings['theme'] })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme === themeName
                      ? `border-${themeColors.primary}-400 bg-${themeColors.card}`
                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className={`w-full h-16 rounded bg-gradient-to-br from-${themeColors.primary}-500 to-${themeColors.primary}-700 mb-2`}></div>
                  <p className="text-slate-100 capitalize font-semibold">{themeName}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Save Confirmation */}
          <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-4 text-center">
            <p className="text-green-300">✓ Alla ändringar sparas automatiskt!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
