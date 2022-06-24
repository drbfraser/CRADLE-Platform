import { API_URL, apiFetch } from 'src/shared/api';
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
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import Checkbox from '@material-ui/core/Checkbox';
import { ConfirmDialog } from '../../shared/components/confirmDialog';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { Patient } from 'src/shared/types';
import { PatientStats } from './PatientStats';
import { PersonalInfo } from './PersonalInfo';
import { PregnancyInfo } from './PregnancyInfo';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

type RouteParams = {
  patientId: string;
};

type FilterRequestBody = {
  referrals: boolean;
  readings: boolean;
  assessments: boolean;
  forms: boolean;
};

type FilterRequestKey = keyof FilterRequestBody;

type Filter = {
  //parameter is for net request;display_title is for UI display
  parameter: FilterRequestKey;
  display_title: string;
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
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  const history = useHistory();
  const [cards, setCards] = useState<JSX.Element[]>([]);
  const [errorLoading, setErrorLoading] = useState(false);
  const [isThereAPendingReferral, setIsThereAPendingReferral] = useState(false);
  const [
    confirmDialogPerformAssessmentOpen,
    setConfirmDialogPerformAssessmentOpen,
  ] = useState(false);

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
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
      .then((resp) => resp.json())
      .then(setPatient)
      .catch(() => setErrorLoading(true));
  }, [patientId]);

  useEffect(() => {
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

    apiFetch(
      `${API_URL}${
        EndpointEnum.PATIENTS
      }/${patientId}/get_all_records?readings=${
        filterRequestBody.readings ? 1 : 0
      }&referrals=${filterRequestBody.referrals ? 1 : 0}&assessments=${
        filterRequestBody.assessments ? 1 : 0
      }&forms=${filterRequestBody.forms ? 1 : 0}`
    )
      .then((resp) => resp.json())
      .then((resp) => UpdateCardsJsx(resp))
      .catch(() => setErrorLoading(true));
  }, [filterRequestBody, patientId]);

  useEffect(() => {
    apiFetch(
      API_URL + EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.REFERRALS
    )
      .then((resp) => resp.json())
      .then((referralsData) => {
        for (let i = 0; i < referralsData.length; i++) {
          if (
            !referralsData[i].isAssessed &&
            !referralsData[i].isCancelled &&
            !referralsData[i].notAttended
          ) {
            setIsThereAPendingReferral(true);
            break;
          }
        }
      })
      .catch(() => console.error('Error receiving referrals'));
  }, [patientId]);

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
        open={confirmDialogPerformAssessmentOpen}
        onClose={() => {
          setConfirmDialogPerformAssessmentOpen(false);
        }}
        onConfirm={() => {
          history.push(`/assessments/new/${patientId}`);
        }}
      />
      <Header
        patient={patient}
        isThereAPendingReferral={isThereAPendingReferral}
        setConfirmDialogPerformAssessmentOpen={
          setConfirmDialogPerformAssessmentOpen
        }
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
