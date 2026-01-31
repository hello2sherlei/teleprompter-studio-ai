import React, { useState, useEffect } from 'react';

interface ControlsProps {
    isRecording: boolean;
    isScrolling: boolean;
    onToggleRecord: () => void;
    onToggleScroll: () => void;
    onResetScroll: () => void;
    aspectRatio: '16:9' | '9:16';
    onAspectRatioChange: (ratio: '16:9' | '9:16') => void;
    onToggleSettings: () => void;
    cameraOn: boolean;
    micOn: boolean;
    onToggleCamera: () => void;
    onToggleMic: () => void;
}

const Controls: React.FC<ControlsProps> = ({
    isRecording,
    isScrolling,
    onToggleRecord,
    onToggleScroll,
    onResetScroll,
    aspectRatio,
    onAspectRatioChange,
    onToggleSettings,
    cameraOn,
    micOn,
    onToggleCamera,
    onToggleMic
}) => {

    // Timer
    const [time, setTime] = useState(0);

    // Timer effect
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else {
            setTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-[#1A202C] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-700 px-3 md:px-6 py-2 md:py-3 flex items-center gap-2 md:gap-4 z-30 max-w-[95vw] safe-area-bottom">
            {/* Time */}
            <div className={`font-mono text-base md:text-xl font-medium w-12 md:w-16 text-center ${isRecording ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                {formatTime(time)}
            </div>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Play/Pause Scroll */}
            <button
                onClick={onToggleScroll}
                className={`p-2.5 rounded-full transition-all ${isScrolling ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                title={isScrolling ? '暂停滚动' : '开始滚动'}
            >
                <span className="material-symbols-outlined">
                    {isScrolling ? 'pause' : 'play_arrow'}
                </span>
            </button>

            {/* Reset Scroll */}
            <button
                onClick={onResetScroll}
                className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                title="重置滚动位置"
            >
                <span className="material-symbols-outlined">replay</span>
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Record Button */}
            <button onClick={onToggleRecord} className="relative group flex items-center justify-center" title={isRecording ? '停止录制' : '开始录制'}>
                <div className={`absolute inset-0 bg-red-500/20 rounded-full transition-transform duration-300 ${isRecording ? 'animate-ping scale-100' : 'scale-0 group-hover:scale-150'}`}></div>
                <div className={`size-12 rounded-full bg-red-500 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center transition-transform active:scale-95`}>
                    {isRecording ? (
                        <div className="size-4 bg-white rounded-sm"></div>
                    ) : (
                        <div className="size-4 bg-white rounded-full"></div>
                    )}
                </div>
            </button>

            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

            {/* Quick Settings */}
            <div className="flex items-center gap-1">
                {/* Microphone */}
                <button
                    onClick={onToggleMic}
                    className={`p-2 rounded-lg transition-colors ${micOn ? 'text-gray-500 hover:text-primary hover:bg-primary/10' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}
                    title={micOn ? '关闭麦克风' : '打开麦克风'}
                >
                    <span className="material-symbols-outlined">{micOn ? 'mic' : 'mic_off'}</span>
                </button>

                {/* Camera */}
                <button
                    onClick={onToggleCamera}
                    className={`p-2 rounded-lg transition-colors ${cameraOn ? 'text-gray-500 hover:text-primary hover:bg-primary/10' : 'text-red-500 bg-red-50 dark:bg-red-900/20'}`}
                    title={cameraOn ? '关闭摄像头' : '打开摄像头'}
                >
                    <span className="material-symbols-outlined">{cameraOn ? 'videocam' : 'videocam_off'}</span>
                </button>

                {/* Settings */}
                <button
                    onClick={onToggleSettings}
                    className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    title="设置"
                >
                    <span className="material-symbols-outlined">tune</span>
                </button>

                {/* Aspect Ratio */}
                <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ml-2">
                    <button
                        onClick={() => onAspectRatioChange('16:9')}
                        className={`px-2 py-1 text-xs font-bold rounded shadow-sm transition-all ${aspectRatio === '16:9' ? 'bg-white dark:bg-gray-600 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}
                    >
                        16:9
                    </button>
                    <button
                        onClick={() => onAspectRatioChange('9:16')}
                        className={`px-2 py-1 text-xs font-bold rounded shadow-sm transition-all ${aspectRatio === '9:16' ? 'bg-white dark:bg-gray-600 text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}
                    >
                        9:16
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;