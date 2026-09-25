import React, { useState } from 'react';
import {
  X,
  Download,
  Laptop,
  Monitor,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  WifiOff
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { soundEngine } from '../utils/audio';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'browser' | 'desktop' | 'shortcut' | 'backup'>('browser');

  if (!isOpen) return null;

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playClick();
    if (isInstallable) {
      const res = await install();
      if (res) {
        setInstallSuccess(true);
        soundEngine.playComplete();
      }
    } else {
      // If browser blocks beforeinstallprompt in iframe, inform user or trigger native shortcut
      soundEngine.playClick();
      setActiveTab('browser');
    }
  };

  const handleExportAppData = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playComplete();
    const tasks = localStorage.getItem('taskflow_tasks_v1');
    const projects = localStorage.getItem('taskflow_projects_v1');
    const backup = { tasks: tasks ? JSON.parse(tasks) : [], projects: projects ? JSON.parse(projects) : [] };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-standalone-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm select-auto animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl border p-6 z-10 select-auto ${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800 text-neutral-100'
            : 'bg-white border-neutral-200 text-neutral-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Install TaskFlow Desktop App
              </h3>
              <p className="text-xs text-neutral-400">
                Run natively on macOS, Windows, Linux, or Mobile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits Badges */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
          <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex flex-col items-center">
            <Zap className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-[11px] font-semibold">Standalone Window</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">No tabs or URL bar</span>
          </div>
          <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex flex-col items-center">
            <WifiOff className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-[11px] font-semibold">100% Offline Ready</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Instant cached load</span>
          </div>
          <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 flex flex-col items-center">
            <ShieldCheck className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-[11px] font-semibold">Local Storage</span>
            <span className="text-[10px] text-neutral-400 mt-0.5">Private on your device</span>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg mb-4 text-xs">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('browser');
            }}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
              activeTab === 'browser'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Browser Install
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('desktop');
            }}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
              activeTab === 'desktop'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Native App (.exe/.dmg)
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('shortcut');
            }}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
              activeTab === 'shortcut'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Desktop Shortcut
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('backup');
            }}
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-colors cursor-pointer text-center ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Data Backup
          </button>
        </div>

        {/* Tab 1: Browser Step-by-Step */}
        {activeTab === 'browser' && (
          <div className="space-y-3 mb-5">
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-neutral-900 dark:text-neutral-100">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-semibold text-xs text-blue-500">
                  <Monitor className="w-4 h-4" />
                  <span>Install as Native Window App</span>
                </div>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                >
                  <span>Open in Full Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Because this preview is running inside an embedded iframe, your browser's install button may be hidden. Open it in a full tab or use the steps below:
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
              <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
                <span>Direct Install Steps:</span>
              </h4>
              <ul className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">1</span>
                  <span>
                    Click the <strong>"Open in Full Tab"</strong> button above (or open your browser directly).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">2</span>
                  <span>
                    In the browser top bar, click the <strong>three dots (⋮)</strong> menu &rarr; <strong>"Save and share"</strong> (or <strong>"More tools"</strong>) &rarr; <strong>"Install TaskFlow Desktop"</strong> (or <strong>"Create shortcut..."</strong>).
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">3</span>
                  <span>
                    Check <strong>"Open as window"</strong> and click <strong>Create/Install</strong>. TaskFlow will open in its own separate desktop window with an app icon!
                  </span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Native App (Electron Packaging) */}
        {activeTab === 'desktop' && (
          <div className="space-y-3 mb-5">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
              <h4 className="text-xs font-semibold mb-1 flex items-center gap-2">
                <Laptop className="w-4 h-4 text-purple-500" />
                <span>Build an Offline .exe or .dmg Package (Electron)</span>
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2.5">
                The codebase includes an <code>electron.js</code> runner. If you have exported or cloned the repository to your computer:
              </p>
              <div className="bg-neutral-900 text-neutral-200 p-2.5 rounded-lg font-mono text-[11px] space-y-1 select-text">
                <div className="text-neutral-500"># 1. Install electron</div>
                <div>npm install electron --save-dev</div>
                <div className="text-neutral-500 mt-1"># 2. Build the desktop app bundle</div>
                <div>npm run build</div>
                <div className="text-neutral-500 mt-1"># 3. Launch native desktop window</div>
                <div>npx electron electron.js</div>
              </div>
              <p className="text-[11px] text-neutral-400 mt-2">
                You can also run <code>npx electron-builder</code> to produce a double-clickable <code>.exe</code> (Windows) or <code>.dmg</code> (macOS) installer.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Desktop Window Shortcut */}
        {activeTab === 'shortcut' && (
          <div className="space-y-3 mb-5">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
              <h4 className="text-xs font-semibold mb-2">Create Instant Desktop Window Shortcut</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2.5">
                Creates an independent window with its own icon on your desktop without browser UI:
              </p>
              <ol className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1.5 list-decimal list-inside">
                <li>Click the <strong>three dots (⋮)</strong> menu in the top right of your browser.</li>
                <li>Hover over <strong>Save and share</strong> (or <strong>More tools</strong>).</li>
                <li>Click <strong>Create shortcut...</strong></li>
                <li>Make sure to check the box <strong>"Open as window"</strong>.</li>
                <li>Click <strong>Create</strong>. TaskFlow will be placed on your desktop and dock!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 4: Offline Data Backup */}
        {activeTab === 'backup' && (
          <div className="space-y-3 mb-5">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
              <h4 className="text-xs font-semibold mb-1">Download All Your Data</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
                Export an offline JSON snapshot of your tasks, projects, tags, and focus session stats.
              </p>
              <button
                type="button"
                onClick={handleExportAppData}
                className="w-full py-2.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Offline JSON File</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>PWA Standalone App · macOS / Windows / Linux</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              soundEngine.playClick();
              onClose();
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-neutral-200/60 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 font-medium cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
