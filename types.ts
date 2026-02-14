
export interface RolePlayer {
  id: string;
  role: string;
  name: string;
  photoUrl: string | null;
  scale?: number; // Individual scale factor (0.5 to 2.0)
}

export interface MeetingDetails {
  title: string;
  theme: string;
  date: string;
  time: string;
  location: string;
  clubName: string;
  flyerType: 'full' | 'spotlight';
  themeColor: 'blue' | 'maroon' | 'grey' | 'yellow' | 'midnight' | 'royal' | 'sunset' | 'ocean' | 'platinum';
  globalPhotoScale?: number; // Global scale (0.5 to 2.0)
}

export interface FlyerConfig {
  details: MeetingDetails;
  roles: RolePlayer[];
  backgroundUrl: string | null;
}
