import React from 'react';

interface LeftSidebarProps {
    currentMode: string;
    setMode: (mode: 'studio' | 'library' | 'settings') => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({ currentMode, setMode }) => {
    return (
        <aside className="hidden lg:flex w-16 flex-col items-center py-6 border-r border-black/5 dark:border-white/10 bg-white dark:bg-[#1A202C] gap-6 shrink-0 z-10">
            <button
                onClick={() => setMode('studio')}
                className={`size-10 flex items-center justify-center rounded-xl transition-all group ${currentMode === 'studio' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}`}
                title="录制工作室"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">videocam</span>
            </button>
            <button
                onClick={() => setMode('library')}
                className={`size-10 flex items-center justify-center rounded-xl transition-all group ${currentMode === 'library' ? 'bg-lavender-dark text-purple-700 shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-lavender hover:text-purple-600'}`}
                title="脚本库"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">folder_open</span>
            </button>
            <button
                onClick={() => setMode('settings')}
                className={`size-10 flex items-center justify-center rounded-xl transition-all group ${currentMode === 'settings' ? 'bg-peach-dark text-orange-700 shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-peach hover:text-orange-600'}`}
                title="设置"
            >
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
            </button>
            <div className="flex-1"></div>
            <button
                className="size-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="帮助"
            >
                <span className="material-symbols-outlined">help</span>
            </button>
        </aside>
    );
};

export default LeftSidebar;