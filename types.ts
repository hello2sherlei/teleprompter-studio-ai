export interface ScriptSettings {
    fontSize: number;
    scrollSpeed: number;
    textWidth: 'Narrow' | 'Medium' | 'Wide';
    textColor: string;
    guideLineColor: string;
    mirrorVideo: boolean;
    showGrid: boolean;
    eyeContactFix: boolean;
    opacity: number;
    selectedMicId: string;
    selectedCameraId: string;
}

export interface AppState {
    script: string;
    isRecording: boolean;
    rightPanelMode: 'editor' | 'settings';
    aspectRatio: '16:9' | '9:16';
}

export interface Script {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

export interface MediaState {
    cameraOn: boolean;
    micOn: boolean;
    isRecording: boolean;
    isScrolling: boolean;
}

export enum GeminiModel {
    FLASH = 'gemini-2.0-flash',
    PRO = 'gemini-2.0-pro'
}