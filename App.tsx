
import React, { useState, useEffect } from 'react';
import { MusicPlatform, SocialPlatform, PostPackage, VideoStyle, ProjectState, VideoClip } from './types';
import { generatePromotionPackage, generateAIVideo, generateTTS } from './services/geminiService';
import CaptionCard from './components/CaptionCard';
import CameraStudio from './components/CameraStudio';

const SOCIAL_PLATFORMS: SocialPlatform[] = ['TikTok', 'Instagram', 'Snapchat', 'YouTube Shorts', 'X', 'Facebook'];
const VIDEO_STYLES: VideoStyle[] = [
  'Cinematic', 'Lo-fi', 'Abstract', 'Lyric-based', 'Neon', 
  'Minimalist', 'Grainy', 'Cyberpunk', 'Vintage Film', 'Dreamy', 'Glitch',
  'Synthwave', 'Noir', 'Psychedelic', 'Grunge', 'Vaporwave', 'Ethereal', 'Gothic', 'Pop Art'
];

// Declaration for AI Studio key selection API
declare global {
  // Define AIStudio interface to match the existing global type
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fixed: Removed readonly to avoid conflict with existing platform declarations
    aistudio: AIStudio;
  }
}

const App: React.FC = () => {
  const [link, setLink] = useState('');
  const [mood, setMood] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['Instagram']);
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('Cinematic');
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState<ProjectState | null>(null);
  const [error, setError] = useState('');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');

  const detectMusicPlatform = (url: string): MusicPlatform => {
    const lowUrl = url.toLowerCase();
    if (lowUrl.includes('suno.ai') || lowUrl.includes('suno.com')) return 'Suno';
    if (lowUrl.includes('soundcloud.com')) return 'SoundCloud';
    if (lowUrl.includes('youtube.com') || lowUrl.includes('youtu.be')) return 'YouTube';
    return 'Unknown';
  };

  const handleTogglePlatform = (p: SocialPlatform) => {
    setSelectedPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleAnalyze = async () => {
    if (!link) {
      setError('Paste a track link to begin.');
      return;
    }
    setLoading(true);
    setError('');
    const musicPlatform = detectMusicPlatform(link);
    
    try {
      const data = await generatePromotionPackage(link, mood, musicPlatform, selectedPlatforms, videoStyle);
      setProject({
        id: Math.random().toString(36).substr(2, 9),
        musicLink: link,
        platform: musicPlatform,
        targetPlatforms: selectedPlatforms,
        style: videoStyle,
        package: data,
        videoClips: [],
        isGeneratingVideo: false,
        activeVideoUrl: null
      });
    } catch (err) {
      setError('SoulSound could not reach the creative engine. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!project || !project.package) return;
    
    // Fix: Requirement for Veo models - ensure API key is selected
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
      }
    } catch (e) {
      console.error("Key selection failed", e);
    }

    setProject(prev => prev ? { ...prev, isGeneratingVideo: true } : null);
    setVideoStatus('Visualizing the soul of your track...');
    
    const statusMessages = [
      'Painting with digital light...',
      'Synthesizing cinematic atmosphere...',
      'Mapping the rhythmic pulse to visuals...',
      'Polishing high-fidelity motion frames...',
      'The spirits are aligning for your debut...'
    ];
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % statusMessages.length;
      setVideoStatus(statusMessages[msgIndex]);
    }, 12000);

    try {
      const videoUrl = await generateAIVideo(project.style, project.package.videoConcept.visualPlan);
      const newClip: VideoClip = {
        id: Date.now().toString(),
        url: videoUrl,
        prompt: project.package.videoConcept.visualPlan,
        duration: 10
      };
      setProject(prev => prev ? { 
        ...prev, 
        videoClips: [newClip, ...prev.videoClips],
        activeVideoUrl: videoUrl,
        isGeneratingVideo: false 
      } : null);
    } catch (err: any) {
      setProject(prev => prev ? { ...prev, isGeneratingVideo: false } : null);
      if (err?.message?.includes('Requested entity was not found')) {
        setError('Billing project error. Please select a valid paid API key.');
        await window.aistudio.openSelectKey();
      } else {
        setError('Video generation failed. The spirits are tired.');
      }
    } finally {
      clearInterval(interval);
      setVideoStatus('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      <header className="text-center mb-12 animate-fadeIn">
        <h1 className="text-6xl md:text-8xl font-bold serif tracking-tight text-white mb-4">SoulSound</h1>
        <p className="text-purple-400 text-sm tracking-widest uppercase font-bold">The Artist's Creative Pulse</p>
      </header>

      {!project ? (
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Input Section */}
          <div className="glass p-8 md:p-12 rounded-[2rem] border-white/10 shadow-3xl">
            <div className="space-y-8">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Track Link (SoundCloud / Suno)</label>
                <input 
                  type="text"
                  placeholder="https://soundcloud.com/artist/track..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 block">Platform Optimization</label>
                <div className="flex flex-wrap gap-3">
                  {SOCIAL_PLATFORMS.map(p => (
                    <button
                      key={p}
                      onClick={() => handleTogglePlatform(p)}
                      className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                        selectedPlatforms.includes(p) 
                          ? 'bg-purple-600 border-purple-400 text-white' 
                          : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Visual Aesthetic</label>
                  <select 
                    value={videoStyle}
                    onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white appearance-none"
                  >
                    {VIDEO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2 block">Vibe Context (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Midnight drives, 90s nostalgia..."
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white"
                  />
                </div>
              </div>

              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:scale-[1.01] transition-all font-bold text-xl shadow-2xl shadow-purple-900/30 disabled:opacity-50"
              >
                {loading ? 'Analyzing Track Soul...' : '✨ Generate Creative Project'}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-center text-sm font-medium">{error}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          {/* Project Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass p-6 rounded-3xl border-white/10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Track Analysis</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Genre</span>
                  <span className="text-white text-xs">{project.package?.analysis.genre}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Vibe</span>
                  <span className="text-white text-xs">{project.package?.analysis.vibe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Energy</span>
                  <span className="text-white text-xs">{project.package?.analysis.energy}</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border-white/10">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Creation Modes</h2>
              <div className="space-y-3">
                <button 
                  onClick={handleGenerateVideo}
                  disabled={project.isGeneratingVideo}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-white flex flex-col items-center justify-center"
                >
                  {project.isGeneratingVideo ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="text-[8px] animate-pulse">{videoStatus}</span>
                    </div>
                  ) : (
                    <span>🎬 Mode A: Generate AI Video</span>
                  )}
                </button>
                <button 
                  onClick={() => setIsStudioOpen(true)}
                  className="w-full py-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-white"
                >
                  🎥 Mode B: Custom Camera
                </button>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl border-white/10 h-[400px] overflow-y-auto">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-4">Platform Captions</h2>
              <div className="space-y-4">
                {project.package?.captions.map(c => <CaptionCard key={c.id} caption={c} />)}
              </div>
            </div>
          </div>

          {/* Main Production Stage */}
          <div className="lg:col-span-8 space-y-8">
            {project.activeVideoUrl ? (
              <div className="relative aspect-[9/16] max-h-[700px] mx-auto bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                <video src={project.activeVideoUrl} className="w-full h-full object-cover" autoPlay loop muted />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-white font-bold text-2xl mb-2">SoulSound Master Project</h3>
                  <div className="flex gap-2 mb-4">
                    {project.targetPlatforms.map(tp => (
                      <span key={tp} className="px-2 py-1 bg-purple-600/50 rounded-md text-[9px] font-bold text-white uppercase">{tp}</span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <a href={project.activeVideoUrl} download className="px-6 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">Export 4K</a>
                    <button className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20">Edit Layers</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-[9/16] max-h-[700px] mx-auto bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center p-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-bold text-xl mb-2">Project Ready for Production</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8">Select "Generate AI Video" to create your visuals or "Custom Camera" to record your own performance.</p>
                {project.isGeneratingVideo && (
                  <div className="animate-pulse">
                    <p className="text-purple-400 text-xs font-bold uppercase tracking-[0.2em]">{videoStatus}</p>
                    <p className="text-slate-600 text-[10px] mt-2">Video synthesis takes several minutes. Please wait.</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass p-8 rounded-3xl border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-6">Voiceover Synthesis</h3>
                <div className="space-y-4">
                  {project.package?.voiceoverScripts.map(v => (
                    <div key={v.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-purple-500/30 transition-all">
                      <div className="flex justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{v.type} ({v.duration})</span>
                        <button className="text-[10px] text-purple-400 font-bold hover:underline">Play Demo</button>
                      </div>
                      <p className="text-slate-300 text-sm italic">"{v.text}"</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass p-8 rounded-3xl border-white/10">
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-6">Growth Engine</h3>
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Platform Strategy</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{project.package?.postingTips}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Optimized Hashtags</span>
                    <div className="p-4 bg-black/40 rounded-xl text-slate-400 text-xs font-mono leading-relaxed select-all">
                      {project.package?.hashtags}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isStudioOpen && <CameraStudio onClose={() => setIsStudioOpen(false)} musicLink={link} packageData={project?.package} />}
      
      <footer className="mt-20 text-center opacity-20 hover:opacity-100 transition-opacity">
        <p className="text-[10px] uppercase font-bold tracking-[0.5em] text-white">SoulSound Production Suite &bull; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;