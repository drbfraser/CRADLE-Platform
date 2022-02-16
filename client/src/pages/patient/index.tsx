import React, { useState, useEffect } from 'react';
import { Grid, Divider } from '@material-ui/core';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PersonalInfo } from './PersonalInfo';
import { ReadingCard } from './ReadingCard/ReadingCard';
import { PatientStats } from './PatientStats';
import { PregnancyInfo } from './PregnancyInfo';
import { Patient } from 'src/shared/types';
import { useRouteMatch } from 'react-router-dom';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum, SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

type RouteParams = {
  patientId: string;
};

export const PatientPage = () => {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`)
    // apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`+`/get_all_records?readings=1&referrals=1&assessments=1`)
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
    apiFetch(API_URL + EndpointEnum.PATIENTS + `/${patientId}`+`/get_all_records?readings=1&referrals=1&assessments=1`)
      .then((resp) => resp.json())
      .then((patient) => {
        console.log(patient);
        // setPatient(patient);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  }, [patientId]);

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
      {patient?.readings
        ? patient?.readings
            .sort((r1, r2) => (r2.dateTimeTaken ?? 0) - (r1.dateTimeTaken ?? 0))
            .map((r) => (
              <React.Fragment key={r.readingId}>
                <ReadingCard reading={r} />
                <br />
              </React.Fragment>
            ))
        : null}
    </>
  );
};
