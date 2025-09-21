import { PlaceHolderImages } from "./placeholder-images";

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
  id: string;
  name: string;
  email: string;
  points: number;
  houseId: string;
  role: 'admin' | 'user';
  avatar: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  description: string;
  image: string;
};

// This data is for initializing your Firestore database.
export const initialHousesData: Omit<House, 'id'>[] = [
  { name: 'Red Raptors', color: '#F44336', textColor: 'text-white', president: 'Alice', houseCaptain: 'Bob', points: 0 },
  { name: 'Yellow Strikers', color: '#FFEB3B', textColor: 'text-gray-800', president: 'Charlie', houseCaptain: 'Dave', points: 0 },
  { name: 'Green Geckos', color: '#4CAF50', textColor: 'text-white', president: 'Eve', houseCaptain: 'Frank', points: 0 },
  { name: 'Blue Blasters', color: '#2196F3', textColor: 'text-white', president: 'Grace', houseCaptain: 'Heidi', points: 0 },
];


export const events: Event[] = [
    { 
        id: 'event_1', 
        title: 'Flutter Forward Extended', 
        date: '2025-09-15', 
        description: 'Join us for a recap of the biggest announcements from Flutter Forward, with live demos and Q&A sessions.',
        image: PlaceHolderImages.find(p => p.id === 'event-1')?.imageUrl || ''
    },
    { 
        id: 'event_2', 
        title: 'Intro to Google Cloud', 
        date: '2025-10-02', 
        description: 'A beginner-friendly workshop on Google Cloud Platform. No prior experience needed!',
        image: PlaceHolderImages.find(p => p.id === 'event-2')?.imageUrl || ''
    },
    { 
        id: 'event_3', 
        title: 'Android Dev Challenge', 
        date: '2025-10-20', 
        description: 'Showcase your Android development skills in our annual hackathon. Exciting prizes to be won!',
        image: PlaceHolderImages.find(p => p.id === 'event-3')?.imageUrl || ''
    },
    { 
        id: 'event_4', 
        title: 'Fireside Chat with a Googler', 
        date: '2025-11-05', 
        description: 'An exclusive session with a software engineer from Google. Ask anything about tech, careers, and life at Google.',
        image: PlaceHolderImages.find(p => p.id === 'event-4')?.imageUrl || ''
    },
];
