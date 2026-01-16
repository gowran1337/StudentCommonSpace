import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Temporary user with credentials 1 and 1
    if (email === '1' && password === '1') {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/calendar');
    } else {
      setError('Invalid credentials. Use 1 and 1.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-xl border border-slate-700">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Login</h1>
        
        {error && <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="Enter username"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Enter password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
            />
          </div>
          
          <button
            type="submit"
            className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded transition"
          >
            Sign In
          </button>
        </form>
        
        <p className="mt-4 text-center text-xs text-slate-400">
          Demo credentials: Username: 1, Password: 1
        </p>
      </div>
    </div>
  );
};

export default Login;
