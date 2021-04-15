import React from 'react';
import { Typography, Button } from '@material-ui/core';
import AssignmentLateIcon from '@material-ui/icons/AssignmentLate';
import AssignmentTurnedInIcon from '@material-ui/icons/AssignmentTurnedIn';
import { Reading } from 'src/types';
import { getPrettyDateTime } from 'src/shared/utils';
import { Divider, Header, Segment } from 'semantic-ui-react';
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
      history.push(`/assessments/edit/${reading.readingId}/${followUp.id}`);
    } else {
      history.push(`/assessments/new/${reading.readingId}`);
    }
  };

  return (
    <div>
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
          <Typography variant="h5" component="h3">
            No Referral
          </Typography>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleCreateReferral}>
            Create Referral
          </Button>
        </>
      )}

      {followUp && (
        <Segment>
          {followUp.specialInvestigations && (
            <>
              <Header size="small">Special Investigations + Results:</Header>
              <p>{followUp.specialInvestigations}</p>
              <Divider />
            </>
          )}
          {followUp.diagnosis && (
            <>
              <Header size="small">Final Diagnosis:</Header>
              <p>{followUp.diagnosis}</p>
              <Divider />
            </>
          )}
          {followUp.treatment && (
            <>
              <Header size="small">Treatment/Operation:</Header>
              <p>{followUp.treatment}</p>
              <Divider />
            </>
          )}
          {followUp.medicationPrescribed && (
            <>
              <Header size="small">Medication Prescribed:</Header>
              <p>{followUp.medicationPrescribed || 'N/A'}</p>
              <Divider />
            </>
          )}
          {followUp.followupInstructions && (
            <>
              <Header size="small">Followup Instructions:</Header>
              <p>{followUp.followupInstructions}</p>
              <Divider />
            </>
          )}
          <p>
            <b>Assessed By: </b>
            {`Healthcare Worker ${followUp.healthcareWorkerId}` ?? `N/A`}
          </p>
          <p>
            <b>Date Last Assessed:</b>{' '}
            {getPrettyDateTime(followUp.dateAssessed)}
          </p>
        </Segment>
      )}
      {referral && (
        <Button color="primary" variant="outlined" onClick={handleAssess}>
          {followUp ? `Update Assessment` : `Assess`}
        </Button>
      )}
    </div>
  );
};
