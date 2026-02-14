
import React from 'react';
import { MapPin, Calendar, Clock, Users, Shield, Zap } from 'lucide-react';
import { RolePlayer, MeetingDetails } from '../types.ts';

interface FlyerCanvasProps {
  details: MeetingDetails;
  roles: RolePlayer[];
  backgroundUrl: string | null;
  bgOpacity: number;
  photoStyle: 'circle' | 'square';
  layoutPattern?: 'standard' | 'staggered' | 'focus';
}

interface RoleItemProps {
  role?: RolePlayer;
  photoStyle: 'circle' | 'square';
  layoutPattern: 'standard' | 'staggered' | 'focus';
  isFocused?: boolean;
  index?: number;
  variant?: 'normal' | 'large';
  labelIfEmpty?: string;
  themeColor: MeetingDetails['themeColor'];
  isLightBackground: boolean;
  globalScale?: number;
}

const RoleItem: React.FC<RoleItemProps> = ({ 
  role, 
  photoStyle, 
  layoutPattern, 
  isFocused = false, 
  index = 0, 
  variant = 'normal', 
  labelIfEmpty, 
  themeColor, 
  isLightBackground,
  globalScale = 1.0
}) => {
  const frameClass = photoStyle === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const textMainClass = isLightBackground ? 'text-slate-900' : 'text-white';
  const textRoleClass = isLightBackground ? 'text-tm-blue' : 'text-tm-yellow';
  
  const baseSize = variant === 'large' ? 112 : 64; 
  const combinedScale = (role?.scale || 1.0) * globalScale;
  const finalSize = baseSize * combinedScale;
  
  const containerWidth = finalSize + 32;

  return (
    <div 
      className={`flex flex-col items-center group animate-in fade-in zoom-in duration-300 min-w-0`}
      style={{ width: `${containerWidth}px` }}
    >
      <div className="relative mb-2 flex justify-center w-full">
        <div 
          className={`${frameClass} border-[3px] ${isLightBackground ? 'border-tm-blue/20' : 'border-tm-yellow/40'} overflow-hidden bg-white/10 shadow-xl group-hover:${isLightBackground ? 'border-tm-blue' : 'border-tm-yellow'} transition-all duration-300 shrink-0 transform group-hover:scale-105`}
          style={{ width: `${finalSize}px`, height: `${finalSize}px` }}
        >
          {role?.photoUrl ? (
            <img src={role.photoUrl} className="w-full h-full object-cover" alt={role.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className={`w-1/2 h-1/2 ${isLightBackground ? 'text-tm-blue/10' : 'text-tm-yellow/10'}`} />
            </div>
          )}
        </div>
      </div>
      <div className="text-center w-full px-1 overflow-hidden">
        <p className={`${variant === 'large' ? 'text-[7px] sm:text-[8px]' : 'text-[6px] sm:text-[7px]'} font-black ${textRoleClass} uppercase tracking-widest leading-none mb-1 truncate drop-shadow-sm`}>
          {role?.role || labelIfEmpty || "Role"}
        </p>
        <p className={`${variant === 'large' ? 'text-[10px] sm:text-[12px]' : 'text-[9px] sm:text-[10px]'} font-bold ${textMainClass} leading-tight drop-shadow-lg truncate w-full`}>
          {role?.name || "TBA"}
        </p>
      </div>
    </div>
  );
};

const CategorySection: React.FC<{ 
  title: string; 
  icon: any; 
  items: RolePlayer[]; 
  photoStyle: 'circle' | 'square'; 
  layoutPattern: 'standard' | 'staggered' | 'focus'; 
  themeColor: MeetingDetails['themeColor'];
  isLightBackground: boolean;
  globalScale: number;
  isFocusedSection?: boolean 
}> = ({ title, icon: Icon, items, photoStyle, layoutPattern, themeColor, isLightBackground, globalScale, isFocusedSection = false }) => (
  items.length > 0 && (
    <div className="flex flex-col gap-3 w-full items-center shrink-0 mb-4">
      <div className={`flex items-center gap-2 border-b ${isLightBackground ? 'border-tm-blue/10' : 'border-tm-yellow/20'} pb-0.5 w-full max-w-[85%] justify-center`}>
        <Icon className={`w-2.5 h-2.5 ${isLightBackground ? 'text-tm-blue' : 'text-tm-yellow'} shrink-0`} />
        <h3 className={`text-[6px] lg:text-[7px] font-black tracking-[0.3em] uppercase ${isLightBackground ? 'text-tm-blue' : 'text-tm-yellow'} truncate`}>{title}</h3>
      </div>
      <div className={`flex flex-wrap justify-center items-start w-full gap-x-3 sm:gap-x-4 lg:gap-x-6 gap-y-4`}>
        {items.map((role, i) => (
          <RoleItem 
            key={role.id} 
            role={role} 
            photoStyle={photoStyle} 
            layoutPattern={layoutPattern} 
            isFocused={isFocusedSection} 
            index={i}
            themeColor={themeColor}
            isLightBackground={isLightBackground}
            globalScale={globalScale}
          />
        ))}
      </div>
    </div>
  )
);

const FlyerCanvas: React.FC<FlyerCanvasProps> = ({ 
  details, 
  roles, 
  backgroundUrl, 
  bgOpacity, 
  photoStyle, 
  layoutPattern = 'standard' 
}) => {
  const themeColor = details.themeColor || 'blue';
  const globalPhotoScale = details.globalPhotoScale || 1.0;
  
  let baseColorClass = 'bg-tm-blue';
  let isLightBackground = false;

  switch (themeColor) {
    case 'maroon': baseColorClass = 'bg-tm-maroon'; break;
    case 'grey': baseColorClass = 'bg-tm-grey'; isLightBackground = true; break;
    case 'yellow': baseColorClass = 'bg-tm-yellow'; isLightBackground = true; break;
    case 'midnight': baseColorClass = 'bg-slate-950'; break;
    default: baseColorClass = 'bg-tm-blue';
  }

  const findRoles = (keywords: string[]) => 
    roles.filter(r => keywords.some(k => r.role.toUpperCase().includes(k.toUpperCase())));

  const leadership = findRoles(['TMOD', 'TTM', 'GENERAL EVALUATOR', 'GE']).filter(r => !r.role.toUpperCase().match(/\d/)); 
  const support = findRoles(['TIMER', 'AH COUNTER', 'GRAMMARIAN']);
  
  const textMainClass = isLightBackground ? 'text-slate-900' : 'text-white';
  const textAccentClass = isLightBackground ? 'text-tm-blue' : 'text-tm-yellow';
  const badgeClass = isLightBackground ? 'bg-tm-blue text-white' : 'bg-tm-maroon/90 text-tm-yellow';

  const logoUrl = "https://i.postimg.cc/V6m9zvZR/logo.jpg";

  return (
    <div className={`relative w-full h-full flex flex-col font-sans overflow-hidden transition-all duration-500 ${baseColorClass}`}>
      <div className="absolute inset-0 z-0">
        {backgroundUrl ? (
          <img src={backgroundUrl} className="w-full h-full object-cover transition-opacity duration-300" style={{ opacity: bgOpacity / 100 }} alt="Flyer Background" />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br from-black/20 to-black/60`} />
        )}
        <div className={`absolute inset-0 ${isLightBackground ? 'bg-white/10' : 'bg-black/20'}`} />
      </div>

      <div className={`relative z-10 flex flex-col h-full ${textMainClass} p-4 sm:p-5 lg:p-6 pt-5`}>
        <div className={`absolute top-0 right-0 left-0 h-1 ${isLightBackground ? 'bg-tm-blue' : 'bg-tm-yellow'}`} />
        
        <div className="mb-4 flex flex-col items-center text-center shrink-0 w-full overflow-hidden">
          <div className="mb-2">
             <img src={logoUrl} alt="TM Logo" className="h-8 sm:h-10 w-auto object-contain rounded bg-white p-0.5" />
          </div>
          <div className="flex flex-col text-center overflow-hidden mb-1">
              <span className={`text-[5px] lg:text-[6px] font-black tracking-[0.4em] uppercase ${textAccentClass}`}>TOASTMASTERS INTERNATIONAL</span>
              <span className={`text-[9px] lg:text-[11px] font-bold uppercase tracking-widest truncate max-w-[200px] mx-auto`}>{details.clubName}</span>
          </div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-header font-black mb-1.5 drop-shadow-2xl uppercase truncate w-full">
            {details.flyerType === 'spotlight' ? "SPOTLIGHT" : details.title}
          </h1>
          <div className={`${badgeClass} py-0.5 px-6 rounded-full border border-white/20 shadow-xl max-w-[90%] mx-auto`}>
            <p className={`text-[8px] sm:text-[10px] lg:text-[11px] font-bold italic truncate`}>Theme: {details.theme}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {details.flyerType === 'spotlight' ? (
             <div className="flex-1 flex flex-wrap items-center justify-center gap-x-6 gap-y-8 px-4 py-6 overflow-y-auto no-scrollbar">
               {roles.map((role) => (
                 <RoleItem key={role.id} role={role} photoStyle={photoStyle} layoutPattern="standard" variant={roles.length <= 2 ? 'large' : 'normal'} themeColor={themeColor} isLightBackground={isLightBackground} globalScale={globalPhotoScale} />
               ))}
             </div>
          ) : (
             <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto no-scrollbar py-2">
               <CategorySection title="Leadership Team" icon={Shield} items={leadership} photoStyle={photoStyle} layoutPattern={layoutPattern} isFocusedSection={true} themeColor={themeColor} isLightBackground={isLightBackground} globalScale={globalPhotoScale} />
               <CategorySection title="Technical Support" icon={Zap} items={support} photoStyle={photoStyle} layoutPattern={layoutPattern} themeColor={themeColor} isLightBackground={isLightBackground} globalScale={globalPhotoScale} />
             </div>
          )}
        </div>

        <div className={`mt-3 pt-3 border-t ${isLightBackground ? 'border-tm-blue/10' : 'border-white/10'} shrink-0`}>
          <div className={`grid grid-cols-3 gap-1 ${isLightBackground ? 'bg-white/90' : 'bg-black/80'} backdrop-blur-md rounded-xl p-3 shadow-xl`}>
            <div className="flex flex-col items-center text-center gap-0.5 overflow-hidden">
              <Calendar className={`w-3.5 h-3.5 ${textAccentClass}`} />
              <p className="text-[8px] sm:text-[10px] font-bold">{new Date(details.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className={`flex flex-col items-center text-center gap-0.5 border-x ${isLightBackground ? 'border-tm-blue/10' : 'border-white/10'} px-1`}>
              <Clock className={`w-3.5 h-3.5 ${textAccentClass}`} />
              <p className="text-[8px] sm:text-[10px] font-bold">{details.time}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-0.5">
              <MapPin className={`w-3.5 h-3.5 ${textAccentClass}`} />
              <p className="text-[7px] sm:text-[9px] font-bold leading-tight line-clamp-2 text-center break-words">{details.location}</p>
            </div>
          </div>
          <p className={`mt-2 text-center text-[7px] ${textAccentClass} opacity-80 uppercase font-black tracking-[0.5em]`}>WHERE LEADERS ARE MADE</p>
        </div>
      </div>
    </div>
  );
};

export default FlyerCanvas;
