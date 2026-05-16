import { useState, useEffect, useRef } from 'react';
import { 
  Search as SearchIcon, 
  Plus, 
  Tag as TagIcon, 
  FileText, 
  Filter,
  Calendar,
  MoreVertical,
  Archive,
  Trash2,
  ExternalLink,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import api from '../services/api';

import { useSearch } from '../contexts/SearchContext';

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const timeDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const timeOptions = [
    { value: 'all',  label: 'All Time',      icon: '∞' },
    { value: '10m',  label: 'Last 10 Min',   icon: '⏱' },
    { value: '30m',  label: 'Last 30 Min',   icon: '⏱' },
    { value: '1h',   label: 'Last 1 Hour',   icon: '🕐' },
    { value: '3h',   label: 'Last 3 Hours',  icon: '🕒' },
    { value: '12h',  label: 'Last 12 Hours', icon: '🕛' },
    { value: '24h',  label: 'Last 24 Hours', icon: '📅' },
    { value: '3d',   label: 'Last 3 Days',   icon: '📅' },
    { value: '7d',   label: 'Last 1 Week',   icon: '📆' },
  ];

  const activeTimeLabel = timeOptions.find(o => o.value === timeFilter)?.label ?? 'All Time';

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data);
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

  const archiveNote = async (id: string) => {
    try {
      await api.patch(`/notes/${id}`, { archived: true });
      setNotes(notes.filter(n => n.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(e.target as Node)) {
        setIsTimeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || note.tags.includes(selectedTag);

    let matchesTime = true;
    if (timeFilter !== 'all') {
      const updatedDate = new Date(note.updated_at);
      const now = new Date();
      const diffMs = now.getTime() - updatedDate.getTime();
      const diffMins = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays  = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === '10m') matchesTime = diffMins  <= 10;
      if (timeFilter === '30m') matchesTime = diffMins  <= 30;
      if (timeFilter === '1h')  matchesTime = diffHours <= 1;
      if (timeFilter === '3h')  matchesTime = diffHours <= 3;
      if (timeFilter === '12h') matchesTime = diffHours <= 12;
      if (timeFilter === '24h') matchesTime = diffHours <= 24;
      if (timeFilter === '3d')  matchesTime = diffDays  <= 3;
      if (timeFilter === '7d')  matchesTime = diffDays  <= 7;
    }

    return matchesSearch && matchesTag && matchesTime;
  });

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Workspace</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">{notes.length} items collected</p>
        </div>
        <button
          onClick={createNote}
          className="bg-brand-primary text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </header>

      {/* Toolbar & Filters */}
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title..."
            className="w-full h-11 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 dark:text-white focus:bg-white dark:focus:bg-black/40 focus:border-brand-primary dark:focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 rounded-xl pl-10 pr-4 text-sm transition-all outline-none"
          />
        </div>
        
        {/* Tag Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full max-w-full">
            <button
              onClick={() => setSelectedTag(null)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                !selectedTag 
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white' 
                : 'bg-white dark:bg-black/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              All Items
            </button>
            {allTags.map(tag => (
              <button
                key={tag as string}
                onClick={() => setSelectedTag(tag as string)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                  selectedTag === tag 
                  ? 'bg-blue-600 dark:bg-brand-primary text-white border-blue-600 dark:border-brand-primary shadow-md shadow-blue-500/20 dark:shadow-brand-primary/20' 
                  : 'bg-white dark:bg-black/20 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                #{tag as string}
              </button>
            ))}
          </div>
          {/* Custom Time Filter Dropdown */}
          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-widest transition-all ${
                timeFilter !== 'all'
                  ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary dark:text-brand-primary'
                  : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/20'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{activeTimeLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isTimeDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-12 z-50 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-black/60 overflow-hidden"
                >
                  <div className="p-2 space-y-0.5">
                    {timeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setTimeFilter(opt.value); setIsTimeDropdownOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                          timeFilter === opt.value
                            ? 'bg-brand-primary/10 text-brand-primary font-bold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 font-medium'
                        }`}
                      >
                        <span className="text-base leading-none">{opt.icon}</span>
                        <span>{opt.label}</span>
                        {timeFilter === opt.value && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-56 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="group bg-white dark:bg-gray-900/40 dark:backdrop-blur-md p-6 rounded-[2rem] border border-gray-200 dark:border-white/10 shadow-sm hover:shadow-md dark:hover:shadow-black/50 transition-all cursor-pointer relative flex flex-col h-full"
                onClick={() => navigate(`/note/${note.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary transition-all">
                    <FileText className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveNote(note.id);
                    }}
                    className="p-2 text-gray-300 hover:text-orange-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
                
                <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white group-hover:text-brand-primary transition-colors mb-2 leading-snug">
                  {note.title}
                </h3>
                
                <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                  {note.content || "No content added yet."}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {note.tags.map((tag: string) => (
                    <span key={tag} className="text-[10px] font-bold text-gray-400 dark:text-gray-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-50 dark:bg-white/10 group-hover:bg-gray-100 dark:group-hover:bg-brand-primary/20 dark:group-hover:text-brand-primary transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {note.updated_at
                      ? new Date(note.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'No date'}
                  </span>
                  {note.public && (
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm shadow-green-500/20" title="Publicly accessible" />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredNotes.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-black/20 rounded-[3rem] border border-dashed border-gray-200 dark:border-white/10">
              <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <SearchIcon className="w-6 h-6 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs">No matching results</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                className="text-brand-primary font-bold text-sm mt-4 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
