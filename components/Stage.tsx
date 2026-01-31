import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { ScriptSettings } from '../types';

interface StageProps {
    script: string;
    isRecording: boolean;
    isScrolling: boolean;
    aspectRatio: '16:9' | '9:16';
    settings: ScriptSettings;
    cameraOn: boolean;
    micOn: boolean;
    onStreamReady?: (stream: MediaStream | null) => void;
    aiScrollSpeed?: number;
}

export interface StageRef {
    getMediaStream: () => MediaStream | null;
    resetScroll: () => void;
}

const Stage = forwardRef<StageRef, StageProps>(({
    script,
    isRecording,
    isScrolling,
    aspectRatio,
    settings,
    cameraOn,
    micOn,
    onStreamReady,
    aiScrollSpeed = 1
}, ref) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const streamRef = useRef<MediaStream | null>(null);

    useImperativeHandle(ref, () => ({
        getMediaStream: () => streamRef.current,
        resetScroll: () => {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = 0;
                setScrollProgress(0);
            }
        }
    }));

    // Auto-scroll when isScrolling is true
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isScrolling && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            interval = setInterval(() => {
                container.scrollTop += (settings.scrollSpeed / 20);
                // Calculate progress
                const maxScroll = container.scrollHeight - container.clientHeight;
                const progress = maxScroll > 0 ? (container.scrollTop / maxScroll) * 100 : 0;
                setScrollProgress(Math.min(100, progress));
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isScrolling, settings.scrollSpeed]);

    // Camera Init
    useEffect(() => {
        const startCamera = async () => {
            if (!cameraOn) {
                // Stop camera
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => {
                        if (track.kind === 'video') {
                            track.stop();
                        }
                    });
                }
                if (videoRef.current) {
                    videoRef.current.srcObject = null;
                }
                setCameraActive(false);
                return;
            }

            try {
                const constraints: MediaStreamConstraints = {
                    video: true,
                    audio: micOn
                };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setCameraActive(true);
                }
                if (onStreamReady) {
                    onStreamReady(stream);
                }
            } catch (err) {
                console.error("Camera error:", err);
                setCameraActive(false);
            }
        };
        startCamera();

        return () => {
            // Cleanup on unmount
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraOn]);

    // Handle microphone toggle
    useEffect(() => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = micOn;
            });
        }
    }, [micOn]);

    // Handle scroll events for manual scrolling
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const maxScroll = container.scrollHeight - container.clientHeight;
            const progress = maxScroll > 0 ? (container.scrollTop / maxScroll) * 100 : 0;
            setScrollProgress(Math.min(100, progress));
        }
    };

    const getWidthClass = () => {
        switch (settings.textWidth) {
            case 'Narrow': return 'w-1/3 border-x border-white/5';
            case 'Medium': return 'w-2/3 border-x border-white/5';
            case 'Wide': return 'w-full';
            default: return 'w-full';
        }
    };

    const getTextColorClass = () => {
        switch (settings.textColor) {
            case 'yellow': return 'text-yellow-100';
            case 'cyan': return 'text-cyan-100';
            default: return 'text-white';
        }
    };

    const getGuideColorClass = () => {
        switch (settings.guideLineColor) {
            case 'red': return 'text-red-500 border-red-500/30 bg-red-500/5';
            case 'green': return 'text-green-500 border-green-500/30 bg-green-500/5';
            default: return 'text-primary border-primary/30 bg-primary/5';
        }
    };

    return (
        <section className="flex-1 flex flex-col relative bg-gray-100 dark:bg-black p-4 md:p-6 overflow-hidden items-center justify-center">

            {/* Header overlay for recording (if active) */}
            {isRecording && (
                <div className="absolute top-0 left-0 right-0 z-40 p-4 flex justify-between items-center bg-transparent pointer-events-none">
                    <div className="px-3 py-1 bg-black/50 backdrop-blur rounded-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-red-500 text-sm animate-pulse">radio_button_checked</span>
                        <span className="text-white text-sm font-semibold">录制中</span>
                    </div>
                </div>
            )}

            {/* Scroll Progress Bar */}
            {(isScrolling || scrollProgress > 0) && (
                <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-2 rounded-lg">
                    <span className="text-white text-xs font-medium">{Math.round(scrollProgress)}%</span>
                    <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all duration-200"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Main Video Container */}
            <div
                className={`relative w-full h-full bg-black rounded-2xl shadow-2xl overflow-hidden group ring-1 ring-black/10 dark:ring-white/10 transition-all duration-500 ease-in-out`}
                style={{
                    maxWidth: aspectRatio === '16:9' ? '1200px' : '500px',
                    aspectRatio: aspectRatio === '16:9' ? '16/9' : '9/16'
                }}
            >
                {/* Hidden canvas for recording composite */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover ${settings.mirrorVideo ? '-scale-x-100' : ''}`}
                    style={{ display: cameraActive ? 'block' : 'none' }}
                />

                {/* Fallback when camera is off */}
                {!cameraActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <div className="text-center">
                            <span className="material-symbols-outlined text-6xl text-gray-600 mb-2">videocam_off</span>
                            <p className="text-gray-500 text-sm">摄像头已关闭</p>
                        </div>
                    </div>
                )}

                {/* Grid Overlay */}
                {settings.showGrid && (
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
                        <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                            <div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div>
                            <div className="border-r border-b border-white"></div><div className="border-r border-b border-white"></div><div className="border-b border-white"></div>
                            <div className="border-r border-white"></div><div className="border-r border-white"></div><div></div>
                        </div>
                    </div>
                )}

                {/* AI Sync Badge (Only when scrolling) */}
                {isScrolling && (
                    <div className="absolute top-6 left-6 z-20 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10 shadow-lg">
                        <div className="relative size-3 flex items-center justify-center">
                            <div className={`absolute w-full h-full rounded-full ${aiScrollSpeed > 0.8 ? 'bg-green-500' : aiScrollSpeed > 0.4 ? 'bg-yellow-500' : 'bg-orange-500'} opacity-40 animate-ping`}></div>
                            <div className={`relative size-2 ${aiScrollSpeed > 0.8 ? 'bg-green-500' : aiScrollSpeed > 0.4 ? 'bg-yellow-500' : 'bg-orange-500'} rounded-full`}></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white uppercase tracking-wider leading-none mb-0.5">AI 语速同步</span>
                            <span className="text-[10px] text-gray-300 font-medium leading-none">
                                {aiScrollSpeed > 0.8 ? '正常语速' : aiScrollSpeed > 0.4 ? '语速放缓' : '等待说话...'}
                            </span>
                        </div>
                        <div className="flex items-center gap-0.5 ml-1">
                            <div className={`w-1 ${aiScrollSpeed > 0.3 ? 'bg-primary' : 'bg-gray-600'} rounded transition-all`} style={{ height: '8px' }}></div>
                            <div className={`w-1 ${aiScrollSpeed > 0.5 ? 'bg-primary' : 'bg-gray-600'} rounded transition-all`} style={{ height: '12px' }}></div>
                            <div className={`w-1 ${aiScrollSpeed > 0.8 ? 'bg-primary' : 'bg-gray-600'} rounded transition-all`} style={{ height: '16px' }}></div>
                            <div className={`w-1 ${aiScrollSpeed > 1.0 ? 'bg-primary' : 'bg-gray-600'} rounded transition-all`} style={{ height: '12px' }}></div>
                            <div className={`w-1 ${aiScrollSpeed > 1.1 ? 'bg-primary' : 'bg-gray-600'} rounded transition-all`} style={{ height: '8px' }}></div>
                        </div>
                    </div>
                )}

                {!isRecording && (
                    <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-20">
                        <div className="size-2.5 rounded-full bg-green-500"></div>
                        <span className="text-white text-xs font-medium tracking-wide">预览</span>
                    </div>
                )}

                {/* Teleprompter Overlay */}
                <div className={`absolute inset-0 z-10 flex justify-center pointer-events-none`}>
                    <div
                        className={`h-full pointer-events-auto backdrop-blur-sm transition-all duration-300 flex flex-col items-center relative overflow-hidden ${getWidthClass()}`}
                        style={{ backgroundColor: `rgba(0, 0, 0, ${settings.opacity / 100})` }}
                    >

                        {/* Guide Line */}
                        <div className={`absolute top-1/2 left-0 w-full h-20 -translate-y-1/2 border-y-2 z-0 pointer-events-none transition-colors duration-300 ${getGuideColorClass()}`}>
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70">
                                <span className="material-symbols-outlined text-3xl">play_arrow</span>
                            </div>
                        </div>

                        {/* Text Area */}
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="relative w-full flex-1 overflow-y-auto scrollbar-hide px-8 md:px-12 py-12 mask-image-gradient scroll-smooth"
                        >
                            {/* Spacer to allow scrolling to start at middle */}
                            <div className="h-[40%]"></div>

                            <div className={`font-bold text-center leading-normal opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-pre-wrap transition-all duration-300 ${getTextColorClass()}`}
                                style={{ fontSize: `${settings.fontSize}px` }}
                            >
                                {script || "在此输入脚本内容..."}
                            </div>

                            {/* Spacer to allow scrolling to end at middle */}
                            <div className="h-[40%]"></div>
                        </div>
                    </div>
                </div>

                {/* Mic indicator */}
                {!micOn && cameraActive && (
                    <div className="absolute bottom-6 right-6 z-30 bg-red-500/80 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="material-symbols-outlined text-white text-sm">mic_off</span>
                        <span className="text-white text-xs font-medium">已静音</span>
                    </div>
                )}
            </div>
        </section>
    );
});

Stage.displayName = 'Stage';

export default Stage;