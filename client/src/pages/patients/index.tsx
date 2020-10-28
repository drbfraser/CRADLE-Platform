import React, { useState, useEffect } from 'react';
import { EndpointEnum } from '../../../src/server';
import { BASE_URL } from '../../../src/server/utils';
import { PatientTable } from './PatientTable';
import { IPatient } from './types';

export const PatientsPage = () => {
  const [patients, setPatients] = useState<IPatient[]>([]);
  const [limit] = useState(10);
  const [page] = useState(1);
  const [search] = useState('');
  const [sortBy] = useState('patientName');
  const [sortDir] = useState('asc');

  useEffect(() => {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    };

    const params =
      '?' +
      new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        search: search,
        sortBy: sortBy,
        sortDir: sortDir,
      });

    fetch(BASE_URL + EndpointEnum.PATIENTS + params, fetchOptions)
      .then(async (resp) => {
        const json = await resp.json();
        setPatients(json);
      })
      .catch((e) => console.error(e)); // TODO properly handle error
  }, [limit, page, search, sortBy, sortDir]);

  return (
    <>
      <h2>Patients</h2>
      <PatientTable patients={patients} />
    </>
  );
};
