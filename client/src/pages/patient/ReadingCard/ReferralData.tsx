import React from 'react';
import {
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { Reading } from 'src/shared/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { useHistory } from 'react-router-dom';

interface IProps {
  reading: Reading;
}

export const ReferralData = ({ reading }: IProps) => {
  const history = useHistory();
  const referral = reading.referral;
  const followUp = reading.followup;

  const handleCreateReferral = () => {
    history.push(`/referrals/new/${reading.readingId}`);
  };

  const handleAssess = () => {
    if (followUp) {
      history.push(
        `/assessments/edit/${reading.patientId}/${reading.readingId}/${followUp.id}`
      );
    } else {
      history.push(
        `/assessments/new/${reading.patientId}/${reading.readingId}`
      );
    }
  };

  return (
    <>
      {referral ? (
        <>
          <Typography variant="h5">
            {referral.isAssessed ? (
              <>
                <AssignmentTurnedInIcon fontSize="large" /> Referral Assessed
              </>
            ) : (
              <>
                <AssignmentLateIcon fontSize="large" /> Referral Pending
              </>
            )}
          </Typography>
          <Typography variant="subtitle1">
            Referred on {getPrettyDateTime(referral.dateReferred)}
          </Typography>
          <Typography variant="subtitle1">
            Referred to {referral.referralHealthFacilityName}
          </Typography>
          {Boolean(referral.comment) && (
            <div>
              <Typography>
                <b>Referral Comment:</b>
              </Typography>
              <Typography variant="subtitle1">{referral.comment}</Typography>
            </div>
          )}
        </>
      ) : (
        <>
          <Typography variant="h5">No Referral</Typography>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleCreateReferral}>
            Create Referral
          </Button>
          <br />
        </>
      )}
      <br />
      {referral && !followUp && (
        <Button color="primary" variant="outlined" onClick={handleAssess}>
          Assess
        </Button>
      )}
      {followUp && (
        <Accordion>
          <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
            <Typography>
              <b>Assessment</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              {[
                {
                  label: 'Assessed By',
                  value:
                    `Healthcare Worker ${followUp.healthcareWorkerId}` ?? `N/A`,
                },
                {
                  label: 'Date Last Assessed',
                  value: getPrettyDateTime(followUp.dateAssessed),
                },
                {
                  label: 'Special Investigations + Results',
                  value: followUp.specialInvestigations,
                },
                {
                  label: 'Final Diagnosis',
                  value: followUp.diagnosis,
                },
                {
                  label: 'Treatment/Operation',
                  value: followUp.treatment,
                },
                {
                  label: 'Medication Prescribed',
                  value: followUp.medicationPrescribed,
                },
                {
                  label: 'Followup Instructions',
                  value: followUp.followupInstructions,
                },
              ]
                .filter((info) => Boolean(info.value))
                .map((info) => (
                  <p key={info.label}>
                    <b>{info.label}:</b> {info.value}
                  </p>
                ))}
              <Button color="primary" variant="outlined" onClick={handleAssess}>
                Update Assessment
              </Button>
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};
