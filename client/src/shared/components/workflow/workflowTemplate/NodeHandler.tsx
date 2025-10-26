import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface NodeHandlerProps {
  isVisible: boolean;
  onInsertNode: () => void;
  onAddBranch: () => void;
}

export const NodeHandler: React.FC<NodeHandlerProps> = ({
  isVisible,
  onInsertNode,
  onAddBranch,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event?: React.MouseEvent) => {
    event?.stopPropagation();
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

  if (!isVisible) return null;

  return (
    <>
      <Tooltip title="Add action" placement="top">
        <Box
          sx={{
            position: 'absolute',
            bottom: '-15px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}>
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              width: 28,
              height: 28,
              '&:hover': {
                backgroundColor: '#1565c0',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease-in-out',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Tooltip>
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
    </>
  );
};
