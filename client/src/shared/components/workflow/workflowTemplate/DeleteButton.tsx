import React from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Clear';

interface DeleteButtonProps {
  isEditMode: boolean;
  onDelete?: () => void;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  isEditMode,
  onDelete,
}) => {
  if (!isEditMode) return null;

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <IconButton
      onClick={handleDelete}
      sx={{
        position: 'absolute',
        top: -8,
        right: -8,
        width: 28,
        height: 28,
        backgroundColor: '#f44336',
        color: 'white',
        boxShadow: '0 2px 4px rgba(244, 67, 54, 0.4)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: '#d32f2f',
          transform: 'scale(1.1)',
          boxShadow: '0 3px 8px rgba(244, 67, 54, 0.6)',
        },
        '&:active': {
          transform: 'scale(0.95)',
        },
      }}
      size="small">
      <DeleteIcon sx={{ fontSize: '16px' }} />
    </IconButton>
  );
};
