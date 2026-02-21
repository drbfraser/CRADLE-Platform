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

function calculateStepPositions(
  steps: WorkflowTemplateStepWithFormAndIndex[],
  firstStepId: string,
  stepLevels: Map<string, number>
): Map<string, Position> {
  const stepPositions = new Map<string, Position>();
  const nextXAtLevel = new Map<number, number>(); // Tracks the right-most edge of each level

  const layout = (stepId: string, level: number): number => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return 0;

    const y = level * VERTICAL_SPACING;
    let x: number;

    if (!step.branches || step.branches.length === 0) {
      // LEAF NODE: Place it at the next available spot at this depth
      x = nextXAtLevel.get(level) || 0;
      nextXAtLevel.set(level, x + HORIZONTAL_SPACING);
    } else {
      // PARENT NODE: Layout all children first
      const childXPositions = step.branches.map((b) =>
        layout(b.targetStepId, level + 1)
      );

      // Center parent over its children
      const minChildX = Math.min(...childXPositions);
      const maxChildX = Math.max(...childXPositions);
      x = (minChildX + maxChildX) / 2;

      // Ensure this parent doesn't overlap existing nodes at ITS level
      const currentLevelMinX = nextXAtLevel.get(level) || 0;
      if (x < currentLevelMinX) {
        x = currentLevelMinX;
      }
      nextXAtLevel.set(level, x + HORIZONTAL_SPACING);
    }

    stepPositions.set(stepId, { x, y });
    return x;
  };

  layout(firstStepId, 0);
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
    const edges = createFlowEdges(steps, isEditMode, onAddRule);

    return { generatedNodes: nodes, generatedEdges: edges };
  }, [
    steps,
    firstStepId,
    selectedStepId,
    isEditMode,
    onStepSelect,
    onInsertNode,
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
        edgeTypes={edgeTypes}
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
