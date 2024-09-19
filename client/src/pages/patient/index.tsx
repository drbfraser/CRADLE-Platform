import {
  AssessmentCard,
  CustomizedFormCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancelledCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from './Cards';
import { Box, Divider, Grid, Paper } from '@mui/material';
import { Filter, FilterRequestBody, Patient, Referral } from 'src/shared/types';
import {
  getPatientAsync,
  getPatientRecordsAsync,
  getPatientReferralsAsync,
} from 'src/shared/api';
import { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Checkbox from '@mui/material/Checkbox';
import { ConfirmDialog } from '../../shared/components/confirmDialog';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PatientStats } from './PatientStats';
import { PersonalInfo } from './PersonalInfo';
import { PregnancyInfo } from './PregnancyInfo';
import { SexEnum } from 'src/shared/enums';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';

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
              return <ReferralCancelledCard referral={card} />;
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
          <Grid item key={card.id ?? card.readingId} xs={12}>
            <Paper variant="outlined">
              <Box p={1} my={1} bgcolor={'#f9f9f9'}>
                {mapCardToJSX(card)}
              </Box>
            </Paper>
          </Grid>
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
      <Grid container spacing={2}>
        <Grid container item xs={12} lg={6} direction="column" spacing={2}>
          <Grid item>
            <PersonalInfo patient={patient} />
          </Grid>

          <Grid item>
            {patient?.patientSex === SexEnum.FEMALE ? (
              <PregnancyInfo
                patientId={patientId}
                patientName={patient?.patientName}
              />
            ) : (
              <MedicalInfo patient={patient} patientId={patientId} />
            )}
          </Grid>
        </Grid>

        <Grid container item xs={12} lg={6} direction="column" spacing={2}>
          <Grid item>
            <PatientStats patientId={patientId} />
          </Grid>

          <Grid item>
            {patient?.patientSex === SexEnum.FEMALE && (
              <MedicalInfo patient={patient} patientId={patientId} />
            )}
          </Grid>
        </Grid>

        <Grid container item xs={12} spacing={2} direction="column">
          <Paper className={classes.cardList}>
            <Grid item className={classes.listHeader}>
              <Typography component={'span'}>Show only: </Typography>

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
                  label={filter.display_title}
                  key={filter.parameter}
                />
              ))}
            </Grid>
            <Divider />
            {cards}
          </Paper>
        </Grid>
      </Grid>
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
  listHeader: {
    display: 'flex',
    placeContent: 'end',
    alignItems: 'center',
  },
}));
