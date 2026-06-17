import { WorkflowTemplate } from './workflowApiTypes';

export interface HistoryManager {
  history: WorkflowTemplate[];
  currentIndex: number;
  maxHistorySize: number;
}

export const createNewHistoryManager = (): HistoryManager => ({
  history: [],
  currentIndex: -1,
  maxHistorySize: 10,
});
