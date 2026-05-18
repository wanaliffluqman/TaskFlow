export type User = {
  id: string;
  email: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
  dueDate: string;
  checklistItems: ChecklistItem[];
};
