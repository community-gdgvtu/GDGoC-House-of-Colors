
export type Community = {
  id: string;
  name: string;
  managerId?: string; // UID of the community manager
};

export type User = {
  id: string; // This is the Firebase Auth UID
  customId: string; // This is the GOOGE001 style ID
  name: string;
  email: string;
  points: number;
  communityId?: string; // The community the user belongs to
  role: 'organizer' | 'manager' | 'user';
  avatar: string;
};

// This data is for initializing your Firestore database.
export const initialCommunitiesData: Omit<Community, 'id'>[] = [
  { name: 'Community Alpha' },
  { name: 'Community Beta' },
  { name: 'Community Gamma' },
  { name: 'Community Delta' },
];
