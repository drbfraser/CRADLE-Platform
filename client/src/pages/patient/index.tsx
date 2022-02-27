import React, { useState, useEffect, useRef } from 'react';
import { Grid, Divider } from '@material-ui/core';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PersonalInfo } from './PersonalInfo';

import {
  AssessmentCard,
  ReadingCard,
  ReferralAssessedCard,
  ReferralCancellationCard,
  ReferralNotAttendedCard,
  ReferralPendingCard,
} from './Cards/Cards';
import { PatientStats } from './PatientStats';
import { PregnancyInfo } from './PregnancyInfo';
import { Patient } from 'src/shared/types';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { makeStyles } from '@material-ui/core/styles';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import { ConfirmDialog } from '../../shared/components/confirmDialog';

type RouteParams = {
  patientId: string;
};

type FilterRequestBody = {
  referrals: number;
  readings: number;
  assessments: number;
};

type Filter = {
  //parameter is for net request;display_title is for UI display
  parameter: string;
  display_title: string;
};

const Filters: Filter[] = [
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
];

export const PatientPage = () => {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  //we will need to send 2 request, the second is specifically for the cards data array
  const history = useHistory();
  const [cards, setCards] = useState([]);
  const original_cards_ref = useRef<boolean>(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [isThereAPendingReferral, setIsThereAPendingReferral] = useState(false);
  const [
    confirmDialogPerformAssessmentOpen,
    setConfirmDialogPerformAssessmentOpen,
  ] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<string[]>([
    'referrals',
    'readings',
    'assessments',
  ]);
  const [filterRequestBody] = useState<FilterRequestBody>({
    referrals: 1,
    readings: 1,
    assessments: 1,
  });

  useEffect(() => {
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
      .then((resp) => resp.json())
      .then((patient) => {
        setPatient(patient);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  useEffect(() => {
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}/get_all_records?readings=${filterRequestBody.readings}&referrals=${filterRequestBody.referrals}&assessments=${filterRequestBody.assessments}`
    )
      .then((resp) => resp.json())
      .then((cards_data) => {
        if (cards_data.length > 0) {
          original_cards_ref.current = true;
        }
        /////////////////////////////
        collectCardsWithData(cards_data);
        ////////////////////
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId, original_cards_ref, filterRequestBody]);

  useEffect(() => {
    apiFetch(
      API_URL + EndpointEnum.PATIENTS + `/${patientId}` + EndpointEnum.REFERRALS
    )
      .then((resp) => resp.json())
      .then((referralsData) => {
        // TODO: encapsulate checking for pending into its own function
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
      .catch(() => {
        console.error('Error receiving referrals');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collectCardsWithData = (cards_data: any) => {
    const cards_elements = [] as any;
    let index;
    for (index = 0; index < cards_data.length; index++) {
      const card_item = cards_data[index];

      if (card_item.type === 'reading') {
        cards_elements.push(
          <React.Fragment key={index}>
            <ReadingCard reading={card_item} />
            <br />
          </React.Fragment>
        );
      } else if (card_item.type === 'assessment') {
        cards_elements.push(
          <React.Fragment key={index}>
            <AssessmentCard followUp={card_item} />
            <br />
          </React.Fragment>
        );
      } else if (card_item.type === 'referral') {
        if (card_item.isAssessed) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralAssessedCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else if (card_item.isCancelled) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralCancellationCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else if (card_item.notAttended) {
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralNotAttendedCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        } else {
          //pending
          cards_elements.push(
            <React.Fragment key={index}>
              <ReferralPendingCard referral={card_item} />
              <br />
            </React.Fragment>
          );
        }
      } else {
        //illegal case, no handling
      }
    }
    setCards(cards_elements);
  };

  const handleChangeFilters = (newFilters: any) => {
    filterRequestBody!.referrals = 0;
    filterRequestBody!.readings = 0;
    filterRequestBody!.assessments = 0;
    let i;
    for (i = 0; i < newFilters.length; i++) {
      if (newFilters[i] === 'referrals') {
        filterRequestBody!.referrals = 1;
      } else if (newFilters[i] === 'readings') {
        filterRequestBody!.readings = 1;
      } else if (newFilters[i] === 'assessments') {
        filterRequestBody!.assessments = 1;
      } else {
        //illegal type, not handling
      }
    }
    //request parameters have been ready, now sent request and get new data
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}/get_all_records?readings=${filterRequestBody.readings}&referrals=${filterRequestBody.referrals}&assessments=${filterRequestBody.assessments}`
    )
      .then((resp) => resp.json())
      .then((cards_data) => {
        //**collect cards into UI components, the output is cards(html) rather than data
        collectCardsWithData(cards_data);

        //after getting the data, render the view
        setSelectedParameter(newFilters);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  };

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Header
        patient={patient}
        isThereAPendingReferral={isThereAPendingReferral}
        setConfirmDialogPerformAssessmentOpen={
          setConfirmDialogPerformAssessmentOpen
        }
      />
      <ConfirmDialog
        title={'Warning'}
        content={
          'You have at least one pending referral. Do you still want to create an assessment without a referral?'
        }
        open={confirmDialogPerformAssessmentOpen}
        onClose={() => {
          setConfirmDialogPerformAssessmentOpen(false);
        }}
        onConfirm={() => {
          history.push(`/assessments/new/${patientId}`);
        }}
      />
      <br />
      <Divider />
      <br />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <PersonalInfo patient={patient} />
          <br />
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
          <br />
          {patient?.patientSex === SexEnum.FEMALE && (
            <MedicalInfo patient={patient} patientId={patientId} />
          )}
        </Grid>
      </Grid>

      {/* Should consider to user 'current' property */}
      {Boolean(original_cards_ref.current) && (
        <>
          <br />
          <br />
          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center">
            <Grid item container justifyContent="flex-end" spacing={2}>
              <Grid item>
                <Typography>Show only: </Typography>
                {Filters.map((filter_checkbox, index) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedParameter.includes(
                          filter_checkbox.parameter
                        )}
                        onChange={(event, checked) => {
                          //if the original state is 'selected', now the 'check operation' is to remove this item from the selected array
                          if (checked) {
                            const newFilters = [
                              ...selectedParameter,
                              event.target.value,
                            ];
                            handleChangeFilters(newFilters);
                          }
                          //if the original state is 'not selected', now the 'check operation' is to add this item to the selected array
                          else {
                            const newParameters = [...selectedParameter];
                            const i = newParameters.indexOf(event.target.value);
                            if (i > -1) {
                              //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice
                              newParameters.splice(i, 1);
                            }
                            handleChangeFilters(newParameters);
                          }
                        }}
                        value={filter_checkbox.parameter}
                      />
                    }
                    label={<>{filter_checkbox.display_title}</>}
                    key={index}
                  />
                ))}
              </Grid>
            </Grid>
          </Grid>
        </>
      )}

      <br />
      <Divider />
      <br />

      {cards ? cards.map((card) => <>{card}</>) : null}
    </>
  );
};

export const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    margin: 0,
    height: '100%',
    position: 'relative',
    resize: 'both',
  },
  filterIcon: {
    height: 30,
    width: 30,
    color: '#00b8e6',
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  content: {
    maxHeight: 600,
  },
  formControl: {
    margin: '4px 8px',
    minWidth: 180,
  },
  inputLabel: {
    fontSize: '50',
  },
  container: {
    margin: 'auto',
  },
  center: {
    display: `flex`,
    flexDirection: `column`,
    alignItems: `center`,
  },
  red: {
    color: '#f44336',
    padding: '2px',
  },
  green: {
    color: '#4caf50',
    padding: '2px',
  },
}));
