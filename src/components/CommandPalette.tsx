import React from 'react';
import {
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  Clock,
  Sun,
  Volume2,
  Plus,
  ArrowRight,
  Folder,
  Tag,
  Kanban,
  ListTodo,
  Grid,
  Download
} from 'lucide-react';
import { Task, Project, ViewType, DisplayMode } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onOpenNewTask: () => void;
  onSelectView: (view: ViewType, projectId?: string, tag?: string) => void;
  onChangeDisplayMode: (mode: DisplayMode) => void;
  onStartFocus: () => void;
  onOpenDownloadModal?: () => void;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  theme: 'dark' | 'light';
}

interface CommandItem {
  id: string;
  type: 'action' | 'task' | 'project';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  tasks,
  projects,
  onSelectTask,
  onOpenNewTask,
  onSelectView,
  onChangeDisplayMode,
  onStartFocus,
  onOpenDownloadModal,
  onToggleTheme,
  onToggleSound,
  theme,
}) => {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items
  const items = React.useMemo(() => {
    const list: CommandItem[] = [];
    const q = query.trim().toLowerCase();

    // Built-in actions
    const defaultActions: CommandItem[] = [
      {
        id: 'cmd-download-app',
        type: 'action',
        title: 'Download & Install Desktop App',
        subtitle: 'Install as standalone desktop app for macOS, Windows, Linux',
        icon: <Download className="w-4 h-4 text-blue-500" />,
        action: () => {
          onClose();
          if (onOpenDownloadModal) onOpenDownloadModal();
        },
      },
      {
        id: 'cmd-new-task',
        type: 'action',
        title: 'Create New Task',
        subtitle: 'Add to Inbox or active view',
        icon: <Plus className="w-4 h-4 text-emerald-500" />,
        action: () => {
          onClose();
          onOpenNewTask();
        },
      },
      {
        id: 'cmd-focus',
        type: 'action',
        title: 'Start Focus / Pomodoro Timer',
        subtitle: '25 min deep work sprint',
        icon: <Clock className="w-4 h-4 text-rose-500" />,
        action: () => {
          onClose();
          onStartFocus();
        },
      },
      {
        id: 'cmd-view-today',
        type: 'action',
        title: 'Go to Today',
        subtitle: 'View tasks scheduled for today',
        icon: <Calendar className="w-4 h-4 text-amber-500" />,
        action: () => {
          onClose();
          onSelectView('today');
        },
      },
      {
        id: 'cmd-view-inbox',
        type: 'action',
        title: 'Go to Inbox',
        subtitle: 'Triage unprocessed tasks',
        icon: <Layers className="w-4 h-4 text-blue-500" />,
        action: () => {
          onClose();
          onSelectView('inbox');
        },
      },
      {
        id: 'cmd-mode-list',
        type: 'action',
        title: 'Switch to List View',
        subtitle: 'High density table layout',
        icon: <ListTodo className="w-4 h-4 text-neutral-400" />,
        action: () => {
          onClose();
          onChangeDisplayMode('list');
        },
      },
      {
        id: 'cmd-mode-kanban',
        type: 'action',
        title: 'Switch to Kanban Board',
        subtitle: 'Column sprint workflow',
        icon: <Kanban className="w-4 h-4 text-neutral-400" />,
        action: () => {
          onClose();
          onChangeDisplayMode('kanban');
        },
      },
      {
        id: 'cmd-mode-matrix',
        type: 'action',
        title: 'Switch to Eisenhower Matrix',
        subtitle: 'Urgent vs. Important prioritization',
        icon: <Grid className="w-4 h-4 text-neutral-400" />,
        action: () => {
          onClose();
          onChangeDisplayMode('matrix');
        },
      },
      {
        id: 'cmd-toggle-theme',
        type: 'action',
        title: 'Toggle Theme',
        subtitle: 'Switch between Dark Slate and Crisp Light',
        icon: <Sun className="w-4 h-4 text-amber-400" />,
        action: () => {
          onClose();
          onToggleTheme();
        },
      },
      {
        id: 'cmd-toggle-sound',
        type: 'action',
        title: 'Toggle Desktop Audio Feedback',
        subtitle: 'Mute or unmute synthesized mechanical sounds',
        icon: <Volume2 className="w-4 h-4 text-purple-400" />,
        action: () => {
          onClose();
          onToggleSound();
        },
      },
    ];

    if (!q) {
      return defaultActions;
    }

    // Filter actions
    defaultActions.forEach((item) => {
      if (
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      ) {
        list.push(item);
      }
    });

    // Filter projects
    projects.forEach((proj) => {
      if (proj.name.toLowerCase().includes(q)) {
        list.push({
          id: `proj-${proj.id}`,
          type: 'project',
          title: `Project: ${proj.name}`,
          subtitle: proj.description || 'Open project view',
          icon: <Folder className="w-4 h-4 text-blue-400" />,
          action: () => {
            onClose();
            onSelectView('project', proj.id);
          },
        });
      }
    });

    // Filter tasks
    tasks.forEach((task) => {
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));

      if (matchTitle || matchDesc || matchTags) {
        const proj = projects.find((p) => p.id === task.projectId);
        list.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          subtitle: `${proj ? proj.name : 'Inbox'}${task.dueDate ? ` · Due ${task.dueDate}` : ''}${
            task.completed ? ' · Completed' : ''
          }`,
          icon: <CheckCircle2 className={`w-4 h-4 ${task.completed ? 'text-emerald-500' : 'text-neutral-400'}`} />,
          action: () => {
            onClose();
            onSelectTask(task);
          },
        });
      }
    });

    return list;
  }, [query, tasks, projects, onOpenNewTask, onStartFocus, onSelectView, onChangeDisplayMode, onToggleTheme, onToggleSound, onClose, onSelectTask]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        soundEngine.playClick();
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden z-10 select-none ${
          theme === 'dark' ? 'bg-neutral-900 border-neutral-700/80 text-neutral-100' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
      >
        {/* Search Input Box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search tasks, or find a project..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-neutral-500"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-500">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No matching tasks or commands found for "{query}"
            </div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    soundEngine.playClick();
                    item.action();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className="shrink-0">{item.icon}</span>
                    <div className="truncate">
                      <div className="font-medium truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts info */}
        <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">↑↓</kbd> navigate
            </span>
            <span>
              <kbd className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 rounded">↵</kbd> select
            </span>
          </div>
          <span>TaskFlow Command Engine</span>
        </div>
      </div>
    </div>
  );
};
