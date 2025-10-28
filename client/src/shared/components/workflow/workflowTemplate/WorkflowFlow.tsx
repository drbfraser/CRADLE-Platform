import React, { useCallback, useMemo } from 'react';
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

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

interface WorkflowFlowProps {
  steps: WorkflowTemplateStepWithFormAndIndex[];
  firstStepId: ID;
  selectedStepId?: string;
  isEditMode?: boolean;
  onStepSelect?: (stepId: string) => void;
  onInsertNode?: (stepId: string) => void;
  onAddBranch?: (stepId: string) => void;
}

export const WorkflowFlow: React.FC<WorkflowFlowProps> = ({
  steps,
  firstStepId,
  selectedStepId,
  isEditMode = false,
  onStepSelect,
  onInsertNode,
  onAddBranch,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Generate nodes and edges from steps
  const { generatedNodes, generatedEdges } = useMemo(() => {
    if (!steps || steps.length === 0) {
      return { generatedNodes: [], generatedEdges: [] };
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Create a map of step positions for layout
    const stepPositions = new Map<string, { x: number; y: number }>();
    const stepLevels = new Map<string, number>();
    const levelCounts = new Map<number, number>();

    // First, determine the level of each step using BFS
    const queue: { stepId: string; level: number }[] = [
      { stepId: firstStepId, level: 0 },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { stepId, level } = queue.shift()!;
      if (visited.has(stepId)) continue;

      visited.add(stepId);
      stepLevels.set(stepId, level);

      const step = steps.find((s) => s.id === stepId);
      if (step?.branches) {
        step.branches.forEach((branch: WorkflowTemplateStepBranch) => {
          if (!visited.has(branch.targetStepId)) {
            queue.push({ stepId: branch.targetStepId, level: level + 1 });
          }
        });
      }
    }

    // Calculate positions for each level
    stepLevels.forEach((level, stepId) => {
      const count = levelCounts.get(level) || 0;
      levelCounts.set(level, count + 1);
    });

    // Constants for flow layout
    const NODE_WIDTH = 0;
    const HORIZONTAL_SPACING = 500; // Space between nodes at same level
    const VERTICAL_SPACING = 250; // Space between each level

    // Group nodes by level. Use for node positioning.
    const levelNodes = new Map<number, string[]>();

    stepLevels.forEach((level, stepId) => {
      if (!levelNodes.has(level)) {
        levelNodes.set(level, []);
      }
      levelNodes.get(level)!.push(stepId);
    });

    // Calculate positions for each level
    levelNodes.forEach((nodeIds, level) => {
      const nodeCount = nodeIds.length;
      const totalWidth = (nodeCount - 1) * HORIZONTAL_SPACING + NODE_WIDTH;
      const startX = -totalWidth / 2; // Center the level horizontally

      nodeIds.forEach((stepId, index) => {
        const x = startX + index * HORIZONTAL_SPACING;
        const y = level * VERTICAL_SPACING;

        stepPositions.set(stepId, { x, y });
      });
    });

    // Create nodes
    steps.forEach((step) => {
      const position = stepPositions.get(step.id) || { x: 0, y: 0 };
      nodes.push({
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
      });
    });

    // Create edges
    steps.forEach((step) => {
      if (step.branches) {
        step.branches.forEach(
          (branch: WorkflowTemplateStepBranch, index: number) => {
            edges.push({
              id: `e-${step.id}-${branch.targetStepId}-${index}`,
              source: step.id,
              target: branch.targetStepId,
              type: 'smoothstep',
              animated: false,
              style: {
                stroke: '#b1b1b7',
                strokeWidth: 2,
              },
            });
          }
        );
      }
    });

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
  React.useEffect(() => {
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds: Edge[]) => addEdge(params, eds)),
    [setEdges]
  );

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
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
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
