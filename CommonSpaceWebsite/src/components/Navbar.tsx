import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/theme-context';

const Navbar = () => {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <nav className="bg-slate-800 dark:bg-slate-800 light:bg-white border-b border-slate-700 dark:border-slate-700 light:border-slate-200">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-400">
                    CommonSpace
                </div>
                <ul className="flex gap-6 items-center">
                    <li>
                        <NavLink
                            to="/calendar"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            📅 Calendar
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/bulletinboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            📌 Bulletin Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/taskboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            ✅ Task Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/expenses"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            💰 Expenses
                        </NavLink>
                    </li>

                    <li>
                        <NavLink
                            to="/generalchat"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            💬 General Chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 transition'
                            }
                        >
                            👤 Profile
                        </NavLink>
                    </li>
                    <li>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-slate-700 dark:bg-slate-700 light:bg-slate-200 text-yellow-400 dark:text-yellow-400 light:text-slate-700 hover:bg-slate-600 dark:hover:bg-slate-600 light:hover:bg-slate-300 transition"
                            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm font-medium"
                        >
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
