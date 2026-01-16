import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  username: string;
  password: string;
  profilePicture: string;
  quote: string;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get registered users
    const usersJson = localStorage.getItem('users');
    const users: User[] = usersJson ? JSON.parse(usersJson) : [];

    // Check credentials
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUser', username);
      localStorage.setItem('username', username);
      
      // Load user's profile settings
      const savedSettings = localStorage.getItem(`profileSettings_${username}`);
      if (savedSettings) {
        localStorage.setItem('profileSettings', savedSettings);
      } else {
        localStorage.setItem('profileSettings', JSON.stringify({
          username: user.username,
          profilePicture: user.profilePicture,
          quote: user.quote,
          backgroundImage: '',
          theme: 'dark'
        }));
      }
      
      navigate('/calendar');
    } else {
      setError('Fel användarnamn eller lösenord');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Logga in</h1>
        
        {error && <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Ange användarnamn"
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
              placeholder="Ange lösenord"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition"
          >
            Logga in
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm text-slate-400">
          Har du inget konto?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-purple-400 hover:text-purple-300 underline"
          >
            Registrera här
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
