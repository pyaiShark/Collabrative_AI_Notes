import { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  StickyNote,
  Archive,
  LogOut,
  Plus,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import api from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import NoteEditor from './pages/NoteEditor';
import PublicNote from './pages/PublicNote';
import Auth from './pages/Auth';
import ArchivedNotes from './pages/Archive';

// --- Auth Context ---
interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => useContext(AuthContext)!;

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('peblo_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('peblo_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem('peblo_token', newToken);
    localStorage.setItem('peblo_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('peblo_token');
    localStorage.removeItem('peblo_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// --- Protected Route ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!token) return <Navigate to="/auth" />;
  return <>{children}</>;
};

// --- Layout ---
const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Always apply dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'My Notes', icon: StickyNote, path: '/notes' },
    { name: 'Archive', icon: Archive, path: '/archive' },
  ];

  return (
    <div className="flex h-screen bg-bg-surface dark:bg-transparent overflow-hidden transition-colors duration-500">
      {/* Drawer Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Desktop & Persistent on Large Screens */}
      <motion.aside
        className={`fixed md:static inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-gray-900/40 dark:backdrop-blur-xl border-r border-gray-200 dark:border-white/10 flex flex-col transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-white/10 mb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/favicon.svg"
              alt="Peblo logo"
              className="w-8 h-8 rounded-lg shadow-lg shadow-brand-primary/20"
            />
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">Peblo</span>
          </Link>
          <div className="flex items-center gap-1">
            <button className="md:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group ${location.pathname === item.path
                  ? 'bg-blue-50 dark:bg-brand-primary/10 text-blue-600 dark:text-brand-primary'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
            >
              <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? 'text-blue-600 dark:text-brand-primary' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent" onClick={() => isProfileMenuOpen && setIsProfileMenuOpen(false)}>
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-gray-900/30 dark:backdrop-blur-xl border-b border-gray-200 dark:border-white/10 gap-6 z-10 transition-colors duration-500">
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={(e) => { e.stopPropagation(); setIsSidebarOpen(true); }}
              className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Peblo</span>
          </div>

          <div className="flex-1 max-w-2xl relative hidden sm:block" />

          <div className="flex items-center gap-3">
            <button className="sm:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
              <StickyNote className="w-5 h-5" />
            </button>
            <div className="h-8 w-[1px] bg-gray-200 mx-1 hidden sm:block" />
            <div className="flex items-center gap-2 relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsProfileMenuOpen(!isProfileMenuOpen); }}
                className="w-10 h-10 rounded-full border border-gray-200 p-0.5 overflow-hidden hover:ring-4 hover:ring-gray-100 transition-all active:scale-95 shadow-sm"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 top-12 w-64 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-6 z-[80]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg shadow-brand-primary/20">
                        {user?.name?.[0].toUpperCase()}
                      </div>
                      <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white truncate w-full">{user?.name}</h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate w-full">{user?.email}</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-transparent">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Quick Action FAB */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl shadow-xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
      >
        <Plus className="w-6 h-6 text-brand-primary" />
      </button>
    </div>
  );
};

export default function App() {
  // Apply dark mode globally for all routes (including standalone pages like PublicNote)
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/shared/:shareId" element={<PublicNote />} />

          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/notes" element={<ProtectedRoute><Layout><Notes /></Layout></ProtectedRoute>} />
          <Route path="/archive" element={<ProtectedRoute><Layout><ArchivedNotes /></Layout></ProtectedRoute>} />
          <Route path="/note/:id" element={<ProtectedRoute><Layout><NoteEditor /></Layout></ProtectedRoute>} />
          <Route path="/note/new" element={<ProtectedRoute><Layout><NoteEditor /></Layout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
