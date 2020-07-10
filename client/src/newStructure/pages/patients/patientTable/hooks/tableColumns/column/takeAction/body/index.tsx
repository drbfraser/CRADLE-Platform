import { Callback, GlobalSearchPatient, OrUndefined } from '@types';

import AddIcon from '@material-ui/icons/Add';
import { AddPatientPrompt } from '../../../../../../../../shared/components/addPatientPrompt';
import { AlreadyAdded } from './alreadyAdded';
import CheckIcon from '@material-ui/icons/Check';
import Fab from '@material-ui/core/Fab';
import { PatientStateEnum } from '../../../../../../../../enums';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import { useAddPatient } from './addPatient';
import { useAlreadyAddedPatient } from './alreadyAdded/hooks';
import { useStyles } from './styles';

interface IProps {
  className: string;
  patientId: string;
  patients: Array<GlobalSearchPatient>;
  onGlobalSearchPatientSelected: Callback<string>;
}

export const TakeActionBody: React.FC<IProps> = ({
  className,
  patientId,
  patients,
  onGlobalSearchPatientSelected,
}) => {
  const classes = useStyles();

  const patient = React.useMemo((): OrUndefined<GlobalSearchPatient> => {
    return patients.find((patient: GlobalSearchPatient): boolean => {
      return patient.patientId === patientId;
    });
  }, [patients, patientId]);

  const {
    showAlreadyAdded,
    onAlreadyAdded,
    onClose,
  } = useAlreadyAddedPatient();

  const { showAddPatientPrompt, hidePrompt, showPrompt } = useAddPatient();

  const addPatient = (): void => {
    onGlobalSearchPatientSelected(patientId);
  };

  const handleAddButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    // Prevents clicking on the parent patient row
    // which would cause navigation to the patient page
    event.stopPropagation();
    showPrompt();
  };

  const handleJustAddedButtonClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ): void => {
    // Prevents clicking on the parent patient row
    // which would cause navigation to the patient page
    event.stopPropagation();
    onAlreadyAdded();
  };

  switch (patient?.state) {
    case PatientStateEnum.ADD: {
      return (
        <div className={className}>
          <AddPatientPrompt
            show={showAddPatientPrompt}
            closeDialog={hidePrompt}
            addPatient={addPatient}
            message="Are you sure you want to add this patient to your health facility?"
            positiveText="Yes I'm Sure"
          />
          <Tooltip title="Add" placement="left">
            <Fab
              className={classes.button}
              color="primary"
              size="medium"
              onClick={handleAddButtonClick}>
              <AddIcon className={classes.button} />
            </Fab>
          </Tooltip>
        </div>
      );
    }
    case PatientStateEnum.ADDED: {
      return null;
    }
    case PatientStateEnum.JUST_ADDED: {
      return (
        <div className={className}>
          <AlreadyAdded show={showAlreadyAdded} onClose={onClose} />
          <Tooltip title="Just added" placement="left">
            <Fab
              classes={{ root: classes.justAdded }}
              color="inherit"
              size="medium"
              onClick={handleJustAddedButtonClick}>
              <CheckIcon />
            </Fab>
          </Tooltip>
        </div>
      );
    }
    default: {
      return null;
    }
  }
};
