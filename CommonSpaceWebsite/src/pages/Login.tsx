import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { signIn } = useAuth();

    // Load saved credentials on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedEmail && savedPassword) {
            setEmail(savedEmail);
            setPassword(savedPassword);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                // Save or clear credentials based on remember me
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }
                navigate('/profile');
            }
        } catch {
            setError('Ett oväntat fel uppstod');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-800 light:from-slate-100 light:to-slate-200">
            <div className="w-full max-w-md p-8 bg-slate-800 dark:bg-slate-800 light:bg-white rounded-lg shadow-xl border border-slate-700 dark:border-slate-700 light:border-slate-300">
                <h1 className="text-3xl font-bold text-center text-white dark:text-white light:text-slate-900 mb-8">Login</h1>

                {error && (
                    <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-100 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-2">
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
                            className="w-full px-4 py-2 bg-slate-700 dark:bg-slate-700 light:bg-slate-100 border border-slate-600 dark:border-slate-600 light:border-slate-300 rounded text-white dark:text-white light:text-slate-900 placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-300 dark:text-slate-300 light:text-slate-700 mb-2">
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
                            placeholder="Ange ditt lösenord"
                            className="w-full px-4 py-2 bg-slate-700 dark:bg-slate-700 light:bg-slate-100 border border-slate-600 dark:border-slate-600 light:border-slate-300 rounded text-white dark:text-white light:text-slate-900 placeholder-slate-400 dark:placeholder-slate-400 light:placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-800"
                        />
                        <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-300 dark:text-slate-300 light:text-slate-700">
                            Kom ihåg mig
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-medium rounded transition"
                    >
                        {loading ? 'Loggar in...' : 'Logga in'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-slate-300 dark:text-slate-300 light:text-slate-600">
                        Har du inget konto än?
                    </p>
                    <a
                        href="/register"
                        className="inline-block mt-2 text-purple-400 dark:text-purple-400 light:text-purple-600 hover:text-purple-300 dark:hover:text-purple-300 light:hover:text-purple-700 font-medium transition"
                    >
                        Registrera dig här →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Login;
