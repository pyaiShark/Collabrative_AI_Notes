import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  BrainCircuit, 
  Tag as TagIcon, 
  Share2, 
  Eye, 
  Archive,
  Trash2,
  X,
  Plus,
  Loader2,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const saveTimeout = useRef<any>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchNote();
    } else {
      setNote({ title: 'New Note', content: '', tags: [], public: false });
      setLoading(false);
    }
  }, [id]);

  const fetchNote = async () => {
    try {
      const res = await api.get(`/notes`);
      const currentNote = res.data.find((n: any) => n.id === id);
      if (!currentNote) {
        // Check archived too
        const archRes = await api.get('/notes/archived');
        const archNote = archRes.data.find((n: any) => n.id === id);
        if (archNote) setNote(archNote);
        else navigate('/notes');
      } else {
        setNote(currentNote);
      }
    } catch (e) {
      console.error(e);
      navigate('/notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: any) => {
    setNote((prev: any) => ({ ...prev, ...updates }));
    
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        if (id && id !== 'new') {
          await api.patch(`/notes/${id}`, updates);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
    }, 1000);
  };

  const generateAI = async () => {
    if (!id || id === 'new') return;
    setAiLoading(true);
    try {
      const res = await api.post(`/notes/${id}/ai`);
      const { summary, action_items, suggested_title } = res.data;
      
      const newContent = `${note.content}\n\nAI Summary:\n${summary}\n\nAction Items:\n${action_items.map((it: string) => `• ${it}`).join('\n')}`;
      
      await handleUpdate({ 
        content: newContent, 
        title: note.title === 'New Note' || note.title === 'Untitled Note' ? suggested_title : note.title 
      });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    if (newTag && !note.tags.includes(newTag)) {
      handleUpdate({ tags: [...note.tags, newTag] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    handleUpdate({ tags: note.tags.filter((t: string) => t !== tag) });
  };

  const togglePublic = async () => {
    await handleUpdate({ public: !note.public });
  };

  const shareUrl = `${window.location.origin}/shared/${note?.shareId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
  </div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <nav className="flex items-center justify-between pb-4">
        <button 
          onClick={() => navigate('/notes')}
          className="p-2 -ml-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 ${saving ? 'text-brand-primary opacity-100' : 'text-gray-300 opacity-60'} mr-4`}>
            {saving ? 'Saving...' : 'Synced'}
          </span>
          <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-xl">
            <button
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isPreview ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isPreview ? 'bg-white dark:bg-gray-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              Preview
            </button>
          </div>
          <div className="w-[1px] h-6 bg-gray-200 dark:bg-white/10 mx-2" />
          <button
            onClick={() => setShowShare(true)}
            className={`p-2 rounded-xl transition-all ${note.public ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-500/20' : 'hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 border border-transparent'}`}
            title="Share Settings"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={generateAI}
            disabled={aiLoading}
            className="p-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 shadow-lg shadow-black/10 dark:shadow-white/10"
            title="AI Enhancement"
          >
            {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <div className="bg-white dark:bg-gray-900/40 dark:backdrop-blur-xl rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] dark:shadow-black/50 border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col min-h-[75vh] transition-colors duration-500">
        <div className="p-10 border-b border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-black/20">
          <input
            type="text"
            value={note.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            placeholder="Document Title"
            className="text-4xl font-display font-bold w-full bg-transparent focus:outline-none placeholder:text-gray-200 dark:placeholder:text-gray-700 text-gray-900 dark:text-white tracking-tight"
          />
          <div className="flex flex-wrap items-center gap-2 mt-6">
            {note.tags.map((tag: string) => (
              <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 rounded-full text-[10px] font-bold uppercase tracking-widest group cursor-default shadow-sm transition-all hover:border-brand-primary/30 dark:hover:border-brand-primary/50 hover:text-brand-primary dark:hover:text-brand-primary">
                #{tag}
                <button onClick={() => removeTag(tag)} className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="relative">
              <input
                type="text"
                placeholder="TAG+"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTag()}
                className="pl-8 pr-4 py-1.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary/30 w-32 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-white shadow-sm"
              />
              <TagIcon className="absolute left-3 top-2 w-3 h-3 text-gray-300 dark:text-gray-500" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-10">
          {isPreview ? (
            <div className="markdown-body max-w-none">
              <ReactMarkdown>{note.content || "_Start writing to see the preview..._"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              value={note.content}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              placeholder="Start drafting your thoughts..."
              className="w-full h-full min-h-[50vh] bg-transparent focus:outline-none resize-none leading-loose text-gray-600 dark:text-gray-300 placeholder:text-gray-300 dark:placeholder:text-gray-600 text-lg font-normal"
            />
          )}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 dark:bg-gray-900/40 dark:backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-[48px] p-10 max-w-md w-full shadow-2xl relative border border-gray-100 dark:border-gray-700"
            >
              <button 
                onClick={() => setShowShare(false)}
                className="absolute right-8 top-8 p-2 bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
                <Share2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-2 text-gray-900 dark:text-white tracking-tight">Collaboration</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">Instantly publish this note to the web. Anyone with the unique link will be able to read it.</p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Public Link</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Accessible by anyone</p>
                  </div>
                  <button
                    onClick={togglePublic}
                    className={`w-12 h-6 rounded-full transition-all relative ${note.public ? 'bg-brand-primary' : 'bg-gray-300'}`}
                  >
                    <motion.div 
                      animate={{ x: note.public ? 24 : 0 }}
                      className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {note.public && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 ml-2">Secure Link</p>
                    <div className="flex items-center gap-2 p-4 bg-gray-900 rounded-3xl shadow-lg">
                      <input 
                        type="text" 
                        readOnly 
                        value={shareUrl} 
                        className="bg-transparent text-xs text-gray-400 flex-1 focus:outline-none truncate font-mono"
                      />
                      <button 
                        onClick={copyLink}
                        className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-gray-50 dark:border-gray-700 flex justify-end">
                <button 
                  onClick={() => setShowShare(false)}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
