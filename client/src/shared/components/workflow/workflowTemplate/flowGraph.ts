import { Node, Edge } from '@xyflow/react';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplateStepBranch,
} from 'src/shared/types/workflow/workflowApiTypes';
import { Position } from './flowLayout';

export function createFlowNodes(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  stepPositions: Map<string, Position>,
  selectedStepId: string | undefined,
  isEditMode: boolean,
  onStepSelect?: (stepId: string) => void,
  onInsertNode?: (stepId: string) => void,
  onAddBranch?: (stepId: string) => void,
  onDeleteNode?: (stepId: string) => void
): Node[] {
  return steps.map((step) => {
    const position = stepPositions.get(step.id) || { x: 0, y: 0 };
    return {
      id: step.id,
      type: 'flowNode',
      position,
      data: {
        stepNumber: step.index || 1,
        stepName: step.name,
        stepId: step.id,
        isSelected: selectedStepId === step.id,
        isEditMode,
        onNodeClick: onStepSelect,
        onInsertNode,
        onAddBranch,
        onDeleteNode,
      },
    };
  });
}

export function createFlowEdges(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  isEditMode: boolean,
  onAddRule?: (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => void,
  onInsertNodeBetween?: (
    sourceStepId: string,
    targetStepId: string,
    branchId?: string
  ) => void
): Edge[] {
  const edges: Edge[] = [];

  steps.forEach((step) => {
    if (step.branches) {
      step.branches.forEach(
        (branch: WorkflowTemplateStepBranch, index: number) => {
          let conditionName = 'Condition';
          if (branch.condition) {
            try {
              const rule = JSON.parse(branch.condition.rule);
              conditionName =
                rule.name || rule.label || `Condition ${index + 1}`;
            } catch {
              conditionName = `Condition ${index + 1}`;
            }
          }

          edges.push({
            id: `e-${step.id}-${branch.targetStepId}-${index}`,
            source: step.id,
            target: branch.targetStepId,
            type: 'flowEdge',
            animated: false,
            data: {
              hasCondition: !!branch.condition,
              conditionName: branch.condition ? conditionName : undefined,
              branchId: branch.id,
              sourceStepId: step.id,
              targetStepId: branch.targetStepId,
              onAddRule,
              onInsertNodeBetween,
              isEditMode,
            },
            style: {
              stroke: '#9e9e9e',
              strokeWidth: 2.5,
            },
            markerEnd: {
              type: 'arrowclosed' as const,
              width: 20,
              height: 20,
              color: '#9e9e9e',
            },
          });
        }
      );
    }
  });

  return edges;
}
