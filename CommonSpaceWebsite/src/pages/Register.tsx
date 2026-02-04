import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const defaultProfilePics = ['😀', '😎', '🤓', '🤖', '👽', '🦄', '🐱', '🐶', '🐼', '🦊'];

// Generate a unique flat code in Google Meet style
const generateFlatCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part2 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part1}-${part2}-${part3}`;
};

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [flatCode, setFlatCode] = useState('');
  const [isCreatingNewFlat, setIsCreatingNewFlat] = useState(true);
  const [profilePicture, setProfilePicture] = useState('😀');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Fyll i e-post och lösenord');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Lösenordet måste vara minst 6 tecken');
      setLoading(false);
      return;
    }

    // Generate or validate flat code
    let finalFlatCode = flatCode.trim().toUpperCase();
    if (isCreatingNewFlat) {
      // Generate a new unique code
      finalFlatCode = generateFlatCode();
      
      // Check if code already exists (rare collision)
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 5) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('flat_code')
          .eq('flat_code', finalFlatCode)
          .limit(1);
        
        if (!existing || existing.length === 0) {
          isUnique = true;
        } else {
          finalFlatCode = generateFlatCode();
          attempts++;
        }
      }
    } else {
      // Joining existing flat - validate code exists
      if (!finalFlatCode || finalFlatCode.length < 3) {
        setError('Ange en giltig lägenhetskod');
        setLoading(false);
        return;
      }
    }

    try {
      // Sign up with Supabase and include flat_code in metadata
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            flat_code: finalFlatCode,
            profile_picture: profilePicture
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with additional details
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            profile_picture: profilePicture,
            flat_code: finalFlatCode,
            is_admin: isCreatingNewFlat // First person creating flat becomes admin
          })
          .eq('id', data.user.id);

        if (profileError) {
          console.error('Profile update error:', profileError);
          // Don't show error to user as profile was created by trigger
        }

        // Show success message with the code if creating new flat
        if (isCreatingNewFlat) {
          alert(`Din lägenhetskod: ${finalFlatCode}\n\nDu är nu admin för denna lägenhet.\nDela denna kod med dina rumskamrater!`);
        }

        // Navigate to login
        navigate('/');
      }
    } catch (err) {
      setError('Ett oväntat fel uppstod');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Registrera</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              E-post
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="din@email.com"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Lägenhet
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-3 bg-slate-700 border border-slate-600 rounded cursor-pointer hover:border-purple-400 transition">
                <input
                  type="radio"
                  checked={isCreatingNewFlat}
                  onChange={() => setIsCreatingNewFlat(true)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  disabled={loading}
                />
                <div className="ml-3">
                  <div className="text-white font-medium">Skapa ny lägenhet</div>
                  <div className="text-xs text-slate-400">Generera en unik kod automatiskt</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 bg-slate-700 border border-slate-600 rounded cursor-pointer hover:border-purple-400 transition">
                <input
                  type="radio"
                  checked={!isCreatingNewFlat}
                  onChange={() => setIsCreatingNewFlat(false)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  disabled={loading}
                />
                <div className="ml-3">
                  <div className="text-white font-medium">Gå med i befintlig lägenhet</div>
                  <div className="text-xs text-slate-400">Ange kod från rumskamrat</div>
                </div>
              </label>
            </div>
          </div>

          {!isCreatingNewFlat && (
            <div>
              <label htmlFor="flatCode" className="block text-sm font-medium text-slate-300 mb-2">
                Lägenhetskod *
              </label>
              <input
                type="text"
                id="flatCode"
                value={flatCode}
                onChange={(e) => {
                  setFlatCode(e.target.value);
                  setError('');
                }}
                placeholder="ABC-DEF-GHI"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition uppercase"
                disabled={loading}
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Ange koden du fått från en rumskamrat
              </p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Lösenord
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Välj ett lösenord"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Bekräfta lösenord
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Bekräfta ditt lösenord"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Välj profilbild
            </label>
            <div className="grid grid-cols-5 gap-2">
              {defaultProfilePics.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setProfilePicture(emoji)}
                  className={`text-3xl p-3 rounded hover:bg-slate-600 transition-colors ${
                    profilePicture === emoji ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrerar...' : 'Registrera'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-slate-400">
          Har du redan ett konto?{' '}
          <Link
            to="/"
            className="text-purple-400 hover:text-purple-300 font-medium"
          >
            Logga in här
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
