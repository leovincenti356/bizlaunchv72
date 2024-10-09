export interface BusinessModule {
  id: string;
  userId: string;
  name: string;
  description: string;
  type: 'running' | 'idea';
  income: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  tasks: Task[];
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}