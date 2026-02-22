export type Note = {
  id: string;
  title: string;
  content: string;
  userId: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string;
  preferredThemeId?: string;
};

export type Theme = {
  id: string;
  name: string;
  primary: string; // HSL e.g. "199 68% 77%"
  background: string;
  accent: string;
};
