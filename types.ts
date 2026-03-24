
export interface RolePlayer {
  id: string;
  role: string;
  name: string;
  photoUrl: string | null;
  scale?: number;
  category: 'leadership' | 'support';
}

export interface MeetingDetails {
  title: string;
  theme: string;
  themeLabel?: string;
  leadershipLabel?: string;
  supportLabel?: string;
  date: string;
  time: string;
  location: string;
  clubName: string;
  flyerType: 'full' | 'spotlight';
  themeColor: 'blue' | 'maroon' | 'grey' | 'yellow' | 'midnight' | 'royal' | 'sunset' | 'ocean' | 'platinum';
  globalPhotoScale?: number;
  titleFont?: 'sans' | 'serif';
  badgeShape?: 'capsule' | 'modern';
}

export interface FlyerConfig {
  details: MeetingDetails;
  roles: RolePlayer[];
  backgroundUrl: string | null;
}
