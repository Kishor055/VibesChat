
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  roomId: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'private' | 'group';
  members: string[];
  lastMessage?: string;
}

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex@pulsetalk.io',
  avatar: 'https://picsum.photos/seed/alex/200/200',
  status: 'online',
};

export const MOCK_USERS: User[] = [
  { id: 'u2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: 'https://picsum.photos/seed/sarah/200/200', status: 'online' },
  { id: 'u3', name: 'James Wilson', email: 'james@example.com', avatar: 'https://picsum.photos/seed/james/200/200', status: 'away' },
  { id: 'u4', name: 'Elena Rodriguez', email: 'elena@example.com', avatar: 'https://picsum.photos/seed/elena/200/200', status: 'offline' },
];

export const MOCK_ROOMS: Room[] = [
  { id: 'r1', name: 'Engineering Sync', type: 'group', members: ['u1', 'u2', 'u3'], lastMessage: 'See you in the meeting!' },
  { id: 'r2', name: 'Sarah Chen', type: 'private', members: ['u1', 'u2'], lastMessage: 'Did you check the PR?' },
  { id: 'r3', name: 'Design Specs', type: 'group', members: ['u1', 'u4'], lastMessage: 'The glassmorphism looks great.' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', senderId: 'u2', text: 'Hey Alex, how is the new PulseTalk UI coming along?', timestamp: new Date(Date.now() - 3600000).toISOString(), roomId: 'r2' },
  { id: 'm2', senderId: 'u1', text: 'It is looking sharp! Just finished the glass panels.', timestamp: new Date(Date.now() - 3000000).toISOString(), roomId: 'r2' },
  { id: 'm3', senderId: 'u2', text: 'Awesome. Did you implement the AI smart replies yet?', timestamp: new Date(Date.now() - 2400000).toISOString(), roomId: 'r2' },
];
