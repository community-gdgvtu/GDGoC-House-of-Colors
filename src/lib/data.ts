export type House = {
  id: string;
  name: string;
  color: string;
  textColor: string;
  president: string;
  houseCaptain: string;
  points: number;
};

export type User = {
  id: string; // This is the Firebase Auth UID
  customId: string; // This is the new GOOGE001 style ID
  name: string;
  email: string;
  points: number;
  houseId: string;
  role: 'admin' | 'user';
  avatar: string;
};

// This data is for initializing your Firestore database.
export const initialHousesData: Omit<House, 'id'>[] = [
  { name: 'Red Raptors', color: '#F44336', textColor: 'text-white', president: 'Alice', houseCaptain: 'Bob', points: 0 },
  { name: 'Yellow Strikers', color: '#FFEB3B', textColor: 'text-gray-800', president: 'Charlie', houseCaptain: 'Dave', points: 0 },
  { name: 'Green Geckos', color: '#4CAF50', textColor: 'text-white', president: 'Eve', houseCaptain: 'Frank', points: 0 },
  { name: 'Blue Blasters', color: '#2196F3', textColor: 'text-white', president: 'Grace', houseCaptain: 'Heidi', points: 0 },
];
