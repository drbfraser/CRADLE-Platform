import React, { useState, useRef } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface NodeHandlerProps {
  isEditMode: boolean;
  onInsertNode: () => void;
  onAddBranch: () => void;
}

export const NodeHandler: React.FC<NodeHandlerProps> = ({
  isEditMode,
  onInsertNode,
  onAddBranch,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    event.stopPropagation();
    setAnchorEl(handleRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleInsertNode = (event: React.MouseEvent) => {
    event.stopPropagation();
    onInsertNode();
    handleClose();
  };

  const handleAddBranch = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAddBranch();
    handleClose();
  };

  return (
    <>
      <Box
        ref={handleRef}
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
      {isEditMode && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          sx={{
            mt: 1,
          }}>
          <MenuItem onClick={handleInsertNode}>
            <ListItemIcon>
              <AddCircleOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Insert node</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleAddBranch}>
            <ListItemIcon>
              <AccountTreeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Add branch</ListItemText>
          </MenuItem>
        </Menu>
      )}
    </>
  );
};
