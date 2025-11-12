import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  NodeTypes,
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
import { ID } from 'src/shared/constants';

const HORIZONTAL_SPACING = 350; // Space between nodes at the same level
const VERTICAL_SPACING = 180; // Space between each level (top to bottom)

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

type Position = { x: number; y: number };

/**
 * Calculate the deepest level for each node using DFS.
 * Nodes with multiple parents get assigned the maximum level.
 */
function calculateNodeLevels(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string
): Map<string, number> {
  const stepLevels = new Map<string, number>();

  const dfs = (stepId: string, level: number) => {
    const currentLevel = stepLevels.get(stepId);
    if (currentLevel !== undefined && currentLevel >= level) {
      return;
    }

    stepLevels.set(stepId, level);

    const step = steps.find((s) => s.id === stepId);
    if (step?.branches && step.branches.length > 0) {
      step.branches.forEach((branch: WorkflowTemplateStepBranch) => {
        dfs(branch.targetStepId, level + 1);
      });
    }
  };

  dfs(firstStepId, 0);
  return stepLevels;
}

/**
 * Assign horizontal positions to leaf nodes (endpoints) in DFS order.
 */
function positionLeafNodes(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string,
  stepLevels: Map<string, number>,
  stepPositions: Map<string, Position>
): void {
  const visited = new Set<string>();
  let horizontalIndex = 0;

  const traverse = (stepId: string) => {
    if (visited.has(stepId)) return;
    visited.add(stepId);

    const step = steps.find((s) => s.id === stepId);
    const level = stepLevels.get(stepId) || 0;

    if (step?.branches && step.branches.length > 0) {
      // Not a leaf, continue to children
      step.branches.forEach((branch: WorkflowTemplateStepBranch) => {
        traverse(branch.targetStepId);
      });
    } else {
      // Leaf node: assign position
      const x = horizontalIndex * HORIZONTAL_SPACING;
      const y = level * VERTICAL_SPACING;
      stepPositions.set(stepId, { x, y });
      horizontalIndex++;
    }
  };

  traverse(firstStepId);
}

/**
 * Position parent nodes at the average X position of their children.
 * bottom-up from leaf nodes.
 */
function positionParentNodes(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string,
  stepLevels: Map<string, number>,
  stepPositions: Map<string, Position>
): void {
  const calculatePosition = (stepId: string): Position => {
    // Return if already positioned
    if (stepPositions.has(stepId)) {
      return stepPositions.get(stepId)!;
    }

    const step = steps.find((s) => s.id === stepId);
    const level = stepLevels.get(stepId) || 0;
    const y = level * VERTICAL_SPACING;

    if (step?.branches && step.branches.length > 0) {
      // Calculate X as average of children's X positions
      const childPositions = step.branches.map(
        (branch: WorkflowTemplateStepBranch) =>
          calculatePosition(branch.targetStepId)
      );

      const avgX =
        childPositions.reduce((sum, pos) => sum + pos.x, 0) /
        childPositions.length;

      const position = { x: avgX, y };
      stepPositions.set(stepId, position);
      return position;
    }

    // Fallback for nodes without branches
    const position = { x: 0, y };
    stepPositions.set(stepId, position);
    return position;
  };

  calculatePosition(firstStepId);
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
  onAddBranch?: (stepId: string) => void
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
      },
    };
  });
}

/**
 * Create ReactFlow edges from workflow step branches.
 */
function createFlowEdges(
  steps: WorkflowTemplateStepWithFormAndIndex[]
): Edge[] {
  const edges: Edge[] = [];

  steps.forEach((step) => {
    if (step.branches) {
      step.branches.forEach(
        (branch: WorkflowTemplateStepBranch, index: number) => {
          edges.push({
            id: `e-${step.id}-${branch.targetStepId}-${index}`,
            source: step.id,
            target: branch.targetStepId,
            type: 'default',
            animated: false,
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
}

export const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  steps,
  firstStepId,
  selectedStepId,
  isEditMode = false,
  onStepSelect,
  onInsertNode,
  onAddBranch,
  onConnectionCreate,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const { generatedNodes, generatedEdges } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { generatedNodes: [], generatedEdges: [] };
    }

    const stepLevels = calculateNodeLevels(steps, firstStepId);

    const stepPositions = new Map<string, Position>();
    positionLeafNodes(steps, firstStepId, stepLevels, stepPositions);

    positionParentNodes(steps, firstStepId, stepLevels, stepPositions);

    preventNodeOverlaps(stepLevels, stepPositions);

    const nodes = createFlowNodes(
      steps,
      stepPositions,
      selectedStepId,
      isEditMode,
      onStepSelect,
      onInsertNode,
      onAddBranch
    );
    const edges = createFlowEdges(steps);

    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    steps,
    firstStepId,
    selectedStepId,
    isEditMode,
    onStepSelect,
    onInsertNode,
    onAddBranch,
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

      // Check if source already has outgoing connections
      if (sourceStep.branches && sourceStep.branches.length > 0) {
        return 'This node already has an outgoing connection.';
      }

      // Calculate levels to ensure target is deeper than source
      const stepLevels = calculateNodeLevels(steps, firstStepId);
      const sourceLevel = stepLevels.get(sourceStepId) ?? 0;
      const targetLevel = stepLevels.get(targetStepId) ?? 0;

      // Target must be at a deeper level than source
      if (targetLevel <= sourceLevel) {
        return `Invalid connection: target node must be on a lower level. Source level: ${sourceLevel}, Target level: ${targetLevel}`;
      }

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
        nodesDraggable={false}
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
