import React, { useState, useRef } from 'react';
import type { User } from '../App';
import { GoogleGenAI } from '@google/genai';

declare var Razorpay: any;

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

type Props = {
  user: User;
  setUser: (u: User) => void;
  onLogout: () => void;
  navigate: (page: 'landing') => void;
};

export default function DashboardPage({ user, setUser, onLogout, navigate }: Props) {
  const [product, setProduct] = useState('');
  const [desc, setDesc] = useState('');
  const [audience, setAudience] = useState('general Indian audience');
  const [lang, setLang] = useState('Hinglish (Hindi + English)');
  const [tone, setTone] = useState('Energetic & Desi');
  const [platform, setPlatform] = useState('Instagram Reels');
  
  const [activeTab, setActiveTab] = useState<'scripts' | 'image' | 'video'>('scripts');
  
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const [videoPrompt, setVideoPrompt] = useState('');
  const [generatedStandaloneVideo, setGeneratedStandaloneVideo] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<string>('');
  
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const [generatingVideo, setGeneratingVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, string>>({});
  const [editingVideoType, setEditingVideoType] = useState<string | null>(null);
  
  const handleGenerateVideo = async (s: { type: string; content: string }) => {
    try {
      setGeneratingVideo(s.type);
      setError('');
      
      // Step 1: Check if API key is selected
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        let hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
           await window.aistudio.openSelectKey();
        }
      }

      // Initialize GenAI with the dynamically injected API key
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      
      // Create Veo prompt based on the ad script
      const prompt = `A cinematic, high-quality professional advertisement video for: ${product}. Setting the mood of: ${tone}. Video elements should visually match this ad script: ${s.content.substring(0, 500)}`;
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: platform.includes('Instagram') || platform.includes('Shorts') ? '9:16' : '16:9'
        }
      });
      
      // Poll for completion (can take a few minutes)
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation completed but no URL returned.");
      
      // Fetch the video. We have to proxy or fetch it as a blob if CORS allows,
      // but according to the docs we can fetch using the API key:
      const videoRes = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || ''
        }
      });
      
      if (!videoRes.ok) throw new Error("Failed to fetch generated video.");
      
      const blob = await videoRes.blob();
      const videoUrl = URL.createObjectURL(blob);
      
      setVideos(prev => ({ ...prev, [s.type]: videoUrl }));
      
    } catch (e: any) {
      if (e.message && e.message.includes('Requested entity was not found')) {
         // Reset key state hint
         setError("API Key error. Please try generating again to re-select the key.");
         if (window.aistudio && window.aistudio.openSelectKey) {
             await window.aistudio.openSelectKey();
         }
      } else {
         setError('Failed to generate video: ' + e.message);
      }
    } finally {
      setGeneratingVideo(null);
    }
  };

  const buyPlan = async (plan: string) => {
    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const order = await res.json();
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'VigyapanAI',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
        order_id: order.orderId,
        prefill: { email: user?.email || '' },
        theme: { color: '#FF6B00' },
        handler: async function(response: any) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan
              })
            });
            const verify = await verifyRes.json();
            
            const newUser = {
              ...user,
              credits: (user.credits || 0) + verify.creditsAdded,
              plan: verify.plan
            };
            setUser(newUser);
            localStorage.setItem('va_user', JSON.stringify(newUser));
            setShowUpgrade(false);
            alert(`🎉 Payment successful! ${verify.creditsAdded} credits added!`);
          } catch (e: any) {
            alert('Payment verification failed: ' + e.message);
          }
        }
      };
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (e: any) {
      alert('Payment failed to start: ' + e.message);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleGenerate = async () => {
    if (!product) {
        setError('Product ka naam likho pehle! ✍️');
        return;
    }
    if (user.credits <= 0) {
        setError('Credits khatam!');
        return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: product, productDesc: desc, audience, language: lang, tone, platform }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      
      setResults(data.text);
      setUser({ ...user, credits: data.creditsLeft });
    } catch (err: any) {
      setError(err.message || 'Kuch galat ho gaya');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) {
      setError('Please enter a prompt for the image.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        let hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
           await window.aistudio.openSelectKey();
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
        }
      });
      
      const base64Image = response.generatedImages[0].image.imageBytes;
      setGeneratedImageUrl(`data:image/jpeg;base64,${base64Image}`);
    } catch (e: any) {
      setError('Failed to generate image: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStandaloneVideo = async () => {
    if (!videoPrompt) {
      setError('Please enter a prompt for the video.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        let hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
           await window.aistudio.openSelectKey();
        }
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: videoPrompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });
      
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation completed but no URL returned.");
      
      const videoRes = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || ''
        }
      });
      
      if (!videoRes.ok) throw new Error("Failed to fetch generated video.");
      
      const blob = await videoRes.blob();
      setGeneratedStandaloneVideo(URL.createObjectURL(blob));
    } catch (e: any) {
      setError('Failed to generate video: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const renderSections = () => {
    if (!results) return null;
    
    // Parse the sections out of the results
    const types = ['HOOK AD', 'STORYTELLING AD', 'OFFER AD', 'TESTIMONIAL AD'];
    const sections: {type: string, content: string}[] = [];
    
    types.forEach((type, i) => {
      const marker = `===${type}===`;
      const next = types[i+1] ? `===${types[i+1]}===` : null;
      const start = results.indexOf(marker);
      if (start === -1) return;
      
      const cs = start + marker.length;
      let end = next ? results.indexOf(next) : results.length;
      if (end === -1) end = results.length;
      
      const content = results.slice(cs, end).trim();
      if (content) sections.push({ type, content });
    });

    if (sections.length === 0) sections.push({ type: 'GENERATED AD', content: results });

    return (
      <div className="animate-[cardIn_0.45s_ease_both]">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border)]">
          <div>
            <div className="font-bold text-lg">✨ {product}</div>
            <div className="text-[0.77rem] text-[var(--muted)] mt-1">{lang} · {tone} · {platform}</div>
          </div>
          <button onClick={() => copyToClipboard(results)} className="bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.3)] text-[var(--gold)] px-4 py-2 rounded-lg cursor-pointer text-sm font-semibold transition-colors hover:bg-[rgba(255,184,0,0.2)]">📋 Copy All</button>
        </div>

        {sections.map((s, i) => (
          <div key={i} className="ad-card relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-[rgba(255,107,0,0.15)] border border-[rgba(255,107,0,0.3)] text-[var(--saffron)] px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide">{s.type}</div>
              <div className="bg-[rgba(255,184,0,0.1)] border border-[rgba(255,184,0,0.2)] text-[var(--gold)] px-3 py-1 rounded-full text-[0.7rem] font-semibold">🌐 {lang}</div>
            </div>
            
            <div className="grid md:grid-cols-[1fr_300px] gap-6">
              <div>
                <div className="whitespace-pre-wrap text-[0.9rem] leading-[1.78] text-white/90 mb-4">{s.content}</div>
                <div className="flex gap-2">
                  <button onClick={() => copyToClipboard(s.content)} className="bg-white/5 text-white px-4 py-2 rounded-lg text-[0.78rem] font-semibold cursor-pointer border-none transition-colors hover:bg-white/10">📋 Copy Script</button>
                  <button onClick={() => handleGenerateVideo(s)} disabled={generatingVideo !== null} className="bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-4 py-2 rounded-lg text-[0.78rem] font-bold cursor-pointer border-none shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:-translate-y-px transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 w-max">
                    {generatingVideo === s.type ? (
                      <><span className="w-3.5 h-3.5 border-2 border-[#1A0700]/30 border-t-[#1A0700] rounded-full animate-spin"></span> Generating Video...</>
                    ) : (
                      <>🎥 Generate Video (Veo 3.1)</>
                    )}
                  </button>
                </div>
              </div>
              
              {(generatingVideo === s.type || videos[s.type]) && (
                <div className="bg-black/40 rounded-xl border border-white/10 flex flex-col overflow-hidden md:min-h-[300px]">
                  {videos[s.type] ? (
                    <>
                      <video src={videos[s.type]} controls autoPlay loop className="w-full h-[250px] object-contain bg-black" />
                      <div className="p-3 bg-white/5 border-t border-white/10 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <a href={videos[s.type]} download={`VigyapanAI_${s.type}.mp4`} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-[0.75rem] font-bold py-1.5 px-2 justify-center rounded-md text-center transition-colors flex items-center gap-1.5 no-underline">
                            ⬇️ Download
                          </a>
                          <button onClick={() => setEditingVideoType(s.type)} className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:border-purple-500/60 text-white text-[0.75rem] font-bold py-1.5 px-2 justify-center rounded-md transition-colors flex items-center gap-1.5">
                            ✂️ AI Editor
                          </button>
                        </div>
                        <div className="text-[0.65rem] text-[var(--muted)] text-center uppercase tracking-wider font-bold mb-0.5 mt-1">1-Click Social Push</div>
                        <div className="flex gap-2">
                           <button onClick={() => alert("Authenticating with YouTube...")} className="flex-1 bg-red-500/20 text-red-100 hover:bg-red-500/40 border border-red-500/30 text-[0.7rem] font-bold py-1.5 rounded-md transition-colors">▶️ Shorts</button>
                           <button onClick={() => alert("Authenticating with Instagram...")} className="flex-1 bg-pink-500/20 text-pink-100 hover:bg-pink-500/40 border border-pink-500/30 text-[0.7rem] font-bold py-1.5 rounded-md transition-colors">📸 Reels</button>
                           <button onClick={() => alert("Authenticating with Facebook...")} className="flex-1 bg-blue-500/20 text-blue-100 hover:bg-blue-500/40 border border-blue-500/30 text-[0.7rem] font-bold py-1.5 rounded-md transition-colors">📘 FB Ads</button>
                        </div>
                      </div>
                    </>
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-transparent to-black/40 h-[300px]">
                       <div className="w-10 h-10 border-[3px] border-[var(--saffron)] border-t-transparent rounded-full animate-spin mb-4" />
                       <div className="text-[0.8rem] font-bold text-[var(--gold)] mb-1 uppercase tracking-widest font-['Baloo_2']">Veo 3.1 is creating</div>
                       <div className="text-[0.75rem] text-[var(--muted)]">This usually takes 1-3 minutes. Hang tight!</div>
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* TOPBAR */}
      <div className="flex items-center justify-between px-7 py-3.5 bg-[#0D0700]/95 backdrop-blur-[12px] border-b border-[var(--border)] sticky top-0 z-50">
        <div className="topbar-logo" onClick={() => navigate('landing')}><em>Vigyapan</em>AI 🇮🇳</div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#ffb8001a] border border-[#ffb80040] px-4 py-1.5 rounded-full text-[0.82rem] font-semibold">
            🎬 Credits: <span className="text-[var(--gold)] font-extrabold">{user.credits}</span>
          </div>
          <button onClick={() => setShowUpgrade(true)} className="bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] px-4 py-2 rounded-lg border-none cursor-pointer text-[0.82rem] font-extrabold hover:-translate-y-px transition-transform">⚡ Upgrade</button>
          <div className="flex items-center gap-2 bg-white/5 border border-[var(--border)] px-4 py-1.5 rounded-full text-[0.82rem] cursor-pointer hover:border-[var(--saffron)] transition-colors" onClick={onLogout}>
            👤 <span>{user.name}</span> · Logout
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden grid lg:grid-cols-[360px_1fr] h-[calc(100vh-57px)]">
        {/* FORM PANEL */}
        <div className="flex flex-col border-r border-[var(--border)] bg-[var(--card)]">
          <div className="flex border-b border-[var(--border)]">
            <button onClick={() => setActiveTab('scripts')} className={`flex-1 py-4 text-[0.85rem] font-bold transition-colors border-b-2 ${activeTab === 'scripts' ? 'text-[var(--gold)] border-[var(--gold)] bg-white/5' : 'text-white/50 border-transparent hover:text-white/80'}`}>Scripts</button>
            <button onClick={() => setActiveTab('image')} className={`flex-1 py-4 text-[0.85rem] font-bold transition-colors border-b-2 ${activeTab === 'image' ? 'text-[var(--gold)] border-[var(--gold)] bg-white/5' : 'text-white/50 border-transparent hover:text-white/80'}`}>Images</button>
            <button onClick={() => setActiveTab('video')} className={`flex-1 py-4 text-[0.85rem] font-bold transition-colors border-b-2 ${activeTab === 'video' ? 'text-[var(--gold)] border-[var(--gold)] bg-white/5' : 'text-white/50 border-transparent hover:text-white/80'}`}>Videos</button>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1">
            {error && <div className="text-red-400 mb-4 text-sm font-semibold">{error}</div>}
            
            {activeTab === 'scripts' && (
              <>
                <div className="mb-5">
                  <div className="fp-label">Product / Service <span className="fp-label-hi">प्रोडक्ट</span></div>
                  <input value={product} onChange={e => setProduct(e.target.value)} className="w-full bg-white/5 border border-[var(--border)] text-white px-3.5 py-2.5 rounded-[11px] text-[0.9rem] outline-none transition-all duration-300 focus:border-[var(--saffron)] focus:scale-[1.02] focus:shadow-[0_0_15px_rgba(255,107,0,0.15)] placeholder:text-white/25" placeholder="e.g. Herbal face cream..." />
                </div>

                <div className="mb-5">
                  <div className="fp-label">Description <span className="fp-label-hi">विवरण</span></div>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-white/5 border border-[var(--border)] text-white px-3.5 py-2.5 rounded-[11px] text-[0.9rem] outline-none transition-all duration-300 focus:border-[var(--saffron)] focus:scale-[1.02] focus:shadow-[0_0_15px_rgba(255,107,0,0.15)] placeholder:text-white/25 resize-y min-h-[76px]" placeholder="Kya karta hai? Koi offer?"></textarea>
                </div>

                <div className="mb-5">
                  <div className="fp-label">Target Audience <span className="fp-label-hi">दर्शक</span></div>
                  <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full bg-[#1A0700] border border-[var(--border)] text-white px-3.5 py-2.5 rounded-[11px] text-[0.9rem] outline-none transition-all duration-300 focus:border-[var(--saffron)] focus:scale-[1.02] focus:shadow-[0_0_15px_rgba(255,107,0,0.15)]">
                    <option value="housewives">👩‍🍳 Housewives & Homemakers</option>
                    <option value="youth">👦 Youth (18-25)</option>
                    <option value="general Indian audience">🇮🇳 General Indian Audience</option>
                  </select>
                </div>

                <div className="mb-5">
                  <div className="fp-label">Language <span className="fp-label-hi">भाषा</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {label: 'Hinglish', v: 'Hinglish (Hindi + English)', hi: 'हिंग्लिश ✨'},
                      {label: 'Hindi', v: 'Hindi', hi: 'हिन्दी'},
                      {label: 'Tamil', v: 'Tamil', hi: 'தமிழ்'},
                      {label: 'Telugu', v: 'Telugu', hi: 'తెలుగు'}
                    ].map(x => (
                      <div key={x.v} onClick={() => setLang(x.v)} className={`bg-white/5 border rounded-lg px-3 py-2 cursor-pointer text-[0.78rem] text-center transition-all duration-300 select-none hover:scale-[1.02] ${lang === x.v ? 'bg-[rgba(255,107,0,0.14)] border-[var(--saffron)] text-[var(--gold)] scale-[1.02] shadow-[0_0_10px_rgba(255,107,0,0.15)]' : 'border-[var(--border)] hover:border-[var(--saffron)]'}`}>
                        {x.label} <span className={`block text-[0.68rem] mt-0.5 transition-colors ${lang === x.v ? 'text-[#ffb80099]' : 'text-[var(--muted)]'}`}>{x.hi}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="fp-label">Tone <span className="fp-label-hi">टोन</span></div>
                  <div className="flex gap-2 flex-wrap">
                    {['Energetic & Desi', 'Emotional & Heartfelt', 'Funny & Witty'].map(t => (
                      <div key={t} onClick={() => setTone(t)} className={`px-3 py-1.5 rounded-lg border text-[0.78rem] cursor-pointer transition-all duration-300 hover:scale-[1.05] ${tone === t ? 'bg-[rgba(255,107,0,0.14)] border-[var(--saffron)] text-[var(--gold)] scale-[1.05] shadow-[0_0_10px_rgba(255,107,0,0.15)]' : 'bg-white/5 border-[var(--border)] hover:border-[var(--saffron)]'}`}>
                        {t.split(' ')[0]}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <div className="fp-label">Platform <span className="fp-label-hi">प्लेटफॉर्म</span></div>
                  <div className="flex gap-2 flex-wrap">
                    {['Instagram Reels', 'YouTube Shorts', 'Facebook'].map(p => (
                      <div key={p} onClick={() => setPlatform(p)} className={`px-3 py-1.5 rounded-lg border text-[0.78rem] cursor-pointer transition-all duration-300 hover:scale-[1.05] ${platform === p ? 'bg-[rgba(255,107,0,0.14)] border-[var(--saffron)] text-[var(--gold)] scale-[1.05] shadow-[0_0_10px_rgba(255,107,0,0.15)]' : 'bg-white/5 border-[var(--border)] hover:border-[var(--saffron)]'}`}>
                        {p}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={handleGenerate} disabled={loading} className="w-full p-4 rounded-xl bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] font-extrabold text-[0.98rem] border-none flex items-center justify-center gap-2 font-['Baloo_2'] shadow-[0_6px_24px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? 'Please wait...' : '✨ विज्ञापन बनाएं — Generate Ads'}
                </button>
              </>
            )}

            {activeTab === 'image' && (
              <>
                <div className="mb-5">
                  <div className="fp-label">Image Prompt <span className="fp-label-hi">प्रॉम्प्ट</span></div>
                  <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} className="w-full bg-white/5 border border-[var(--border)] text-white px-3.5 py-2.5 rounded-[11px] text-[0.9rem] outline-none transition-all duration-300 focus:border-[var(--saffron)] focus:scale-[1.02] focus:shadow-[0_0_15px_rgba(255,107,0,0.15)] placeholder:text-white/25 resize-y min-h-[120px]" placeholder="Describe the image you want. e.g. A high quality editorial shot of a herbal face cream jar..."></textarea>
                </div>
                <button onClick={handleGenerateImage} disabled={loading} className="w-full p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-extrabold text-[0.98rem] border-none flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? 'Generating...' : '🖼️ Generate Image'}
                </button>
              </>
            )}

            {activeTab === 'video' && (
              <>
                <div className="mb-5">
                  <div className="fp-label">Video Prompt <span className="fp-label-hi">प्रॉम्प्ट</span></div>
                  <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} className="w-full bg-white/5 border border-[var(--border)] text-white px-3.5 py-2.5 rounded-[11px] text-[0.9rem] outline-none transition-all duration-300 focus:border-[var(--saffron)] focus:scale-[1.02] focus:shadow-[0_0_15px_rgba(255,107,0,0.15)] placeholder:text-white/25 resize-y min-h-[120px]" placeholder="Describe the video. e.g. A cinematic slow motion shot of water splashing on a face cream..."></textarea>
                </div>
                <button onClick={handleGenerateStandaloneVideo} disabled={loading} className="w-full p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white font-extrabold text-[0.98rem] border-none flex items-center justify-center gap-2 shadow-[0_6px_24px_rgba(236,72,153,0.3)] hover:-translate-y-0.5 transition-all disabled:opacity-50">
                  {loading ? 'Generating...' : '🎥 Generate Video'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* OUTPUT PANEL */}
        <div className="p-8 overflow-y-auto bg-[var(--dark)]">
          {activeTab === 'scripts' && (
            !results && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="text-[3.8rem] mb-4 opacity-35">🎬</div>
                <h3 className="text-[1.2rem] text-[var(--muted)] font-medium mb-2">आपका AI Ad यहाँ आएगा</h3>
                <p className="text-white/30 text-[0.88rem]">Fill the form on the left and click Generate.<br/>4 ad scripts will appear here instantly.</p>
              </div>
            ) : loading ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                 <div className="w-[60px] h-[60px] rounded-full border-4 border-[rgba(255,107,0,0.2)] border-t-[var(--saffron)] animate-spin mb-4" />
                 <div className="text-[1.1rem] font-semibold text-[var(--gold)] mb-2">AI kaam kar raha hai... ✨</div>
                 <div className="text-[0.85rem] text-[var(--muted)]">Generating your Indian ad copy securely.</div>
               </div>
            ) : (
              renderSections()
            )
          )}

          {activeTab === 'image' && (
            !generatedImageUrl && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="text-[3.8rem] mb-4 opacity-35">🖼️</div>
                <h3 className="text-[1.2rem] text-[var(--muted)] font-medium mb-2">आपके Ad Images यहाँ आएंगें</h3>
                <p className="text-white/30 text-[0.88rem]">Describe the image and click Generate.<br/>Your image will appear here instantly.</p>
              </div>
            ) : loading ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                 <div className="w-[60px] h-[60px] rounded-full border-4 border-[rgba(79,70,229,0.2)] border-t-indigo-500 animate-spin mb-4" />
                 <div className="text-[1.1rem] font-semibold text-indigo-400 mb-2">Generating Image... ✨</div>
                 <div className="text-[0.85rem] text-[var(--muted)]">Using Imagen 3 to create high quality visuals.</div>
               </div>
            ) : generatedImageUrl && (
              <div className="animate-[cardIn_0.45s_ease_both]">
                <div className="ad-card relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide">AI GENERATED IMAGE</div>
                  </div>
                  <img src={generatedImageUrl} alt="Generated" className="w-full rounded-xl border border-white/10" />
                  <div className="mt-4 flex gap-2">
                    <a href={generatedImageUrl} download="VigyapanAI_Image.jpg" className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 justify-center rounded-lg text-center transition-colors flex items-center gap-1.5 no-underline">
                      ⬇️ Download Output
                    </a>
                  </div>
                </div>
              </div>
            )
          )}

          {activeTab === 'video' && (
            !generatedStandaloneVideo && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-10">
                <div className="text-[3.8rem] mb-4 opacity-35">🎥</div>
                <h3 className="text-[1.2rem] text-[var(--muted)] font-medium mb-2">आपके Ad Videos यहाँ आएंगें</h3>
                <p className="text-white/30 text-[0.88rem]">Describe the video and click Generate.<br/>It may take 1-3 minutes.</p>
              </div>
            ) : loading ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-10">
                 <div className="w-[60px] h-[60px] rounded-full border-4 border-[rgba(236,72,153,0.2)] border-t-pink-500 animate-spin mb-4" />
                 <div className="text-[1.1rem] font-semibold text-pink-400 mb-2">Generating Video... ✨</div>
                 <div className="text-[0.85rem] text-[var(--muted)]">Using Veo 3.1 to generate your standalone video. This usually takes 1-3 minutes. Hang tight!</div>
               </div>
            ) : generatedStandaloneVideo && (
              <div className="animate-[cardIn_0.45s_ease_both]">
                <div className="ad-card relative overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-[18px] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-pink-500/15 border border-pink-500/30 text-pink-400 px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase tracking-wide">AI GENERATED VIDEO</div>
                  </div>
                  <video src={generatedStandaloneVideo} controls autoPlay loop className="w-full rounded-xl border border-white/10 bg-black min-h-[300px]" />
                  <div className="mt-4 flex gap-2">
                    <a href={generatedStandaloneVideo} download="VigyapanAI_Video.mp4" className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-3 justify-center rounded-lg text-center transition-colors flex items-center gap-1.5 no-underline">
                      ⬇️ Download Video
                    </a>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {showUpgrade && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[8px] z-[150] flex items-center justify-center p-5" onClick={(e) => { if(e.target === e.currentTarget) setShowUpgrade(false); }}>
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-10 max-w-[820px] w-full max-h-[90vh] overflow-y-auto relative animate-[fadeUp_0.3s_ease_both]">
            <button className="absolute top-4 right-5 bg-white/10 border-none text-white w-8 h-8 rounded-full cursor-pointer text-base hover:bg-white/20 transition-colors" onClick={() => setShowUpgrade(false)}>✕</button>
            <div className="text-2xl font-extrabold text-center mb-1.5">⚡ Credits Upgrade karein</div>
            <div className="text-[var(--muted)] text-center text-sm mb-8">Aur ads banao — India ke liye, Indian bhavon mein</div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[18px]">
              
              <div className="bg-[rgba(34,197,94,0.05)] border border-[rgba(34,197,94,0.3)] rounded-2xl p-7 flex flex-col transition-transform hover:-translate-y-1 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--green)] text-white text-[0.72rem] font-extrabold py-1 px-[18px] rounded-full whitespace-nowrap">Special</div>
                <div className="text-base font-bold mb-1">Trial</div>
                <div className="font-['Baloo_2'] text-[0.82rem] text-[var(--green)] mb-4">Try it first</div>
                <div className="text-[2.8rem] font-extrabold leading-none"><sup>₹</sup>1</div>
                <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">one-time · 10 Ads</div>
                <ul className="list-none flex-1 mb-6">
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--green)] before:font-extrabold before:shrink-0">10 Ad Generations</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--green)] before:font-extrabold before:shrink-0">All Features</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--green)] before:font-extrabold before:shrink-0">3 Days Access</li>
                </ul>
                <button onClick={() => buyPlan('trial')} disabled={loadingPlan === 'trial'} className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border-none bg-[var(--green)] text-white transition-shadow hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)] text-center w-full flex justify-center items-center gap-2">
                  {loadingPlan === 'trial' && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                  Pay ₹1
                </button>
              </div>

              <div className="bg-[var(--card)] border border-white/10 rounded-2xl p-7 flex flex-col transition-transform hover:-translate-y-1">
                <div className="text-base font-bold mb-1">Starter</div>
                <div className="font-['Baloo_2'] text-[0.82rem] text-[var(--gold)] mb-4">Solo creators</div>
                <div className="text-[2.8rem] font-extrabold leading-none"><sup>₹</sup>999</div>
                <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">/month · 30 Credits</div>
                <ul className="list-none flex-1 mb-6">
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">30 Ad Generations</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All Languages</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All Platforms</li>
                </ul>
                <button onClick={() => buyPlan('starter')} disabled={loadingPlan === 'starter'} className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10 text-center w-full flex justify-center items-center gap-2">
                  {loadingPlan === 'starter' && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                  Buy ₹999
                </button>
              </div>

              <div className="bg-gradient-to-br from-[rgba(255,107,0,0.12)] to-[rgba(255,184,0,0.05)] border border-[var(--saffron)] rounded-2xl p-7 flex flex-col transition-transform hover:-translate-y-1 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] text-[0.72rem] font-extrabold py-1 px-4 rounded-full whitespace-nowrap">🔥 Best Value</div>
                <div className="text-base font-bold mb-1">Growth</div>
                <div className="font-['Baloo_2'] text-[0.82rem] text-[var(--gold)] mb-4">D2C & Brands</div>
                <div className="text-[2.8rem] font-extrabold leading-none"><sup>₹</sup>3,499</div>
                <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">/month · 150 Credits</div>
                <ul className="list-none flex-1 mb-6">
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">150 Ad Generations</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">All Languages</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">Priority Support</li>
                </ul>
                <button onClick={() => buyPlan('growth')} disabled={loadingPlan === 'growth'} className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border-none bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] transition-shadow hover:shadow-[0_8px_24px_rgba(255,107,0,0.4)] text-center w-full flex justify-center items-center gap-2">
                  {loadingPlan === 'growth' && <span className="w-4 h-4 border-2 border-[#1A0700]/20 border-t-[#1A0700] rounded-full animate-spin"></span>}
                  Buy ₹3,499
                </button>
              </div>

              <div className="bg-[var(--card)] border border-white/10 rounded-2xl p-7 flex flex-col transition-transform hover:-translate-y-1">
                <div className="text-base font-bold mb-1">Agency</div>
                <div className="font-['Baloo_2'] text-[0.82rem] text-[var(--gold)] mb-4">Large brands</div>
                <div className="text-[2.8rem] font-extrabold leading-none"><sup>₹</sup>9,999</div>
                <div className="text-[var(--muted)] text-[0.82rem] mb-6 mt-1">/month · 999 Credits</div>
                <ul className="list-none flex-1 mb-6">
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">999 Ad Generations</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">White-label</li>
                  <li className="py-2 border-b border-white/5 text-[0.87rem] text-white/75 flex items-center gap-2.5 before:content-['✓'] before:text-[var(--gold)] before:font-extrabold before:shrink-0">API Access</li>
                </ul>
                <button onClick={() => buyPlan('agency')} disabled={loadingPlan === 'agency'} className="mt-auto p-3.5 rounded-xl font-bold text-[0.92rem] cursor-pointer border border-white/20 bg-transparent text-white transition-colors hover:bg-white/10 text-center w-full flex justify-center items-center gap-2">
                  {loadingPlan === 'agency' && <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>}
                  Buy ₹9,999
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* AI VIDEO EDITOR MODAL */}
      {editingVideoType && videos[editingVideoType] && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-[fadeUp_0.3s_ease_both] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/50">
              <div className="flex items-center gap-3">
                <div className="text-xl font-bold bg-gradient-to-r from-[var(--saffron)] to-[var(--gold)] text-transparent bg-clip-text">✂️ VigyapanAI Editor</div>
                <div className="px-2 py-0.5 bg-white/10 rounded text-[0.7rem] font-medium text-white/70">Pro</div>
              </div>
              <button className="text-white/60 hover:text-white transition-colors bg-transparent border-none text-2xl leading-none cursor-pointer" onClick={() => setEditingVideoType(null)}>✕</button>
            </div>
            
            {/* Main Editor Body */}
            <div className="flex flex-1 overflow-hidden min-h-[500px]">
              
              {/* Left Canvas Area (Video) */}
              <div className="flex-1 flex flex-col bg-black relative p-6 items-center justify-center border-r border-white/10">
                <video src={videos[editingVideoType]} controls className="max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10" />
                
                {/* Floating Timeline Mock */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl flex flex-col gap-3">
                   <div className="flex justify-between text-[0.7rem] text-white/50 font-mono">
                     <span>00:00</span>
                     <span>00:15 / 00:30</span>
                   </div>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden relative cursor-pointer">
                     <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-[var(--saffron)] rounded-full"></div>
                     <div className="absolute left-[20%] top-0 bottom-0 w-[40%] bg-white/20 rounded-full"></div> {/* Trim indicator mock */}
                   </div>
                   <div className="flex justify-center gap-4 text-white/70">
                     <button className="bg-transparent border-none text-white/70 hover:text-white cursor-pointer">⏪</button>
                     <button className="bg-transparent border-none text-white hover:text-[var(--gold)] cursor-pointer text-lg">⏸️</button>
                     <button className="bg-transparent border-none text-white/70 hover:text-white cursor-pointer">⏩</button>
                   </div>
                </div>
              </div>
              
              {/* Right Sidebar (Tools) */}
              <div className="w-[320px] bg-[#161616] flex flex-col overflow-y-auto">
                <div className="p-5 border-b border-white/5">
                  <div className="text-sm font-bold mb-4 uppercase tracking-wider text-white/50">Enhance Tools</div>
                  
                  <div className="flex flex-col gap-3">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left cursor-pointer transition-colors group flex items-start gap-3">
                      <div className="text-xl group-hover:scale-110 transition-transform">📝</div>
                      <div>
                        <div className="text-[0.85rem] font-bold text-white mb-1">Auto Captions</div>
                        <div className="text-[0.7rem] text-white/50 leading-relaxed">Generate stylish Hinglish/Hindi captions perfectly synced with audio.</div>
                      </div>
                    </button>

                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left cursor-pointer transition-colors group flex items-start gap-3">
                      <div className="text-xl group-hover:scale-110 transition-transform">🎵</div>
                      <div>
                        <div className="text-[0.85rem] font-bold text-white mb-1">BGM & Trends</div>
                        <div className="text-[0.7rem] text-white/50 leading-relaxed">Add trending Indian lofi, energetic beats, or dramatic BGM.</div>
                      </div>
                    </button>
                    
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left cursor-pointer transition-colors group flex items-start gap-3">
                      <div className="text-xl group-hover:scale-110 transition-transform">✂️</div>
                      <div>
                        <div className="text-[0.85rem] font-bold text-white mb-1">Smart Trim</div>
                        <div className="text-[0.7rem] text-white/50 leading-relaxed">Automatically cut silences and awkward pauses for better retention.</div>
                      </div>
                    </button>

                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left cursor-pointer transition-colors group flex items-start gap-3">
                      <div className="text-xl group-hover:scale-110 transition-transform">✨</div>
                      <div>
                        <div className="text-[0.85rem] font-bold text-white mb-1">Color Grade</div>
                        <div className="text-[0.7rem] text-white/50 leading-relaxed">Apply cinematic, warm, or engaging filters to make elements pop.</div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="p-5 mt-auto">
                  <button onClick={() => { alert("Exporting with applied edits... (Mock)"); setEditingVideoType(null); }} className="w-full bg-gradient-to-br from-[var(--saffron)] to-[var(--gold)] text-[#1A0700] py-3.5 rounded-xl font-bold text-[0.9rem] border-none cursor-pointer shadow-[0_4px_16px_rgba(255,107,0,0.3)] hover:-translate-y-0.5 transition-all">
                    Export Final Video
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
