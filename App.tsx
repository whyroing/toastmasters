
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Camera, Download, Sparkles, Award, Image as ImageIcon, Loader2, Sliders, Layout, Square, Circle, UserCheck, CalendarDays, Rocket, Palette, AlertCircle, X, Check, Maximize2, Key } from 'lucide-react';
import { RolePlayer, MeetingDetails } from './types.ts';
import { generateFlyerBackground, generateRoleAvatar } from './geminiService.ts';
import FlyerCanvas from './components/FlyerCanvas.tsx';
import { toPng } from 'html-to-image';

const FULL_MEETING_ROLES = [
  "TMOD",
  "TTM",
  "General Evaluator",
  "Timer",
  "Ah Counter",
  "Grammarian"
];

const SPOTLIGHT_ROLES = [
  "Featured Speaker",
  "Speech Evaluator"
];

const BRAND_COLORS = [
  { id: 'blue', hex: '#004165', label: 'Loyal Blue' },
  { id: 'maroon', hex: '#772432', label: 'True Maroon' },
  { id: 'midnight', hex: '#0F172A', label: 'Midnight' },
  { id: 'royal', hex: 'linear-gradient(135deg, #004165, #772432)', label: 'Royal Duo' },
  { id: 'sunset', hex: 'linear-gradient(135deg, #772432, #F2DF74)', label: 'Sunset Mix' },
  { id: 'ocean', hex: 'linear-gradient(135deg, #004165, #0F172A)', label: 'Deep Ocean' },
  { id: 'platinum', hex: 'linear-gradient(135deg, #004165, #A9B2B1)', label: 'Platinum' },
  { id: 'grey', hex: '#A9B2B1', label: 'Cool Grey' },
  { id: 'yellow', hex: '#F2DF74', label: 'Happy Yellow' },
] as const;

const App: React.FC = () => {
  const flyerRef = useRef<HTMLDivElement>(null);
  const [details, setDetails] = useState<MeetingDetails>({
    title: "Meeting Invitation",
    theme: "The Art of Listening",
    date: new Date().toISOString().split('T')[0],
    time: "19:00",
    location: "Community Center / Zoom",
    clubName: "Your Club Name",
    flyerType: 'full',
    themeColor: 'blue',
    globalPhotoScale: 1.0
  });

  const [hasApiKey, setHasApiKey] = useState<boolean>(!!process.env.API_KEY);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected || !!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeyDialog = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setErrorMsg(null);
    }
  };

  const createDefaultRoles = (type: 'full' | 'spotlight'): RolePlayer[] => {
    const rolesList = type === 'full' ? FULL_MEETING_ROLES : SPOTLIGHT_ROLES;
    return rolesList.map((role) => ({
      id: Math.random().toString(36).substr(2, 9),
      role,
      name: "",
      photoUrl: null,
      scale: 1.0
    }));
  };

  const [roles, setRoles] = useState<RolePlayer[]>(createDefaultRoles('full'));
  const [isGeneratingBg, setIsGeneratingBg] = useState(false);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [isDownloading, setIsDownloading] = useState(false);
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState(100);
  const [photoStyle, setPhotoStyle] = useState<'circle' | 'square'>('circle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFlyerTypeChange = (type: 'full' | 'spotlight') => {
    if (details.flyerType === type) return;
    setDetails(prev => ({ ...prev, flyerType: type }));
    setRoles(createDefaultRoles(type));
  };

  const addRole = () => {
    const newRoleName = details.flyerType === 'spotlight' ? "Spotlight Member" : "Additional Role";
    setRoles([...roles, {
      id: Math.random().toString(36).substr(2, 9),
      role: newRoleName,
      name: "",
      photoUrl: null,
      scale: 1.0
    }]);
  };

  const removeRole = (id: string) => {
    setRoles(roles.filter(r => r.id !== id));
  };

  const updateRole = (id: string, updates: Partial<RolePlayer>) => {
    setRoles(roles.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handlePhotoUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateRole(id, { photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleError = (err: any) => {
    console.error("API Error:", err);
    if (err.message?.includes("Requested entity was not found") || err.message?.includes("API key")) {
      setHasApiKey(false);
      setErrorMsg("Please select a valid paid API key to use AI generation features.");
    } else {
      setErrorMsg(err.message || "An unexpected error occurred during generation.");
    }
  };

  const handleMagicPhoto = async (id: string, roleName: string) => {
    if (!hasApiKey && !process.env.API_KEY) {
      handleOpenKeyDialog();
      return;
    }
    setErrorMsg(null);
    setGeneratingIds(prev => new Set(prev).add(id));
    try {
      const url = await generateRoleAvatar(roleName || "Speaker", details.theme);
      if (url) {
        updateRole(id, { photoUrl: url });
      } else {
        setErrorMsg("Avatar generation failed. Check your project configuration.");
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setGeneratingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleGenerateBackground = async () => {
    if (!hasApiKey && !process.env.API_KEY) {
      handleOpenKeyDialog();
      return;
    }
    if (isGeneratingBg) return;
    setErrorMsg(null);
    setIsGeneratingBg(true);
    try {
      const url = await generateFlyerBackground(details.theme);
      if (url) {
        setBackgroundUrl(url);
      } else {
        setErrorMsg("Background generation returned no image.");
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsGeneratingBg(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!flyerRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(flyerRef.current, { 
        quality: 1, 
        pixelRatio: 4, 
        cacheBust: true 
      });
      const link = document.createElement('a');
      link.download = `TM_Flyer_${details.theme.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      setErrorMsg('Failed to export flyer. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const inputClasses = "w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:border-tm-blue focus:ring-4 focus:ring-tm-blue/10 outline-none transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row font-sans text-slate-900">
      {/* Error Alert */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 duration-300">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px]">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div className="flex-1 text-sm font-semibold">{errorMsg}</div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-red-100 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* API Key Modal Overlay */}
      {(!hasApiKey && !process.env.API_KEY) && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full text-center border border-slate-100 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-tm-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Key className="w-10 h-10 text-tm-blue" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3">API Setup Required</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-8">
              To use AI-powered features, please select a valid Google Cloud API key with <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-tm-blue font-bold underline">billing enabled</a>.
            </p>
            <button 
              onClick={handleOpenKeyDialog}
              className="w-full py-4 bg-tm-blue text-white rounded-2xl font-black uppercase tracking-widest hover:bg-tm-blue/90 transition-all hover:scale-105"
            >
              Select Project API Key
            </button>
          </div>
        </div>
      )}

      {/* Editor Panel */}
      <div className="w-full lg:w-[45%] p-6 lg:p-12 overflow-y-auto no-print scroll-smooth">
        <header className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-tm-maroon to-tm-blue rounded-2xl shadow-lg shadow-tm-maroon/20 animate-float">
              <Rocket className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight font-header shimmer-text">
                Flyer Pro
              </h1>
              <div className="flex items-center gap-2">
                <span className="h-1 w-8 bg-tm-maroon rounded-full"></span>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Next Gen Creator</p>
              </div>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium max-w-sm leading-relaxed text-left">
            Elevate your club's presence with professional, AI-powered design tools.
          </p>
        </header>

        <div className="space-y-8 stagger-in">
          <section className="glass-card rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-white/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-tm-blue/10 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-tm-blue" />
              </div>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-widest">Meeting Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Club Identity</label>
                <input type="text" className={inputClasses} value={details.clubName} placeholder="e.g. Skyline Speakers" onChange={(e) => setDetails({ ...details, clubName: e.target.value })} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Meeting Theme</label>
                <input type="text" className={inputClasses} value={details.theme} placeholder="e.g. Overcoming Fear" onChange={(e) => setDetails({ ...details, theme: e.target.value })} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Event Date</label>
                <input type="date" className={inputClasses} value={details.date} onChange={(e) => setDetails({ ...details, date: e.target.value })} />
              </div>
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Start Time</label>
                <input type="time" className={inputClasses} value={details.time} onChange={(e) => setDetails({ ...details, time: e.target.value })} />
              </div>
              <div className="md:col-span-2 space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Location / Link</label>
                <textarea 
                  rows={3}
                  className={`${inputClasses} resize-none leading-relaxed text-sm`} 
                  value={details.location} 
                  placeholder="Enter full venue address clearly (e.g. Maurya Lok Complex, Patna)" 
                  onChange={(e) => setDetails({ ...details, location: e.target.value })} 
                />
              </div>
            </div>
          </section>

          <section className="bg-tm-blue rounded-[2.5rem] p-8 shadow-2xl shadow-tm-blue/30 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tm-yellow/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-tm-maroon/20 rounded-full -ml-16 -mb-16 blur-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="shrink-0 text-left">
                  <h2 className="text-xl font-black flex items-center gap-3">
                    <Palette className="w-6 h-6 text-tm-yellow" />
                    Studio Style
                  </h2>
                  <p className="text-blue-100/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Refine the visual output</p>
                </div>
                <button 
                  onClick={handleGenerateBackground}
                  disabled={isGeneratingBg}
                  className="group min-w-max px-8 py-4 bg-white text-tm-blue rounded-full text-xs font-black uppercase tracking-widest hover:bg-tm-yellow transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-4 shadow-xl hover:scale-105 active:scale-95 disabled:cursor-not-allowed whitespace-nowrap overflow-hidden"
                >
                  {isGeneratingBg ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform shrink-0" />
                      <span>AI Magic BG</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-4 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-tm-yellow uppercase tracking-widest">
                    <Award className="w-3.5 h-3.5" />
                    Brand Identity Palette
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {BRAND_COLORS.map((color) => (
                      <button 
                        key={color.id}
                        onClick={() => setDetails(prev => ({ ...prev, themeColor: color.id as any }))}
                        className={`group relative h-12 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${details.themeColor === color.id ? 'border-tm-yellow scale-105 shadow-[0_0_15px_rgba(242,223,116,0.5)]' : 'border-white/10 hover:border-white/30'}`}
                        style={{ background: color.hex }}
                        title={color.label}
                      >
                        {details.themeColor === color.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <Check className={`w-5 h-5 ${color.id === 'yellow' || color.id === 'grey' ? 'text-slate-900' : 'text-tm-yellow'}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-tm-yellow uppercase tracking-widest">
                    <Layout className="w-3.5 h-3.5" />
                    Blueprint
                  </div>
                  <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => handleFlyerTypeChange('full')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${details.flyerType === 'full' ? 'bg-white text-tm-blue shadow-xl' : 'hover:bg-white/5'}`}>Classic</button>
                    <button onClick={() => handleFlyerTypeChange('spotlight')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${details.flyerType === 'spotlight' ? 'bg-white text-tm-blue shadow-xl' : 'hover:bg-white/5'}`}>Spotlight</button>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-black text-tm-yellow uppercase tracking-widest">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Frame Cut
                  </div>
                  <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => setPhotoStyle('circle')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${photoStyle === 'circle' ? 'bg-white text-tm-blue shadow-xl' : 'hover:bg-white/5'}`}>Circle</button>
                    <button onClick={() => setPhotoStyle('square')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${photoStyle === 'square' ? 'bg-white text-tm-blue shadow-xl' : 'hover:bg-white/5'}`}>Square</button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4 text-left">
                  <div className="flex items-center justify-between text-[10px] font-black text-tm-yellow uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-3.5 h-3.5" />
                      Global Scale
                    </div>
                    <span className="bg-white/20 px-2 py-0.5 rounded-md font-mono text-[9px]">{details.globalPhotoScale?.toFixed(1)}x</span>
                  </div>
                  <input type="range" min="0.5" max="2.0" step="0.1" value={details.globalPhotoScale} onChange={(e) => setDetails({ ...details, globalPhotoScale: parseFloat(e.target.value) })} className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer accent-tm-yellow" />
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
              <div className="text-left">
                <h2 className="text-base font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-tm-maroon" />
                  Role Players
                </h2>
              </div>
              <button onClick={addRole} className="group flex items-center gap-2 px-5 py-2.5 bg-tm-maroon text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-tm-maroon/90 shadow-xl transition-all hover:-translate-y-1 active:scale-95">
                <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                Add Member
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => (
                <div key={role.id} className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-4">
                  <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                      <div className={`w-16 h-16 ${photoStyle === 'circle' ? 'rounded-full' : 'rounded-2xl'} bg-slate-50 border-2 border-slate-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-tm-maroon/30`}>
                        {generatingIds.has(role.id) ? (
                          <Loader2 className="w-5 h-5 text-tm-blue animate-spin" />
                        ) : role.photoUrl ? (
                          <img src={role.photoUrl} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <label className="p-2 bg-tm-blue text-white rounded-full cursor-pointer shadow-xl hover:scale-110 active:scale-90 transition-all">
                          <Plus className="w-3 h-3" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(role.id, e)} />
                        </label>
                        <button onClick={() => handleMagicPhoto(role.id, role.role)} disabled={generatingIds.has(role.id)} className="p-2 bg-tm-yellow text-tm-blue rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all disabled:opacity-50">
                          <Sparkles className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <input className="w-full text-[9px] font-black text-tm-maroon border-none bg-transparent focus:ring-0 p-0 uppercase tracking-widest placeholder:text-tm-maroon/30" value={role.role} onChange={(e) => updateRole(role.id, { role: e.target.value })} placeholder="Enter Role..." />
                      <input className="w-full text-sm font-bold text-slate-800 border-none bg-transparent focus:ring-0 p-0 placeholder:text-slate-300" value={role.name} onChange={(e) => updateRole(role.id, { name: e.target.value })} placeholder="Member Name" />
                    </div>
                    <button onClick={() => removeRole(role.id)} className="p-3 text-slate-200 hover:text-red-500 transition-all duration-200">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 px-1 pt-2 border-t border-slate-50">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Scale</span>
                    <input type="range" min="0.5" max="2.0" step="0.05" value={role.scale || 1.0} onChange={(e) => updateRole(role.id, { scale: parseFloat(e.target.value) })} className="flex-1 h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-tm-maroon" />
                    <span className="text-[9px] font-mono text-slate-400">{(role.scale || 1.0).toFixed(1)}x</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="w-full lg:w-[55%] bg-[#E2E8F0] flex flex-col items-center justify-center p-6 lg:p-12 sticky top-0 print:p-0 print:bg-white print:static print:w-full print:h-screen">
        <div className="mb-8 flex gap-4 no-print z-50 animate-in fade-in zoom-in duration-1000 delay-300">
          <button onClick={handleDownloadImage} disabled={isDownloading} className="group flex items-center gap-3 px-8 py-4 bg-tm-blue text-white rounded-2xl font-black uppercase tracking-widest hover:bg-tm-blue/90 hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50">
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{isDownloading ? 'Saving...' : 'Export PNG'}</span>
          </button>
        </div>
        <div id="flyer-preview-container" ref={flyerRef} className="w-full max-w-[480px] shadow-2xl bg-tm-blue aspect-[3/4] relative print:shadow-none print:max-w-none">
          <FlyerCanvas details={details} roles={roles} backgroundUrl={backgroundUrl} bgOpacity={bgOpacity} photoStyle={photoStyle} />
        </div>
        <div className="mt-8 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] no-print opacity-50">Live Preview</div>
      </div>
    </div>
  );
};

export default App;
