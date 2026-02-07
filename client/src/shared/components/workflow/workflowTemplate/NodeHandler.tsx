import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface NodeHandlerProps {
  isEditMode: boolean;
  onInsertNode: () => void;
}

export const NodeHandler: React.FC<NodeHandlerProps> = ({
  isEditMode,
  onInsertNode,

}) => {

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    event.stopPropagation();
    onInsertNode();
  };

  return (
      <Box
        onClick={handleClick}
        sx={{
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}>
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: isEditMode ? '#1976d2' : '#9e9e9e',
            width: isEditMode ? 24 : 8,
            height: isEditMode ? 24 : 8,
            border: '2px solid white',
            cursor: isEditMode ? 'pointer' : 'default',
            transition: 'all 0.2s ease-in-out',
            boxShadow: isEditMode
              ? '0 2px 8px rgba(25, 118, 210, 0.4)'
              : 'none',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        {isEditMode && (
          <AddIcon
            sx={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '14px',
              color: 'white',
              pointerEvents: 'none',
            }}
          />
        )}
      </Box>
  );
};
