
export type Note = {
  id: string;
  title: string;
  content: string;
  metadata?: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  projectId?: string; // Reference to Project document ID
  labelId?: string;   // Reference to Label document ID
  tags?: string[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
};

export type Label = {
  id: string;
  name: string;
  isDefault?: boolean;
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
  primary: string; 
  background: string;
  accent: string;
};
