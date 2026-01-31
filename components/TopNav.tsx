import React from 'react';

interface TopNavProps {
    isRecording: boolean;
    toggleRightPanel: () => void;
    darkMode: boolean;
    onToggleDarkMode: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ isRecording, toggleRightPanel, darkMode, onToggleDarkMode }) => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-black/5 dark:border-white/10 px-6 py-3 bg-white dark:bg-[#1A202C] z-20 shrink-0">
            <div className="flex items-center gap-4">
                <div className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/20">
                    <span className="material-symbols-outlined">auto_videocam</span>
                </div>
                <div className="flex flex-col">
                    <h2 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        {isRecording ? "录制中..." : "提词器工作室"}
                    </h2>
                    {isRecording && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded w-fit flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-red-500 animate-pulse"></span>
                            REC
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">
                {!isRecording && (
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-mint rounded-full text-teal-800 text-xs font-semibold">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Gemini AI 已连接
                    </div>
                )}

                {isRecording && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-lg">cloud_done</span>
                        <span className="hidden sm:inline">自动保存中</span>
                    </div>
                )}

                <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

                {/* Dark Mode Toggle */}
                <button
                    onClick={onToggleDarkMode}
                    className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                        {darkMode ? 'light_mode' : 'dark_mode'}
                    </span>
                </button>

                <button
                    onClick={toggleRightPanel}
                    className="flex items-center justify-center size-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="面板切换"
                >
                    <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">
                        {isRecording ? 'settings' : 'edit_note'}
                    </span>
                </button>

                <div
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 ring-2 ring-white dark:ring-gray-800 shadow-sm cursor-pointer"
                    style={{ backgroundImage: 'url("https://picsum.photos/200/200")' }}
                ></div>
            </div>
        </header>
    );
};

export default TopNav;