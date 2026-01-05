"use client";

import { useState, useEffect } from "react";
import { Settings, X } from "lucide-react";

export function TabSettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPersistenceEnabled, setIsPersistenceEnabled] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tabPersistenceEnabled');
    if (saved !== null) {
      setIsPersistenceEnabled(saved === 'true');
    }
  }, []);

  const togglePersistence = () => {
    const newValue = !isPersistenceEnabled;
    setIsPersistenceEnabled(newValue);
    localStorage.setItem('tabPersistenceEnabled', String(newValue));
  };

  return (
    <>
      {/* Floating Settings Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        aria-label="Tab Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Settings Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tab Settings
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Tab Persistence
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Keep tabs open when returning to dashboard
                </p>
              </div>
              <button
                onClick={togglePersistence}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPersistenceEnabled
                    ? 'bg-indigo-600'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPersistenceEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {!isPersistenceEnabled && (
              <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                💡 Tip: Pin tabs to keep them open, or double-click the active tab
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
