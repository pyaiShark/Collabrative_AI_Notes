import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BrainCircuit, Calendar, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function PublicNote() {
  const { shareId } = useParams();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPublicNote();
  }, [shareId]);

  const fetchPublicNote = async () => {
    try {
      const res = await api.get(`/shared/${shareId}`);
      setNote(res.data);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent flex items-center justify-center p-4">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-white/10 rounded-2xl mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-white/10 rounded w-32" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-transparent flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4">Note not found.</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">This link might be expired or the note is no longer public.</p>
      <Link to="/auth" className="bg-brand-primary text-white px-8 py-3 rounded-2xl font-bold shadow-md shadow-brand-primary/20">
        Create My Own Workspace
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-transparent pb-20 selection:bg-brand-primary/10">
      <nav className="p-8 flex items-center justify-between max-w-4xl mx-auto border-b border-gray-50 dark:border-white/10 mb-12">
        <Link to="/" className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2.5 tracking-tight group">
          <div className="w-10 h-10 bg-gray-900 dark:bg-white rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-black/10 dark:shadow-white/10">
            <BrainCircuit className="w-6 h-6 text-white dark:text-gray-900" />
          </div>
          Peblo
        </Link>
        <Link to="/auth" className="text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-brand-primary transition-colors">
          Sign In
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto p-6 md:p-0">
        <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <header className="mb-12">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-8">
              {note.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                <Calendar className="w-3.5 h-3.5" />
                Published {note.updated_at ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
              </div>
              
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag: string) => (
                  <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-100 dark:border-white/10">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-xl rounded-[48px] p-10 md:p-16 shadow-sm dark:shadow-black/50 border border-gray-200 dark:border-white/10">
            <div className="markdown-body text-gray-700 dark:text-gray-300 text-lg leading-loose max-w-none">
              <ReactMarkdown>{note.content || "_No content available._"}</ReactMarkdown>
            </div>
          </div>
        </article>

        <footer className="mt-20 pt-10 border-t border-gray-50 dark:border-white/10 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-2">Build your own workspace</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Peblo is the AI-powered thinking environment for modern knowledge workers.</p>
            <Link to="/auth" className="inline-flex items-center gap-3 bg-gray-900 dark:bg-brand-primary text-white px-8 py-4 rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-brand-secondary transition-all shadow-xl shadow-black/10 dark:shadow-brand-primary/20">
              <BrainCircuit className="w-5 h-5 text-brand-primary dark:text-white" />
              Get Started for Free
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
