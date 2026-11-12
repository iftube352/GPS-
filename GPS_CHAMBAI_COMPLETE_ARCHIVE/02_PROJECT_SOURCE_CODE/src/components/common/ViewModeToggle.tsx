import React, { useState, useEffect } from 'react';
import { LayoutGrid, List } from 'lucide-react';

export type DisplayViewMode = 'grid' | 'list';

export function useViewMode(
  moduleKey: string,
  defaultMode: DisplayViewMode = 'grid'
): [DisplayViewMode, (mode: DisplayViewMode) => void] {
  const storageKey = `gps_chambai_view_mode_${moduleKey}`;

  const [mode, setModeState] = useState<DisplayViewMode>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'grid' || saved === 'list') return saved;
    } catch {
      // ignore
    }
    return defaultMode;
  });

  useEffect(() => {
    const onGlobalChange = (e: Event) => {
      const custom = e as CustomEvent<{ moduleKey: string; mode: DisplayViewMode }>;
      if (custom.detail?.moduleKey === moduleKey || custom.detail?.moduleKey === 'ALL') {
        setModeState(custom.detail.mode);
      }
    };
    window.addEventListener('gps-view-mode-changed', onGlobalChange);
    return () => window.removeEventListener('gps-view-mode-changed', onGlobalChange);
  }, [moduleKey]);

  const setMode = (next: DisplayViewMode) => {
    setModeState(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
    window.dispatchEvent(
      new CustomEvent('gps-view-mode-changed', { detail: { moduleKey, mode: next } })
    );
  };

  return [mode, setMode];
}

interface ViewModeToggleProps {
  mode: DisplayViewMode;
  onChange: (mode: DisplayViewMode) => void;
  className?: string;
  compact?: boolean;
  lang?: 'en' | 'ur';
  dark?: boolean;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  mode,
  onChange,
  className = '',
  compact = false,
}) => {
  return (
    <div
      className={`inline-flex items-center bg-slate-200/90 p-0.5 rounded-xl border border-slate-300/70 shrink-0 ${className}`}
      role="group"
      aria-label="View Mode Toggle"
    >
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
          mode === 'grid'
            ? 'bg-white text-emerald-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Grid View"
      >
        <LayoutGrid size={13} />
        {!compact && <span>Grid</span>}
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-black transition-all ${
          mode === 'list'
            ? 'bg-white text-emerald-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="List View"
      >
        <List size={13} />
        {!compact && <span>List</span>}
      </button>
    </div>
  );
};
