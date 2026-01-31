import React, { useState, useRef, useEffect } from 'react';

interface ReviewSessionProps {
    recordedBlob: Blob;
    script: string;
    recordingDuration: number;
    recordingAspectRatio?: '16:9' | '9:16'; // Aspect ratio selected during recording
    onBack: () => void;
    onDownload: () => void;
    onDelete: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({
    recordedBlob,
    script,
    recordingDuration,
    recordingAspectRatio = '16:9',
    onBack,
    onDownload,
    onDelete
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [videoDuration, setVideoDuration] = useState(recordingDuration);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [format, setFormat] = useState<'MP4' | 'WebM'>('MP4');
    const [resolution, setResolution] = useState('1080p HD');
    // Default to the recording aspect ratio instead of 'original'
    const [targetAspectRatio, setTargetAspectRatio] = useState<'16:9' | '9:16' | '1:1' | 'original'>(recordingAspectRatio);
    const [originalAspectRatio, setOriginalAspectRatio] = useState<number>(16 / 9);

    const recordingDate = new Date().toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const wordCount = script.replace(/\s/g, '').length;

    useEffect(() => {
        const url = URL.createObjectURL(recordedBlob);
        setVideoUrl(url);
        return () => {
            URL.revokeObjectURL(url);
        };
    }, [recordedBlob]);

    useEffect(() => {
        if (recordingDuration > 0 && videoDuration === 0) {
            setVideoDuration(recordingDuration);
        }
    }, [recordingDuration, videoDuration]);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            if (isFinite(dur) && !isNaN(dur) && dur > 0) {
                setVideoDuration(dur);
            }
            const width = videoRef.current.videoWidth;
            const height = videoRef.current.videoHeight;
            if (width && height) {
                setOriginalAspectRatio(width / height);
            }
        }
    };

    const handleCanPlay = () => {
        if (videoRef.current) {
            const dur = videoRef.current.duration;
            if (isFinite(dur) && !isNaN(dur) && dur > 0 && videoDuration === 0) {
                setVideoDuration(dur);
            }
        }
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (videoRef.current && isFinite(time)) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (seconds: number) => {
        if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
            return '00:00';
        }
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fileSize = (recordedBlob.size / 1024 / 1024).toFixed(2);
    const displayDuration = videoDuration > 0 ? videoDuration : recordingDuration;

    // Get the numeric aspect ratio for target
    const getTargetRatio = () => {
        switch (targetAspectRatio) {
            case '16:9': return 16 / 9;
            case '9:16': return 9 / 16;
            case '1:1': return 1;
            default: return originalAspectRatio;
        }
    };

    // Calculate container dimensions to show cropped preview
    const getContainerStyle = () => {
        const targetRatio = getTargetRatio();

        if (targetAspectRatio === 'original') {
            // Show original aspect ratio
            return {
                aspectRatio: `${originalAspectRatio}`,
                maxHeight: '450px'
            };
        }

        // For cropped view, use target aspect ratio
        return {
            aspectRatio: `${targetRatio}`,
            // Make the container larger to match the recording preview
            maxHeight: targetAspectRatio === '9:16' ? '75vh' : '60vh',
            maxWidth: targetAspectRatio === '9:16' ? '450px' : '100%',
            width: targetAspectRatio === '9:16' ? '100%' : undefined,
            margin: '0 auto'
        };
    };

    return (
        <div
            className="fixed inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-gray-800 z-[100]"
            style={{ overflowY: 'auto' }}
        >
            {/* Header */}
            <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-50">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary transition"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-medium">返回工作室</span>
                </button>
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">smart_display</span>
                    <span className="font-bold text-gray-900 dark:text-white">Studio AI</span>
                </div>
                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-purple-500"></div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">回顾录制内容</h1>

                    {/* Aspect Ratio Selection */}
                    <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                        {(['original', '16:9', '9:16', '1:1'] as const).map((ratio) => (
                            <button
                                key={ratio}
                                onClick={() => setTargetAspectRatio(ratio)}
                                className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 transition ${targetAspectRatio === ratio
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {ratio === 'original' ? (
                                    <>
                                        <span className="material-symbols-outlined text-xs">crop_free</span>
                                        原始
                                    </>
                                ) : ratio}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Crop Info Banner */}
                {targetAspectRatio !== 'original' && (
                    <div className="mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500 text-lg">crop</span>
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                            智能裁剪: 视频将从中心裁剪为 {targetAspectRatio} 比例
                        </span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Video Player - Left Side */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
                            {/* Video Container with Crop */}
                            <div
                                className="relative flex items-center justify-center bg-black overflow-hidden"
                                style={getContainerStyle()}
                            >
                                {videoUrl && (
                                    <video
                                        ref={videoRef}
                                        src={videoUrl}
                                        className="absolute"
                                        style={{
                                            // Use object-fit: cover to crop and fill the container
                                            objectFit: targetAspectRatio === 'original' ? 'contain' : 'cover',
                                            objectPosition: 'center',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                        onCanPlay={handleCanPlay}
                                        onEnded={() => setIsPlaying(false)}
                                        onClick={togglePlay}
                                        preload="auto"
                                    />
                                )}

                                {/* Play Button Overlay */}
                                {!isPlaying && (
                                    <button
                                        onClick={togglePlay}
                                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition z-10"
                                    >
                                        <div className="size-16 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
                                            <span className="material-symbols-outlined text-3xl text-gray-800 ml-1">play_arrow</span>
                                        </div>
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="px-4 py-2.5 bg-gray-900">
                                <div className="flex items-center gap-3">
                                    <button onClick={togglePlay} className="text-white hover:text-primary transition">
                                        <span className="material-symbols-outlined text-xl">
                                            {isPlaying ? 'pause' : 'play_arrow'}
                                        </span>
                                    </button>
                                    <span className="text-xs text-gray-400 font-mono w-10">{formatTime(currentTime)}</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={displayDuration > 0 ? displayDuration : 100}
                                        value={currentTime}
                                        onChange={handleSeek}
                                        className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary"
                                    />
                                    <span className="text-xs text-gray-400 font-mono w-10">{formatTime(displayDuration)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Transcript Info */}
                        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
                            <span className="size-2 rounded-full bg-green-500"></span>
                            <span>脚本共 {wordCount} 字，录制时长 {formatTime(displayDuration)}</span>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Session Info Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">录制模式</span>
                                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs font-medium rounded">草稿</span>
                                </div>
                                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">提词器录制</h2>
                                <p className="text-xs text-gray-500">录制于 {recordingDate}</p>
                            </div>

                            {/* AI Summary */}
                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">AI 摘要</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                                    本次录制表现良好！
                                </p>
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                        <span className="text-xs text-gray-600 dark:text-gray-300">语速均匀，表达流畅</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 text-base">check_circle</span>
                                        <span className="text-xs text-gray-600 dark:text-gray-300">视频画面清晰稳定</span>
                                    </div>
                                </div>
                            </div>

                            {/* Script Preview */}
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">脚本内容</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2 text-xs text-gray-600 dark:text-gray-300 max-h-16 overflow-hidden relative">
                                    {script.slice(0, 80)}...
                                    <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-50 dark:from-gray-900"></div>
                                </div>
                            </div>
                        </div>

                        {/* Export Options Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">导出选项</h3>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                                    <label className="text-xs text-gray-500 block mb-0.5">分辨率</label>
                                    <select
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none cursor-pointer"
                                    >
                                        <option value="1080p HD">1080p HD</option>
                                        <option value="720p HD">720p HD</option>
                                        <option value="480p">480p</option>
                                    </select>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                                    <label className="text-xs text-gray-500 block mb-0.5">格式</label>
                                    <select
                                        value={format}
                                        onChange={(e) => setFormat(e.target.value as 'MP4' | 'WebM')}
                                        className="w-full bg-transparent text-sm font-medium text-gray-900 dark:text-white outline-none cursor-pointer"
                                    >
                                        <option value="MP4">MP4</option>
                                        <option value="WebM">WebM</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                onClick={onDownload}
                                className="w-full py-2.5 bg-gradient-to-r from-primary to-purple-500 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-primary/20 text-sm"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                下载视频
                            </button>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                                    <span className="material-symbols-outlined text-base">cloud_upload</span>
                                    保存到云端
                                </button>
                                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition">
                                    <span className="material-symbols-outlined text-base">share</span>
                                    分享链接
                                </button>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                                <span className="text-xs text-gray-400">文件大小: {fileSize} MB</span>
                            </div>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={onDelete}
                            className="w-full py-2 border border-red-200 dark:border-red-900/50 text-red-500 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm"
                        >
                            <span className="material-symbols-outlined text-base">delete</span>
                            删除录制
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReviewSession;
