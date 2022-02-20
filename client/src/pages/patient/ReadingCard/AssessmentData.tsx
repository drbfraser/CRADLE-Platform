import React from 'react';
import {
  Typography,
  Button,
  // Accordion,
  // AccordionDetails,
  // AccordionSummary,
} from '@material-ui/core';
import { Reading } from 'src/shared/types';
// import { TrafficLight } from 'src/shared/components/trafficLight';
import { getPrettyDateTime } from 'src/shared/utils';
// import AssessmentIcon from '@material-ui/icons/Assessment';
import DiagnosisIcon from '@material-ui/icons/LocalHospital';
// import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { useHistory } from 'react-router-dom';

interface IProps {
  reading: Reading;
}

export const ReadingData = ({ reading }: IProps) => {

  const history = useHistory();
  const followUp = reading.followup;
  // const firstLetterUppercase = (str: string) => {
  //   str = str.trim();
  //   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  // };

  const handleAssess = () => {
    if (followUp) {
      history.push(
        `/assessments/edit/${reading.patientId}/${reading.readingId}/${followUp.id}`
      );
    }
    
    // else {
    //   history.push(
    //     // `/assessments/new/${reading.patientId}/${reading.readingId}`
    //     `/assessments/new/${reading.patientId}`
    //   );
    // }
  };

  return (
    <>
      <Typography variant="h5">
        <DiagnosisIcon fontSize="large" />
        Assessment
      </Typography>

      {Boolean(followUp && followUp.healthcareWorkerId) && (
        <p>
          <b>Assessed By:</b> Healthcare Worker:{followUp?.healthcareWorkerId}
        </p>
      )}

      {Boolean(followUp && followUp.dateAssessed) && (
        <p>
          <b>Date Last Assessed:</b>
          {getPrettyDateTime(followUp?.dateAssessed!)}
        </p>
      )}

      {Boolean(followUp && followUp.specialInvestigations) && (
        <p>
          <b>Special Investigations + Results:</b>
          {followUp?.specialInvestigations}
        </p>
      )}

      {Boolean(followUp && followUp.diagnosis) && (
        <p>
          <b>Final Diagnosis:</b>
          {followUp?.diagnosis}
        </p>
      )}

      {Boolean(followUp && followUp.treatment) && (
        <p>
          <b>Treatment/Operation:</b>
          {followUp?.treatment}
        </p>
      )}

      {Boolean(followUp && followUp.medicationPrescribed) && (
        <p>
          <b>Medication Prescribed:</b>
          {followUp?.medicationPrescribed}
        </p>
      )}

      {Boolean(followUp && followUp.followupInstructions) && (
        <p>
          <b>Followup Instructions:</b>
          {followUp?.followupInstructions}
        </p>
      )}

      <Button color="primary" variant="outlined" onClick={handleAssess}>
        Update Assessment
      </Button>
    </>
  );
};
