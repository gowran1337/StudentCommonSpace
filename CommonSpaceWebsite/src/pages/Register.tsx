import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  password: string;
  profilePicture: string;
  quote: string;
}

const defaultProfilePics = ['😀', '😎', '🤓', '🤖', '👽', '🦄', '🐱', '🐶', '🐼', '🦊'];

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState('😀');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Fyll i användarnamn och lösenord');
      return;
    }

    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte');
      return;
    }

    if (password.length < 3) {
      setError('Lösenordet måste vara minst 3 tecken');
      return;
    }

    // Get existing users
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if username already exists
    if (users.some(u => u.username === username)) {
      setError('Användarnamnet är redan taget');
      return;
    }

    // Create new user
    const newUser: User = {
      username,
      password,
      profilePicture,
      quote: ''
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Auto login
    localStorage.setItem('currentUser', username);
    localStorage.setItem('username', username);
    localStorage.setItem('profileSettings', JSON.stringify({
      username,
      profilePicture,
      quote: '',
      backgroundImage: '',
      theme: 'dark'
    }));

    navigate('/profile');
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
            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
              Användarnamn
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder="Välj ett användarnamn"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>
          
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
            className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition"
          >
            Registrera
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-slate-400">
          Har du redan ett konto?{' '}
          <button
            onClick={() => navigate('/')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Logga in här
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
