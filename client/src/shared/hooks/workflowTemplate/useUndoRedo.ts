import { useState,useCallback } from "react";
import { WorkflowTemplate } from "src/shared/types/workflow/workflowApiTypes";
import { HistoryManager, createNewHistoryManager } from "src/shared/types/workflow/workflowTempalateEditorType";
import { initHistory, captureState, performUndo, performRedo, canUndo, canRedo, deepClone } from "src/shared/components/workflow/workflowTemplate/workflowTemplateUtils";

export const useUndoRedo = (
    editedWorkflow: WorkflowTemplate | null,
    setEditedWorkflow: (workflow: WorkflowTemplate | null) => void,
    selectedStepId: string | undefined,
    setSelectedStepId: (stepId: string | undefined) => void,
) => {
    const [historyManager, setHistoryManager] = useState<HistoryManager>(createNewHistoryManager());

    const init = useCallback((initialWorkflow: WorkflowTemplate) => {
        
        const initHistoryManager = initHistory(createNewHistoryManager(), initialWorkflow, selectedStepId);
        setHistoryManager(initHistoryManager);

    }, [selectedStepId]);

    const captureCurrentState = useCallback( (action?: string) => {
        if (!editedWorkflow) return;

        setHistoryManager(captureState(historyManager, editedWorkflow, selectedStepId, action));

    }, [editedWorkflow, selectedStepId, historyManager]);

    const undo = useCallback(() => {
        
        const { manager, stateToRestore } = performUndo(historyManager);

        if (stateToRestore){
            setEditedWorkflow(deepClone(stateToRestore.workflow));
            setSelectedStepId(stateToRestore.selectedStepId);
            setHistoryManager(manager);
        }
        
    }, [historyManager, setEditedWorkflow, setSelectedStepId]);
    
    const redo = useCallback(() => {
        const { manager, stateToRestore } = performRedo(historyManager);

        if (stateToRestore){
            setEditedWorkflow(deepClone(stateToRestore.workflow));
            setSelectedStepId(stateToRestore.selectedStepId);
            setHistoryManager(manager);
        }
    }, [historyManager, setEditedWorkflow, setSelectedStepId]);

    const clearHistory = useCallback(() => {
        setHistoryManager(createNewHistoryManager());
    }, []);

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