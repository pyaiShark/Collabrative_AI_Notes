import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Loader2, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import { useAuth } from '../App';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await api.post(endpoint, formData);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-transparent relative overflow-hidden transition-colors duration-500">
      {/* Soft focus elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-100 dark:bg-blue-900 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-orange-100 dark:bg-orange-900 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-xl rounded-[48px] p-12 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] dark:shadow-black/50 border border-gray-200 dark:border-white/10">
          <div className="flex justify-center mb-10">
            <div className="w-16 h-16 bg-gray-900 dark:bg-white rounded-[24px] flex items-center justify-center shadow-2xl shadow-black/10 dark:shadow-white/10">
              <BrainCircuit className="w-9 h-9 text-white dark:text-gray-900" />
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
              {isLogin ? 'Welcome Back' : 'Join Peblo'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium text-sm">
              The professional workspace for AI-powered thinking.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold uppercase tracking-widest border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-brand-primary" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 focus:bg-white dark:focus:bg-black/40 dark:text-white transition-all text-sm font-medium"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-brand-primary" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 focus:bg-white dark:focus:bg-black/40 dark:text-white transition-all text-sm font-medium"
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-brand-primary" />
              <input
                type="password"
                placeholder="Password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/5 focus:border-brand-primary/20 focus:bg-white dark:focus:bg-black/40 dark:text-white transition-all text-sm font-medium"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 dark:bg-brand-primary text-white py-4 rounded-3xl font-bold transition-all flex items-center justify-center gap-3 group relative overflow-hidden active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-black/10 hover:bg-black dark:hover:bg-brand-secondary"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <span className="text-sm uppercase tracking-widest">{isLogin ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-gray-400 font-bold uppercase tracking-widest hover:text-brand-primary transition-colors text-[10px]"
            >
              {isLogin ? "Need an account? Sign up" : "Already registered? Sign in"}
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-gray-300 dark:text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; 2024 PEBLO AI WORKSPACE
        </p>
      </motion.div>
    </div>
  );
}
