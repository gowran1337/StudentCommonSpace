import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { gdprApi } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

interface ProfileSettings {
  username: string;
  profilePicture: string;
  quote: string;
  backgroundImage: string;
  theme: 'dark' | 'purple' | 'blue' | 'green';
  flatCode?: string;
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [flatMembers, setFlatMembers] = useState<Array<{id: string, email: string, profile_picture: string, is_admin: boolean}>>([]);

  // Save flat code to Supabase
  const saveFlatCodeToSupabase = async (code: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, flat_code: code }, { onConflict: 'id' });
      
      if (error) {
        console.error('Error saving flat code to Supabase:', error);
      }
    } catch (err) {
      console.error('Error saving flat code:', err);
    }
  };

  const initialSettings: ProfileSettings = {
    username: '',
    profilePicture: '😀',
    quote: '',
    backgroundImage: '',
    theme: 'dark',
    flatCode: '',
  };

  const [settings, setSettings] = useState<ProfileSettings>(initialSettings);

  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [tempQuote, setTempQuote] = useState('');

  // Load profile from Supabase on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error loading profile:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          // Migrate old data URLs to emoji
          const migratedProfilePic = data.profile_picture?.startsWith('data:') 
            ? '😀' 
            : (data.profile_picture || '😀');
          
          const loadedSettings: ProfileSettings = {
            username: data.email?.split('@')[0] || '',
            profilePicture: migratedProfilePic,
            quote: '',
            backgroundImage: '',
            theme: 'dark',
            flatCode: data.flat_code || '',
          };
          
          setSettings(loadedSettings);
          setIsAdmin(data.is_admin || false);
          localStorage.setItem('profileSettings', JSON.stringify(loadedSettings));
          localStorage.setItem('flatCode', data.flat_code || '');
          
          // Load flat members if admin
          if (data.is_admin && data.flat_code) {
            const { data: members } = await supabase
              .from('profiles')
              .select('id, email, profile_picture, is_admin')
              .eq('flat_code', data.flat_code);
            
            if (members) {
              setFlatMembers(members);
            }
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (loading) return; // Don't save while loading
    
    localStorage.setItem('profileSettings', JSON.stringify(settings));
    localStorage.setItem('flatCode', settings.flatCode || '');
    
    document.body.className = `bg-${themes[settings.theme].bg}`;
  }, [settings, loading]);

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSettings({ ...settings, backgroundImage: result });
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
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-5xl">
                <span>{settings.profilePicture?.startsWith('data:') ? '😀' : (settings.profilePicture || '😀')}</span>
              </div>
              <p className="text-slate-300">Välj en emoji som din profilbild</p>
            </div>
            
            {/* Emoji Selector */}
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-300 mb-2">Välj en emoji:</p>
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

          {/* Flat Code Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Lägenhetskod</h2>
            <div className={`bg-slate-700 border-2 border-${currentTheme.primary}-500 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm mb-2">Din lägenhetskod:</p>
                  <input
                    type="text"
                    value={settings.flatCode || ''}
                    onChange={(e) => {
                      const newCode = e.target.value.toUpperCase();
                      setSettings({ ...settings, flatCode: newCode });
                      localStorage.setItem('flatCode', newCode);
                    }}
                    onBlur={(e) => {
                      const newCode = e.target.value.toUpperCase();
                      saveFlatCodeToSupabase(newCode);
                    }}
                    placeholder="Ange lägenhetskod..."
                    className={`w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-3 text-2xl font-bold text-${currentTheme.primary}-400 placeholder-slate-400 focus:outline-none focus:border-${currentTheme.primary}-400 uppercase tracking-widest`}
                  />
                </div>
                <div className="text-4xl ml-4">🏠</div>
              </div>
              <p className="text-slate-400 text-sm">
                Dela denna kod med dina rumskamrater så de kan gå med i samma lägenhet. 
                Endast personer med samma kod kan se era gemensamma saker.
              </p>
            </div>
          </div>

          {/* v>

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
                  onChange={handleBackgroundUpload}
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

          {/* Admin Section - Manage Flat Members */}
          {isAdmin && settings.flatCode && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold text-slate-100">👑 Admin - Hantera Lägenhet</h2>
                <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">ADMIN</span>
              </div>
              
              <div className="bg-slate-700 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-300">Lägenhetskod:</p>
                  <div className="flex items-center gap-2">
                    <code className="px-3 py-1 bg-slate-800 rounded text-cyan-400 font-mono font-bold">
                      {settings.flatCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(settings.flatCode!);
                        alert('Kod kopierad!');
                      }}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-sm transition-colors"
                    >
                      Kopiera
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Dela denna kod med dina rumskamrater</p>
              </div>

              <div className="bg-slate-700 rounded-lg p-4">
                <h3 className="font-semibold text-slate-100 mb-3">Rumskamrater ({flatMembers.length})</h3>
                <div className="space-y-2">
                  {flatMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-slate-800 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                          {member.profile_picture?.startsWith('data:') ? '😀' : (member.profile_picture || '😀')}
                        </div>
                        <div>
                          <p className="text-white font-medium">{member.email?.split('@')[0]}</p>
                          <p className="text-xs text-slate-400">{member.email}</p>
                        </div>
                        {member.is_admin && (
                          <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded">ADMIN</span>
                        )}
                      </div>
                      {member.id !== user?.id && (
                        <button
                          onClick={async () => {
                            if (confirm(`Ta bort ${member.email?.split('@')[0]} från lägenheten?`)) {
                              try {
                                await supabase
                                  .from('profiles')
                                  .update({ flat_code: null })
                                  .eq('id', member.id);
                                
                                setFlatMembers(prev => prev.filter(m => m.id !== member.id));
                                alert('Användare borttagen!');
                              } catch (error) {
                                console.error('Error removing user:', error);
                                alert('Kunde inte ta bort användare');
                              }
                            }
                          }}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded transition-colors"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GDPR & Privacy Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">🔒 Integritet & Data (GDPR)</h2>
            
            <div className="bg-slate-700 rounded-lg p-4 space-y-4">
              <div>
                <Link 
                  to="/privacy" 
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  📄 Läs vår Integritetspolicy
                </Link>
                <p className="text-xs text-slate-400 mt-1">
                  Läs om vilken data vi samlar in och hur vi skyddar den
                </p>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h3 className="font-semibold text-slate-100 mb-2">Exportera din data</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Ladda ner all din data i JSON-format (profil, meddelanden, händelser, utgifter)
                </p>
                <button
                  onClick={async () => {
                    if (!user) return;
                    try {
                      await gdprApi.exportUserData(user.id);
                      alert('Din data har laddats ner!');
                    } catch (error) {
                      alert('Kunde inte exportera data');
                    }
                  }}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
                >
                  📥 Ladda ner min data
                </button>
              </div>

              <div className="border-t border-slate-600 pt-4">
                <h3 className="font-semibold text-red-400 mb-2">⚠️ Radera mitt konto</h3>
                <p className="text-sm text-slate-400 mb-3">
                  Detta raderar PERMANENT all din data: profil, meddelanden, händelser, utgifter. 
                  Denna åtgärd kan inte ångras!
                </p>
                <button
                  onClick={async () => {
                    if (!user) return;
                    
                    const confirmed = confirm(
                      '⚠️ VARNING: Detta raderar PERMANENT all din data!\n\n' +
                      '• Din profil\n' +
                      '• Alla dina meddelanden\n' +
                      '• Alla dina kalenderhändelser\n' +
                      '• Alla dina utgifter\n' +
                      '• Alla dina poster på anslagstavlan\n\n' +
                      'Denna åtgärd kan INTE ångras!\n\n' +
                      'Är du HELT SÄKER på att du vill fortsätta?'
                    );
                    
                    if (!confirmed) return;
                    
                    const doubleConfirm = confirm(
                      'Sista chansen!\n\n' +
                      'Skriv OK nedan för att bekräfta permanent radering av ditt konto.'
                    );
                    
                    if (!doubleConfirm) return;
                    
                    try {
                      await gdprApi.deleteUserAccount(user.id);
                      alert('Ditt konto har raderats. Du kommer nu loggas ut.');
                      window.location.href = '/';
                    } catch (error) {
                      alert('Kunde inte radera konto. Kontakta support.');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                >
                  🗑️ Radera mitt konto permanent
                </button>
              </div>
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
