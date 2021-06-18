import React, { useState, useEffect } from 'react';
import { Grid, Divider } from '@material-ui/core';
import { Header } from './Header';
import { MedicalInfo } from './MedicalInfo';
import { PersonalInfo } from './PersonalInfo';
import { ReadingCard } from './ReadingCard/ReadingCard';
import { PatientStats } from './PatientStats';
import { Patient, Pregnancy } from 'src/shared/types';
import { useRouteMatch } from 'react-router-dom';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';

type RouteParams = {
  patientId: string;
};

export const PatientPage = () => {
  const { patientId } = useRouteMatch<RouteParams>().params;
  const [patient, setPatient] = useState<Patient>();
  const [pregnancy, setPregnancy] = useState<Pregnancy>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const urlPatient = API_URL + EndpointEnum.PATIENTS + `/${patientId}`;
    const urlPregnancy = urlPatient + EndpointEnum.PREGNANCY_STATUS;
    const fetchPatient = apiFetch(urlPatient).then((resp) => resp.json());
    const fetchPregnancy = apiFetch(urlPregnancy).then((resp) => resp.json());

    Promise.all([fetchPatient, fetchPregnancy])
      .then(([patient, pregnancy]) => {
        setPregnancy(pregnancy);
        setPatient(patient);
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
          <MedicalInfo patient={patient} pregnancy={pregnancy} />
        </Grid>
        <Grid item xs={12} md={6}>
          <PatientStats patientId={patientId} />
        </Grid>
      </Grid>
      <br />
      <Divider />
      <br />
      {patient?.readings
        .sort((r1, r2) => (r2.dateTimeTaken ?? 0) - (r1.dateTimeTaken ?? 0))
        .map((r) => (
          <React.Fragment key={r.readingId}>
            <ReadingCard reading={r} />
            <br />
          </React.Fragment>
        ))}
    </>
  );
};
