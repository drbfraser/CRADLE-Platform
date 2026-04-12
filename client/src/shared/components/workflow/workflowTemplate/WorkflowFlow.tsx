import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box } from '@mui/material';
import {
  WorkflowTemplateStepWithFormAndIndex,
  WorkflowTemplateStepBranch,
} from 'src/shared/types/workflow/workflowApiTypes';
import { FlowNode } from './FlowNode';
import { FlowEdge } from './FlowEdge';
import { ID } from 'src/shared/constants';

const HORIZONTAL_SPACING = 350; // Space between nodes at the same level
const VERTICAL_SPACING = 180; // Space between each level (top to bottom)

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes: EdgeTypes = {
  flowEdge: FlowEdge,
};

type Position = { x: number; y: number };

/**
 * Calculate each node using BFS.
 * Nodes with multiple parents get assigned the level of their closest parent
 */
function calculateNodeLevels(
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

      //assign if not yet visited
      if (existingLevel === undefined) {
        stepLevels.set(branch.targetStepId, newLevel);
        queue.push(branch.targetStepId);
      }
    });
  }
  return stepLevels;
}

function calculateStepPositions(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string,
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

  //put orphaned nodes above the graph
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
function preventNodeOverlaps(
  stepLevels: Map<string, number>,
  stepPositions: Map<string, Position>
): void {
  // Group nodes by level
  const levelNodes = new Map<number, string[]>();
  stepLevels.forEach((level, stepId) => {
    if (!levelNodes.has(level)) {
      levelNodes.set(level, []);
    }
    levelNodes.get(level)!.push(stepId);
  });

  // Process each level
  levelNodes.forEach((nodeIds) => {
    if (nodeIds.length <= 1) return;

    // Sort nodes by their current X position
    const nodesWithPositions = nodeIds
      .map((stepId) => ({
        stepId,
        pos: stepPositions.get(stepId)!,
      }))
      .sort((a, b) => a.pos.x - b.pos.x);

    // Enforce minimum spacing
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

    // Center the level horizontally around x=0
    const minX = Math.min(...nodesWithPositions.map((n) => n.pos.x));
    const maxX = Math.max(...nodesWithPositions.map((n) => n.pos.x));
    const offset = -(minX + maxX) / 2;

    nodesWithPositions.forEach(({ stepId, pos }) => {
      stepPositions.set(stepId, { x: pos.x + offset, y: pos.y });
    });

    //Global Centering Logic
    const levelNodes = new Map<number, string[]>();
    stepLevels.forEach((level, stepId) => {
      if (!levelNodes.has(level)) levelNodes.set(level, []);
      levelNodes.get(level)!.push(stepId);
    });

    levelNodes.forEach((nodeIds) => {
      const positions = nodeIds.map((id) => stepPositions.get(id)!.x);
      const minX = Math.min(...positions);
      const maxX = Math.max(...positions);

      // Center this specific level horizontally around 0
      const levelCenterOffset = (minX + maxX) / 2;

      nodeIds.forEach((stepId) => {
        const currentPos = stepPositions.get(stepId)!;
        stepPositions.set(stepId, {
          x: currentPos.x - levelCenterOffset, // Shift nodes so level is centered at 0
          y: currentPos.y,
        });
      });
    });
  });
}

/**
 * Create ReactFlow nodes from workflow steps and their calculated positions.
 */
function createFlowNodes(
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

/**
 * Create ReactFlow edges from workflow step branches.
 */
function createFlowEdges(
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
          // Extract condition name for display
          let conditionName = 'Condition';
          if (branch.condition) {
            try {
              const rule = JSON.parse(branch.condition.rule);
              // Try to extract a meaningful name from the rule
              conditionName =
                rule.name || rule.label || `Condition ${index + 1}`;
            } catch {
              // If parsing fails, use a default name
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

interface WorkflowFlowProps {
  steps: WorkflowTemplateStepWithFormAndIndex[];
  firstStepId: ID;
  selectedStepId?: string;
  isEditMode?: boolean;
  onStepSelect?: (stepId: string) => void;
  onInsertNode?: (stepId: string) => void;
  onAddBranch?: (stepId: string) => void;
  onConnectionCreate?: (sourceStepId: string, targetStepId: string) => void;
  onDeleteNode?: (stepId: string) => void;
  onAddRule?: (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => void;
  onInsertNodeBetween?: (
    sourceStepId: string,
    targetStepId: string,
    branchId?: string
  ) => void;
}

export const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  steps,
  firstStepId,
  selectedStepId,
  isEditMode = false,
  onStepSelect,
  onInsertNode,
  onInsertNodeBetween,
  onAddBranch,
  onConnectionCreate,
  onDeleteNode,
  onAddRule,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { generatedNodes, generatedEdges } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { generatedNodes: [], generatedEdges: [] };
    }

    const stepLevels = calculateNodeLevels(steps, firstStepId);

    const stepPositions = calculateStepPositions(
      steps,
      firstStepId,
      stepLevels
    );

    preventNodeOverlaps(stepLevels, stepPositions);

    const nodes = createFlowNodes(
      steps,
      stepPositions,
      selectedStepId,
      isEditMode,
      onStepSelect,
      onInsertNode,
      onAddBranch,
      onDeleteNode
    );
    const edges = createFlowEdges(
      steps,
      isEditMode,
      onAddRule,
      onInsertNodeBetween
    );

    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    steps,
    firstStepId,
    selectedStepId,
    isEditMode,
    onStepSelect,
    onInsertNode,
    onInsertNodeBetween,
    onAddBranch,
    onDeleteNode,
    onAddRule,
  ]);

  // Update nodes and edges when generated data changes
  useEffect(() => {
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  const validateConnection = useCallback(
    (sourceStepId: string, targetStepId: string): string | null => {
      // Find steps
      const sourceStep = steps.find((s) => s.id === sourceStepId);
      const targetStep = steps.find((s) => s.id === targetStepId);

      if (!sourceStep || !targetStep) {
        return 'Invalid connection: step not found';
      }

      // Calculate levels to ensure target is deeper than source
      const stepLevels = calculateNodeLevels(steps, firstStepId);
      const sourceLevel = stepLevels.get(sourceStepId) ?? 0;
      const targetLevel = stepLevels.get(targetStepId) ?? 0;

      return null;
    },
    [steps, firstStepId]
  );

  /**
   * Handle new connections created by dragging edges between nodes.
   */
  const onConnect = useCallback(
    (params: Connection) => {
      if (!isEditMode) {
        return;
      }

      if (!params.source || !params.target) {
        return;
      }

      const error = validateConnection(params.source, params.target);
      if (error) {
        return;
      }

      if (onConnectionCreate) {
        onConnectionCreate(params.source, params.target);
      }

      setEdges((eds: Edge[]) => addEdge(params, eds));
    },
    [isEditMode, validateConnection, onConnectionCreate, setEdges]
  );

  /**
   * Handle node click events.
   */
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onStepSelect) {
        onStepSelect(node.id);
      }
    },
    [onStepSelect]
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={isEditMode ? onConnect : undefined}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodesDraggable={true}
        nodesConnectable={isEditMode}
        elementsSelectable={isEditMode}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
          minZoom: 0.5,
          maxZoom: 2,
        }}
        attributionPosition="bottom-left">
        <Background />
        <Controls />
      </ReactFlow>
    </Box>
  );
};
