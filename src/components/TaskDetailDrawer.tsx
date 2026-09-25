import React from 'react';
import {
  X,
  Check,
  Calendar,
  Clock,
  Tag,
  Folder,
  Trash2,
  Copy,
  Play,
  Plus,
  AlertCircle,
  CheckCircle2,
  CheckSquare
} from 'lucide-react';
import { Task, Project, Priority, Subtask } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface TaskDetailDrawerProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onDuplicateTask: (task: Task) => void;
  onStartFocusOnTask: (taskId: string) => void;
  theme: 'dark' | 'light';
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  projects,
  isOpen,
  onClose,
  onUpdateTask,
  onDeleteTask,
  onDuplicateTask,
  onStartFocusOnTask,
  theme,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState('');
  const [newTagInput, setNewTagInput] = React.useState('');

  if (!isOpen || !task) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    soundEngine.playClick();
    const newSubtask: Subtask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    onUpdateTask(task.id, {
      subtasks: [...task.subtasks, newSubtask],
    });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subtaskId: string) => {
    soundEngine.playClick();
    const updated = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdateTask(task.id, { subtasks: updated });
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    soundEngine.playClick();
    const updated = task.subtasks.filter((s) => s.id !== subtaskId);
    onUpdateTask(task.id, { subtasks: updated });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagInput.trim()) {
      e.preventDefault();
      const cleanTag = newTagInput.trim().replace(/^#/, '');
      if (!task.tags.includes(cleanTag)) {
        soundEngine.playClick();
        onUpdateTask(task.id, {
          tags: [...task.tags, cleanTag],
        });
      }
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    soundEngine.playClick();
    onUpdateTask(task.id, {
      tags: task.tags.filter((t) => t !== tagToRemove),
    });
  };

  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-y-0 right-0 w-96 border-l shadow-2xl z-40 flex flex-col select-none animate-in slide-in-from-right duration-150 backdrop-blur-md bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100">
      {/* Drawer Header */}
      <div className="h-12 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (!task.completed) {
                soundEngine.playComplete();
              } else {
                soundEngine.playUncheck();
              }
              onUpdateTask(task.id, {
                completed: !task.completed,
                completedAt: !task.completed ? new Date().toISOString() : undefined,
                status: !task.completed ? 'done' : 'todo',
              });
            }}
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              task.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400'
            }`}
          >
            {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
          <span className="text-xs text-neutral-400">
            {task.completed ? 'Marked complete' : 'Mark complete'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!task.completed && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onStartFocusOnTask(task.id);
              }}
              className="p-1.5 rounded text-neutral-500 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Focus timer on this task"
            >
              <Play className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onDuplicateTask(task);
            }}
            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Duplicate task"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onDeleteTask(task.id);
              onClose();
            }}
            className="p-1.5 rounded text-neutral-500 hover:text-rose-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 ml-1"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Title Input */}
        <div>
          <input
            type="text"
            value={task.title}
            onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
            placeholder="Task title"
            className="w-full text-base font-semibold bg-transparent border-none focus:outline-none placeholder:text-neutral-400"
          />
        </div>

        {/* Description / Notes */}
        <div>
          <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            Notes
          </label>
          <textarea
            value={task.description || ''}
            onChange={(e) => onUpdateTask(task.id, { description: e.target.value })}
            placeholder="Add notes, context, or links..."
            rows={3}
            className="w-full text-xs p-2 rounded-lg bg-neutral-100/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 resize-none"
          />
        </div>

        {/* Metadata Controls Grid */}
        <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800 text-xs">
          {/* Project Selector */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5" /> Project
            </span>
            <select
              value={task.projectId || 'inbox'}
              onChange={(e) => onUpdateTask(task.id, { projectId: e.target.value })}
              className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border-none focus:outline-none"
            >
              <option value="inbox">Inbox</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Priority
            </span>
            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded">
              {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    onUpdateTask(task.id, { priority: p });
                  }}
                  className={`px-2 py-0.5 text-[11px] rounded uppercase font-semibold transition-colors ${
                    task.priority === p
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date & Time */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Due Date
            </span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={task.dueDate || ''}
                onChange={(e) => onUpdateTask(task.id, { dueDate: e.target.value || undefined })}
                className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border-none focus:outline-none tabular-nums"
              />
              <input
                type="time"
                value={task.dueTime || ''}
                onChange={(e) => onUpdateTask(task.id, { dueTime: e.target.value || undefined })}
                className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border-none focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {/* Estimated duration */}
          <div className="flex items-center justify-between">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Est. Minutes
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="5"
                value={task.estimatedMinutes || ''}
                onChange={(e) =>
                  onUpdateTask(task.id, {
                    estimatedMinutes: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                placeholder="e.g. 30"
                className="w-20 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded text-xs border-none focus:outline-none tabular-nums text-right font-mono"
              />
              <span className="text-neutral-400 text-[11px]">min</span>
            </div>
          </div>

          {/* Eisenhower Matrix Toggles */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-neutral-400">Eisenhower Matrix</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!task.isUrgent}
                  onChange={(e) => onUpdateTask(task.id, { isUrgent: e.target.checked })}
                  className="rounded text-rose-500 focus:ring-0"
                />
                <span>Urgent</span>
              </label>
              <label className="flex items-center gap-1 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!task.isImportant}
                  onChange={(e) => onUpdateTask(task.id, { isImportant: e.target.checked })}
                  className="rounded text-indigo-500 focus:ring-0"
                />
                <span>Important</span>
              </label>
            </div>
          </div>
        </div>

        {/* Subtasks Section */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                Subtasks
              </span>
            </div>
            {task.subtasks.length > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                {completedSubtasksCount}/{task.subtasks.length}
              </span>
            )}
          </div>

          {/* Subtask list */}
          <div className="space-y-1.5 mb-2">
            {task.subtasks.map((subtask) => (
              <div
                key={subtask.id}
                className="group flex items-center justify-between p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                  <button
                    type="button"
                    onClick={() => handleToggleSubtask(subtask.id)}
                    className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      subtask.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    {subtask.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </button>
                  <span
                    className={`truncate ${
                      subtask.completed
                        ? 'line-through text-neutral-400 dark:text-neutral-500'
                        : 'text-neutral-800 dark:text-neutral-200'
                    }`}
                  >
                    {subtask.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(subtask.id)}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Form */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a step / checklist item..."
              className="w-full text-xs py-1 bg-transparent border-none focus:outline-none placeholder:text-neutral-400"
            />
          </form>
        </div>

        {/* Tags Section */}
        <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Tags
            </span>
            <Tag className="w-3.5 h-3.5 text-neutral-400" />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 ml-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </div>

          <input
            type="text"
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Type tag and press Enter..."
            className="w-full text-xs p-1.5 rounded bg-neutral-100/60 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 focus:outline-none"
          />
        </div>

        {/* Metadata Footer */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-400 space-y-1 font-mono tabular-nums">
          <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
          {task.completedAt && (
            <div>Completed: {new Date(task.completedAt).toLocaleString()}</div>
          )}
        </div>
      </div>
    </div>
  );
};
