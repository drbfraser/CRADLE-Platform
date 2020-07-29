import { NewAssessment, OrNull, Referral } from '@types';

import { Action } from '../../reducers';
import { Assessment } from './assessment';
import { FollowUpModal } from './followupModal';
import { Header } from './header';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  assessment: NewAssessment;
  displayAssessmentModal: boolean;
  patientId: string;
  readingId: string;
  referral: OrNull<Referral>;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
  updateState: React.Dispatch<Action>;
}

export const ReferralInfo: React.FC<IProps> = ({
  assessment,
  displayAssessmentModal,
  patientId,
  readingId,
  referral,
  onAddPatientRequired,
  updateState,
}) => {
  const classes = useStyles();

  return referral ? (
    <div className={classes.container}>
      <Header
        assessed={Boolean(referral.followUp)}
        dateReferred={referral.dateReferred}
        healthFacilityName={referral.referralHealthFacilityName}
      />
      {!referral.followUp && (
        <div className={classes.comment}>
          <Typography>
            <b>Comment:</b>
          </Typography>
          <Typography variant="subtitle1">{referral.comment}</Typography>
        </div>
      )}
      <Assessment assessment={referral.followUp} />
      <FollowUpModal
        assessment={assessment}
        displayAssessmentModal={displayAssessmentModal}
        patientId={patientId}
        readingId={readingId}
        referral={referral}
        onAddPatientRequired={onAddPatientRequired}
        updateState={updateState}
      />
    </div>
  ) : (
    <div className={classes.container}>
      <Typography variant="h5" component="h3">
        No Referral
      </Typography>
    </div>
  );
};
