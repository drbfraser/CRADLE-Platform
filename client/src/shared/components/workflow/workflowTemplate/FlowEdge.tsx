import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { Box, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface FlowEdgeData {
  hasCondition: boolean;
  branchId?: string;
  sourceStepId: string;
  targetStepId: string;
  onAddRule?: (
    branchId: string,
    sourceStepId: string,
    targetStepId: string
  ) => void;
  isEditMode?: boolean;
}

export const FlowEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = data as FlowEdgeData | undefined;
  const hasCondition = edgeData?.hasCondition ?? false;
  const isEditMode = edgeData?.isEditMode ?? false;
  const branchId = edgeData?.branchId;
  const sourceStepId = edgeData?.sourceStepId;
  const targetStepId = edgeData?.targetStepId;
  const onAddRule = edgeData?.onAddRule;

  // Only show the '+' button if there's no condition and in edit mode
  const showAddButton = !hasCondition && isEditMode;

  const handleAddRule = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onAddRule && branchId && sourceStepId && targetStepId) {
      onAddRule(branchId, sourceStepId, targetStepId);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {showAddButton && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan">
            <IconButton
              size="small"
              onClick={handleAddRule}
              sx={{
                backgroundColor: '#1976d2',
                color: 'white',
                width: 28,
                height: 28,
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.4)',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#1565c0',
                  transform: 'scale(1.1)',
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.6)',
                },
              }}>
              <AddIcon sx={{ fontSize: '16px' }} />
            </IconButton>
          </Box>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
