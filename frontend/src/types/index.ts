/* ═══ TypeScript Interfaces ═══ */

export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  role: 'beginner' | 'intermediate';
  is_verified: boolean;
  is_active: boolean;
  date_joined: string;
  average_rating: number;
  rating_count: number;
}

export interface Profile {
  id: number;
  username: string;
  email: string;
  role: string;
  bio: string;
  location: string;
  avatar: string | null;
  skills_to_learn: number[];
  skills_to_teach: number[];
  skills_to_learn_names: string[];
  skills_to_teach_names: string[];
  average_rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  name: string;
}

export interface Session {
  id: number;
  user1: number;
  user2: number;
  user1_name: string;
  user2_name: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  room_name: string;
  jitsi_url: string;
  has_rated: boolean;
  created_at: string;
}

export interface Message {
  id: number;
  sender: number;
  receiver: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface Conversation {
  user_id: number;
  username: string;
  last_message: string;
  last_timestamp: string;
  unread_count: number;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  image: string | null;
  link: string;
  tags: string;
  tags_list: string[];
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface VerificationRequest {
  id: number;
  username: string;
  certificate: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
