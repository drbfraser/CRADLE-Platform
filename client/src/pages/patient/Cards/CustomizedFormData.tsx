import React from 'react';
import { Typography, Button } from '@material-ui/core';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import { CustomizedForm } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';
// import { apiFetch, API_URL } from 'src/shared/api';
// import { EndpointEnum } from 'src/shared/enums';
// import {FormSchema} from 'src/shared/types';



interface IProps {
  form: CustomizedForm;
}

export const CustomizedFormData = ({ form }: IProps) => {
  const history = useHistory();

  const handleEditFormClick = () => {




    if (form) {
      history.push( `/forms/edit/${form.patientId}/${form.id}`);

      // apiFetch(API_URL + EndpointEnum.FORM_TEMPLATE)
      // .then((resp) => resp.json())
      // .then((form_schemas:FormSchema[]) => {
      //   // setFormSchemas(form_schemas);
      //   history.push({pathname:`/forms/edit/${form.patientId}/${form.id}`, search:'123',});
      //   // console.log(formSchemas);
      // })
      // .catch(() => {
      //   // setErrorLoading(true);
      //   console.log("Error Loading !!!!!!");
      // });





      
    }



               


  };

  return (
    <>
      <>
        <Typography variant="h5">
          <>
            <AssignmentLateIcon fontSize="large" /> {form.name}
          </>
        </Typography>
        <Typography variant="subtitle1">
          {`Last Edit : ${getPrettyDateTime(form.lastEdited)}`}
        </Typography>
        <Typography variant="subtitle1">
          {`Category : ${form.category}`}
        </Typography>

        <Button
          color="primary"
          variant="outlined"
          onClick={handleEditFormClick}>
          View & Edit Form
        </Button>
      </>
    </>
  );
};
