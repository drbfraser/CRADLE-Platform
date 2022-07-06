import {
  AssessmentCard,
  CustomizedFormCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancellationCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from './Cards/Cards';
import { Divider, Grid, Paper } from '@material-ui/core';
import { Filter, FilterRequestBody, Patient, Referral } from 'src/shared/types';
import React, { useEffect, useState } from 'react';
import {
  getPatientAsync,
  getPatientRecordsAsync,
  getPatientReferralsAsync,
} from 'src/shared/api';
import { useHistory, useRouteMatch } from 'react-router-dom';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Checkbox from '@material-ui/core/Checkbox';
import { ConfirmDialog } from '../../shared/components/confirmDialog';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PatientStats } from './PatientStats';
import { PersonalInfo } from './PersonalInfo';
import { PregnancyInfo } from './PregnancyInfo';
import { SexEnum } from 'src/shared/enums';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

type RouteParams = {
  patientId: string;
};

const filters: Filter[] = [
  {
    parameter: 'referrals',
    display_title: 'Referral',
  },
  {
    parameter: 'readings',
    display_title: 'Reading',
  },
  {
    parameter: 'assessments',
    display_title: 'Assessment',
  },
  {
    parameter: 'forms',
    display_title: 'Form',
  },
];

export const PatientPage = () => {
  const history = useHistory();

  const { patientId } = useRouteMatch<RouteParams>().params;

  const [patient, setPatient] = useState<Patient>();
  const [cards, setCards] = useState<JSX.Element[]>([]);

  const [errorLoading, setErrorLoading] = useState(false);
  const [hasPendingReferral, setHasPendingReferral] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [filterRequestBody, setFilterRequestBody] = useState<FilterRequestBody>(
    {
      referrals: true,
      readings: true,
      assessments: true,
      forms: true,
    }
  );

  const classes = useStyles();

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patient: Patient = await getPatientAsync(patientId);
        setPatient(patient);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    const loadPatientRefferals = async () => {
      try {
        const referrals: Referral[] = await getPatientReferralsAsync(patientId);

        const hasPendingReferral = referrals.some(
          (referral) =>
            !referral.isAssessed &&
            !referral.isCancelled &&
            !referral.notAttended
        );

        setHasPendingReferral(hasPendingReferral);
      } catch (e) {
        console.error('Error receiving referrals');
      }
    };

    loadPatient();
    loadPatientRefferals();
  }, [patientId]);

  useEffect(() => {
    const loadRecords = async () => {
      const mapCardToJSX = (card: any) => {
        switch (card.type) {
          case 'assessment':
            return <AssessmentCard followUp={card} />;
          case 'form':
            return <CustomizedFormCard form={card} />;
          case 'reading':
            return <ReadingCard reading={card} />;
          case 'referral':
            if (card.isAssessed) {
              return <ReferralAssessedCard referral={card} />;
            } else if (card.isCancelled) {
              return <ReferralCancellationCard referral={card} />;
            } else if (card.notAttended) {
              return <ReferralNotAttendedCard referral={card} />;
            } else {
              return <ReferralPendingCard referral={card} />;
            }
          default:
            return <div>Error</div>;
        }
      };

      const UpdateCardsJsx = (cards: any[]) => {
        const cardsJsx = cards.map((card) => (
          <React.Fragment key={card.id ?? card.readingId}>
            {mapCardToJSX(card)}
          </React.Fragment>
        ));
        setCards(cardsJsx);
      };

      try {
        const records = await getPatientRecordsAsync(
          patientId,
          filterRequestBody
        );
        UpdateCardsJsx(records);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    loadRecords();
  }, [filterRequestBody, patientId]);

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <ConfirmDialog
        title={'Warning'}
        content={
          'You have at least one pending referral. Do you still want to perform an assessment without assessing a referral?'
        }
        open={confirmDialogOpen}
        onClose={() => {
          setConfirmDialogOpen(false);
        }}
        onConfirm={() => {
          history.push(`/assessments/new/${patientId}`);
        }}
      />
      <Header
        patient={patient}
        isThereAPendingReferral={hasPendingReferral}
        setConfirmDialogPerformAssessmentOpen={setConfirmDialogOpen}
      />
      <Grid container spacing={2} className={classes.root}>
        <Grid item xs={12} md={6}>
          <PersonalInfo patient={patient} />
          {patient?.patientSex === SexEnum.FEMALE ? (
            <PregnancyInfo
              patientId={patientId}
              patientName={patient?.patientName}
            />
          ) : (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <PatientStats patientId={patientId} />
          {patient?.patientSex === SexEnum.FEMALE && (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>
      </Grid>

      <Paper className={classes.cardList}>
        <Grid container justifyContent="flex-end" spacing={2}>
          <Grid item>
            <Typography>Show only: </Typography>
            {filters.map((filter) => (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filterRequestBody[filter.parameter]}
                    onChange={(e) => {
                      setFilterRequestBody({
                        ...filterRequestBody,
                        [filter.parameter]: e.target.checked,
                      });
                    }}
                  />
                }
                label={<>{filter.display_title}</>}
                key={filter.parameter}
              />
            ))}
          </Grid>
        </Grid>
      </Paper>
      <Divider />
      {cards}
    </>
  );
};

export const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
  },
  cardList: {
    width: '100%',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
  },
}));
