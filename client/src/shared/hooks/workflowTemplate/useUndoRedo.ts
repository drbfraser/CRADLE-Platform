import { useState } from "react";
import { WorkflowTemplate } from "src/shared/types/workflow/workflowApiTypes";
import { HistoryManager, createNewHistoryManager } from "src/shared/types/workflow/workflowTempalateEditorType";
import { initHistory, captureState, performUndo, performRedo, canUndo, canRedo, deepClone } from "src/shared/components/workflow/workflowTemplate/workflowTemplateUtils";

export const useUndoRedo = (
    editedWorkflow: WorkflowTemplate | null,
    setEditedWorkflow: (workflow: WorkflowTemplate | null) => void,
) => {
    const [historyManager, setHistoryManager] = useState<HistoryManager>(createNewHistoryManager());

    const init = (initialWorkflow: WorkflowTemplate) => {
        
        const initHistoryManager = initHistory(createNewHistoryManager(), initialWorkflow);
        setHistoryManager(initHistoryManager);

    };

    const captureCurrentState = (workflowToCapture?: WorkflowTemplate) => {
        const workflow = workflowToCapture || editedWorkflow;
    
        if (!workflow) return;

        setHistoryManager((prev) => captureState(prev, workflow));

    };

    const undo = () => {
        
        setHistoryManager((prev) => {
            const { manager, stateToRestore } = performUndo(prev);

            if (stateToRestore){
                setEditedWorkflow(deepClone(stateToRestore));
            }

            return manager;
        })

    };
    
    const redo = () => {
        setHistoryManager((prev) => {
            const { manager, stateToRestore } = performRedo(prev);

            if (stateToRestore){
                setEditedWorkflow(deepClone(stateToRestore));
            }

            return manager;
        })
    };

    const clearHistory = () => {
        setHistoryManager(createNewHistoryManager());
    };

    return {
        init,
        captureCurrentState,
        canUndo: canUndo(historyManager),
        canRedo: canRedo(historyManager),
        undo,
        redo,
        clearHistory,
        historyManager,
    }
}