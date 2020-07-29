import { NewAssessment, OrNull, Patient, Reading } from '@types';
import { useDispatch, useSelector } from 'react-redux';

import { Action } from '../reducers';
import Grid from '@material-ui/core/Grid';
import { Header } from './header';
import { Heart } from './heart';
import { Loader } from '../../../../shared/components/loader';
import Paper from '@material-ui/core/Paper';
import React from 'react';
import { ReduxState } from '../../../../redux/rootReducer';
import { ReferralInfo } from './referralInfo';
import { Symptoms } from './symptoms';
import { UrineTests } from './urineTests';
import { getReferralIds } from './utils';
import { getReferrals } from '../../../../shared/reducers/referrals';
import { getTrafficIcon } from '../../../../shared/utils';
import { useReadings } from './hooks';
import { useStyles } from './styles';

interface IProps {
  assessment: NewAssessment;
  displayAssessmentModal: boolean;
  selectedPatient: Patient;
  onAddPatientRequired: (
    actionAfterAdding: () => void,
    message: string
  ) => void;
  updateState: React.Dispatch<Action>;
}

export const PatientReadings: React.FC<IProps> = ({
  assessment,
  displayAssessmentModal,
  selectedPatient,
  onAddPatientRequired,
  updateState,
}) => {
  const classes = useStyles();

  const mappedReferrals = useSelector(
    (state: ReduxState): OrNull<Record<string, any>> => {
      return state.referrals.mappedReferrals;
    }
  );

  const dispatch = useDispatch();

  React.useEffect((): void => {
    dispatch(getReferrals(getReferralIds(selectedPatient)));
  }, [dispatch, selectedPatient]);

  const readings = useReadings(selectedPatient);

  return (
    <Grid className={classes.container} container={true} spacing={0}>
      {readings.map(
        (reading: Reading): JSX.Element => (
          <Grid key={reading.readingId} item={true} xs={12}>
            <Paper className={classes.paper}>
              <div>
                <Header dateTimeTaken={reading.dateTimeTaken} />
                <div className={classes.reading}>
                  {getTrafficIcon(reading.trafficLightStatus)}
                  <Heart reading={reading} />
                  <Symptoms symptoms={reading.symptoms} />
                  <UrineTests urineTests={reading.urineTests} />
                </div>
              </div>
              {mappedReferrals ? (
                <ReferralInfo
                  assessment={assessment}
                  displayAssessmentModal={displayAssessmentModal}
                  readingId={reading.readingId}
                  referral={mappedReferrals[reading.readingId]}
                  onAddPatientRequired={onAddPatientRequired}
                  updateState={updateState}
                />
              ) : (
                <Loader message="Loading referrals..." show={true} />
              )}
            </Paper>
          </Grid>
        )
      )}
    </Grid>
  );
};
