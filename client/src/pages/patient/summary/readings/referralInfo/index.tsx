import { FollowUp, OrNull, Patient, Referral } from '@types';
import { useDispatch } from 'react-redux';

import { Assessment } from './assessment';
import Button from '@material-ui/core/Button';
import { Header } from './header';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { push } from 'connected-react-router';
import { useStyles } from './styles';

interface IProps {
  followUp: OrNull<FollowUp>;
  readingId: string;
  referral: OrNull<Referral>;
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
}

export const ReferralInfo: React.FC<IProps> = ({
  followUp,
  readingId,
  referral,
  selectedPatient,
  onAddPatientRequired,
}) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const manageAssessment = (): void => {
    onAddPatientRequired((): void => {
      if(followUp) {
        dispatch(push(`/assessments/edit/${readingId}/${followUp.id}`))
      } else {
        dispatch(push(`/assessments/new/${readingId}`))
      }
    }, `You haven't added this patient to your health facility. You need to do that before you can edit this patient. Would like to add this patient?`);
  };

  return (
    <div className={classes.container}>
      {referral ? (
        <>
          <Header
            assessed={Boolean(followUp)}
            dateReferred={referral.dateReferred}
            healthFacilityName={referral.referralHealthFacilityName}
          />
          {!followUp && (
            <div className={classes.comment}>
              <Typography>
                <b>Comment:</b>
              </Typography>
              <Typography variant="subtitle1">{referral.comment}</Typography>
            </div>
          )}
        </>
      ) : (
        <Typography variant="h5" component="h3">
          No Referral
        </Typography>
      )}
      <Assessment followUp={followUp} />
      {referral && (
        <Button
          className={classes.button}
          color="primary"
          variant="outlined"
          onClick={manageAssessment}>
          {followUp ? `Update Assessment` : `Assess`}
        </Button>
      )}
    </div>
  );
};
