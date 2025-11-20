import { HistoryManager, HistoryState} from 'src/shared/types/workflow/workflowTempalateEditorType';
import { WorkflowTemplate } from 'src/shared/types/workflow/workflowApiTypes';

export const initHistory = (
    manager: HistoryManager,
    initialWorkflow: WorkflowTemplate,
    selectedStepId?: string,
): HistoryManager => {

    const state: HistoryState = {
        workflow: deepClone(initialWorkflow),
        selectedStepId: selectedStepId,
        action: 'INITIAL_STATE',
    };

    return {
        ...manager,
        history: [state],
        currentIndex: 0,
    }
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

export const captureState = (
    manager: HistoryManager,
    workflow: WorkflowTemplate,
    selectedStepId?: string,
    action?: string,
) => {

    const state: HistoryState = {
        workflow: deepClone(workflow),
        selectedStepId: selectedStepId,
        action: action,
    };

    const newHistory = manager.history.slice(0, manager.currentIndex + 1);

    newHistory.push(state);

    let updatedHistory = newHistory;
    let newIndex = newHistory.length - 1;

    if (newHistory.length > manager.maxHistorySize) {
        updatedHistory = newHistory.slice(1);
        newIndex = updatedHistory.length - 1;
    }

    return {
        ...manager,
        history: updatedHistory,
        currentIndex: newIndex,
    };
};

export const performUndo = (
    manager: HistoryManager
  ): { manager: HistoryManager; stateToRestore: HistoryState | null } => {
    if (manager.currentIndex <= 0) {
      return { manager, stateToRestore: null };
    }
  
    const newIndex = manager.currentIndex - 1;
  
    return {
      manager: {
        ...manager,
        currentIndex: newIndex,
      },
      stateToRestore: manager.history[newIndex],
    };
  };

  export const performRedo = (
    manager: HistoryManager
  ): { manager: HistoryManager; stateToRestore: HistoryState | null } => {
    if (manager.currentIndex >= manager.history.length - 1){
        return { manager, stateToRestore: null };
    }

    const newIndex = manager.currentIndex + 1;

    return {
        manager: {
            ...manager,
            currentIndex: newIndex,
        },
        stateToRestore: manager.history[newIndex],
    };
  };

  export const canUndo = (manager: HistoryManager): boolean => {
    return manager.currentIndex > 0;
  }

  export const canRedo = (manager: HistoryManager): boolean => {
    return manager.currentIndex < manager.history.length - 1;
  }