
export interface RolePlayer {
  id: string;
  role: string;
  name: string;
  photoUrl: string | null;
}

export interface MeetingDetails {
  title: string;
  theme: string;
  date: string;
  time: string;
  location: string;
  clubName: string;
  flyerType: 'full' | 'spotlight';
}

export interface FlyerConfig {
  details: MeetingDetails;
  roles: RolePlayer[];
  backgroundUrl: string | null;
}
