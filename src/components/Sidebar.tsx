import React from 'react';
import {
  Inbox,
  Calendar,
  CalendarRange,
  Layers,
  CheckCircle2,
  FolderPlus,
  Hash,
  Plus,
  ChevronRight,
  Terminal,
  Briefcase,
  Smile,
  Tag,
  Circle,
  MoreVertical,
  Trash2,
  Edit2,
  Sliders
} from 'lucide-react';
import { Project, Task, ViewType } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface SidebarProps {
  currentView: ViewType;
  selectedProjectId: string | null;
  selectedTag: string | null;
  onSelectView: (view: ViewType, projectId?: string, tag?: string) => void;
  projects: Project[];
  tasks: Task[];
  onOpenNewTask: () => void;
  onOpenNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onOpenDownloadModal?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  theme: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  selectedProjectId,
  selectedTag,
  onSelectView,
  projects,
  tasks,
  onOpenNewTask,
  onOpenNewProject,
  onEditProject,
  onDeleteProject,
  onOpenDownloadModal,
  isCollapsed,
  onToggleCollapse,
  theme,
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = React.useState<string | null>(null);

  // Calculate task counts
  const todayStr = new Date().toISOString().split('T')[0];

  const inboxCount = tasks.filter((t) => !t.completed && (t.projectId === 'inbox' || !t.projectId)).length;
  const todayCount = tasks.filter((t) => !t.completed && t.dueDate === todayStr).length;
  const upcomingCount = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > todayStr).length;
  const anytimeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Extract all unique tags
  const allTags = React.useMemo(() => {
    const tagMap = new Map<string, number>();
    tasks.forEach((t) => {
      t.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + (t.completed ? 0 : 1));
      });
    });
    return Array.from(tagMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.completed).length;
    const active = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, active, completed, percent };
  };

  const getProjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-4 h-4" />;
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'Smile':
        return <Smile className="w-4 h-4" />;
      default:
        return <Circle className="w-3.5 h-3.5 fill-current" />;
    }
  };

  if (isCollapsed) {
    return (
      <aside
        className={`w-14 border-r flex flex-col items-center py-3 select-none shrink-0 ${
          theme === 'dark' ? 'bg-neutral-950/60 border-neutral-800/80' : 'bg-neutral-50/80 border-neutral-200'
        }`}
      >
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleCollapse();
          }}
          className="p-2 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 mb-4"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenNewTask();
          }}
          className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm mb-6 hover:opacity-90 active:scale-95 transition-transform"
          title="New Task (N)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSelectView('inbox')}
            className={`p-2 rounded ${currentView === 'inbox' ? 'text-blue-500 bg-blue-500/10' : 'text-neutral-400'}`}
            title={`Inbox (${inboxCount})`}
          >
            <Inbox className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('today')}
            className={`p-2 rounded ${currentView === 'today' ? 'text-amber-500 bg-amber-500/10' : 'text-neutral-400'}`}
            title={`Today (${todayCount})`}
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('upcoming')}
            className={`p-2 rounded ${currentView === 'upcoming' ? 'text-indigo-500 bg-indigo-500/10' : 'text-neutral-400'}`}
            title={`Upcoming (${upcomingCount})`}
          >
            <CalendarRange className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectView('completed')}
            className={`p-2 rounded ${currentView === 'completed' ? 'text-emerald-500 bg-emerald-500/10' : 'text-neutral-400'}`}
            title={`Completed (${completedCount})`}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className={`w-64 border-r flex flex-col justify-between py-3 px-3 select-none shrink-0 transition-all ${
        theme === 'dark' ? 'bg-neutral-950/70 border-neutral-800/80 text-neutral-200' : 'bg-neutral-50/90 border-neutral-200 text-neutral-800'
      }`}
    >
      <div className="flex flex-col overflow-y-auto pr-1">
        {/* Workspace Brand / Profile */}
        <div className="flex items-center justify-between px-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900 font-bold flex items-center justify-center text-xs">
              T
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Workspace
              </span>
              <span className="text-[10px] text-neutral-500 tabular-nums">
                {anytimeCount} pending tasks
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleCollapse();
            }}
            className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
            title="Collapse Sidebar"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick New Task Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenNewTask();
          }}
          className="w-full mb-4 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-between transition-colors bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </div>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded opacity-70 bg-white/20 dark:bg-black/20">
            N
          </kbd>
        </button>

        {/* Smart Views */}
        <div className="space-y-0.5 mb-5">
          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectView('inbox');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'inbox'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4 text-blue-500" />
              <span>Inbox</span>
            </div>
            {inboxCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                {inboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectView('today');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'today'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>Today</span>
            </div>
            {todayCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectView('upcoming');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'upcoming'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CalendarRange className="w-4 h-4 text-indigo-500" />
              <span>Upcoming</span>
            </div>
            {upcomingCount > 0 && (
              <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                {upcomingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectView('anytime');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'anytime'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-neutral-400" />
              <span>All Tasks</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
              {anytimeCount}
            </span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onSelectView('completed');
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'completed'
                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Completed Log</span>
            </div>
            <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
              {completedCount}
            </span>
          </button>
        </div>

        {/* Projects Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
              Projects
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenNewProject();
              }}
              className="p-1 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
              title="Add New Project"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {projects.map((project) => {
              const stats = getProjectStats(project.id);
              const isSelected = currentView === 'project' && selectedProjectId === project.id;

              return (
                <div key={project.id} className="relative group">
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectView('project', project.id);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors text-left ${
                      isSelected
                        ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/40 dark:hover:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {stats.total > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono tabular-nums text-neutral-400">
                            {stats.percent}%
                          </span>
                          <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                            {stats.active}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Context action for project */}
                  <div className="absolute right-1 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-200 bg-neutral-200 dark:bg-neutral-800"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </button>

                    {projectMenuOpen === project.id && (
                      <>
                        <div
                          className="fixed inset-0 z-30"
                          onClick={() => setProjectMenuOpen(null)}
                        />
                        <div
                          className={`absolute right-0 top-6 w-32 rounded-md shadow-lg border py-1 z-40 text-xs ${
                            theme === 'dark'
                              ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
                              : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <button
                            onClick={() => {
                              setProjectMenuOpen(null);
                              onEditProject(project);
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <Edit2 className="w-3 h-3 text-neutral-400" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => {
                              setProjectMenuOpen(null);
                              if (confirm(`Delete project "${project.name}"? Tasks will move to Inbox.`)) {
                                onDeleteProject(project.id);
                              }
                            }}
                            className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3 h-3 text-rose-500" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                Tags
              </span>
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
            </div>

            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map(([tag, count]) => {
                const isSelected = currentView === 'tag' && selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectView('tag', undefined, tag);
                    }}
                    className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-neutral-300 dark:bg-neutral-700 text-neutral-950 dark:text-white font-medium'
                        : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <span className="text-neutral-400">#</span>
                    <span>{tag}</span>
                    <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono tabular-nums">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Download / Install App Prompt in Sidebar */}
      {onOpenDownloadModal && (
        <div className="pt-2 mb-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDownloadModal();
            }}
            className="w-full py-1.5 px-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Install Desktop App</span>
            </div>
            <span className="text-[10px] uppercase font-mono opacity-80">Free</span>
          </button>
        </div>
      )}

      {/* Bottom Storage & Status bar */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800/80 px-2 flex items-center justify-between text-[11px] text-neutral-400 dark:text-neutral-500">
        <span className="tabular-nums font-mono">
          Local Storage v1.2
        </span>
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="All changes saved locally" />
      </div>
    </aside>
  );
};
