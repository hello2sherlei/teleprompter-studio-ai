import React, { useEffect, useState } from 'react';
import { ScriptSettings as SettingsType } from '../types';

interface ScriptSettingsProps {
    settings: SettingsType;
    updateSettings: (key: keyof SettingsType, value: any) => void;
}

interface MediaDevice {
    deviceId: string;
    label: string;
    kind: string;
}

const ScriptSettings: React.FC<ScriptSettingsProps> = ({ settings, updateSettings }) => {
    const [microphones, setMicrophones] = useState<MediaDevice[]>([]);
    const [cameras, setCameras] = useState<MediaDevice[]>([]);
    const [devicesLoaded, setDevicesLoaded] = useState(false);

    // Load available devices
    useEffect(() => {
        const loadDevices = async () => {
            try {
                // Request permission first to get device labels
                await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

                const devices = await navigator.mediaDevices.enumerateDevices();

                const mics = devices
                    .filter(d => d.kind === 'audioinput')
                    .map(d => ({
                        deviceId: d.deviceId,
                        label: d.label || `麦克风 ${d.deviceId.slice(0, 8)}`,
                        kind: d.kind
                    }));

                const cams = devices
                    .filter(d => d.kind === 'videoinput')
                    .map(d => ({
                        deviceId: d.deviceId,
                        label: d.label || `摄像头 ${d.deviceId.slice(0, 8)}`,
                        kind: d.kind
                    }));

                setMicrophones(mics);
                setCameras(cams);
                setDevicesLoaded(true);

                // Auto-select first device if none selected
                if (!settings.selectedMicId && mics.length > 0) {
                    updateSettings('selectedMicId', mics[0].deviceId);
                }
                if (!settings.selectedCameraId && cams.length > 0) {
                    updateSettings('selectedCameraId', cams[0].deviceId);
                }
            } catch (err) {
                console.error('Error loading devices:', err);
            }
        };

        loadDevices();

        // Listen for device changes
        navigator.mediaDevices.addEventListener('devicechange', loadDevices);
        return () => {
            navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
        };
    }, []);

    return (
        <aside className="w-80 bg-white dark:bg-[#1a202c] border-l border-[#e5e7eb] dark:border-[#2d3748] flex flex-col overflow-y-auto shrink-0 z-10 shadow-lg h-full">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                <h3 className="text-[#111418] dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">提词器设置</h3>
                <p className="text-sm text-gray-500 mt-1">调整提词器的显示效果</p>
            </div>

            {/* Device Selection Section */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 bg-orange-50/30 dark:bg-orange-900/10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-6 rounded-md bg-orange-200 dark:bg-orange-900 text-orange-700 dark:text-orange-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">settings_input_component</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">设备选择</span>
                </div>

                {/* Microphone Selection */}
                <div className="mb-4">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                        <span className="material-symbols-outlined text-sm">mic</span>
                        麦克风
                    </label>
                    <select
                        value={settings.selectedMicId || ''}
                        onChange={(e) => updateSettings('selectedMicId', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-primary transition cursor-pointer"
                    >
                        {!devicesLoaded ? (
                            <option>加载中...</option>
                        ) : microphones.length === 0 ? (
                            <option>未找到麦克风</option>
                        ) : (
                            microphones.map((mic) => (
                                <option key={mic.deviceId} value={mic.deviceId}>
                                    {mic.label}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Camera Selection */}
                <div>
                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-2">
                        <span className="material-symbols-outlined text-sm">videocam</span>
                        摄像头
                    </label>
                    <select
                        value={settings.selectedCameraId || ''}
                        onChange={(e) => updateSettings('selectedCameraId', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-primary transition cursor-pointer"
                    >
                        {!devicesLoaded ? (
                            <option>加载中...</option>
                        ) : cameras.length === 0 ? (
                            <option>未找到摄像头</option>
                        ) : (
                            cameras.map((cam) => (
                                <option key={cam.deviceId} value={cam.deviceId}>
                                    {cam.label}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    选择录制时使用的音视频设备
                </p>
            </div>

            {/* Beauty Filter Section */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 bg-pink-50/30 dark:bg-pink-900/10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-6 rounded-md bg-pink-200 dark:bg-pink-900 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">face_retouching_natural</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">美颜滤镜</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {[
                        { id: 'none', label: '原图', icon: 'block' },
                        { id: 'natural', label: '自然', icon: 'spa' },
                        { id: 'bright', label: '提亮', icon: 'light_mode' },
                        { id: 'warm', label: '暖色', icon: 'thermostat' },
                        { id: 'cool', label: '冷色', icon: 'ac_unit' },
                        { id: 'vintage', label: '复古', icon: 'photo_camera' },
                        { id: 'soft', label: '柔焦', icon: 'blur_on' },
                    ].map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => updateSettings('beautyFilter', filter.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition ${settings.beautyFilter === filter.id
                                    ? 'bg-pink-100 dark:bg-pink-900/50 border-2 border-pink-400'
                                    : 'bg-gray-100 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-lg ${settings.beautyFilter === filter.id ? 'text-pink-500' : 'text-gray-500'}`}>
                                {filter.icon}
                            </span>
                            <span className={`text-[10px] font-medium ${settings.beautyFilter === filter.id ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500'}`}>
                                {filter.label}
                            </span>
                        </button>
                    ))}
                </div>

                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">auto_awesome</span>
                    实时预览美颜效果
                </p>
            </div>

            {/* Font Size Slider */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-macaron-pink/40 text-pink-700 dark:text-pink-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">format_size</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">字体大小</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{settings.fontSize}px</span>
                </div>
                <input
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-400"
                    type="range"
                    min="16"
                    max="72"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings('fontSize', parseInt(e.target.value))}
                />
            </div>

            {/* Background Opacity */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">opacity</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">背景透明度</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{settings.opacity}%</span>
                </div>
                <input
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-500"
                    type="range"
                    min="0"
                    max="90"
                    value={settings.opacity}
                    onChange={(e) => updateSettings('opacity', parseInt(e.target.value))}
                />
            </div>

            {/* AI Scroll Speed / Sensitivity */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50 bg-blue-50/30 dark:bg-blue-900/10">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-macaron-lavender text-purple-700 dark:text-purple-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">psychology</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">滚动速度</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{settings.scrollSpeed}</span>
                </div>
                <input
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-400"
                    type="range"
                    min="5"
                    max="100"
                    value={settings.scrollSpeed}
                    onChange={(e) => updateSettings('scrollSpeed', parseInt(e.target.value))}
                />
                <p className="text-xs text-gray-500 mt-2">调整字幕滚动的基础速度</p>
            </div>

            {/* Visual Colors */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center gap-2 mb-4">
                    <div className="size-6 rounded-md bg-macaron-mint text-green-700 dark:text-green-300 flex items-center justify-center">
                        <span className="material-symbols-outlined text-sm">palette</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">外观设置</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">文字颜色</label>
                        <div className="flex gap-2">
                            <button onClick={() => updateSettings('textColor', 'white')} className={`size-6 rounded-full bg-white border border-gray-300 shadow-sm ${settings.textColor === 'white' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                            <button onClick={() => updateSettings('textColor', 'yellow')} className={`size-6 rounded-full bg-yellow-100 border border-yellow-200 ${settings.textColor === 'yellow' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                            <button onClick={() => updateSettings('textColor', 'cyan')} className={`size-6 rounded-full bg-cyan-100 border border-cyan-200 ${settings.textColor === 'cyan' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">引导线</label>
                        <div className="flex gap-2">
                            <button onClick={() => updateSettings('guideLineColor', 'blue')} className={`size-6 rounded-full bg-primary border border-blue-600 shadow-sm ${settings.guideLineColor === 'blue' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                            <button onClick={() => updateSettings('guideLineColor', 'red')} className={`size-6 rounded-full bg-red-500 border border-red-600 ${settings.guideLineColor === 'red' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                            <button onClick={() => updateSettings('guideLineColor', 'green')} className={`size-6 rounded-full bg-green-500 border border-green-600 ${settings.guideLineColor === 'green' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Margin / Width */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-800/50">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-md bg-macaron-lemon text-yellow-700 dark:text-yellow-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm">width</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">文字宽度</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {(['Narrow', 'Medium', 'Wide'] as const).map((width) => (
                        <button
                            key={width}
                            onClick={() => updateSettings('textWidth', width)}
                            className={`flex-1 py-1.5 px-2 rounded text-xs font-medium transition ${settings.textWidth === width ? 'bg-primary/10 border border-primary/20 text-primary font-bold' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {width === 'Narrow' ? '窄' : width === 'Medium' ? '中' : '宽'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Additional Toggles */}
            <div className="p-5 flex-1">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">镜像视频</span>
                        <button
                            onClick={() => updateSettings('mirrorVideo', !settings.mirrorVideo)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.mirrorVideo ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${settings.mirrorVideo ? 'translate-x-4.5' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">显示网格</span>
                        <button
                            onClick={() => updateSettings('showGrid', !settings.showGrid)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.showGrid ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${settings.showGrid ? 'translate-x-4.5' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-300">眼神修正 (Beta)</span>
                        <button
                            onClick={() => updateSettings('eyeContactFix', !settings.eyeContactFix)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${settings.eyeContactFix ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition ${settings.eyeContactFix ? 'translate-x-4.5' : 'translate-x-1'}`}></span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default ScriptSettings;