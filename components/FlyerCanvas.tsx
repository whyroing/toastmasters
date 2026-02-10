
import React from 'react';
import { MapPin, Calendar, Clock, Users, Shield, Zap } from 'lucide-react';
import { RolePlayer, MeetingDetails } from '../types';

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
}

const RoleItem: React.FC<RoleItemProps> = ({ role, photoStyle, layoutPattern, isFocused = false, index = 0, variant = 'normal', labelIfEmpty }) => {
  const frameClass = photoStyle === 'circle' ? 'rounded-full' : 'rounded-2xl';
  
  // Slightly increased sizes
  const sizeClasses = variant === 'large'
    ? 'w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32'
    : isFocused && layoutPattern === 'focus' 
      ? 'w-18 h-18 sm:w-20 sm:h-20 lg:w-22 lg:h-22' 
      : 'w-14 h-14 sm:w-16 sm:h-16 lg:w-18 lg:h-18';

  const staggeredClass = layoutPattern === 'staggered' && index % 2 !== 0 ? 'mt-4 sm:mt-6' : '';

  // Adjusted container widths to match larger frames
  const containerWidth = variant === 'large' 
    ? 'w-[110px] sm:w-[130px] lg:w-[150px]' 
    : 'w-[80px] sm:w-[100px] lg:w-[110px]';

  return (
    <div className={`flex flex-col items-center group animate-in fade-in zoom-in duration-300 ${staggeredClass} ${containerWidth} min-w-0`}>
      <div className="relative mb-2 flex justify-center w-full">
        <div className={`${sizeClasses} ${frameClass} border-[3px] border-tm-yellow/40 overflow-hidden bg-tm-blue/40 shadow-xl group-hover:border-tm-yellow transition-all duration-300 shrink-0`}>
          {role?.photoUrl ? (
            <img src={role.photoUrl} className="w-full h-full object-cover" alt={role.name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Users className="w-1/2 h-1/2 text-tm-yellow/10" />
            </div>
          )}
        </div>
      </div>
      <div className="text-center w-full px-1 overflow-hidden">
        <p className={`${variant === 'large' ? 'text-[7px] sm:text-[8px]' : 'text-[6px] sm:text-[7px]'} font-black text-tm-yellow uppercase tracking-widest leading-none mb-1 truncate drop-shadow-sm`}>
          {role?.role || labelIfEmpty || "Role"}
        </p>
        <p className={`${variant === 'large' ? 'text-[10px] sm:text-[12px]' : 'text-[9px] sm:text-[10px]'} font-bold text-white leading-tight drop-shadow-lg truncate w-full`}>
          {role?.name || "To Be Announced"}
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
  isFocusedSection?: boolean 
}> = ({ title, icon: Icon, items, photoStyle, layoutPattern, isFocusedSection = false }) => (
  items.length > 0 && (
    <div className="flex flex-col gap-3 w-full items-center shrink-0">
      <div className="flex items-center gap-2 border-b border-tm-yellow/20 pb-0.5 w-full max-w-[85%] justify-center">
        <Icon className="w-2.5 h-2.5 text-tm-yellow shrink-0" />
        <h3 className="text-[6px] lg:text-[7px] font-black tracking-[0.3em] uppercase text-tm-yellow truncate">{title}</h3>
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
  const findRoles = (keywords: string[]) => 
    roles.filter(r => keywords.some(k => r.role.toUpperCase().includes(k.toUpperCase())));

  const leadership = findRoles(['TMOD', 'TTM', 'GENERAL EVALUATOR', 'GE']).filter(r => !r.role.toUpperCase().match(/\d/)); 
  const support = findRoles(['TIMER', 'AH COUNTER', 'GRAMMARIAN']);
  const speakers = findRoles(['SPEAKER']);
  const evaluators = findRoles(['EVALUATOR']);
  
  const speakerEvaluator = [...speakers, ...evaluators];
  const allCategorizedIds = new Set([...leadership, ...support, ...speakerEvaluator].map(r => r.id));

  const renderFullMeeting = () => (
    <div className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto no-scrollbar py-2">
      <CategorySection 
        title="Leadership" 
        icon={Shield} 
        items={leadership} 
        photoStyle={photoStyle}
        layoutPattern={layoutPattern}
        isFocusedSection={true} 
      />
      <CategorySection 
        title="Support Team" 
        icon={Zap} 
        items={support} 
        photoStyle={photoStyle}
        layoutPattern={layoutPattern}
      />
    </div>
  );

  const renderSpotlight = () => {
    const pairs = [
      { 
        speaker: speakers.find(s => s.role.includes('1')) || speakers[0], 
        evaluator: evaluators.find(e => e.role.includes('1')) || evaluators[0] 
      },
      { 
        speaker: speakers.find(s => s.role.includes('2')) || speakers[1], 
        evaluator: evaluators.find(e => e.role.includes('2')) || evaluators[1] 
      }
    ];

    return (
      <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto no-scrollbar py-2 items-center justify-center">
        {pairs.map((pair, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 w-full animate-in slide-in-from-bottom duration-500 shrink-0">
            <div className="flex items-center gap-3 w-full justify-center px-12">
              <div className="h-px bg-tm-yellow/30 flex-1" />
              <span className="text-[7px] font-black text-tm-yellow/70 tracking-[0.4em] uppercase whitespace-nowrap">Session {idx + 1}</span>
              <div className="h-px bg-tm-yellow/30 flex-1" />
            </div>
            <div className="flex items-start justify-center gap-6 sm:gap-12 lg:gap-16">
              <RoleItem 
                role={pair.speaker} 
                photoStyle={photoStyle} 
                layoutPattern="standard" 
                variant="large" 
                labelIfEmpty={`Speaker ${idx + 1}`}
              />
              <RoleItem 
                role={pair.evaluator} 
                photoStyle={photoStyle} 
                layoutPattern="standard" 
                variant="large" 
                labelIfEmpty={`Evaluator ${idx + 1}`}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const logoUrl = "https://i.postimg.cc/V6m9zvZR/logo.jpg";

  return (
    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-tm-blue">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        {backgroundUrl ? (
          <img 
            src={backgroundUrl} 
            className="w-full h-full object-cover transition-opacity duration-300" 
            style={{ opacity: bgOpacity / 100 }}
            alt="Flyer Background" 
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-tm-blue via-tm-blue to-tm-maroon" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full text-white p-4 sm:p-5 lg:p-6 pt-5">
        <div className="absolute top-0 right-0 left-0 h-1 bg-tm-yellow shadow-md" />
        
        {/* Header */}
        <div className="mb-4 flex flex-col items-center text-center shrink-0 w-full overflow-hidden">
          <div className="mb-2">
             <img src={logoUrl} alt="Toastmasters Logo" className="h-8 sm:h-10 w-auto object-contain rounded shadow-lg border border-white/20 bg-white p-0.5" />
          </div>

          <div className="flex items-center gap-2 mb-1 w-full justify-center">
            <div className="flex flex-col text-center overflow-hidden">
              <span className="text-[5px] lg:text-[6px] font-black tracking-[0.4em] uppercase text-tm-yellow leading-none truncate">TOASTMASTERS INTERNATIONAL</span>
              <span className="text-[9px] lg:text-[11px] font-bold uppercase tracking-widest text-white leading-tight drop-shadow-md truncate max-w-[200px] sm:max-w-none">{details.clubName}</span>
            </div>
          </div>
          
          <h1 className="text-lg sm:text-xl lg:text-2xl font-header font-black mb-1.5 text-white drop-shadow-2xl leading-tight truncate w-full">
            {details.flyerType === 'spotlight' ? "MEMBER SPOTLIGHT" : details.title.toUpperCase()}
          </h1>
          
          <div className="bg-tm-maroon/90 py-0.5 px-6 rounded-full border border-tm-yellow/30 shadow-xl max-w-[90%] mx-auto">
            <p className="text-[8px] sm:text-[10px] lg:text-[11px] font-bold text-tm-yellow italic tracking-wide truncate">
              Theme: {details.theme}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          {details.flyerType === 'spotlight' ? renderSpotlight() : renderFullMeeting()}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-tm-yellow/20 shrink-0">
          <div className="grid grid-cols-3 gap-1 bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 shadow-xl">
            <div className="flex flex-col items-center text-center gap-0.5 overflow-hidden">
              <Calendar className="w-3.5 h-3.5 text-tm-yellow shrink-0" />
              <p className="text-[5px] uppercase text-tm-yellow font-black tracking-widest">DATE</p>
              <p className="text-[8px] sm:text-[10px] font-bold truncate w-full">
                {new Date(details.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-0.5 border-x border-tm-yellow/10 overflow-hidden px-1">
              <Clock className="w-3.5 h-3.5 text-tm-yellow shrink-0" />
              <p className="text-[5px] uppercase text-tm-yellow font-black tracking-widest">TIME</p>
              <p className="text-[8px] sm:text-[10px] font-bold truncate w-full">{details.time}</p>
            </div>
            <div className="flex flex-col items-center text-center gap-0.5 overflow-hidden">
              <MapPin className="w-3.5 h-3.5 text-tm-yellow shrink-0" />
              <p className="text-[5px] uppercase text-tm-yellow font-black tracking-widest">VENUE</p>
              <p className="text-[8px] sm:text-[9px] font-bold leading-tight line-clamp-1 w-full">
                {details.location}
              </p>
            </div>
          </div>
          
          <div className="mt-2.5 text-center">
            <p className="text-[7px] text-tm-yellow opacity-70 uppercase font-black tracking-[0.5em] truncate">WHERE LEADERS ARE MADE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlyerCanvas;
