
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { PostPackage, MusicPlatform, SocialPlatform, VideoStyle, VideoClip, VoiceoverScript } from "../types";

const STYLE_PROMPT_MAP: Record<VideoStyle, string> = {
  'Neon': 'Vibrant high-contrast lighting, glowing neon tubes, electric blues and pinks, dark reflections, sharp edges, synthwave aesthetic.',
  'Minimalist': 'Spacious compositions, simple geometric forms, monochromatic or neutral palette, clean lines, high-end design feel, quiet motion.',
  'Grainy': 'Heavy film grain texture, analog film look, 16mm or Super 8 aesthetic, flickering highlights, organic imperfections, nostalgic vibes.',
  'Cinematic': 'Professional 35mm depth of field, anamorphic lens flares, rich color grading, dramatic shadows, wide aspect ratio feel.',
  'Lo-fi': 'Low resolution textures, warm vintage filters, slightly blurry focus, cozy indoor lighting, retro desktop or room aesthetic.',
  'Abstract': 'Fluid shapes, swirling light trails, non-representational motion, morphing textures, kaleidoscopic patterns.',
  'Lyric-based': 'Dynamic typography, kinetic text motion, high contrast backgrounds for readability, artistic font integration.',
  'Cyberpunk': 'Futuristic urban decay, rain-slicked streets, holographic advertisements, purple and teal lighting, high-tech low-life vibe.',
  'Vintage Film': 'Sepia tones, light leaks, dust and scratches, jittery frame rate, old camera motor sounds, classic Hollywood look.',
  'Dreamy': 'Soft focus, ethereal glow, pastel gradients, slow motion floating particles, surreal transitions, lens diffusion.',
  'Glitch': 'Digital artifacts, chromatic aberration, data-bending visuals, fragmented frames, signal interference look.',
  'Synthwave': '80s retro-futurism, wireframe grids, sunset horizons, chrome textures, pink and purple haze.',
  'Noir': 'Dramatic black and white, chiaroscuro lighting, long shadows, smoke and fog, hard contrast, gritty detective aesthetic.',
  'Psychedelic': 'Trippy swirling colors, melting forms, intense saturation, fractal geometry, mind-bending visual loops.',
  'Grunge': 'Dirty textures, desaturated colors, hand-held camera shake, distressed overlays, raw and unpolished aesthetic.',
  'Vaporwave': '90s web aesthetic, marble statues, palm trees, glitched windows, apathetic mood, pink and blue gradients.',
  'Ethereal': 'Heavenly light beams, white-on-white aesthetics, holy glow, slow and graceful floating motion, spiritual atmosphere.',
  'Gothic': 'Dark ornate architecture, velvet textures, candlelight, mysterious shadows, melancholic beauty, Victorian vibes.',
  'Pop Art': 'Ben-Day dots, bold outlines, primary colors, comic book style, high energy graphic motion.'
};

export async function generatePromotionPackage(
  link: string, 
  mood: string, 
  musicPlatform: MusicPlatform, 
  socialPlatforms: SocialPlatform[],
  videoStyle: VideoStyle
): Promise<PostPackage> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are "SoulSound AI", a senior creative engine for independent musicians.
    Analyze the provided music link and create a high-conversion promotion package.
    
    TONE: Emotional, Spiritual, Raw, Deep, Artist-first.
    TARGET PLATFORMS: ${socialPlatforms.join(', ')}.
    VISUAL STYLE: ${videoStyle}.
  `;

  const prompt = `
    Analyze this track: ${link}. 
    Mood Context: ${mood}.
    
    1. EXTRACT Analysis: Genre, Vibe, Energy level.
    2. VIDEO CONCEPT: Scene-by-scene moving visual plan.
    3. CAMERA MODE: Filming instructions for the artist.
    4. AI VOICEOVER SCRIPTS: Poetic and atmospheric.
    5. CAPTIONS: platform-optimized.
    6. HASHTAGS: Niche and trending.
    7. POSTING TIPS: Algorithmic advice.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: {
              type: Type.OBJECT,
              properties: {
                genre: { type: Type.STRING },
                vibe: { type: Type.STRING },
                energy: { type: Type.STRING },
              },
              required: ["genre", "vibe", "energy"]
            },
            videoConcept: {
              type: Type.OBJECT,
              properties: {
                visualPlan: { type: Type.STRING },
                motionStyle: { type: Type.STRING },
                colorGrading: { type: Type.STRING },
                textOverlays: { type: Type.ARRAY, items: { type: Type.STRING } },
                transitions: { type: Type.STRING },
                loopEnding: { type: Type.STRING },
              },
              required: ["visualPlan", "motionStyle", "colorGrading", "textOverlays", "transitions", "loopEnding"],
            },
            cameraInstructions: {
              type: Type.OBJECT,
              properties: {
                angles: { type: Type.STRING },
                lighting: { type: Type.STRING },
                movement: { type: Type.STRING },
                filtersAndEffects: { type: Type.STRING },
              },
              required: ["angles", "lighting", "movement", "filtersAndEffects"],
            },
            voiceoverScripts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  text: { type: Type.STRING },
                  duration: { type: Type.STRING },
                },
                required: ["id", "type", "text", "duration"],
              },
            },
            captions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  text: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                },
                required: ["id", "type", "text", "emoji"],
              },
            },
            hashtags: { type: Type.STRING },
            recommendedLengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            postingTips: { type: Type.STRING },
          },
          required: ["analysis", "videoConcept", "cameraInstructions", "voiceoverScripts", "captions", "hashtags", "recommendedLengths", "postingTips"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("SoulSound Engine Error:", error);
    throw error;
  }
}

export async function generateAIVideo(style: VideoStyle, plan: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const styleKeywords = STYLE_PROMPT_MAP[style] || 'Cinematic lighting, fluid motion.';
  const videoPrompt = `A professional 9:16 vertical video for music promotion. Style Details: ${styleKeywords} Content Description: ${plan} Ultra-high quality, smooth frame rate, music-reactive visuals, atmospheric.`;
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: videoPrompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");
    
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
}

export async function generateTTS(script: string, voiceName: string = 'Zephyr'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say naturally and with emotional depth: ${script}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("TTS generation failed");
    
    const audioBlob = await (await fetch(`data:audio/pcm;base64,${base64Audio}`)).blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("TTS Error:", error);
    return '';
  }
}
