import React from 'react';
import {
  AlertTriangle,
  Calendar,
  UserCheck,
  Archive,
  Check,
  Plus
} from 'lucide-react';
import { Task, Project } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface TaskMatrixViewProps {
  tasks: Task[];
  projects: Project[];
  onSelectTask: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
  onUpdateMatrixPriority: (taskId: string, isUrgent: boolean, isImportant: boolean) => void;
  onAddTaskWithMatrix: (isUrgent: boolean, isImportant: boolean) => void;
  theme: 'dark' | 'light';
}

export const TaskMatrixView: React.FC<TaskMatrixViewProps> = ({
  tasks,
  projects,
  onSelectTask,
  onToggleComplete,
  onUpdateMatrixPriority,
  onAddTaskWithMatrix,
  theme,
}) => {
  const activeTasks = tasks.filter((t) => !t.completed);

  // Quadrants
  // Q1: Urgent & Important
  // Q2: Not Urgent & Important
  // Q3: Urgent & Not Important
  // Q4: Neither
  const q1Tasks = activeTasks.filter((t) => t.isUrgent && t.isImportant);
  const q2Tasks = activeTasks.filter((t) => !t.isUrgent && t.isImportant);
  const q3Tasks = activeTasks.filter((t) => t.isUrgent && !t.isImportant);
  const q4Tasks = activeTasks.filter((t) => !t.isUrgent && !t.isImportant);

  const quadrants = [
    {
      id: 'q1',
      title: 'Do First',
      subtitle: 'Urgent & Important',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
      tasks: q1Tasks,
      isUrgent: true,
      isImportant: true,
      borderColor: 'border-rose-500/30',
      headerBg: 'bg-rose-500/5',
    },
    {
      id: 'q2',
      title: 'Schedule & Deep Work',
      subtitle: 'Important, Not Urgent',
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
      tasks: q2Tasks,
      isUrgent: false,
      isImportant: true,
      borderColor: 'border-indigo-500/30',
      headerBg: 'bg-indigo-500/5',
    },
    {
      id: 'q3',
      title: 'Delegate / Quick Hit',
      subtitle: 'Urgent, Not Important',
      icon: <UserCheck className="w-4 h-4 text-amber-500" />,
      tasks: q3Tasks,
      isUrgent: true,
      isImportant: false,
      borderColor: 'border-amber-500/30',
      headerBg: 'bg-amber-500/5',
    },
    {
      id: 'q4',
      title: 'Backlog / Eliminate',
      subtitle: 'Neither Urgent nor Important',
      icon: <Archive className="w-4 h-4 text-neutral-400" />,
      tasks: q4Tasks,
      isUrgent: false,
      isImportant: false,
      borderColor: 'border-neutral-500/30',
      headerBg: 'bg-neutral-500/5',
    },
  ];

  return (
    <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4 p-4 overflow-hidden select-none">
      {quadrants.map((q) => (
        <div
          key={q.id}
          className={`flex flex-col rounded-xl border ${q.borderColor} ${
            theme === 'dark'
              ? 'bg-neutral-900/50 text-neutral-100'
              : 'bg-white text-neutral-900 shadow-xs'
          } overflow-hidden`}
        >
          {/* Quadrant Header */}
          <div className={`p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between ${q.headerBg}`}>
            <div className="flex items-center gap-2">
              {q.icon}
              <div>
                <h4 className="text-xs font-semibold leading-tight">{q.title}</h4>
                <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {q.subtitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tabular-nums text-neutral-400">
                {q.tasks.length}
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onAddTaskWithMatrix(q.isUrgent, q.isImportant);
                }}
                className="p-1 rounded text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                title="Add task in this quadrant"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quadrant Tasks List */}
          <div className="flex-1 p-2 overflow-y-auto space-y-1.5">
            {q.tasks.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-4">
                <span className="text-xs text-neutral-400">No tasks in this quadrant</span>
              </div>
            ) : (
              q.tasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="group flex items-start justify-between p-2 rounded-lg border border-neutral-200 dark:border-neutral-800/80 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer text-xs"
                  >
                    <div className="flex items-start gap-2 flex-1 min-w-0 pr-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEngine.playComplete();
                          onToggleComplete(task.id);
                        }}
                        className="mt-0.5 w-3.5 h-3.5 rounded border border-neutral-300 dark:border-neutral-600 flex items-center justify-center hover:border-emerald-500 shrink-0"
                      >
                        {task.completed && <Check className="w-2.5 h-2.5 text-emerald-500" />}
                      </button>

                      <div className="truncate flex-1">
                        <span className="font-medium truncate block">{task.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                          {project && <span>{project.name}</span>}
                          {task.dueDate && (
                            <>
                              <span>·</span>
                              <span className="tabular-nums">{task.dueDate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[10px] text-neutral-400">
                      <span>P{task.priority.slice(1)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
