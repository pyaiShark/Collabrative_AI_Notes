import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Tag, 
  BrainCircuit, 
  Clock, 
  ArrowRight,
  Plus,
  BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';

export default function Dashboard() {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/insights');
      setInsights(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      const res = await api.post('/notes', { title: 'New Note', content: '' });
      navigate(`/note/${res.data.id}`);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="animate-pulse space-y-8 mt-8">
    <div className="h-32 bg-gray-200 rounded-2xl w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-64 bg-gray-200 rounded-2xl" />
      <div className="h-64 bg-gray-200 rounded-2xl" />
    </div>
  </div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Insights and activity across your workspace.</p>
        </div>
        <button
          onClick={createNote}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all flex items-center gap-2 w-fit text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Note
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Notes', value: insights?.totalNotes, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'AI Summaries', value: insights?.aiStats?.summaries, icon: BrainCircuit, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
          { label: 'Action Items', value: insights?.aiStats?.actionItems, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
          { label: 'Total Tags', value: insights?.mostUsedTags?.length, icon: Tag, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900/40 dark:backdrop-blur-md shadow-sm hover:shadow-md dark:hover:shadow-black/50 transition-all group`}
          >
            <div className={`w-10 h-10 ${stat.bg} dark:bg-white/5 ${stat.color} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-display font-bold text-gray-900 dark:text-white mt-1">{stat.value || 0}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Notes */}
        <section className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-6 rounded-[32px] border border-gray-200 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Recently Edited
            </h2>
            <Link to="/notes" className="text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary text-xs font-bold uppercase tracking-widest transition-colors">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {insights?.recentNotes?.map((note: any) => (
              <Link
                key={note.id}
                to={`/note/${note.id}`}
                className="group p-4 rounded-2xl flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-gray-100 dark:hover:border-white/5"
              >
                <div className="w-10 h-10 bg-gray-50 dark:bg-black/20 rounded-xl flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{note.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Updated {note.updated_at ? new Date(note.updated_at).toLocaleDateString() : '—'}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-brand-primary transition-all group-hover:translate-x-1" />
              </Link>
            ))}
            {(!insights?.recentNotes || insights.recentNotes.length === 0) && (
              <div className="text-center py-12">
                <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">Your notebook is empty.</p>
              </div>
            )}
          </div>
        </section>

        {/* Top Tags */}
        <section className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-6 rounded-[32px] border border-gray-200 dark:border-white/10 shadow-sm">
          <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6 px-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Top Tags
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {insights?.mostUsedTags?.map((tag: any, i: number) => (
              <div
                key={tag.tag}
                className="p-4 rounded-2xl bg-gray-50/50 dark:bg-black/20 hover:bg-gray-50 dark:hover:bg-black/40 border border-gray-100 dark:border-white/5 group transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest transition-colors group-hover:text-brand-primary">#{tag.tag}</span>
                  <span className="text-xs font-bold text-brand-primary">{tag.count}</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((tag.count / 10) * 100, 100)}%` }}
                    className="h-full bg-brand-primary rounded-full transition-all"
                  />
                </div>
              </div>
            ))}
            {(!insights?.mostUsedTags || insights.mostUsedTags.length === 0) && (
              <div className="col-span-2 text-center py-12">
                <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No tags found yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
