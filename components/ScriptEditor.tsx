import React, { useState } from 'react';
import * as GeminiService from '../services/geminiService';

interface ScriptEditorProps {
    script: string;
    setScript: (s: string) => void;
    onClose: () => void;
    scrollSpeed: number;
    fontSize: number;
    onScrollSpeedChange: (speed: number) => void;
    onFontSizeChange: (size: number) => void;
}

const ScriptEditor: React.FC<ScriptEditorProps> = ({
    script,
    setScript,
    onClose,
    scrollSpeed,
    fontSize,
    onScrollSpeedChange,
    onFontSizeChange
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSpeedPicker, setShowSpeedPicker] = useState(false);
    const [showFontPicker, setShowFontPicker] = useState(false);

    const handleRewrite = async () => {
        setIsGenerating(true);
        try {
            const newScript = await GeminiService.rewriteScript(script);
            setScript(newScript);
        } catch (e) {
            console.error(e);
        }
        setIsGenerating(false);
    };

    const handleExpand = async () => {
        setIsGenerating(true);
        try {
            const newScript = await GeminiService.expandScript(script);
            setScript(newScript);
        } catch (e) {
            console.error(e);
        }
        setIsGenerating(false);
    };

    const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
    const charCount = script.length;

    return (
        <aside className="w-96 bg-white dark:bg-[#1A202C] border-l border-black/5 dark:border-white/10 flex flex-col shrink-0 z-20 shadow-xl h-full">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-lavender/30 dark:bg-lavender-dark/10">
                <div>
                    <h1 className="text-base font-bold text-gray-900 dark:text-white">脚本编辑器</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{charCount} 字符 · {wordCount} 词</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <span className="material-symbols-outlined">close_fullscreen</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800 overflow-x-auto">
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
                    <span className="material-symbols-outlined text-[20px]">format_italic</span>
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>

                {/* Speed Picker */}
                <div className="relative">
                    <button
                        onClick={() => { setShowSpeedPicker(!showSpeedPicker); setShowFontPicker(false); }}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1 text-xs font-medium"
                    >
                        <span className="material-symbols-outlined text-[20px]">speed</span>
                        <span>{scrollSpeed}</span>
                    </button>
                    {showSpeedPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50 w-48">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">滚动速度</label>
                            <input
                                type="range"
                                min="5"
                                max="100"
                                value={scrollSpeed}
                                onChange={(e) => onScrollSpeedChange(parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>慢</span>
                                <span>快</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Font Size Picker */}
                <div className="relative">
                    <button
                        onClick={() => { setShowFontPicker(!showFontPicker); setShowSpeedPicker(false); }}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center gap-1 text-xs font-medium"
                    >
                        <span className="material-symbols-outlined text-[20px]">text_fields</span>
                        <span>{fontSize}px</span>
                    </button>
                    {showFontPicker && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50 w-48">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2 block">字体大小</label>
                            <input
                                type="range"
                                min="16"
                                max="72"
                                value={fontSize}
                                onChange={(e) => onFontSizeChange(parseInt(e.target.value))}
                                className="w-full accent-primary"
                            />
                            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                                <span>小</span>
                                <span>大</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1"></div>

                {/* Clear Button */}
                <button
                    onClick={() => setScript('')}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                    title="清空"
                >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 relative" onClick={() => { setShowSpeedPicker(false); setShowFontPicker(false); }}>
                <textarea
                    className="w-full h-full resize-none p-6 bg-transparent border-none focus:ring-0 text-base leading-relaxed text-gray-700 dark:text-gray-200 custom-scrollbar focus:outline-none"
                    placeholder="在此输入脚本内容..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                />
            </div>

            {/* AI Action Area */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/30">
                    <div className="flex items-start gap-3 mb-3">
                        <span className={`material-symbols-outlined text-primary mt-0.5 ${isGenerating ? 'animate-spin' : ''}`}>auto_awesome</span>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI 智能生成</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">让 Gemini AI 帮你优化或扩展脚本</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleRewrite}
                            disabled={isGenerating || !script.trim()}
                            className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[16px]">draw</span>
                            优化润色
                        </button>
                        <button
                            onClick={handleExpand}
                            disabled={isGenerating || !script.trim()}
                            className="flex-1 bg-primary hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            扩展内容
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ScriptEditor;