import { Project, Task } from '../types/todo';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v1',
  PROJECTS: 'taskflow_projects_v1',
  THEME: 'taskflow_theme_v1',
  SOUND: 'taskflow_sound_v1',
};

const getTodayDateString = (offsetDays: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj-eng',
    name: 'Engineering',
    color: '#3B82F6', // Blue
    icon: 'Terminal',
    description: 'System architecture, API design, code refactoring',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-product',
    name: 'Product Design',
    color: '#8B5CF6', // Purple
    icon: 'Layers',
    description: 'Figma mockups, design tokens, usability feedback',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-ops',
    name: 'Operations & Work',
    color: '#10B981', // Emerald
    icon: 'Briefcase',
    description: 'Sprint planning, quarterly roadmap, team 1-on-1s',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proj-personal',
    name: 'Personal Life',
    color: '#F59E0B', // Amber
    icon: 'Smile',
    description: 'Health, reading, finance, and home maintenance',
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Audit desktop keyboard shortcuts & focus trapped handlers',
    description: 'Ensure ⌘K, N for quick add, and arrow key navigation feel instantaneous with zero layout jitter.',
    completed: false,
    priority: 'p1',
    projectId: 'proj-eng',
    dueDate: getTodayDateString(0),
    dueTime: '11:00',
    tags: ['deep-work', 'desktop', 'core'],
    subtasks: [
      { id: 'sub-1-1', title: 'Verify ⌘K command palette focus cycle', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-1-2', title: 'Check Escape key resets active view drawer', completed: false, createdAt: new Date().toISOString() },
      { id: 'sub-1-3', title: 'Benchmark input latency under 120Hz display', completed: false, createdAt: new Date().toISOString() },
    ],
    estimatedMinutes: 45,
    timeSpentMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'in_progress',
    isUrgent: true,
    isImportant: true,
  },
  {
    id: 'task-2',
    title: 'Finalize Q3 release notes & changelog highlights',
    description: 'Summarize offline sync, new Kanban swimlanes, and dark mode palette enhancements.',
    completed: false,
    priority: 'p2',
    projectId: 'proj-ops',
    dueDate: getTodayDateString(0),
    dueTime: '15:30',
    tags: ['communication', 'release'],
    subtasks: [
      { id: 'sub-2-1', title: 'Draft customer-facing bullet points', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-2-2', title: 'Collect developer changelog links', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-2-3', title: 'Distribute preview to QA lead', completed: false, createdAt: new Date().toISOString() },
    ],
    estimatedMinutes: 30,
    timeSpentMinutes: 20,
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'todo',
    isUrgent: false,
    isImportant: true,
  },
  {
    id: 'task-3',
    title: 'Review pull request #342: Web Audio sound synthesis',
    description: 'Verify synthesized chimes perform without audio glitches or memory leaks on tab unfocus.',
    completed: false,
    priority: 'p3',
    projectId: 'proj-eng',
    dueDate: getTodayDateString(1),
    dueTime: '14:00',
    tags: ['review', 'engineering'],
    subtasks: [],
    estimatedMinutes: 25,
    timeSpentMinutes: 0,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'backlog',
    isUrgent: true,
    isImportant: false,
  },
  {
    id: 'task-4',
    title: 'Refine high-contrast color tokens for Dark Slate canvas',
    description: 'Ensure subtle hairline borders (1px) meet WCAG AA 4.5:1 standards on dark backgrounds.',
    completed: true,
    completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    priority: 'p2',
    projectId: 'proj-product',
    dueDate: getTodayDateString(-1),
    tags: ['design-system', 'accessibility'],
    subtasks: [
      { id: 'sub-4-1', title: 'Audit contrast with color picker', completed: true, createdAt: new Date().toISOString() },
      { id: 'sub-4-2', title: 'Export tokens to Tailwind CSS variables', completed: true, createdAt: new Date().toISOString() },
    ],
    estimatedMinutes: 40,
    timeSpentMinutes: 40,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'done',
    isUrgent: false,
    isImportant: true,
  },
  {
    id: 'task-5',
    title: 'Order Ethiopian Yirgacheffe specialty whole beans',
    description: 'Medium roast from the local roastery for the desktop coffee setup.',
    completed: false,
    priority: 'p4',
    projectId: 'proj-personal',
    dueDate: getTodayDateString(2),
    tags: ['errand', 'quick-hit'],
    subtasks: [],
    estimatedMinutes: 10,
    timeSpentMinutes: 0,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'backlog',
    isUrgent: false,
    isImportant: false,
  },
  {
    id: 'task-6',
    title: '30-minute cardio & posture stretch reset',
    description: 'Desk break: ergonomic wrist stretches, thoracic extension, and brisk walk.',
    completed: false,
    priority: 'p2',
    projectId: 'proj-personal',
    dueDate: getTodayDateString(0),
    dueTime: '17:00',
    tags: ['wellness', 'habit'],
    subtasks: [],
    estimatedMinutes: 30,
    timeSpentMinutes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'todo',
    isUrgent: true,
    isImportant: true,
  },
];

export const loadStoredTasks = (): Task[] => {
  if (typeof window === 'undefined') return INITIAL_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TASKS;
  } catch (e) {
    console.warn('Failed to load tasks from localStorage', e);
    return INITIAL_TASKS;
  }
};

export const saveStoredTasks = (tasks: Task[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks to localStorage', e);
  }
};

export const loadStoredProjects = (): Project[] => {
  if (typeof window === 'undefined') return DEFAULT_PROJECTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (!raw) return DEFAULT_PROJECTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PROJECTS;
  } catch (e) {
    console.warn('Failed to load projects from localStorage', e);
    return DEFAULT_PROJECTS;
  }
};

export const saveStoredProjects = (projects: Project[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  } catch (e) {
    console.warn('Failed to save projects to localStorage', e);
  }
};
