
import React, { useState, useRef, useEffect } from 'react';
import { PostPackage } from '../types';

interface CameraStudioProps {
  onClose: () => void;
  musicLink?: string;
  packageData?: PostPackage | null;
}

type FilterType = 'Natural' | 'Noir' | 'Ethereal' | 'Cyber' | 'Urban' | 'Vivid' | 'Warmth' | 'Diffusion' | '8mm' | 'Teal & Orange';

const FILTERS: Record<FilterType, string> = {
  'Natural': 'none',
  'Noir': 'grayscale(1) contrast(1.2) brightness(0.9)',
  'Ethereal': 'brightness(1.1) saturate(0.6) blur(0.5px) contrast(0.9)',
  'Cyber': 'hue-rotate(280deg) saturate(2) contrast(1.1) brightness(0.8)',
  'Urban': 'contrast(1.2) brightness(1.1) saturate(1.1) sepia(0.1)', // Mimics 'Brooklyn'
  'Vivid': 'saturate(1.8) contrast(1.1) brightness(1.1)', // Mimics 'Clarendon'
  'Warmth': 'sepia(0.4) saturate(1.4) brightness(1.05) hue-rotate(-10deg)', // Mimics 'Valencia'
  'Diffusion': 'brightness(1.1) saturate(0.9) blur(1.5px) contrast(0.9)', // Soft focus look
  '8mm': 'contrast(1.1) brightness(0.9) sepia(0.2) saturate(0.8) grayscale(0.1)', // Grainy vintage look
  'Teal & Orange': 'contrast(1.2) brightness(1.0) saturate(1.1) hue-rotate(5deg)' // Cinematic look
};

const CameraStudio: React.FC<CameraStudioProps> = ({ onClose, musicLink, packageData }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Natural');
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [activeScriptIndex, setActiveScriptIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', aspectRatio: 9/16, width: { ideal: 1080 } }, 
          audio: true 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        alert("Studio needs camera access. Please check your settings.");
        onClose();
      }
    }
    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedVideo(URL.createObjectURL(blob));
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
    setTimer(0);
    timerRef.current = window.setInterval(() => setTimer(t => t + 1), 1000);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleDownload = () => {
    if (!recordedVideo) return;
    const a = document.createElement('a');
    a.href = recordedVideo;
    a.download = `soulsound-prod-${Date.now()}.webm`;
    a.click();
  };

  const activeScript = packageData?.voiceoverScripts[activeScriptIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-lg h-full max-h-[900px] relative flex flex-col bg-neutral-950 sm:rounded-[3rem] overflow-hidden shadow-2xl">
        
        {/* Top Navigation */}
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={onClose} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-purple-400">Recording Mode</span>
            {recording && <span className="text-xs font-mono text-red-500 font-bold">00:{timer < 10 ? `0${timer}` : timer}</span>}
          </div>
          <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>
          </button>
        </div>

        {/* Camera Stage */}
        <div className="flex-grow relative overflow-hidden bg-black">
          {!recordedVideo ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover transition-all duration-700"
              style={{ filter: FILTERS[activeFilter] }}
            />
          ) : (
            <video 
              src={recordedVideo} 
              autoPlay 
              loop 
              controls 
              className="w-full h-full object-cover"
            />
          )}

          {/* Prompt Overlays */}
          {packageData && !recordedVideo && (
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-end p-8 gap-4 bg-gradient-to-t from-black/60 to-transparent">
              <div className="bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 mb-20 animate-fadeIn">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Teleprompter: {activeScript?.type}</span>
                  <div className="flex gap-2 pointer-events-auto">
                    <button onClick={() => setActiveScriptIndex(i => i === 0 ? packageData.voiceoverScripts.length-1 : i-1)} className="text-white/40 hover:text-white">←</button>
                    <button onClick={() => setActiveScriptIndex(i => i === packageData.voiceoverScripts.length-1 ? 0 : i+1)} className="text-white/40 hover:text-white">→</button>
                  </div>
                </div>
                <p className="text-white text-base leading-relaxed serif italic">"{activeScript?.text}"</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-24">
                <div className="p-4 bg-purple-900/40 backdrop-blur-md rounded-2xl border border-purple-500/20">
                  <span className="text-[8px] font-bold text-purple-300 uppercase block mb-1">Director: Angle</span>
                  <p className="text-[10px] text-white/80 leading-tight">{packageData.cameraInstructions.angles}</p>
                </div>
                <div className="p-4 bg-indigo-900/40 backdrop-blur-md rounded-2xl border border-indigo-500/20">
                  <span className="text-[8px] font-bold text-indigo-300 uppercase block mb-1">Director: Motion</span>
                  <p className="text-[10px] text-white/80 leading-tight">{packageData.cameraInstructions.movement}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control Center */}
        <div className="p-8 pb-12 bg-neutral-900 flex flex-col gap-8">
          {!recordedVideo ? (
            <>
              {/* Filter Strip */}
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {(Object.keys(FILTERS) as FilterType[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className="flex-shrink-0 flex flex-col items-center gap-3 group"
                  >
                    <div className={`w-14 h-14 rounded-full border-2 transition-all duration-300 ${activeFilter === f ? 'border-purple-500 scale-110' : 'border-white/10'}`} 
                      style={{ 
                        filter: FILTERS[f], 
                        background: '#222',
                        backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.1), transparent)'
                      }} />
                    <span className={`text-[9px] font-bold uppercase tracking-tight transition-colors ${activeFilter === f ? 'text-purple-400' : 'text-slate-500'}`}>{f}</span>
                  </button>
                ))}
              </div>

              {/* Record Action */}
              <div className="flex justify-center items-center">
                <button 
                  onClick={recording ? stopRecording : startRecording}
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${recording ? 'border-white animate-pulse' : 'border-red-600 hover:scale-110'}`}
                >
                  <div className={`transition-all duration-300 ${recording ? 'w-8 h-8 bg-white rounded-md' : 'w-14 h-14 bg-red-600 rounded-full'}`} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-4">
              <button onClick={handleDownload} className="w-full py-5 rounded-2xl bg-purple-600 text-white font-bold text-sm tracking-widest uppercase shadow-lg shadow-purple-900/40">Download Raw Project</button>
              <button onClick={() => setRecordedVideo(null)} className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm tracking-widest uppercase">Discard & Retake</button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default CameraStudio;
