import AssignmentIcon from '@mui/icons-material/Assignment';
import { CustomizedForm } from 'src/shared/types';
import { PrimaryButton } from 'src/shared/components/Button';
import React from 'react';
import { Typography } from '@mui/material';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  form: CustomizedForm;
}

export const CustomizedFormData = ({ form }: IProps) => {
  const history = useHistory();

  const handleEditFormClick = () => {
    if (form) {
      history.push(`/forms/edit/${form.patientId}/${form.id}`);
    }
  };

  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentIcon fontSize="large" /> {form.classification.name}
          </>
        </Typography>
        <Typography variant="subtitle1">
          {`Last Edit : ${getPrettyDateTime(form.lastEdited)}`}
        </Typography>

        <PrimaryButton onClick={handleEditFormClick}>
          View & Edit Form
        </PrimaryButton>
      </>
    </>
  );
};
