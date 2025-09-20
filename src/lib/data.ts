import { PlaceHolderImages } from "./placeholder-images";

export type House = {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  president: string;
  houseCaptain: string;
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

export const houses: House[] = [
  { id: 'red', name: 'Red Raptors', color: '#F44336', bgColor: 'bg-red-500', textColor: 'text-white', borderColor: 'border-red-500', president: 'Alice', houseCaptain: 'Bob' },
  { id: 'yellow', name: 'Yellow Strikers', color: '#FFEB3B', bgColor: 'bg-yellow-400', textColor: 'text-gray-800', borderColor: 'border-yellow-400', president: 'Charlie', houseCaptain: 'Dave' },
  { id: 'green', name: 'Green Geckos', color: '#4CAF50', bgColor: 'bg-green-500', textColor: 'text-white', borderColor: 'border-green-500', president: 'Eve', houseCaptain: 'Frank' },
  { id: 'blue', name: 'Blue Blasters', color: '#2196F3', bgColor: 'bg-blue-500', textColor: 'text-white', borderColor: 'border-blue-500', president: 'Grace', houseCaptain: 'Heidi' },
];

export const users: User[] = [
  { id: 'user_1', name: 'Alex Doe', email: 'alex.doe@example.com', points: 150, houseId: 'blue', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_1' },
  { id: 'user_2', name: 'Brenda Smith', email: 'brenda.smith@example.com', points: 120, houseId: 'red', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_2' },
  { id: 'user_3', name: 'Charlie Brown', email: 'charlie.brown@example.com', points: 200, houseId: 'green', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_3' },
  { id: 'user_4', name: 'Diana Prince', email: 'diana.prince@example.com', points: 80, houseId: 'yellow', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_4' },
  { id: 'user_5', name: 'Ethan Hunt', email: 'ethan.hunt@example.com', points: 180, houseId: 'blue', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_5' },
  { id: 'user_6', name: 'Fiona Glenanne', email: 'fiona.glenanne@example.com', points: 95, houseId: 'red', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_6' },
  { id: 'user_7', name: 'George Costanza', email: 'george.costanza@example.com', points: 110, houseId: 'green', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_7' },
  { id: 'user_8', name: 'Harry Potter', email: 'harry.potter@example.com', points: 250, houseId: 'yellow', role: 'user', avatar: 'https://i.pravatar.cc/150?u=user_8' },
  { id: 'user_admin', name: 'Admin Ali', email: 'ali.admin@example.com', points: 0, houseId: '', role: 'admin', avatar: 'https://i.pravatar.cc/150?u=user_admin' },
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

export const getHouseById = (id: string) => houses.find(h => h.id === id);
export const getUserById = (id: string) => users.find(u => u.id === id);
export const getUsersByHouse = (houseId: string) => users.filter(u => u.houseId === houseId && u.role === 'user');
