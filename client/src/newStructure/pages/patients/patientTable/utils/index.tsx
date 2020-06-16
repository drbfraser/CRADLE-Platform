import { GlobalSearchPatient, Patient } from '@types';
import {
  getLatestReading,
  getLatestReadingDateTime,
  getPrettyDate,
  getTrafficIcon,
  sortPatientsByLastReading,
} from '../../../../shared/utils';

import { Button } from '@material-ui/core';
import { Column } from 'material-table';
import React from 'react';
import { TextAlignProperty } from 'csstype';
import { TrafficLightEnum } from '../../../../enums';
import classes from './styles.module.css';

export const initials: Column<Patient | GlobalSearchPatient> = {
  title: `Patient Initials`,
  field: `patientName`,
  render: (rowData: Patient | GlobalSearchPatient): JSX.Element => (
    <p className={classes.text}>
      { rowData.patientName }
    </p>
  ),
  headerStyle: {
    textAlign: `center` as TextAlignProperty
  }
};

export const patientId: Column<Patient | GlobalSearchPatient> = {
  title: `Patient ID`,
  field: `patientId`,
  customSort: (
    patient: Patient | GlobalSearchPatient, 
    otherPatient: Patient | GlobalSearchPatient
  ) => Number(patient.patientId) - Number(otherPatient.patientId)
};

export const village: Column<Patient | GlobalSearchPatient> = {
  title: `Village`,
  field: `villageNumber`,
};

export const vitalSign: Column<Patient | GlobalSearchPatient> = {
  title: `Vital Sign`,
  cellStyle: {
    padding: `0px`
  },
  render: (rowData: Patient | GlobalSearchPatient) =>
    getTrafficIcon(
      getLatestReading(rowData.readings).trafficLightStatus
    ),
  customSort: (
    patient: Patient | GlobalSearchPatient, 
    otherPatient: Patient | GlobalSearchPatient
  ) => {
    const leftIndex = Object.values(TrafficLightEnum).indexOf(
      patient.readings[0].trafficLightStatus
    );
    const rightIndex = Object.values(TrafficLightEnum).indexOf(
      otherPatient.readings[0].trafficLightStatus
    );

    return leftIndex - rightIndex;
  }
};

export const lastReadingDate: Column<Patient | GlobalSearchPatient> = {
  title: `Date of Last Reading`,
  field: `lastReading`,
  render: (rowData: Patient | GlobalSearchPatient) => (
    <p>{ getPrettyDate(getLatestReadingDateTime(rowData.readings)) }</p>
  ),
  customSort: (
    patient: Patient | GlobalSearchPatient, 
    otherPatient: Patient | GlobalSearchPatient
  ) => sortPatientsByLastReading(patient, otherPatient),
  defaultSort: `asc` as `asc`
};

export const state: Column<Patient | GlobalSearchPatient> = {
  title: `State`,
  field: `state`,
  render: ({ state }: GlobalSearchPatient) => (
    <Button variant="contained">{state}</Button>
  ),
  sorting: false,
};