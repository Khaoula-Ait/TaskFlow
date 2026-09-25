import React from 'react';
import { X, FolderPlus, Terminal, Layers, Briefcase, Smile, Star, Zap, Code, Shield } from 'lucide-react';
import { Project } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (projectData: Partial<Project>) => void;
  editingProject?: Project | null;
  theme: 'dark' | 'light';
}

const COLOR_SWATCHES = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
];

const ICONS = [
  { name: 'Terminal', icon: <Terminal className="w-4 h-4" /> },
  { name: 'Layers', icon: <Layers className="w-4 h-4" /> },
  { name: 'Briefcase', icon: <Briefcase className="w-4 h-4" /> },
  { name: 'Smile', icon: <Smile className="w-4 h-4" /> },
  { name: 'Star', icon: <Star className="w-4 h-4" /> },
  { name: 'Zap', icon: <Zap className="w-4 h-4" /> },
  { name: 'Code', icon: <Code className="w-4 h-4" /> },
  { name: 'Shield', icon: <Shield className="w-4 h-4" /> },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  editingProject,
  theme,
}) => {
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [color, setColor] = React.useState(COLOR_SWATCHES[0]);
  const [icon, setIcon] = React.useState('Layers');

  React.useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || '');
      setColor(editingProject.color);
      setIcon(editingProject.icon);
    } else {
      setName('');
      setDescription('');
      setColor(COLOR_SWATCHES[0]);
      setIcon('Layers');
    }
  }, [editingProject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundEngine.playClick();
    onSaveProject({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-xl shadow-2xl border p-5 z-10 ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold">
              {editingProject ? 'Edit Project' : 'New Project Workspace'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Project Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mobile Redesign, Q4 Goals, Health"
              className="w-full text-xs p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Scope, key deliverables, and notes..."
              rows={2}
              className="w-full text-xs p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Color Marker
            </label>
            <div className="flex items-center gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => setColor(swatch)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === swatch ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: swatch }}
                />
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`flex items-center justify-center p-2 rounded-lg border text-xs gap-1.5 transition-colors ${
                    icon === item.name
                      ? 'border-blue-500 bg-blue-500/10 text-blue-500 font-medium'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {item.icon}
                  <span className="text-[11px]">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40"
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
