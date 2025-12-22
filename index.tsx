
import React, { useState, createContext, useContext, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { UserMode, AppState, AppView, ProjectState, MusicPlatform, SocialPlatform, VideoStyle } from './types';
import { RootLayout } from './app/layout';
import { generatePromotionPackage, generateAIVideo } from './services/geminiService';
import CaptionCard from './components/CaptionCard';
import CameraStudio from './components/CameraStudio';

const AppContext = createContext<AppState | undefined>(undefined);

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userMode, setUserMode] = useState<UserMode>('beginner');
  const [currentView, setCurrentView] = useState<AppView>('onboarding');
  const [currentProject, setCurrentProject] = useState<ProjectState | null>(null);

  return (
    <AppContext.Provider value={{ userMode, setUserMode, currentView, setCurrentView, currentProject, setCurrentProject }}>
      {children}
    </AppContext.Provider>
  );
};

const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// --- COMPONENTS ---

const SOCIAL_PLATFORMS: SocialPlatform[] = ['TikTok', 'Instagram', 'Snapchat', 'YouTube Shorts', 'X', 'Facebook'];
const VIDEO_STYLES: VideoStyle[] = ['Cinematic', 'Lo-fi', 'Abstract', 'Neon', 'Minimalist', 'Grainy', 'Cyberpunk', 'Dreamy', 'Noir', 'Ethereal'];

// --- PAGES ---

const LandingPage = () => {
  const { setUserMode, setCurrentView } = useApp();
  
  return (
    <div className="flex-1 flex flex-col justify-center text-center space-y-12 animate-fadeIn">
      <header className="space-y-4">
        <h1 className="text-6xl font-bold serif tracking-tighter text-white">SoulSound</h1>
        <p className="text-sm text-slate-400 max-w-[280px] mx-auto leading-relaxed italic">
          Music finds its visual heartbeat.
        </p>
      </header>

      <div className="space-y-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">Choose Your Path</p>
        <div className="grid gap-4">
          <button 
            onClick={() => { setUserMode('beginner'); setCurrentView('dashboard'); }}
            className="p-8 rounded-[2rem] glass text-left hover:border-purple-500/50 transition-all group active:scale-95"
          >
            <span className="block font-bold text-lg mb-1 group-hover:text-purple-400 transition-colors">Gentle Guidance</span>
            <span className="block text-xs text-slate-500">A step-by-step journey to your first promotion.</span>
          </button>
          
          <button 
            onClick={() => { setUserMode('advanced'); setCurrentView('dashboard'); }}
            className="p-8 rounded-[2rem] glass text-left hover:border-indigo-500/50 transition-all group active:scale-95"
          >
            <span className="block font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">Direct Flow</span>
            <span className="block text-xs text-slate-500">The full production dashboard for power users.</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { userMode, setCurrentView, currentProject, setCurrentProject } = useApp();
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // For beginner mode
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['Instagram']);
  const [videoStyle, setVideoStyle] = useState<VideoStyle>('Cinematic');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [videoStatus, setVideoStatus] = useState('');

  const detectMusicPlatform = (url: string): MusicPlatform => {
    const lowUrl = url.toLowerCase();
    if (lowUrl.includes('suno.ai') || lowUrl.includes('suno.com')) return 'Suno';
    if (lowUrl.includes('soundcloud.com')) return 'SoundCloud';
    return 'Unknown';
  };

  const handleGeneratePackage = async () => {
    if (!link) return;
    setLoading(true);
    try {
      const platform = detectMusicPlatform(link);
      const pkg = await generatePromotionPackage(link, '', platform, selectedPlatforms, videoStyle);
      setCurrentProject({
        id: Math.random().toString(36).substr(2, 9),
        musicLink: link,
        platform,
        targetPlatforms: selectedPlatforms,
        style: videoStyle,
        package: pkg,
        videoClips: [],
        activeVideoUrl: null,
        isGeneratingVideo: false
      });
      if (userMode === 'beginner') setStep(3);
    } catch (e) {
      console.error(e);
      alert("The spirits are silent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!currentProject?.package) return;
    
    // Check key selection for Veo
    try {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) await window.aistudio.openSelectKey();
    } catch(e) {}

    setCurrentProject({ ...currentProject, isGeneratingVideo: true });
    setVideoStatus('Synthesizing atmosphere...');

    try {
      const url = await generateAIVideo(currentProject.style, currentProject.package.videoConcept.visualPlan);
      setCurrentProject({ ...currentProject, isGeneratingVideo: false, activeVideoUrl: url });
    } catch (e) {
      setCurrentProject({ ...currentProject, isGeneratingVideo: false });
      alert("Video synthesis failed. The creative engine needs a moment.");
    }
  };

  // Beginner Wizard
  if (userMode === 'beginner' && !currentProject) {
    return (
      <div className="flex-1 space-y-12 py-12 animate-fadeIn">
        <header className="text-center space-y-2">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2].map(i => (
              <div key={i} className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-purple-500' : 'bg-white/10'}`} />
            ))}
          </div>
          <h2 className="text-2xl font-bold serif italic text-white">
            {step === 1 ? "Where does the music live?" : "How does it feel?"}
          </h2>
        </header>

        <div className="glass p-8 rounded-[2.5rem] border-white/10">
          {step === 1 ? (
            <div className="space-y-8">
              <input 
                type="text"
                placeholder="Paste Suno or SoundCloud link..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl p-6 text-white focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <button 
                onClick={() => setStep(2)}
                disabled={!link}
                className="w-full py-5 rounded-2xl bg-purple-600 font-bold uppercase tracking-widest text-xs disabled:opacity-30"
              >
                Continue Path
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3">
                {VIDEO_STYLES.slice(0, 6).map(s => (
                  <button 
                    key={s}
                    onClick={() => setVideoStyle(s)}
                    className={`p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${videoStyle === s ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-400'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <button 
                onClick={handleGeneratePackage}
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-purple-800 to-indigo-800 font-bold uppercase tracking-widest text-xs"
              >
                {loading ? "Channelling..." : "Manifest Promotion"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Advanced or Finished Project Dashboard
  return (
    <div className="flex-1 space-y-8 py-8 animate-fadeIn">
      <header className="flex justify-between items-center px-2">
        <div>
          <h2 className="text-2xl font-bold serif italic text-white">Studio</h2>
          <p className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
            {userMode === 'advanced' ? 'Production Dashboard' : 'Guided Result'}
          </p>
        </div>
        <button 
          onClick={() => setCurrentView('reflection')}
          className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10"
        >
          <span className="text-lg">🧘</span>
        </button>
      </header>

      {!currentProject ? (
        <div className="glass p-8 rounded-[2.5rem] space-y-8 border-white/10">
           <input 
              type="text"
              placeholder="Track Link..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-white text-sm"
            />
            <div className="grid grid-cols-2 gap-4">
               <select 
                value={videoStyle}
                onChange={(e) => setVideoStyle(e.target.value as VideoStyle)}
                className="bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-slate-300 appearance-none"
               >
                 {VIDEO_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
               </select>
               <button 
                onClick={handleGeneratePackage}
                disabled={loading}
                className="bg-purple-600 rounded-xl font-bold uppercase tracking-widest text-[10px] text-white"
               >
                 {loading ? "..." : "Generate"}
               </button>
            </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Stage */}
          <div className="relative aspect-[9/16] glass rounded-[3rem] overflow-hidden border-white/10 shadow-2xl">
            {currentProject.activeVideoUrl ? (
              <video src={currentProject.activeVideoUrl} autoPlay loop muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                 </div>
                 <h4 className="font-bold text-white uppercase tracking-widest text-xs">Awaiting Visuals</h4>
                 <button 
                  onClick={handleGenerateVideo}
                  disabled={currentProject.isGeneratingVideo}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/10 hover:bg-white/20 text-[10px] font-bold uppercase tracking-widest transition-all"
                 >
                   {currentProject.isGeneratingVideo ? videoStatus : "🎬 Generate AI Video"}
                 </button>
              </div>
            )}
          </div>

          {/* Metadata Cards */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 ml-4">Campaign Materials</h3>
            <div className="grid gap-4">
               {currentProject.package?.captions.slice(0, 2).map(c => (
                 <CaptionCard key={c.id} caption={c} />
               ))}
            </div>
          </div>

          <button 
            onClick={() => setIsStudioOpen(true)}
            className="w-full py-6 rounded-2xl glass border-purple-500/30 text-purple-400 font-bold text-sm tracking-widest uppercase hover:bg-purple-500/10 transition-all"
          >
            🎥 Open Artist Studio
          </button>
        </div>
      )}

      {isStudioOpen && <CameraStudio onClose={() => setIsStudioOpen(false)} packageData={currentProject?.package} />}
      
      <footer className="pt-12 text-center opacity-20">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold">SoulSound Studio</p>
      </footer>
    </div>
  );
};

const ReflectionPage = () => {
  const { setCurrentView, currentProject } = useApp();
  
  return (
    <div className="flex-1 flex flex-col justify-center space-y-12 py-8 animate-fadeIn">
      <div className="space-y-6 text-center">
        <h2 className="text-4xl font-bold italic serif text-white">Artist's Journal</h2>
        <div className="h-px bg-white/10 w-12 mx-auto" />
        <p className="text-sm leading-relaxed text-slate-400 px-8">
          Your track's soul is being visualized. How does it feel to see your sound take shape?
        </p>
      </div>
      
      <div className="glass p-8 rounded-[2.5rem] mx-4 space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Creative Energy</span>
          <span className="text-purple-400 text-xs font-mono font-bold">100%</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="block text-xl mb-1">✍️</span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Captions</span>
              <span className="block text-white font-bold">{currentProject?.package?.captions.length || 0}</span>
           </div>
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <span className="block text-xl mb-1">🎬</span>
              <span className="block text-[10px] font-bold text-slate-500 uppercase">Renders</span>
              <span className="block text-white font-bold">{currentProject?.activeVideoUrl ? 1 : 0}</span>
           </div>
        </div>
      </div>

      <div className="pt-8 text-center">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="text-[10px] uppercase tracking-[0.3em] font-bold text-purple-400 underline underline-offset-8"
        >
          Return to Studio
        </button>
      </div>
    </div>
  );
};

const MainApp = () => {
  const { currentView } = useApp();

  return (
    <RootLayout>
      {currentView === 'onboarding' && <LandingPage />}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'reflection' && <ReflectionPage />}
    </RootLayout>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <AppProvider>
      <MainApp />
    </AppProvider>
  </React.StrictMode>
);