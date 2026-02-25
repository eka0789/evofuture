export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  image?: string | null;
}

export interface Activity {
  id: string;
  userId: string;
  action: string;
  description?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}
