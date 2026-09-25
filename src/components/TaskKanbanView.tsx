import React from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Play
} from 'lucide-react';
import { Task, Project, Priority } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface TaskKanbanViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: Task['status']) => void;
  onAddTaskWithStatus: (status: Task['status']) => void;
  onStartFocusOnTask: (taskId: string) => void;
  theme: 'dark' | 'light';
}

const COLUMNS: { id: Task['status']; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-neutral-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'review', title: 'In Review', color: 'bg-purple-500' },
  { id: 'done', title: 'Completed', color: 'bg-emerald-500' },
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onUpdateTaskStatus,
  onAddTaskWithStatus,
  onStartFocusOnTask,
  theme,
}) => {
  const getPriorityBorder = (p: Priority) => {
    switch (p) {
      case 'p1':
        return 'border-l-rose-500';
      case 'p2':
        return 'border-l-amber-500';
      case 'p3':
        return 'border-l-blue-500';
      case 'p4':
        return 'border-l-neutral-300 dark:border-l-neutral-700';
    }
  };

  const getNextStatus = (current: Task['status']): Task['status'] | null => {
    switch (current) {
      case 'backlog':
      case 'todo':
        return 'in_progress';
      case 'in_progress':
        return 'review';
      case 'review':
        return 'done';
      case 'done':
        return null;
    }
  };

  const getPrevStatus = (current: Task['status']): Task['status'] | null => {
    switch (current) {
      case 'done':
        return 'review';
      case 'review':
        return 'in_progress';
      case 'in_progress':
        return 'todo';
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex overflow-x-auto p-4 gap-4 select-none">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => {
          if (col.id === 'todo') return t.status === 'todo' || t.status === 'backlog' || (!t.status && !t.completed);
          if (col.id === 'done') return t.status === 'done' || t.completed;
          return t.status === col.id && !t.completed;
        });

        return (
          <div
            key={col.id}
            className={`w-80 flex-shrink-0 flex flex-col rounded-xl border ${
              theme === 'dark'
                ? 'bg-neutral-900/40 border-neutral-800/80'
                : 'bg-neutral-100/60 border-neutral-200'
            }`}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.color}`} />
                <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                  {col.title}
                </span>
                <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                  {colTasks.length}
                </span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAddTaskWithStatus(col.id);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Column Body / Cards List */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center p-4">
                  <span className="text-xs text-neutral-400 dark:text-neutral-500">
                    No tasks in {col.title}
                  </span>
                  <button
                    onClick={() => onAddTaskWithStatus(col.id)}
                    className="mt-2 text-[11px] text-blue-500 hover:underline"
                  >
                    + Add task
                  </button>
                </div>
              ) : (
                colTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  const next = getNextStatus(task.status);
                  const prev = getPrevStatus(task.status);
                  const subtasksTotal = task.subtasks.length;
                  const subtasksDone = task.subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className={`group p-3 rounded-lg border border-l-4 shadow-xs transition-all hover:shadow-md cursor-pointer ${getPriorityBorder(
                        task.priority
                      )} ${
                        theme === 'dark'
                          ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 text-neutral-100'
                          : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold tracking-tight line-clamp-2">
                          {task.title}
                        </span>
                        {!task.completed && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.playClick();
                              onStartFocusOnTask(task.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-rose-500"
                            title="Focus timer on this task"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}

                      {/* Clean Unboxed Metadata */}
                      <div className="flex items-center flex-wrap gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mb-2">
                        {project && (
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: project.color }}
                            />
                            <span>{project.name}</span>
                          </span>
                        )}

                        {task.dueDate && (
                          <>
                            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
                            <span className="tabular-nums">Due {task.dueDate}</span>
                          </>
                        )}

                        {subtasksTotal > 0 && (
                          <>
                            <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
                            <span className="tabular-nums font-mono">
                              {subtasksDone}/{subtasksTotal}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Card Bottom: Navigation arrows */}
                      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1">
                          {prev && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEngine.playClick();
                                onUpdateTaskStatus(task.id, prev);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title="Move back"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          )}
                          {next && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (next === 'done') {
                                  soundEngine.playComplete();
                                } else {
                                  soundEngine.playClick();
                                }
                                onUpdateTaskStatus(task.id, next);
                              }}
                              className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                              title="Advance forward"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <span className="uppercase text-[9px] font-mono tracking-wider text-neutral-400">
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
