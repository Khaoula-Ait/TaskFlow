export type Priority = 'p1' | 'p2' | 'p3' | 'p4'; // p1: Urgent, p2: High, p3: Medium, p4: Low

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: Priority;
  projectId: string; // 'inbox' or custom project id
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  tags: string[];
  subtasks: Subtask[];
  estimatedMinutes?: number;
  timeSpentMinutes?: number;
  createdAt: string;
  updatedAt: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  // Eisenhower matrix fields
  isUrgent?: boolean;
  isImportant?: boolean;
}

export interface Project {
  id: string;
  name: string;
  color: string; // hex or tailwind color name
  icon: string;
  description?: string;
  createdAt: string;
}

export type ViewType = 'inbox' | 'today' | 'upcoming' | 'anytime' | 'completed' | 'project' | 'tag';

export type DisplayMode = 'list' | 'kanban' | 'matrix';

export interface FilterOptions {
  searchQuery: string;
  priorityFilter: Priority | 'all';
  tagFilter: string | 'all';
  groupBy: 'none' | 'project' | 'priority' | 'dueDate';
  sortBy: 'order' | 'dueDate' | 'priority' | 'alphabetical';
}

export interface FocusSession {
  isActive: boolean;
  mode: 'pomodoro' | 'short_break' | 'long_break';
  taskId: string | null;
  durationSeconds: number;
  timeRemainingSeconds: number;
  isRunning: boolean;
  sessionsCompleted: number;
}
