import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ListTodo,
  Kanban,
  Grid,
  Filter,
  Search,
  SlidersHorizontal,
  Plus,
  Calendar,
  CheckCircle2,
  Inbox,
  CalendarRange,
  Layers
} from 'lucide-react';
import {
  Task,
  Project,
  ViewType,
  DisplayMode,
  FilterOptions,
  FocusSession,
  Priority
} from './types/todo';
import {
  loadStoredTasks,
  saveStoredTasks,
  loadStoredProjects,
  saveStoredProjects,
  INITIAL_TASKS,
  DEFAULT_PROJECTS
} from './utils/storage';
import { soundEngine } from './utils/audio';
import { DesktopWindowBar } from './components/DesktopWindowBar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { TaskListView } from './components/TaskListView';
import { TaskKanbanView } from './components/TaskKanbanView';
import { TaskMatrixView } from './components/TaskMatrixView';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { ProjectModal } from './components/ProjectModal';
import { DownloadAppModal } from './components/DownloadAppModal';

export default function App() {
  // State: Theme & Desktop Sound
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow_theme_v1');
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark'; // Dark slate default for sleek desktop feel
    }
    return 'dark';
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow_sound_v1');
      return saved !== 'false';
    }
    return true;
  });

  useEffect(() => {
    soundEngine.enabled = soundEnabled;
    localStorage.setItem('taskflow_sound_v1', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('taskflow_theme_v1', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Tasks & Projects State
  const [tasks, setTasks] = useState<Task[]>(() => loadStoredTasks());
  const [projects, setProjects] = useState<Project[]>(() => loadStoredProjects());

  useEffect(() => {
    saveStoredTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  // Navigation & View State
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Inspector Drawer & Modals State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Filter & Search State
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchQuery: '',
    priorityFilter: 'all',
    tagFilter: 'all',
    groupBy: 'none',
    sortBy: 'order',
  });

  // Pomodoro Focus Timer State
  const [focusSession, setFocusSession] = useState<FocusSession>({
    isActive: false,
    mode: 'pomodoro',
    taskId: null,
    durationSeconds: 25 * 60,
    timeRemainingSeconds: 25 * 60,
    isRunning: false,
    sessionsCompleted: 0,
  });

  // Focus Timer interval ticker
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (focusSession.isRunning) {
      interval = setInterval(() => {
        setFocusSession((prev) => {
          if (prev.timeRemainingSeconds <= 1) {
            soundEngine.playTimerBell();
            return {
              ...prev,
              isRunning: false,
              timeRemainingSeconds: prev.durationSeconds,
              sessionsCompleted: prev.sessionsCompleted + 1,
            };
          }
          return {
            ...prev,
            timeRemainingSeconds: prev.timeRemainingSeconds - 1,
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusSession.isRunning]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.tagName === 'SELECT';

      // ⌘K or Ctrl+K: Open Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        soundEngine.playClick();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Escape: Close all modals & drawers
      if (e.key === 'Escape') {
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isFocusModalOpen) {
          setIsFocusModalOpen(false);
          return;
        }
        if (isDownloadModalOpen) {
          setIsDownloadModalOpen(false);
          return;
        }
        if (isProjectModalOpen) {
          setIsProjectModalOpen(false);
          return;
        }
        if (selectedTaskId) {
          setSelectedTaskId(null);
          return;
        }
      }

      // If typing inside an input field, do not trigger single-key desktop shortcuts
      if (isInput) return;

      // '?' key: Shortcuts Help
      if (e.key === '?') {
        e.preventDefault();
        soundEngine.playClick();
        setIsShortcutsModalOpen(true);
        return;
      }

      // 'F' key: Focus timer modal
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        soundEngine.playClick();
        setIsFocusModalOpen(true);
        return;
      }

      // '1', '2', '3' keys: Switch display modes
      if (e.key === '1') {
        e.preventDefault();
        soundEngine.playClick();
        setDisplayMode('list');
      } else if (e.key === '2') {
        e.preventDefault();
        soundEngine.playClick();
        setDisplayMode('kanban');
      } else if (e.key === '3') {
        e.preventDefault();
        soundEngine.playClick();
        setDisplayMode('matrix');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCommandPaletteOpen,
    isShortcutsModalOpen,
    isFocusModalOpen,
    isProjectModalOpen,
    selectedTaskId,
  ]);

  // Derived filtered tasks for active view
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const currentViewTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by View
    if (currentView === 'inbox') {
      result = result.filter((t) => !t.completed && (t.projectId === 'inbox' || !t.projectId));
    } else if (currentView === 'today') {
      result = result.filter((t) => !t.completed && t.dueDate === todayStr);
    } else if (currentView === 'upcoming') {
      result = result.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr);
    } else if (currentView === 'anytime') {
      result = result.filter((t) => !t.completed);
    } else if (currentView === 'completed') {
      result = result.filter((t) => t.completed);
    } else if (currentView === 'project' && selectedProjectId) {
      result = result.filter((t) => t.projectId === selectedProjectId);
    } else if (currentView === 'tag' && selectedTag) {
      result = result.filter((t) => t.tags.includes(selectedTag));
    }

    // Filter by Priority
    if (filterOptions.priorityFilter !== 'all') {
      result = result.filter((t) => t.priority === filterOptions.priorityFilter);
    }

    // Filter by Tag
    if (filterOptions.tagFilter !== 'all') {
      result = result.filter((t) => t.tags.includes(filterOptions.tagFilter));
    }

    // Search query filter
    if (filterOptions.searchQuery.trim()) {
      const q = filterOptions.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort order
    if (filterOptions.sortBy === 'dueDate') {
      result.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
    } else if (filterOptions.sortBy === 'priority') {
      result.sort((a, b) => a.priority.localeCompare(b.priority));
    } else if (filterOptions.sortBy === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [tasks, currentView, selectedProjectId, selectedTag, filterOptions, todayStr]);

  // Selected task object for drawer
  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );

  // View title helper
  const getViewTitleInfo = () => {
    switch (currentView) {
      case 'inbox':
        return { title: 'Inbox', subtitle: 'Unsorted capture queue' };
      case 'today':
        return {
          title: 'Today',
          subtitle: new Date().toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }),
        };
      case 'upcoming':
        return { title: 'Upcoming', subtitle: 'Scheduled for the coming days' };
      case 'anytime':
        return { title: 'All Tasks', subtitle: 'Complete workspace task ledger' };
      case 'completed':
        return { title: 'Completed Archive', subtitle: 'Finished tasks history' };
      case 'project': {
        const project = projects.find((p) => p.id === selectedProjectId);
        return {
          title: project ? project.name : 'Project',
          subtitle: project?.description || 'Project deliverables',
        };
      }
      case 'tag':
        return { title: `#${selectedTag}`, subtitle: 'Filtered by tag' };
      default:
        return { title: 'Tasks', subtitle: 'Workspace' };
    }
  };

  const viewInfo = getViewTitleInfo();

  // Task Mutations
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
            status: nextCompleted ? 'done' : 'todo',
          };
        }
        return t;
      })
    );
  };

  const handleAddTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'Untitled task',
      description: taskData.description || '',
      completed: false,
      priority: taskData.priority || 'p3',
      projectId:
        taskData.projectId ||
        (currentView === 'project' && selectedProjectId ? selectedProjectId : 'inbox'),
      dueDate:
        taskData.dueDate ||
        (currentView === 'today' ? todayStr : undefined),
      dueTime: taskData.dueTime,
      tags: taskData.tags || (selectedTag ? [selectedTag] : []),
      subtasks: taskData.subtasks || [],
      estimatedMinutes: taskData.estimatedMinutes,
      timeSpentMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: taskData.status || 'todo',
      isUrgent: taskData.isUrgent ?? (taskData.priority === 'p1'),
      isImportant: taskData.isImportant ?? (taskData.priority === 'p1' || taskData.priority === 'p2'),
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    soundEngine.playClick();
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null);
    }
    if (focusSession.taskId === taskId) {
      setFocusSession((prev) => ({ ...prev, taskId: null }));
    }
  };

  const handleDuplicateTask = (task: Task) => {
    soundEngine.playClick();
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}`,
      title: `${task.title} (Copy)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'todo',
    };
    setTasks((prev) => [duplicated, ...prev]);
  };

  const handleStartFocusOnTask = (taskId: string) => {
    soundEngine.playClick();
    setFocusSession((prev) => ({
      ...prev,
      taskId,
      isRunning: true,
      timeRemainingSeconds: prev.durationSeconds,
    }));
    setIsFocusModalOpen(true);
  };

  // Projects Mutations
  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingProject.id ? { ...p, ...projectData } : p))
      );
      setEditingProject(null);
    } else {
      const newProj: Project = {
        id: `proj-${Date.now()}`,
        name: projectData.name || 'New Project',
        color: projectData.color || '#3B82F6',
        icon: projectData.icon || 'Layers',
        description: projectData.description,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, newProj]);
      setCurrentView('project');
      setSelectedProjectId(newProj.id);
    }
  };

  const handleDeleteProject = (projectId: string) => {
    soundEngine.playClick();
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    // Move tasks in deleted project to inbox
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: 'inbox' } : t))
    );
    if (currentView === 'project' && selectedProjectId === projectId) {
      setCurrentView('inbox');
      setSelectedProjectId(null);
    }
  };

  // Export & Import backup JSON
  const handleExportData = () => {
    soundEngine.playClick();
    const backup = {
      version: '1.2',
      exportDate: new Date().toISOString(),
      tasks,
      projects,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow-backup-${todayStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = () => {
    soundEngine.playClick();
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed.tasks)) {
            setTasks(parsed.tasks);
          }
          if (Array.isArray(parsed.projects)) {
            setProjects(parsed.projects);
          }
          soundEngine.playComplete();
          alert('TaskFlow backup successfully restored!');
        } catch (err) {
          alert('Failed to parse backup file. Please ensure it is valid JSON.');
        }
      };
      reader.readAsText(file);
    };
    fileInput.click();
  };

  const handleResetData = () => {
    if (confirm('Reset to initial sample tasks and projects? Current changes will be overwritten.')) {
      soundEngine.playComplete();
      setTasks(INITIAL_TASKS);
      setProjects(DEFAULT_PROJECTS);
      setCurrentView('today');
      setSelectedProjectId(null);
      setSelectedTag(null);
    }
  };

  const activeRemainingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div
      className={`h-screen w-screen flex flex-col overflow-hidden select-none font-sans ${
        theme === 'dark' ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* Native Desktop Window Title Bar */}
      <DesktopWindowBar
        title={viewInfo.title}
        subtitle={viewInfo.subtitle}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        focusSession={focusSession}
        onOpenFocusModal={() => setIsFocusModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        tasksRemaining={activeRemainingTasksCount}
      />

      {/* Main Desktop App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Desktop Sidebar */}
        <Sidebar
          currentView={currentView}
          selectedProjectId={selectedProjectId}
          selectedTag={selectedTag}
          onSelectView={(view, projId, tag) => {
            setCurrentView(view);
            setSelectedProjectId(projId || null);
            setSelectedTag(tag || null);
          }}
          projects={projects}
          tasks={tasks}
          onOpenNewTask={() => {
            const input = document.querySelector('input[placeholder*="Add a task"]') as HTMLInputElement;
            if (input) {
              input.focus();
            } else {
              handleAddTask({ title: 'New Task' });
            }
          }}
          onOpenNewProject={() => {
            setEditingProject(null);
            setIsProjectModalOpen(true);
          }}
          onEditProject={(proj) => {
            setEditingProject(proj);
            setIsProjectModalOpen(true);
          }}
          onDeleteProject={handleDeleteProject}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
          theme={theme}
        />

        {/* Central Workspace Viewport */}
        <main
          className={`flex-1 flex flex-col min-w-0 overflow-hidden ${
            theme === 'dark' ? 'bg-neutral-900/40' : 'bg-white'
          }`}
        >
          {/* Workspace View Header (Breadcrumb + Controls) */}
          <div className="h-14 px-6 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between shrink-0 bg-white/50 dark:bg-neutral-950/20 backdrop-blur-xs">
            <div className="flex items-center gap-3 truncate">
              <div>
                <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>{viewInfo.title}</span>
                </h1>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {viewInfo.subtitle}
                </p>
              </div>
            </div>

            {/* Display Mode Switcher (List, Kanban, Matrix) */}
            <div className="flex items-center gap-3">
              {/* Search in current view */}
              <div className="relative hidden md:block">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={filterOptions.searchQuery}
                  onChange={(e) =>
                    setFilterOptions((prev) => ({ ...prev, searchQuery: e.target.value }))
                  }
                  placeholder="Filter view..."
                  className="w-40 text-xs pl-8 pr-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border-none focus:outline-none focus:ring-1 focus:ring-neutral-400 placeholder:text-neutral-400 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Segmented display buttons per design guidelines */}
              <div className="flex items-center gap-1 p-1 bg-neutral-200/50 dark:bg-neutral-800/80 rounded-lg">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setDisplayMode('list');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    displayMode === 'list'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                  title="List View (1)"
                >
                  <ListTodo className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setDisplayMode('kanban');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    displayMode === 'kanban'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                  title="Kanban Board (2)"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Board</span>
                </button>

                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setDisplayMode('matrix');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    displayMode === 'matrix'
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                  }`}
                  title="Eisenhower Matrix (3)"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active View Mode Body */}
          <div className="flex-1 flex overflow-hidden relative">
            {displayMode === 'list' && (
              <TaskListView
                tasks={currentViewTasks}
                projects={projects}
                onToggleComplete={handleToggleComplete}
                onSelectTask={(task) => {
                  soundEngine.playClick();
                  setSelectedTaskId(task.id);
                }}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
                onStartFocusOnTask={handleStartFocusOnTask}
                filterOptions={filterOptions}
                onChangeFilterOptions={(opts) =>
                  setFilterOptions((prev) => ({ ...prev, ...opts }))
                }
                theme={theme}
                viewTitle={viewInfo.title}
                defaultProjectId={currentView === 'project' ? selectedProjectId || undefined : undefined}
                defaultDueDate={currentView === 'today' ? todayStr : undefined}
              />
            )}

            {displayMode === 'kanban' && (
              <TaskKanbanView
                tasks={currentViewTasks}
                projects={projects}
                onSelectTask={(task) => {
                  soundEngine.playClick();
                  setSelectedTaskId(task.id);
                }}
                onUpdateTaskStatus={(taskId, status) => {
                  handleUpdateTask(taskId, {
                    status,
                    completed: status === 'done',
                    completedAt: status === 'done' ? new Date().toISOString() : undefined,
                  });
                }}
                onAddTaskWithStatus={(status) => {
                  handleAddTask({
                    title: 'New Task',
                    status,
                    completed: status === 'done',
                  });
                }}
                onStartFocusOnTask={handleStartFocusOnTask}
                theme={theme}
              />
            )}

            {displayMode === 'matrix' && (
              <TaskMatrixView
                tasks={currentViewTasks}
                projects={projects}
                onSelectTask={(task) => {
                  soundEngine.playClick();
                  setSelectedTaskId(task.id);
                }}
                onToggleComplete={handleToggleComplete}
                onUpdateMatrixPriority={(taskId, isUrgent, isImportant) => {
                  handleUpdateTask(taskId, { isUrgent, isImportant });
                }}
                onAddTaskWithMatrix={(isUrgent, isImportant) => {
                  handleAddTask({
                    title: 'New Prioritized Task',
                    isUrgent,
                    isImportant,
                    priority: isUrgent && isImportant ? 'p1' : isImportant ? 'p2' : isUrgent ? 'p3' : 'p4',
                  });
                }}
                theme={theme}
              />
            )}

            {/* Task Detail Inspector Drawer */}
            <TaskDetailDrawer
              task={selectedTask}
              projects={projects}
              isOpen={!!selectedTask}
              onClose={() => setSelectedTaskId(null)}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onDuplicateTask={handleDuplicateTask}
              onStartFocusOnTask={handleStartFocusOnTask}
              theme={theme}
            />
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={tasks}
        projects={projects}
        onSelectTask={(task) => {
          setSelectedTaskId(task.id);
        }}
        onOpenNewTask={() => {
          handleAddTask({ title: 'New Task' });
        }}
        onSelectView={(view, projId, tag) => {
          setCurrentView(view);
          setSelectedProjectId(projId || null);
          setSelectedTag(tag || null);
        }}
        onChangeDisplayMode={(mode) => setDisplayMode(mode)}
        onStartFocus={() => setIsFocusModalOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        theme={theme}
      />

      <FocusTimerModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        focusSession={focusSession}
        onUpdateSession={(updates) => setFocusSession((prev) => ({ ...prev, ...updates }))}
        tasks={tasks}
        onToggleTaskComplete={handleToggleComplete}
        theme={theme}
      />

      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        theme={theme}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSaveProject={handleSaveProject}
        editingProject={editingProject}
        theme={theme}
      />

      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
