import React from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { Box, IconButton, Chip, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from 'react';

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
  onInsertNodeBetween?: (
    sourceStepId: string,
    targetStepId: string,
    branchId?: string
  ) => void;
  isEditMode?: boolean;
}

export const FlowEdge: React.FC<EdgeProps> = ({
  id,
  source,
  target,
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
  const sourceStepId = source;
  const targetStepId = target;
  const onAddRule = edgeData?.onAddRule;
  const onInsertNodeBetween = edgeData?.onInsertNodeBetween;

  // Show '+' button if no condition and in edit mode
  // Show rule name chip if condition exists (editable in edit mode, read-only otherwise)
  const showAddButton = !hasCondition && isEditMode;
  const showRuleChip = hasCondition;

  const handleAddClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget as HTMLElement);
  };

  const handleAddCondition = () => {
    handleMenuClose();
    if (isEditMode && onAddRule && sourceStepId && targetStepId) {
      onAddRule(branchId || '', sourceStepId, targetStepId);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleInsertNodeBetween = () => {
    handleMenuClose();
    if (onInsertNodeBetween && sourceStepId && targetStepId) {
      onInsertNodeBetween(sourceStepId, targetStepId, branchId);
    }
  };

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
              <>
                <IconButton
                  size="small"
                  onClick={handleAddClick}
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
              </>
            ) : (
              <Chip
                label={conditionName || 'Rule'}
                icon={
                  isEditMode ? (
                    <EditIcon sx={{ fontSize: '14px !important' }} />
                  ) : undefined
                }
                onClick={isEditMode ? handleAddClick : undefined}
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
            <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                  }}
                  sx={{
                    mt: -5,
                  }}>
                  <MenuItem onClick={handleAddCondition}>
                    {hasCondition ? 'Edit Condition' : 'Add Condition'}
                  </MenuItem>
                  <MenuItem onClick={handleInsertNodeBetween}>
                    Insert Step Between
                  </MenuItem>
                </Menu>
          </Box>
        </EdgeLabelRenderer>
     )}
    </>
  );
};
