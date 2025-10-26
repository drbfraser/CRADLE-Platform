import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Box, Typography } from '@mui/material';
import { NodeHandler } from './NodeHandler';

interface FlowNodeData {
  stepNumber: number;
  stepName: string;
  stepId: string;
  isSelected?: boolean;
  isEditMode?: boolean;
  onNodeClick?: (stepId: string) => void;
  onInsertNode?: (stepId: string) => void;
  onAddBranch?: (stepId: string) => void;
}

export const FlowNode: React.FC<NodeProps> = ({ data, selected }) => {
  if (!data) return null;

  const {
    stepNumber,
    stepName,
    stepId,
    isSelected,
    isEditMode = false,
    onNodeClick,
    onInsertNode,
    onAddBranch,
  } = data as unknown as FlowNodeData;

  const handleInsertNode = () => {
    if (onInsertNode) {
      onInsertNode(stepId);
    }
  };

  const handleAddBranch = () => {
    if (onAddBranch) {
      onAddBranch(stepId);
    }
  };

  return (
    <Box
      sx={{
        width: 200,
        height: 80,
        backgroundColor: 'white',
        border: isSelected ? '5px solid #1976d2' : '3px solid #e0e0e0',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        px: 2,
        py: 1,
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isSelected
            ? '0 6px 12px rgba(25, 118, 210, 0.4)'
            : '0 4px 8px rgba(0,0,0,0.15)',
        },
      }}
      onClick={() => onNodeClick?.(stepId)}>
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#1976d2',
          width: 6,
          height: 6,
          border: '2px solid white',
        }}
      />
      <Typography
        variant="body1"
        sx={{
          color: '#333',
          fontWeight: 500,
          fontSize: '0.9rem',
          textAlign: 'center',
          lineHeight: 1.2,
        }}>
        {stepName || `Step ${stepNumber}`}
      </Typography>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#1976d2',
          width: 6,
          height: 6,
          border: '2px solid white',
        }}
      />
      <NodeHandler
        isVisible={isEditMode}
        onInsertNode={handleInsertNode}
        onAddBranch={handleAddBranch}
      />
    </Box>
  );
};
