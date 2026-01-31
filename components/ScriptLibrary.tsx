import React, { useState } from 'react';
import { Script } from '../types';

interface ScriptLibraryProps {
    scripts: Script[];
    currentScript: string;
    onSelectScript: (script: Script) => void;
    onCreateScript: (title: string, content: string) => void;
    onDeleteScript: (id: string) => void;
    onUpdateScript: (id: string, title: string, content: string) => void;
    onClose: () => void;
}

const ScriptLibrary: React.FC<ScriptLibraryProps> = ({
    scripts,
    currentScript,
    onSelectScript,
    onCreateScript,
    onDeleteScript,
    onUpdateScript,
    onClose
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');

    const handleCreate = () => {
        if (newTitle.trim()) {
            onCreateScript(newTitle.trim(), currentScript || '在此输入脚本内容...');
            setNewTitle('');
            setIsCreating(false);
        }
    };

    const handleSaveEdit = (id: string) => {
        const script = scripts.find(s => s.id === id);
        if (script && editTitle.trim()) {
            onUpdateScript(id, editTitle.trim(), script.content);
            setEditingId(null);
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <aside className="w-96 bg-white dark:bg-[#1A202C] border-l border-black/5 dark:border-white/10 flex flex-col shrink-0 z-20 shadow-xl h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-lavender/30 dark:bg-lavender-dark/10">
                <div>
                    <h1 className="text-base font-bold text-gray-900 dark:text-white">脚本库</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{scripts.length} 个脚本</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Create New Script */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                {isCreating ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="脚本名称..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm border-none focus:ring-2 focus:ring-primary focus:outline-none"
                            autoFocus
                        />
                        <button
                            onClick={handleCreate}
                            className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                        >
                            保存
                        </button>
                        <button
                            onClick={() => { setIsCreating(false); setNewTitle(''); }}
                            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            取消
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 text-primary font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        保存当前脚本
                    </button>
                )}
            </div>

            {/* Script List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {scripts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 p-8">
                        <span className="material-symbols-outlined text-5xl mb-3 opacity-50">folder_open</span>
                        <p className="text-sm text-center">还没有保存任何脚本<br />点击上方按钮保存当前脚本</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {scripts.map(script => (
                            <div
                                key={script.id}
                                className="group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                            >
                                {editingId === script.id ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(script.id)}
                                            className="flex-1 px-2 py-1 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(script.id)}
                                            className="text-primary hover:text-blue-700"
                                        >
                                            <span className="material-symbols-outlined text-lg">check</span>
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div onClick={() => onSelectScript(script)}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary text-lg">description</span>
                                                <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {script.title}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(script.id);
                                                        setEditTitle(script.title);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('确定要删除这个脚本吗？')) {
                                                            onDeleteScript(script.id);
                                                        }
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-red-500 rounded"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                            {script.content.substring(0, 80)}...
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            更新于 {formatDate(script.updatedAt)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
};

export default ScriptLibrary;
