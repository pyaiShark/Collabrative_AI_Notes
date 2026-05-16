import { useState, useEffect } from 'react';
import { 
  Archive as ArchiveIcon, 
  RotateCcw, 
  Trash2,
  FileText,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

import { useSearch } from '../contexts/SearchContext';

export default function ArchivedNotes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes/archived');
      setNotes(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const restoreNote = async (id: string) => {
    try {
      await api.patch(`/notes/${id}`, { archived: false });
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredNotes = notes;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <header>
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Archive</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Safe storage for notes you're not using right now.</p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[2rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-6 rounded-[2.5rem] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md dark:hover:shadow-black/50 transition-all flex flex-col h-full grayscale-[0.5] hover:grayscale-0 relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-blue-500 dark:group-hover:text-brand-primary group-hover:bg-blue-50 dark:group-hover:bg-brand-primary/10 transition-all">
                    <ArchiveIcon className="w-5 h-5" />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => restoreNote(note.id)}
                      className="p-2 text-gray-400 hover:text-brand-primary transition-colors rounded-full hover:bg-gray-100"
                      title="Restore to Workspace"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteNote(note.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-display font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white mb-2 transition-colors">
                  {note.title}
                </h3>
                
                <p className="text-gray-400 dark:text-gray-500 text-sm line-clamp-2 mb-6 flex-1 leading-relaxed">
                  {note.content || "Archived content"}
                </p>

                <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {note.updated_at ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {notes.length === 0 && (
            <div className="col-span-full py-24 text-center bg-gray-50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <ArchiveIcon className="w-6 h-6 text-gray-200 dark:text-gray-600" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">Nothing in Archive</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
