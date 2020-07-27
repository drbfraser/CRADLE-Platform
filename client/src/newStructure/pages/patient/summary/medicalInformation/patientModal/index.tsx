import { Action, actionCreators } from '../../reducers';
import { Form, InputOnChangeData, Modal } from 'semantic-ui-react';

import Button from '@material-ui/core/Button';
import { EditedPatient } from '@types';
import { PatientInfoForm } from '../../../../../shared/components/form/patient';
import React from 'react';
import { useStyles } from './styles';

interface IProps {
  displayPatientModal: boolean;
  patient: EditedPatient;
  updateState: React.Dispatch<Action>;
}

export const PatientModal: React.FC<IProps> = ({
  displayPatientModal,
  patient,
  updateState,
}) => {
  const classes = useStyles();

  const closePatientModal = (
    _: React.MouseEvent<HTMLElement, MouseEvent>
  ): void => {
    updateState(actionCreators.closePatientModal());
  };

  const handleChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    { name, value }: InputOnChangeData
  ): void => {
    updateState(actionCreators.editPatient({ name, value }));
  };

  return (
    <Modal closeIcon onClose={closePatientModal} open={displayPatientModal}>
      <Modal.Header>
        {`Patient Information for ID #${patient.patientId}`}
      </Modal.Header>
      <Modal.Content scrolling>
        <Form>
          <PatientInfoForm
            patient={patient}
            onChange={handleChange}
            isEditPage={true}
          />
          <Button className={classes.submit} variant="contained">
            Submit
          </Button>
        </Form>
      </Modal.Content>
    </Modal>
  );
};
