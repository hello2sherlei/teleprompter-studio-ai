import React, { useState, useRef, useEffect, useCallback } from 'react';
import TopNav from './components/TopNav';
import LeftSidebar from './components/LeftSidebar';
import Stage, { StageRef } from './components/Stage';
import ScriptEditor from './components/ScriptEditor';
import ScriptSettings from './components/ScriptSettings';
import ScriptLibrary from './components/ScriptLibrary';
import Controls from './components/Controls';
import ReviewSession from './components/ReviewSession';
import { ScriptSettings as SettingsType, Script } from './types';

// LocalStorage keys
const STORAGE_KEYS = {
    SCRIPTS: 'teleprompter_scripts',
    DARK_MODE: 'teleprompter_dark_mode',
    SETTINGS: 'teleprompter_settings',
    CURRENT_SCRIPT: 'teleprompter_current_script'
};

const App: React.FC = () => {
    // Default script content
    const defaultScript = `欢迎回来，今天我们继续录制。

这是一个由 AI 驱动的专业提词器应用，帮助你流畅地完成视频录制。

记得点击下方的播放按钮开始自动滚动，调整设置中的滚动速度以适应你的语速。

让我们开始吧...`;

    // State
    const [mode, setMode] = useState<'studio' | 'library' | 'settings'>('studio');
    const [viewMode, setViewMode] = useState<'studio' | 'review'>('studio');
    const [script, setScript] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SCRIPT);
        return saved ? saved : defaultScript;
    });
    const [lastSavedScript, setLastSavedScript] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_SCRIPT);
        return saved ? saved : defaultScript;
    });
    const [isSaving, setIsSaving] = useState(false);

    const [isRecording, setIsRecording] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [rightPanelMode, setRightPanelMode] = useState<'editor' | 'settings'>('editor');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    // Media state
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const recordingStartTimeRef = useRef<number>(0);

    // AI Speech Sync state
    const [aiScrollSpeed, setAiScrollSpeed] = useState(1);
    const speechRecognitionRef = useRef<any>(null);
    const lastSpeechTimeRef = useRef<number>(Date.now());

    // Dark mode
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
        return saved ? JSON.parse(saved) : false;
    });

    // Scripts library
    const [scripts, setScripts] = useState<Script[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SCRIPTS);
        return saved ? JSON.parse(saved) : [];
    });

    const [settings, setSettings] = useState<SettingsType>(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return saved ? JSON.parse(saved) : {
            fontSize: 28,
            scrollSpeed: 20,
            textWidth: 'Wide',
            textColor: 'white',
            guideLineColor: 'blue',
            mirrorVideo: false,
            showGrid: false,
            eyeContactFix: false,
            opacity: 10,
            selectedMicId: '',
            selectedCameraId: '',
            beautyFilter: 'natural'
        };
    });

    // Refs
    const stageRef = useRef<StageRef>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    // Effects
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEYS.DARK_MODE, JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SCRIPTS, JSON.stringify(scripts));
    }, [scripts]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }, [settings]);

    // Auto-save script with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (script !== lastSavedScript) {
                localStorage.setItem(STORAGE_KEYS.CURRENT_SCRIPT, script);
                setLastSavedScript(script);
            }
        }, 1000); // Save 1 second after user stops typing
        return () => clearTimeout(timer);
    }, [script, lastSavedScript]);

    // Manual save function
    const saveScript = useCallback(() => {
        setIsSaving(true);
        localStorage.setItem(STORAGE_KEYS.CURRENT_SCRIPT, script);
        setLastSavedScript(script);
        setTimeout(() => setIsSaving(false), 1000);
    }, [script]);

    // AI Speech Sync
    useEffect(() => {
        if (!isScrolling) {
            if (speechRecognitionRef.current) {
                speechRecognitionRef.current.stop();
                speechRecognitionRef.current = null;
            }
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.log('Speech recognition not supported');
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.language = 'zh-CN';

            recognition.onresult = () => {
                lastSpeechTimeRef.current = Date.now();
                setAiScrollSpeed(1.2);
            };

            recognition.onspeechend = () => {
                setAiScrollSpeed(0.3);
            };

            recognition.onerror = (event: any) => {
                if (event.error !== 'no-speech') {
                    console.log('Speech recognition error:', event.error);
                }
            };

            recognition.onend = () => {
                if (isScrolling && speechRecognitionRef.current) {
                    try {
                        recognition.start();
                    } catch (e) { }
                }
            };

            recognition.start();
            speechRecognitionRef.current = recognition;
        } catch (e) {
            console.log('Could not start speech recognition:', e);
        }

        return () => {
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (e) { }
                speechRecognitionRef.current = null;
            }
        };
    }, [isScrolling]);

    useEffect(() => {
        if (!isScrolling) return;

        const interval = setInterval(() => {
            const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
            if (timeSinceLastSpeech > 2000) {
                setAiScrollSpeed(0.2);
            } else if (timeSinceLastSpeech > 500) {
                setAiScrollSpeed(0.6);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [isScrolling]);

    const updateSettings = (key: keyof SettingsType, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleRightPanel = () => {
        if (rightPanelOpen && rightPanelMode === 'editor') {
            setRightPanelMode('settings');
        } else if (rightPanelOpen && rightPanelMode === 'settings') {
            setRightPanelOpen(false);
        } else {
            setRightPanelOpen(true);
            setRightPanelMode('editor');
        }
    };

    const openSettings = () => {
        setRightPanelMode('settings');
        setRightPanelOpen(true);
    };

    // Recording functions
    const startRecording = useCallback(async () => {
        try {
            // Calculate ideal dimensions based on aspect ratio
            // For 9:16, we want portrait; for 16:9, we want landscape
            const is916 = aspectRatio === '9:16';
            const idealWidth = is916 ? 1080 : 1920;
            const idealHeight = is916 ? 1920 : 1080;

            // Build constraints with selected devices and aspect ratio
            const videoConstraints: MediaTrackConstraints = {
                width: { ideal: idealWidth },
                height: { ideal: idealHeight },
                aspectRatio: { ideal: is916 ? 9 / 16 : 16 / 9 },
                ...(settings.selectedCameraId && { deviceId: { exact: settings.selectedCameraId } })
            };
            const audioConstraints: boolean | MediaTrackConstraints = micOn
                ? (settings.selectedMicId ? { deviceId: { exact: settings.selectedMicId } } : true)
                : false;

            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: audioConstraints
            });

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'video/webm;codecs=vp9'
            });

            recordedChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
                // Switch to review mode when recording stops
                setViewMode('review');
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start(1000);
            setIsRecording(true);
            setIsScrolling(true);
            recordingStartTimeRef.current = Date.now();
        } catch (error) {
            console.error('Recording error:', error);
            alert('无法开始录制，请确保允许摄像头和麦克风权限');
        }
    }, [micOn, aspectRatio, settings]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        // Calculate recording duration
        const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
        setRecordingDuration(duration);
        setIsRecording(false);
        setIsScrolling(false);
    }, []);

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            setRecordedBlob(null);
            startRecording();
        }
    };

    const toggleScroll = () => {
        setIsScrolling(!isScrolling);
    };

    const resetScroll = () => {
        if (stageRef.current) {
            stageRef.current.resetScroll();
        }
    };

    const clearRecording = () => {
        setRecordedBlob(null);
        setViewMode('studio');
    };

    const handleDownload = () => {
        if (recordedBlob) {
            const url = URL.createObjectURL(recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            // Download with .mp4 extension for better compatibility
            a.download = `teleprompter-recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    // Script library functions
    const handleCreateScript = (title: string, content: string) => {
        const newScript: Script = {
            id: Date.now().toString(),
            title,
            content,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        setScripts(prev => [newScript, ...prev]);
    };

    const handleDeleteScript = (id: string) => {
        setScripts(prev => prev.filter(s => s.id !== id));
    };

    const handleUpdateScript = (id: string, title: string, content: string) => {
        setScripts(prev => prev.map(s =>
            s.id === id ? { ...s, title, content, updatedAt: Date.now() } : s
        ));
    };

    const handleSelectScript = (selectedScript: Script) => {
        setScript(selectedScript.content);
        setMode('studio');
        setRightPanelMode('editor');
        setRightPanelOpen(true);
    };

    const handleModeChange = (newMode: 'studio' | 'library' | 'settings') => {
        setMode(newMode);
        if (newMode === 'library') {
            setRightPanelOpen(true);
        } else if (newMode === 'settings') {
            setRightPanelMode('settings');
            setRightPanelOpen(true);
        }
    };

    const effectiveScrollSpeed = settings.scrollSpeed * aiScrollSpeed;

    const renderRightPanel = () => {
        if (!rightPanelOpen) return null;

        if (mode === 'library') {
            return (
                <ScriptLibrary
                    scripts={scripts}
                    currentScript={script}
                    onSelectScript={handleSelectScript}
                    onCreateScript={handleCreateScript}
                    onDeleteScript={handleDeleteScript}
                    onUpdateScript={handleUpdateScript}
                    onClose={() => { setRightPanelOpen(false); setMode('studio'); }}
                />
            );
        }

        if (rightPanelMode === 'editor') {
            return (
                <ScriptEditor
                    script={script}
                    setScript={setScript}
                    onClose={() => setRightPanelOpen(false)}
                    scrollSpeed={settings.scrollSpeed}
                    fontSize={settings.fontSize}
                    onScrollSpeedChange={(speed) => updateSettings('scrollSpeed', speed)}
                    onFontSizeChange={(size) => updateSettings('fontSize', size)}
                    onSave={saveScript}
                    isSaving={isSaving}
                    hasUnsavedChanges={script !== lastSavedScript}
                />
            );
        }

        return (
            <ScriptSettings
                settings={settings}
                updateSettings={updateSettings}
            />
        );
    };

    // If in review mode, show the ReviewSession component
    if (viewMode === 'review' && recordedBlob) {
        return (
            <ReviewSession
                recordedBlob={recordedBlob}
                script={script}
                recordingDuration={recordingDuration}
                recordingAspectRatio={aspectRatio}
                onBack={clearRecording}
                onDownload={handleDownload}
                onDelete={clearRecording}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark font-display">
            <TopNav
                isRecording={isRecording}
                toggleRightPanel={toggleRightPanel}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
            />

            <main className="flex flex-1 overflow-hidden relative">
                <LeftSidebar
                    currentMode={mode}
                    setMode={handleModeChange}
                />

                <Stage
                    ref={stageRef}
                    script={script}
                    isRecording={isRecording}
                    isScrolling={isScrolling}
                    aspectRatio={aspectRatio}
                    settings={{ ...settings, scrollSpeed: effectiveScrollSpeed }}
                    cameraOn={cameraOn}
                    micOn={micOn}
                    aiScrollSpeed={aiScrollSpeed}
                />

                {renderRightPanel()}

                <Controls
                    isRecording={isRecording}
                    isScrolling={isScrolling}
                    onToggleRecord={toggleRecording}
                    onToggleScroll={toggleScroll}
                    onResetScroll={resetScroll}
                    aspectRatio={aspectRatio}
                    onAspectRatioChange={setAspectRatio}
                    onToggleSettings={openSettings}
                    cameraOn={cameraOn}
                    micOn={micOn}
                    onToggleCamera={() => setCameraOn(!cameraOn)}
                    onToggleMic={() => setMicOn(!micOn)}
                />
            </main>
        </div>
    );
};

export default App;