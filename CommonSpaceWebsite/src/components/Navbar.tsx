import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <nav className="bg-slate-800 border-b border-slate-700">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-purple-400">
                    CommonSpace
                </div>
                <ul className="flex gap-6 items-center">
                    <li>
                        <NavLink
                            to="/calendar"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            📅 Calendar
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/bulletinboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            📌 Bulletin Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/taskboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            ✅ Task Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/expenses"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            💰 Expenses
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/drawboard"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            🎨 Draw Board
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/generalchat"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            💬 General Chat
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                isActive ? 'text-purple-400 font-medium' : 'text-slate-300 hover:text-purple-400 transition'
                            }
                        >
                            👤 Profile
                        </NavLink>
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
