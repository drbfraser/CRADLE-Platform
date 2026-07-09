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
import { WorkflowTemplateStepWithFormAndIndex } from 'src/shared/types/workflow/workflowApiTypes';
import { FlowNode } from './FlowNode';
import { FlowEdge } from './FlowEdge';
import { ID } from 'src/shared/constants';
import {
  calculateNodeLevels,
  calculateStepPositions,
  preventNodeOverlaps,
} from './flowLayout';
import { createFlowNodes, createFlowEdges } from './flowGraph';

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

const edgeTypes: EdgeTypes = {
  flowEdge: FlowEdge,
};

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

  useEffect(() => {
    setNodes(generatedNodes);
    setEdges(generatedEdges);
  }, [generatedNodes, generatedEdges, setNodes, setEdges]);

  const validateConnection = useCallback(
    (sourceStepId: string, targetStepId: string): string | null => {
      const sourceStep = steps.find((s) => s.id === sourceStepId);
      const targetStep = steps.find((s) => s.id === targetStepId);

      if (!sourceStep || !targetStep) {
        return 'Invalid connection: step not found';
      }

      return null;
    },
    [steps, firstStepId]
  );

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
