
export type UserMode = 'beginner' | 'advanced';
export type AppView = 'onboarding' | 'dashboard' | 'reflection';

export type MusicPlatform = 'Suno' | 'SoundCloud' | 'YouTube' | 'Spotify' | 'Unknown';
export type SocialPlatform = 'TikTok' | 'Instagram' | 'Snapchat' | 'YouTube Shorts' | 'X' | 'Facebook';

export type VideoStyle = 
  | 'Cinematic' | 'Lo-fi' | 'Abstract' | 'Lyric-based' | 'Neon' 
  | 'Minimalist' | 'Grainy' | 'Cyberpunk' | 'Vintage Film' | 'Dreamy' | 'Glitch'
  | 'Synthwave' | 'Noir' | 'Psychedelic' | 'Grunge' | 'Vaporwave' | 'Ethereal' | 'Gothic' | 'Pop Art';

/**
 * Represents an AI-generated video clip associated with a project.
 */
export interface VideoClip {
  id: string;
  url: string;
  prompt: string;
  duration: number;
}

export interface Caption {
  id: string;
  type: 'Punchy Hook' | 'Poetic' | 'Minimalist' | 'Viral/Curiosity' | 'Spiritual';
  text: string;
  emoji: string;
}

export interface VoiceoverScript {
  id: string;
  type: string;
  text: string;
  duration: string;
}

export interface PostPackage {
  videoConcept: {
    visualPlan: string;
    motionStyle: string;
    colorGrading: string;
    textOverlays: string[];
    transitions: string;
    loopEnding: string;
  };
  cameraInstructions: {
    angles: string;
    lighting: string;
    movement: string;
    filtersAndEffects: string;
  };
  voiceoverScripts: VoiceoverScript[];
  captions: Caption[];
  hashtags: string;
  recommendedLengths: string[];
  postingTips: string;
  analysis: {
    genre: string;
    vibe: string;
    energy: string;
  };
}

export interface ProjectState {
  id: string;
  musicLink: string;
  platform: MusicPlatform;
  targetPlatforms: SocialPlatform[];
  style: VideoStyle;
  package: PostPackage | null;
  videoClips: VideoClip[];
  activeVideoUrl: string | null;
  isGeneratingVideo: boolean;
}

export interface AppState {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentProject: ProjectState | null;
  setCurrentProject: (project: ProjectState | null) => void;
}