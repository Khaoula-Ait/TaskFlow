import React from 'react';
import {
  Check,
  Calendar,
  Clock,
  Tag,
  Plus,
  Play,
  Trash2,
  AlertCircle,
  Folder,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { Task, Project, Priority, FilterOptions } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface TaskGroup {
  key: string;
  label: string;
  color?: string;
  items: Task[];
}

interface TaskListViewProps {
  tasks: Task[];
  projects: Project[];
  onToggleComplete: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (taskData: Partial<Task>) => void;
  onStartFocusOnTask: (taskId: string) => void;
  filterOptions: FilterOptions;
  onChangeFilterOptions: (options: Partial<FilterOptions>) => void;
  theme: 'dark' | 'light';
  viewTitle: string;
  defaultProjectId?: string;
  defaultDueDate?: string;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  projects,
  onToggleComplete,
  onSelectTask,
  onDeleteTask,
  onAddTask,
  onStartFocusOnTask,
  filterOptions,
  onChangeFilterOptions,
  theme,
  viewTitle,
  defaultProjectId,
  defaultDueDate,
}) => {
  // Quick Add State
  const [quickTitle, setQuickTitle] = React.useState('');
  const [quickPriority, setQuickPriority] = React.useState<Priority>('p3');
  const [quickDueDate, setQuickDueDate] = React.useState<string>(defaultDueDate || '');
  const [quickProjectId, setQuickProjectId] = React.useState<string>(defaultProjectId || 'inbox');
  const [isQuickAddExpanded, setIsQuickAddExpanded] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Today string for due date calculations
  const todayStr = new Date().toISOString().split('T')[0];

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    soundEngine.playClick();
    onAddTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      projectId: quickProjectId || 'inbox',
      dueDate: quickDueDate || undefined,
      tags: [],
      subtasks: [],
      status: 'todo',
    });

    setQuickTitle('');
    // Keep project and priority for rapid entry
  };

  const getPriorityInfo = (p: Priority) => {
    switch (p) {
      case 'p1':
        return { label: 'P1 Urgent', colorClass: 'text-rose-500 font-semibold' };
      case 'p2':
        return { label: 'P2 High', colorClass: 'text-amber-500 font-medium' };
      case 'p3':
        return { label: 'P3 Medium', colorClass: 'text-blue-500' };
      case 'p4':
        return { label: 'P4 Low', colorClass: 'text-neutral-400' };
    }
  };

  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return null;
    if (dateStr === todayStr) return { text: 'Today', isOverdue: false, isToday: true };
    
    // Check if tomorrow
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const tomorrowStr = d.toISOString().split('T')[0];
    if (dateStr === tomorrowStr) return { text: 'Tomorrow', isOverdue: false, isToday: false };

    const isOverdue = dateStr < todayStr;
    const parts = dateStr.split('-');
    const formatted = `${parts[1]}/${parts[2]}`;
    return { text: formatted, isOverdue, isToday: false };
  };

  // Grouping logic
  const groupedTasks: TaskGroup[] = React.useMemo(() => {
    if (filterOptions.groupBy === 'none') {
      return [{ key: 'all', label: 'All Tasks', items: tasks }];
    }

    if (filterOptions.groupBy === 'project') {
      const map = new Map<string, Task[]>();
      tasks.forEach((t) => {
        const key = t.projectId || 'inbox';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(t);
      });
      return Array.from(map.entries()).map(([key, items]) => {
        const project = projects.find((p) => p.id === key);
        return {
          key,
          label: project ? project.name : 'Inbox',
          color: project?.color,
          items,
        };
      });
    }

    if (filterOptions.groupBy === 'priority') {
      const pOrder: Priority[] = ['p1', 'p2', 'p3', 'p4'];
      return pOrder
        .map((p) => {
          const items = tasks.filter((t) => t.priority === p);
          return {
            key: p,
            label: getPriorityInfo(p).label,
            items,
          };
        })
        .filter((g) => g.items.length > 0);
    }

    if (filterOptions.groupBy === 'dueDate') {
      const overdue = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate < todayStr);
      const today = tasks.filter((t) => t.dueDate === todayStr);
      const tomorrow = tasks.filter((t) => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return t.dueDate === d.toISOString().split('T')[0];
      });
      const later = tasks.filter((t) => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return t.dueDate && t.dueDate > d.toISOString().split('T')[0];
      });
      const noDate = tasks.filter((t) => !t.dueDate);

      const groups: TaskGroup[] = [];
      if (overdue.length > 0) groups.push({ key: 'overdue', label: 'Overdue', items: overdue });
      if (today.length > 0) groups.push({ key: 'today', label: 'Today', items: today });
      if (tomorrow.length > 0) groups.push({ key: 'tomorrow', label: 'Tomorrow', items: tomorrow });
      if (later.length > 0) groups.push({ key: 'later', label: 'Upcoming', items: later });
      if (noDate.length > 0) groups.push({ key: 'noDate', label: 'No Due Date', items: noDate });
      return groups;
    }

    return [{ key: 'all', label: 'All Tasks', items: tasks }];
  }, [tasks, filterOptions.groupBy, projects, todayStr]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Quick Add Bar */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/30">
        <form onSubmit={handleQuickAdd} className="space-y-2">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs shrink-0"
              title="Add Task (Enter)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onFocus={() => setIsQuickAddExpanded(true)}
              placeholder={`Add a task to ${viewTitle}... (Press Enter to save)`}
              className="flex-1 text-sm bg-white dark:bg-neutral-900/90 border border-neutral-300 dark:border-neutral-700/80 rounded-lg px-3.5 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-500 placeholder:text-neutral-400"
            />
          </div>

          {/* Quick Add Properties Bar */}
          {isQuickAddExpanded && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                {/* Priority Selector */}
                <div className="flex items-center gap-1 bg-neutral-200/60 dark:bg-neutral-800 p-0.5 rounded-md">
                  {(['p1', 'p2', 'p3', 'p4'] as Priority[]).map((p) => {
                    const info = getPriorityInfo(p);
                    const isActive = quickPriority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          setQuickPriority(p);
                        }}
                        className={`px-2 py-1 text-[11px] rounded transition-colors ${
                          isActive
                            ? 'bg-white dark:bg-neutral-700 shadow-xs font-semibold ' + info.colorClass
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                        }`}
                      >
                        {p.toUpperCase()}
                      </button>
                    );
                  })}
                </div>

                {/* Due Date Shortcut Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setQuickDueDate(todayStr);
                    }}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      quickDueDate === todayStr
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium'
                        : 'bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setQuickDueDate(d.toISOString().split('T')[0]);
                    }}
                    className={`px-2 py-1 rounded text-[11px] transition-colors ${
                      quickDueDate && quickDueDate > todayStr
                        ? 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Tomorrow
                  </button>
                  <input
                    type="date"
                    value={quickDueDate}
                    onChange={(e) => setQuickDueDate(e.target.value)}
                    className="px-2 py-1 rounded text-[11px] bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400 border-none focus:outline-none"
                  />
                </div>

                {/* Project Selector */}
                <select
                  value={quickProjectId}
                  onChange={(e) => setQuickProjectId(e.target.value)}
                  className="px-2 py-1 rounded text-[11px] bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 border-none focus:outline-none"
                >
                  <option value="inbox">Inbox</option>
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setIsQuickAddExpanded(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-[11px]"
              >
                Hide options
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Control Toolbar: Group By, Sort, Filter */}
      <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400">
        <div className="flex items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">Priority:</span>
            <div className="flex items-center gap-0.5 bg-neutral-200/50 dark:bg-neutral-800/60 p-0.5 rounded">
              {(['all', 'p1', 'p2', 'p3', 'p4'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onChangeFilterOptions({ priorityFilter: p })}
                  className={`px-1.5 py-0.5 text-[10px] rounded uppercase font-medium transition-colors ${
                    filterOptions.priorityFilter === p
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <span className="text-neutral-300 dark:text-neutral-700">|</span>

          {/* Group By */}
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400 text-[11px]">Group:</span>
            <select
              value={filterOptions.groupBy}
              onChange={(e) =>
                onChangeFilterOptions({ groupBy: e.target.value as FilterOptions['groupBy'] })
              }
              className="bg-transparent text-[11px] text-neutral-700 dark:text-neutral-300 border-none focus:outline-none cursor-pointer"
            >
              <option value="none">None</option>
              <option value="project">By Project</option>
              <option value="priority">By Priority</option>
              <option value="dueDate">By Due Date</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="tabular-nums font-mono text-[11px] text-neutral-400">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {/* Task List Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {groupedTasks.length === 0 || tasks.length === 0 ? (
          <div className="py-16 text-center select-none">
            <CheckCircle2 className="w-10 h-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              All caught up!
            </h4>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
              No tasks match your current view or filter. Press N or use the input above to capture a new task.
            </p>
          </div>
        ) : (
          groupedTasks.map((group) => {
            if (group.items.length === 0) return null;

            return (
              <div key={group.key} className="space-y-1.5">
                {/* Group Header */}
                {filterOptions.groupBy !== 'none' && (
                  <div className="flex items-center justify-between py-1 px-1 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                      {group.color && (
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                      <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                        {group.label}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono tabular-nums text-neutral-400">
                      {group.items.length}
                    </span>
                  </div>
                )}

                {/* Task Items */}
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800/40 border border-neutral-200 dark:border-neutral-800/80 rounded-lg overflow-hidden bg-white dark:bg-neutral-900/60 shadow-xs">
                  {group.items.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const due = formatDueDate(task.dueDate);
                    const priorityInfo = getPriorityInfo(task.priority);
                    const subtasksTotal = task.subtasks.length;
                    const subtasksDone = task.subtasks.filter((s) => s.completed).length;

                    return (
                      <div
                        key={task.id}
                        onClick={() => onSelectTask(task)}
                        className={`group flex items-start justify-between px-3.5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                          task.completed ? 'opacity-60 bg-neutral-50/50 dark:bg-neutral-950/30' : ''
                        }`}
                      >
                        {/* Left: Checkbox & Content */}
                        <div className="flex items-start gap-3 flex-1 min-w-0 pr-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!task.completed) {
                                soundEngine.playComplete();
                              } else {
                                soundEngine.playUncheck();
                              }
                              onToggleComplete(task.id);
                            }}
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              task.completed
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-500'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm tracking-tight ${
                                  task.completed
                                    ? 'line-through text-neutral-400 dark:text-neutral-500'
                                    : 'font-medium text-neutral-900 dark:text-neutral-100'
                                }`}
                              >
                                {task.title}
                              </span>
                            </div>

                            {task.description && (
                              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                                {task.description}
                              </p>
                            )}

                            {/* Clean Unboxed Metadata with Typographic Separators (Zero-Pill Discipline) */}
                            <div className="flex items-center flex-wrap gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-1.5">
                              {/* Project */}
                              {project && (
                                <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-300">
                                  <span
                                    className="w-1.5 h-1.5 rounded-full inline-block"
                                    style={{ backgroundColor: project.color }}
                                  />
                                  <span>{project.name}</span>
                                </span>
                              )}

                              {/* Priority label */}
                              {task.priority !== 'p4' && (
                                <>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
                                  <span className={priorityInfo.colorClass}>{priorityInfo.label}</span>
                                </>
                              )}

                              {/* Due Date */}
                              {due && (
                                <>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
                                  <span
                                    className={`tabular-nums ${
                                      due.isOverdue
                                        ? 'text-rose-500 font-medium'
                                        : due.isToday
                                        ? 'text-amber-500 font-medium'
                                        : 'text-neutral-500'
                                    }`}
                                  >
                                    Due {due.text}
                                  </span>
                                </>
                              )}

                              {/* Estimated Time */}
                              {task.estimatedMinutes && (
                                <>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
                                  <span className="tabular-nums font-mono text-[11px]">
                                    {task.estimatedMinutes}m est
                                  </span>
                                </>
                              )}

                              {/* Subtasks counter */}
                              {subtasksTotal > 0 && (
                                <>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
                                  <span className="tabular-nums font-mono text-[11px] text-neutral-400">
                                    {subtasksDone}/{subtasksTotal} subtasks
                                  </span>
                                </>
                              )}

                              {/* Tags */}
                              {task.tags.map((tag) => (
                                <React.Fragment key={tag}>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">·</span>
                                  <span className="text-neutral-400 dark:text-neutral-500">#{tag}</span>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Actions on Hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          {!task.completed && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEngine.playClick();
                                onStartFocusOnTask(task.id);
                              }}
                              className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                              title="Start Focus Timer on this task"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEngine.playClick();
                              onDeleteTask(task.id);
                            }}
                            className="p-1.5 rounded text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
