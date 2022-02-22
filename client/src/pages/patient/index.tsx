import React, { useState, useEffect } from 'react';
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
import { useRouteMatch } from 'react-router-dom';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
// import { Card } from 'src/shared/types';

type RouteParams = {
  patientId: string;
};

// interface IProps {
//   card:Card;
// };

export const PatientPage = () => {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  //we will need to send 2 request, the second is specifically for the cards data array
  const [cards, setCards] = useState([]);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    /*eslint no-useless-concat: "error"*/
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
      .then((resp) => resp.json())
      .then((patient) => {
        // console.log(patient);
        setPatient(patient);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  useEffect(() => {
    // apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
    apiFetch(
      API_URL +
        EndpointEnum.PATIENTS +
        `/${patientId}/get_all_records?readings=1&referrals=1&assessments=1`
    )
      .then((resp) => resp.json())
      .then((cards_data) => {
        console.log(cards_data);

        /////////////////////////////
        handleAssess(cards_data);

        ////////////////////
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

  const handleAssess = (cards_data: any) => {
    const cards_elements = [] as any;
    var index;
    for (index = 0; index < cards_data.length; index++) {
      var card_item = cards_data[index];
      console.log(card_item);

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
        console.log('error!');
      }
    }
    setCards(cards_elements);
  };

  return (
    <>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Header patient={patient} />
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
      <br />
      <Divider />
      <br />

      {/* {patient?.readings
        ? patient?.readings
            .sort((r1, r2) => (r2.dateTimeTaken ?? 0) - (r1.dateTimeTaken ?? 0))
            .map((r) => (
              <React.Fragment key={r.readingId}>
                <ReadingCard reading={r} />
                <br />
              </React.Fragment>
            ))
        : null} */}
      {console.log(cards)}

      {cards ? cards.map((card) => <>{card}</>) : null}
    </>
  );
};
