import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { Box, IconButton, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';

interface FlowEdgeData {
  hasCondition: boolean;
  conditionName?: string;
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
  const conditionName = edgeData?.conditionName;
  const isEditMode = edgeData?.isEditMode ?? false;
  const branchId = edgeData?.branchId;
  const sourceStepId = edgeData?.sourceStepId;
  const targetStepId = edgeData?.targetStepId;
  const onAddRule = edgeData?.onAddRule;

  // Show '+' button if no condition and in edit mode
  // Show rule name chip if condition exists (editable in edit mode, read-only otherwise)
  const showAddButton = !hasCondition && isEditMode;
  const showRuleChip = hasCondition;

  const handleRuleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    // Only allow editing in edit mode
    // branchId is optional - handleAddRule can find the branch using sourceStepId + targetStepId
    if (isEditMode && onAddRule && sourceStepId && targetStepId) {
      onAddRule(branchId || '', sourceStepId, targetStepId);
    }
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {(showAddButton || showRuleChip) && (
        <EdgeLabelRenderer>
          <Box
            sx={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan">
            {showAddButton ? (
              <IconButton
                size="small"
                onClick={handleRuleClick}
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
            ) : (
              <Chip
                label={conditionName || 'Rule'}
                icon={
                  isEditMode ? (
                    <EditIcon sx={{ fontSize: '14px !important' }} />
                  ) : undefined
                }
                onClick={isEditMode ? handleRuleClick : undefined}
                size="small"
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: '2px solid white',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  cursor: isEditMode ? 'pointer' : 'default',
                  transition: 'all 0.2s ease-in-out',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  height: '26px',
                  maxWidth: '180px',
                  '& .MuiChip-label': {
                    px: 1.5,
                    py: 0.5,
                  },
                  '& .MuiChip-icon': {
                    color: 'white',
                    marginLeft: '6px',
                    marginRight: '-2px',
                  },
                  ...(isEditMode && {
                    '&:hover': {
                      backgroundColor: '#1565c0',
                      boxShadow: '0 3px 6px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }),
                }}
              />
            )}
          </Box>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
