import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: 'General & Navigation',
      items: [
        { keys: ['⌘', 'K'], label: 'Open Command Palette' },
        { keys: ['N'], label: 'Quick add new task' },
        { keys: ['F'], label: 'Open Focus / Pomodoro timer' },
        { keys: ['?'], label: 'Open keyboard shortcuts sheet' },
        { keys: ['ESC'], label: 'Close modals, drawers, or reset search' },
      ],
    },
    {
      category: 'Display Modes',
      items: [
        { keys: ['1'], label: 'Switch to High-Density List View' },
        { keys: ['2'], label: 'Switch to Kanban Board View' },
        { keys: ['3'], label: 'Switch to Eisenhower Priority Matrix' },
      ],
    },
    {
      category: 'Task Actions',
      items: [
        { keys: ['Click Checkbox'], label: 'Toggle completion with audio chime' },
        { keys: ['Click Row'], label: 'Inspect task notes & subtasks' },
        { keys: ['Enter in Quick Add'], label: 'Instant task creation' },
        { keys: ['Drag or Arrows'], label: 'Move cards across Kanban lanes' },
      ],
    },
  ];

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
        className={`relative w-full max-w-lg rounded-xl shadow-2xl border p-5 z-10 ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold">Desktop Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {shortcutGroups.map((group) => (
            <div key={group.category}>
              <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                {group.category}
              </h4>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800/60 rounded-lg border border-neutral-200 dark:border-neutral-800/80 overflow-hidden bg-neutral-50/50 dark:bg-neutral-950/40">
                {group.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 text-xs"
                  >
                    <span className="text-neutral-700 dark:text-neutral-300">
                      {item.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 shadow-2xs"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>TaskFlow Desktop Engine</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
