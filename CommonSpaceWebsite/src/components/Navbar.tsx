import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
    const { signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <nav className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-b border-slate-700 dark:border-slate-700 light:border-slate-300">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-400 dark:text-purple-400 light:text-purple-600">
                    CommonSpace
                </div>
                <ul className="flex gap-6 items-center">
                    <li>
                        <NavLink
                            to="/calendar"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            📅 Calendar
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/bulletinboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            📌 Bulletin Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/taskboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            ✅ Task Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/expenses"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            💰 Expenses
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/drawboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            🎨 Draw Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/generalchat"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            💬 General Chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/directmessages"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            📨 Messages
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 dark:text-purple-400 light:text-purple-600 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-purple-400 dark:hover:text-purple-400 light:hover:text-purple-600 transition'
                            }
                        >
                            👤 Profile
                        </NavLink>
                    </li>
                    <li>
                        <button
                            onClick={toggleTheme}
                            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 light:bg-slate-200 light:hover:bg-slate-300 text-white dark:text-white light:text-slate-800 rounded transition text-lg"
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
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
