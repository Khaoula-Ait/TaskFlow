import React from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Check,
  Minimize2,
  Volume2,
  VolumeX,
  Clock
} from 'lucide-react';
import { Task, FocusSession } from '../types/todo';
import { soundEngine } from '../utils/audio';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusSession: FocusSession;
  onUpdateSession: (updates: Partial<FocusSession>) => void;
  tasks: Task[];
  onToggleTaskComplete: (taskId: string) => void;
  theme: 'dark' | 'light';
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  isOpen,
  onClose,
  focusSession,
  onUpdateSession,
  tasks,
  onToggleTaskComplete,
  theme,
}) => {
  if (!isOpen) return null;

  const currentTask = tasks.find((t) => t.id === focusSession.taskId);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSetMode = (mode: FocusSession['mode']) => {
    soundEngine.playClick();
    let duration = 25 * 60;
    if (mode === 'short_break') duration = 5 * 60;
    if (mode === 'long_break') duration = 15 * 60;

    onUpdateSession({
      mode,
      durationSeconds: duration,
      timeRemainingSeconds: duration,
      isRunning: false,
    });
  };

  const toggleRun = () => {
    soundEngine.playClick();
    onUpdateSession({ isRunning: !focusSession.isRunning });
  };

  const resetTimer = () => {
    soundEngine.playClick();
    onUpdateSession({
      isRunning: false,
      timeRemainingSeconds: focusSession.durationSeconds,
    });
  };

  const progress =
    focusSession.durationSeconds > 0
      ? (1 - focusSession.timeRemainingSeconds / focusSession.durationSeconds) * 100
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border p-6 z-10 flex flex-col items-center text-center ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Top Header */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-rose-500" />
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Desktop Focus Chamber
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Minimize to top bar"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Segmented Switcher */}
        <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg mb-8 text-xs font-medium">
          <button
            onClick={() => handleSetMode('pomodoro')}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              focusSession.mode === 'pomodoro'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => handleSetMode('short_break')}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              focusSession.mode === 'short_break'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSetMode('long_break')}
            className={`px-4 py-1.5 rounded-md transition-colors ${
              focusSession.mode === 'long_break'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Long Break (15m)
          </button>
        </div>

        {/* Circular Progress & Huge Digital Display */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-neutral-200 dark:stroke-neutral-800"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-rose-500 transition-all duration-300 ease-linear"
              strokeWidth="4"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progress) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-mono font-bold tracking-tighter tabular-nums text-neutral-900 dark:text-neutral-100">
              {formatTime(focusSession.timeRemainingSeconds)}
            </span>
            <span className="text-xs text-neutral-400 mt-1 uppercase tracking-widest font-mono">
              {focusSession.isRunning ? 'Active Sprint' : 'Paused'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={resetTimer}
            className="p-3 rounded-full text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleRun}
            className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
            title={focusSession.isRunning ? 'Pause' : 'Start'}
          >
            {focusSession.isRunning ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          <div className="text-xs text-neutral-400 font-mono tabular-nums">
            {focusSession.sessionsCompleted} completed
          </div>
        </div>

        {/* Current Focused Task Banner */}
        <div className="w-full text-left p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            Active Focus Target
          </span>
          {currentTask ? (
            <div className="flex items-center justify-between gap-3">
              <div className="truncate">
                <h5 className="text-sm font-semibold truncate text-neutral-900 dark:text-neutral-100">
                  {currentTask.title}
                </h5>
                {currentTask.subtasks.length > 0 && (
                  <span className="text-xs text-neutral-400 font-mono tabular-nums">
                    {currentTask.subtasks.filter((s) => s.completed).length} of {currentTask.subtasks.length} steps done
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  soundEngine.playComplete();
                  onToggleTaskComplete(currentTask.id);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  currentTask.completed
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{currentTask.completed ? 'Done' : 'Mark Done'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>No task selected for this focus session</span>
              <span className="text-[11px] text-neutral-400">Click any task to focus</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
