import React, { createContext, useContext } from 'react';
import {
  useWorkflowRuleClipboardState,
  WorkflowRuleClipboard,
} from 'src/shared/hooks/workflowTemplate/useWorkflowRuleClipboard';

const WorkflowRuleClipboardContext =
  createContext<WorkflowRuleClipboard | null>(null);

/**
 * Provides an in-memory condition clipboard for one workflow editor session.
 * Mount around WorkflowEditor / WorkflowFlowView; unmount clears the clipboard.
 */
export const WorkflowRuleClipboardProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const value = useWorkflowRuleClipboardState();
  return (
    <WorkflowRuleClipboardContext.Provider value={value}>
      {children}
    </WorkflowRuleClipboardContext.Provider>
  );
};

export function useWorkflowRuleClipboard(): WorkflowRuleClipboard {
  const ctx = useContext(WorkflowRuleClipboardContext);
  if (!ctx) {
    throw new Error(
      'useWorkflowRuleClipboard must be used within WorkflowRuleClipboardProvider'
    );
  }
  return ctx;
}
