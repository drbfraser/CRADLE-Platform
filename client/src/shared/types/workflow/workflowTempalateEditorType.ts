import { WorkflowTemplate } from "./workflowApiTypes";

export interface HistoryState {
    workflow: WorkflowTemplate;
    selectedStepId?: string;
    action?: string;
}

export interface HistoryManager {
    history: HistoryState[];
    currentIndex: number;
    maxHistorySize: number;
}

export const createNewHistoryManager = (): HistoryManager => ({
    history: [],
    currentIndex: -1,
    maxHistorySize: 10,
});