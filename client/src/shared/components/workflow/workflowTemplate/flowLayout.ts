import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplateStepBranch,
} from 'src/shared/types/workflow/workflowApiTypes';

export const HORIZONTAL_SPACING = 350;
export const VERTICAL_SPACING = 180;

export type Position = { x: number; y: number };

/**
 * Calculate each node using BFS.
 * Nodes with multiple parents get assigned the level of their closest parent
 */
export function calculateNodeLevels(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string
): Map<string, number> {
  const stepLevels = new Map<string, number>();
  const queue: string[] = [];
  stepLevels.set(firstStepId, 0);
  queue.push(firstStepId);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const currentLevel = stepLevels.get(currentId) ?? 0;

    const step = steps.find((s) => s.id === currentId);
    step?.branches?.forEach((branch: WorkflowTemplateStepBranch) => {
      const existingLevel = stepLevels.get(branch.targetStepId);
      const newLevel = currentLevel + 1;

      if (existingLevel === undefined) {
        stepLevels.set(branch.targetStepId, newLevel);
        queue.push(branch.targetStepId);
      }
    });
  }
  return stepLevels;
}

export function calculateStepPositions(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  _firstStepId: string,
  stepLevels: Map<string, number>
): Map<string, Position> {
  const stepPositions = new Map<string, Position>();
  const levelNodes = new Map<number, string[]>();

  stepLevels.forEach((level, stepId) => {
    if (!levelNodes.has(level)) levelNodes.set(level, []);
    levelNodes.get(level)!.push(stepId);
  });

  levelNodes.forEach((nodeIds, level) => {
    const y = level * VERTICAL_SPACING;
    const totalWidth = (nodeIds.length - 1) * HORIZONTAL_SPACING;
    const startX = -totalWidth / 2;

    nodeIds.forEach((stepId, index) => {
      stepPositions.set(stepId, {
        x: startX + index * HORIZONTAL_SPACING,
        y,
      });
    });
  });

  let orphanX = 0;
  steps.forEach((step) => {
    if (!stepPositions.has(step.id)) {
      stepPositions.set(step.id, { x: orphanX, y: -VERTICAL_SPACING });
      orphanX += HORIZONTAL_SPACING;
    }
  });
  return stepPositions;
}

/**
 * Prevent overlapping nodes at each level by enforcing minimum spacing
 * and centering each level horizontally.
 */
export function preventNodeOverlaps(
  stepLevels: Map<string, number>,
  stepPositions: Map<string, Position>
): void {
  const levelNodes = new Map<number, string[]>();
  stepLevels.forEach((level, stepId) => {
    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level)!.push(stepId);
  });

  levelNodes.forEach((nodeIds) => {
    if (nodeIds.length <= 1) return;

    const nodesWithPositions = nodeIds
      .map((stepId) => ({
        stepId,
        pos: stepPositions.get(stepId)!,
      }))
      .sort((a, b) => a.pos.x - b.pos.x);

    for (let i = 1; i < nodesWithPositions.length; i++) {
      const prev = nodesWithPositions[i - 1];
      const current = nodesWithPositions[i];
      const minX = prev.pos.x + HORIZONTAL_SPACING;

      if (current.pos.x < minX) {
        current.pos.x = minX;
        stepPositions.set(current.stepId, {
          x: current.pos.x,
          y: current.pos.y,
        });
      }
    }

    const minX = Math.min(...nodesWithPositions.map((n) => n.pos.x));
    const maxX = Math.max(...nodesWithPositions.map((n) => n.pos.x));
    const offset = -(minX + maxX) / 2;

    nodesWithPositions.forEach(({ stepId, pos }) => {
      stepPositions.set(stepId, { x: pos.x + offset, y: pos.y });
    });

    const allLevelNodes = new Map<number, string[]>();
    stepLevels.forEach((level, stepId) => {
      if (!allLevelNodes.has(level)) allLevelNodes.set(level, []);
      allLevelNodes.get(level)!.push(stepId);
    });

    allLevelNodes.forEach((levelNodeIds) => {
      const positions = levelNodeIds.map((id) => stepPositions.get(id)!.x);
      const levelMinX = Math.min(...positions);
      const levelMaxX = Math.max(...positions);
      const levelCenterOffset = (levelMinX + levelMaxX) / 2;

      levelNodeIds.forEach((stepId) => {
        const currentPos = stepPositions.get(stepId)!;
        stepPositions.set(stepId, {
          x: currentPos.x - levelCenterOffset,
          y: currentPos.y,
        });
      });
    });
  });
}
