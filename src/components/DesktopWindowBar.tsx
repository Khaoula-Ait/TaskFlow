import React from 'react';
import {
  Search,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  HelpCircle,
  Clock,
  Sparkles,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { FocusSession } from '../types/todo';

interface DesktopWindowBarProps {
  title: string;
  subtitle?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  focusSession: FocusSession;
  onOpenFocusModal: () => void;
  onOpenDownloadModal: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onResetData: () => void;
  tasksRemaining: number;
}

export const DesktopWindowBar: React.FC<DesktopWindowBarProps> = ({
  title,
  subtitle,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenCommandPalette,
  onOpenShortcuts,
  focusSession,
  onOpenFocusModal,
  onOpenDownloadModal,
  onExportData,
  onImportData,
  onResetData,
  tasksRemaining,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showDataMenu, setShowDataMenu] = React.useState(false);

  const toggleFullscreen = () => {
    soundEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header
      className={`h-11 px-4 flex items-center justify-between border-b select-none transition-colors duration-150 ${
        theme === 'dark'
          ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-200'
          : 'bg-neutral-100/90 border-neutral-200 text-neutral-800'
      } backdrop-blur-md sticky top-0 z-30`}
    >
      {/* Zone 1: Window traffic lights & Desktop Brand */}
      <div className="flex items-center gap-3.5">
        <div className="flex items-center gap-1.5 group">
          <button
            onClick={() => {
              soundEngine.playClick();
              if (window.confirm('Minimize window view?')) {
                // simulated window action
              }
            }}
            title="Close / Reset window"
            className="w-3 h-3 rounded-full bg-rose-500/90 hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-rose-950 font-bold leading-none">×</span>
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              // minimize toggle
            }}
            title="Minimize"
            className="w-3 h-3 rounded-full bg-amber-500/90 hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-amber-950 font-bold leading-none">-</span>
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="w-3 h-3 rounded-full bg-emerald-500/90 hover:brightness-110 active:brightness-90 transition-all flex items-center justify-center cursor-pointer"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[7px] text-emerald-950 font-bold leading-none">+</span>
          </button>
        </div>

        <div className="h-3.5 w-px bg-neutral-300 dark:bg-neutral-800" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-tight uppercase tracking-wider text-neutral-900 dark:text-neutral-100 font-sans">
            TaskFlow
          </span>
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
            desktop
          </span>
        </div>
      </div>

      {/* Zone 2: Window Center Breadcrumb / Context */}
      <div className="flex items-center gap-2 text-xs truncate max-w-md">
        <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
          {title}
        </span>
        {subtitle && (
          <>
            <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">·</span>
            <span className="text-neutral-500 dark:text-neutral-400 truncate">
              {subtitle}
            </span>
          </>
        )}
        <span className="text-neutral-400 dark:text-neutral-600" aria-hidden="true">·</span>
        <span className="text-neutral-400 dark:text-neutral-500 tabular-nums">
          {tasksRemaining} active
        </span>
      </div>

      {/* Zone 3: Desktop Quick Tools */}
      <div className="flex items-center gap-1.5">
        {/* Install / Download Desktop App Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenDownloadModal();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-blue-600/10 hover:bg-blue-600/20 text-blue-500 font-semibold border border-blue-500/20 transition-all cursor-pointer shadow-2xs"
          title="Download & Install Desktop App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>

        {/* Focus Timer Status */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenFocusModal();
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-colors ${
            focusSession.isRunning
              ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400 font-medium border border-rose-500/20 animate-pulse'
              : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300'
          }`}
          title="Focus / Pomodoro Mode"
        >
          <Clock className="w-3.5 h-3.5" />
          <span className="tabular-nums font-mono text-[11px]">
            {focusSession.isRunning ? formatTimer(focusSession.timeRemainingSeconds) : 'Focus'}
          </span>
        </button>

        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenCommandPalette();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
          title="Open Command Palette (⌘K / Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <kbd className="font-mono text-[10px] bg-neutral-200/80 dark:bg-neutral-800 px-1 py-0.5 rounded text-neutral-500 dark:text-neutral-400">
            ⌘K
          </kbd>
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => {
            onToggleSound();
            if (!soundEnabled) {
              setTimeout(() => soundEngine.playComplete(), 50);
            }
          }}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
          title={soundEnabled ? 'Desktop Audio Enabled (Click to mute)' : 'Desktop Audio Muted (Click to unmute)'}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onToggleTheme();
          }}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* Data / Backup Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDataMenu(!showDataMenu)}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
            title="Data & Backup Options"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {showDataMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDataMenu(false)}
              />
              <div
                className={`absolute right-0 mt-1.5 w-48 rounded-lg shadow-xl border py-1.5 z-50 text-xs ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-200'
                    : 'bg-white border-neutral-200 text-neutral-800'
                }`}
              >
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onExportData();
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Download className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Export JSON Backup</span>
                </button>
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onImportData();
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <Upload className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Import JSON Backup</span>
                </button>
                <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />
                <button
                  onClick={() => {
                    setShowDataMenu(false);
                    onResetData();
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-500 hover:bg-rose-500/10"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                  <span>Reset to Sample Tasks</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Shortcuts guide */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenShortcuts();
          }}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
          title="Keyboard Shortcuts (?)"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 rounded transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
