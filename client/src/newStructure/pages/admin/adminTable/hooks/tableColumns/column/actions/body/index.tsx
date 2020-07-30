import CreateIcon from '@material-ui/icons/Create';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { useStyles } from './styles';

interface IProps {
  id: string;
}

export const ActionsBody: React.FC<IProps> = ({ id }) => {
  const classes = useStyles();

  const showEditPrompt = (): void => {
    alert(`Editing patient with id: ${id}`);
  };

  const showDeletePrompt = (): void => {
    alert(`Deleting patient with id: ${id}`);
  };

  return (
    <>
      <div className={classes.container}>
        <Tooltip placement="top" title="Edit user">
          <IconButton onClick={showEditPrompt}>
            <CreateIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" title="Delete user">
          <IconButton onClick={showDeletePrompt}>
            <DeleteIcon className={classes.icon} />
          </IconButton>
        </Tooltip>
      </div>
    </>
  );
};
