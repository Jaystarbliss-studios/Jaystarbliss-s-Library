import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Clock,
  Settings,
  PlusCircle,
  ExternalLink,
  Feather
} from 'lucide-react';

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onExitAdmin: () => void;
  pendingScheduledCount: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  onExitAdmin,
  pendingScheduledCount
}) => {
  const tabs = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'books', label: 'MANUSCRIPTS / BOOKS', icon: BookOpen },
    { id: 'chapters', label: 'CHAPTERS & WRITING', icon: FileText },
    {
      id: 'scheduled',
      label: 'SCHEDULED RELEASES',
      icon: Clock,
      badge: pendingScheduledCount > 0 ? pendingScheduledCount : null
    },
    { id: 'settings', label: 'STUDIO SETTINGS', icon: Settings }
  ];

  return (
    <aside className="w-full md:w-64 bg-[#0d0d10] border-r border-zinc-800/90 flex flex-col justify-between shrink-0 font-calibri min-h-[calc(100vh-4.5rem)]">
      
      {/* Top Header & Navigation */}
      <div className="p-4 sm:p-5 space-y-6">
        
        {/* Studio Branding */}
        <div className="pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-200">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <span className="font-cinzel text-sm font-bold tracking-widest text-zinc-100 block">
                PUBLISHING STUDIO
              </span>
              <span className="font-mono-space text-[10px] text-emerald-400 tracking-wider block font-bold">
                JAYSTARBLISS STUDIOS
              </span>
            </div>
          </div>
        </div>

        {/* Quick Author Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onSelectTab('chapter-editor-new')}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-mono-space tracking-widest font-bold rounded-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>WRITE NEW CHAPTER</span>
          </button>
        </div>

        {/* Primary Studio Navigation */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-mono-space tracking-wider transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold border-l-2 border-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== null && (
                  <span className="px-1.5 py-0.2 bg-amber-950 text-amber-300 border border-amber-800 text-[10px] rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Exit & System Info */}
      <div className="p-4 border-t border-zinc-800/80 bg-[#0a0a0c] space-y-3">
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono-space tracking-wider rounded-sm transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>VIEW PUBLIC LIBRARY</span>
        </button>

        <div className="text-[10px] font-mono-space text-zinc-400 text-center">
          AUTONOMOUS DISK & FIRESTORE ENGINE
        </div>
      </div>

    </aside>
  );
};
