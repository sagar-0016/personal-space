
export type Note = {
  id: string;
  title: string;
  content: string;
  metadata?: string;
  userId: string;
  color?: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  labels?: string[];
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
  primary: string; // HSL e.g. "199 89% 48%"
  background: string;
  accent: string;
};
