import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { gdprApi } from '../services/api';
import { Link } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useConfirm } from '../components/ConfirmDialog';

interface ProfileSettings {
  profilePicture: string;
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
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [flatMembers, setFlatMembers] = useState<Array<{id: string, email: string, profile_picture: string, is_admin: boolean}>>([]);

  // Save flat code to Supabase
  const saveFlatCodeToSupabase = async (code: string) => {
    if (!user) return;
    
    // Normalize: trim whitespace and uppercase for consistent matching
    const normalizedCode = code ? code.trim().toUpperCase() : null;
    
    try {
      console.log('Saving flat code to Supabase:', normalizedCode);
      const { data, error } = await supabase
        .from('profiles')
        .update({ flat_code: normalizedCode })
        .eq('id', user.id)
        .select();
      
      if (error) {
        console.error('Error saving flat code to Supabase:', error);
        showToast('Fel: Kunde inte spara lägenhetskod. ' + error.message, 'error');
      } else {
        console.log('Flat code saved successfully:', data);
        // Update localStorage immediately for other pages to use
        localStorage.setItem('flatCode', normalizedCode || '');
        setSettings(prev => ({ ...prev, flatCode: normalizedCode || '' }));
        // Reload members after saving
        if (normalizedCode) {
          setTimeout(() => loadFlatMembers(), 500);
        }
      }
    } catch (err) {
      console.error('Error saving flat code:', err);
      showToast('Fel: Kunde inte spara lägenhetskod.', 'error');
    }
  };

  // Generate flat code
  const generateFlatCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    return `${part1}-${part2}-${part3}`;
  };

  const handleGenerateFlatCode = async () => {
    if (!user) return;
    
    const confirmed = await confirm({
      title: 'Generera ny lägenhetskod?',
      message: 'Detta kommer att:\n• Skapa en ny lägenhet\n• Göra dig till admin\n• Ta bort dig från din nuvarande lägenhet (om du har en)',
      confirmText: 'Generera',
      cancelText: 'Avbryt',
      danger: true,
    });
    
    if (!confirmed) return;
    
    try {
      let newCode = generateFlatCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Check for collision
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('flat_code', newCode)
          .single();

        if (!existing) break;
        newCode = generateFlatCode();
        attempts++;
      }

      if (attempts === maxAttempts) {
        showToast('Kunde inte generera en unik kod. Försök igen.', 'error');
        return;
      }

      // Update profile with new flat code and set as admin
      await supabase
        .from('profiles')
        .update({ 
          flat_code: newCode,
          is_admin: true
        })
        .eq('id', user.id);

      setSettings({ ...settings, flatCode: newCode });
      setIsAdmin(true);
      localStorage.setItem('flatCode', newCode);

      showToast(`Ny lägenhetskod: ${newCode} — Dela den med dina rumskamrater!`, 'success');
    } catch (error) {
      console.error('Error generating flat code:', error);
      showToast('Kunde inte generera lägenhetskod. Försök igen.', 'error');
    }
  };

  const initialSettings: ProfileSettings = {
    profilePicture: '😀',
    theme: 'dark',
    flatCode: '',
  };

  const [settings, setSettings] = useState<ProfileSettings>(initialSettings);

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
            profilePicture: migratedProfilePic,
            theme: (data.theme as ProfileSettings['theme']) || 'dark',
            flatCode: data.flat_code || '',
          };
          
          setSettings(loadedSettings);
          setIsAdmin(data.is_admin || false);
          localStorage.setItem('profileSettings', JSON.stringify(loadedSettings));
          localStorage.setItem('flatCode', data.flat_code || '');
          
          // Load flat members for users with same flat code
          if (data.flat_code) {
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

  // Function to load flat members
  const loadFlatMembers = useCallback(async () => {
    if (!settings.flatCode) return;

    console.log('Loading flat members for code:', settings.flatCode);
    const { data: members, error } = await supabase
      .from('profiles')
      .select('id, email, profile_picture, is_admin')
      .eq('flat_code', settings.flatCode);
    
    console.log('Flat members query result:', { members, error });
    
    if (members) {
      setFlatMembers(members);
    } else if (error) {
      console.error('Error loading flat members:', error);
    }
  }, [settings.flatCode]);

  // Real-time subscription for flat members updates
  useEffect(() => {
    if (!user || !settings.flatCode) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `flat_code=eq.${settings.flatCode}`
        },
        () => {
          console.log('Profile change detected, reloading members...');
          // Reload flat members when any profile with this flat code changes
          loadFlatMembers();
        }
      )
      .subscribe();

    // Initial load
    loadFlatMembers();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, settings.flatCode, loadFlatMembers]);

  useEffect(() => {
    if (loading) return; // Don't save while loading
    
    // Only save profileSettings to localStorage (flatCode is saved separately via saveFlatCodeToSupabase)
    localStorage.setItem('profileSettings', JSON.stringify({
      profilePicture: settings.profilePicture,
      theme: settings.theme,
      flatCode: settings.flatCode
    }));
    
    document.body.className = `bg-${themes[settings.theme].bg}`;
    
    // Save to Supabase (only profile_picture and theme, NOT flat_code)
    const saveToSupabase = async () => {
      if (!user) return;
      
      try {
        await supabase
          .from('profiles')
          .update({ 
            profile_picture: settings.profilePicture,
            theme: settings.theme
            // flat_code is saved separately via saveFlatCodeToSupabase
          })
          .eq('id', user.id);
      } catch (err) {
        console.error('Error saving profile to Supabase:', err);
      }
    };
    
    saveToSupabase();
  }, [settings.profilePicture, settings.theme, settings.flatCode, loading, user]);

  const currentTheme = themes[settings.theme];

  return (
    <div className={`min-h-screen bg-${currentTheme.bg} p-6`}>
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

          {/* Flat Code Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Lägenhetskod</h2>
            <div className={`bg-slate-700 border-2 border-${currentTheme.primary}-500 rounded-lg p-4`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-slate-300 text-sm mb-2">Din lägenhetskod:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.flatCode || ''}
                      onChange={(e) => {
                        const newCode = e.target.value.toUpperCase();
                        setSettings({ ...settings, flatCode: newCode });
                      }}
                      onBlur={() => {
                        saveFlatCodeToSupabase(settings.flatCode || '');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveFlatCodeToSupabase(settings.flatCode || '');
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="Ange lägenhetskod..."
                      className={`flex-1 bg-slate-600 border border-slate-500 rounded-lg px-4 py-3 text-2xl font-bold text-${currentTheme.primary}-400 placeholder-slate-400 focus:outline-none focus:border-${currentTheme.primary}-400 uppercase tracking-widest`}
                    />
                    <button
                      onClick={() => saveFlatCodeToSupabase(settings.flatCode || '')}
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                      title="Spara lägenhetskod"
                    >
                      💾 Spara
                    </button>
                    <button
                      onClick={handleGenerateFlatCode}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors whitespace-nowrap"
                      title="Generera ny lägenhetskod"
                    >
                      🎲 Generera
                    </button>
                  </div>
                </div>
                <div className="text-4xl ml-4">🏠</div>
              </div>
              <p className="text-slate-400 text-sm">
                Dela denna kod med dina rumskamrater så de kan gå med i samma lägenhet. 
                Endast personer med samma kod kan se era gemensamma saker.
                <strong className="text-yellow-400"> Glöm inte klicka "💾 Spara" efter att du angett koden!</strong>
              </p>
            </div>
          </div>

          {/* v>

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

          {/* Flat Members Section - visible to all users with a flat code */}
          {settings.flatCode && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                {isAdmin ? (
                  <>
                    <h2 className="text-xl font-semibold text-slate-100">👑 Admin - Hantera Lägenhet</h2>
                    <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full">ADMIN</span>
                  </>
                ) : (
                  <h2 className="text-xl font-semibold text-slate-100">🏠 Din Lägenhet</h2>
                )}
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
                        showToast('Kod kopierad!', 'success');
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-100">Rumskamrater ({flatMembers.length})</h3>
                  <button
                    onClick={() => {
                      console.log('Manual refresh clicked');
                      loadFlatMembers();
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded transition-colors"
                  >
                    🔄 Uppdatera
                  </button>
                </div>
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
                      {isAdmin && member.id !== user?.id && (
                        <button
                          onClick={async () => {
                            const ok = await confirm({
                              title: 'Ta bort användare',
                              message: `Vill du ta bort ${member.email?.split('@')[0]} från lägenheten?`,
                              confirmText: 'Ta bort',
                              danger: true,
                            });
                            if (ok) {
                              try {
                                await supabase
                                  .from('profiles')
                                  .update({ flat_code: null })
                                  .eq('id', member.id);
                                
                                setFlatMembers(prev => prev.filter(m => m.id !== member.id));
                                showToast('Användare borttagen!', 'success');
                              } catch (error) {
                                console.error('Error removing user:', error);
                                showToast('Kunde inte ta bort användare', 'error');
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
                      showToast('Din data har laddats ner!', 'success');
                    } catch {
                      showToast('Kunde inte exportera data', 'error');
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
                    
                    const first = await confirm({
                      title: '⚠️ Radera konto permanent',
                      message: 'Detta raderar PERMANENT all din data:\n• Din profil\n• Alla dina meddelanden\n• Alla dina kalenderhändelser\n• Alla dina utgifter\n• Alla dina poster på anslagstavlan\n\nDenna åtgärd kan INTE ångras!',
                      confirmText: 'Ja, radera allt',
                      cancelText: 'Avbryt',
                      danger: true,
                    });
                    
                    if (!first) return;
                    
                    const second = await confirm({
                      title: 'Sista chansen!',
                      message: 'Är du HELT SÄKER? All data försvinner permanent.',
                      confirmText: 'Radera permanent',
                      cancelText: 'Avbryt',
                      danger: true,
                    });
                    
                    if (!second) return;
                    
                    try {
                      await gdprApi.deleteUserAccount(user.id);
                      showToast('Ditt konto har raderats. Du loggas nu ut.', 'success');
                      setTimeout(() => { window.location.href = '/'; }, 2000);
                    } catch {
                      showToast('Kunde inte radera konto. Kontakta support.', 'error');
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
