import React from 'react';
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@material-ui/core';
import { Reading } from 'src/types';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { getPrettyDateTime } from 'src/shared/utils';
import AssessmentIcon from '@material-ui/icons/Assessment';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';

interface IProps {
  reading: Reading;
}

export const ReadingData = ({ reading }: IProps) => {
  const firstLetterUppercase = (str: string) => {
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <>
      <Typography component="h3" variant="h5">
        <AssessmentIcon fontSize="large" />
        Reading
      </Typography>
      {reading.dateTimeTaken !== null && (
        <Typography variant="subtitle1">
          Taken on {getPrettyDateTime(reading.dateTimeTaken)}
        </Typography>
      )}
      <br />
      <TrafficLight status={reading.trafficLightStatus} />
      <br />
      <p>
        <b>Systolic Blood Pressure:</b> {reading.bpSystolic} mm/Hg
      </p>
      <p>
        <b>Diastolic Blood Pressure:</b> {reading.bpDiastolic} mm/Hg
      </p>
      <p>
        <b>Heart Rate:</b> {reading.heartRateBPM} bpm
      </p>
      {Boolean(reading.symptoms?.length) && (
        <p>
          <b>Symptoms: </b>
          {reading.symptoms?.map((s) => firstLetterUppercase(s)).join(', ')}
        </p>
      )}
      {reading.urineTests && (
        <Accordion>
          <AccordionSummary
            expandIcon={<KeyboardArrowDownIcon />}
            aria-controls="urine-tests-content"
            id="urine-tests-header">
            <Typography>
              <b>Urine Tests Result</b>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>
              {[
                {
                  label: 'Leukocytes',
                  value: reading.urineTests.urineTestLeuc,
                },
                {
                  label: 'Nitrites',
                  value: reading.urineTests.urineTestLeuc,
                },
                {
                  label: 'Glucose',
                  value: reading.urineTests.urineTestLeuc,
                },
                {
                  label: 'Protein',
                  value: reading.urineTests.urineTestLeuc,
                },
                {
                  label: 'Blood',
                  value: reading.urineTests.urineTestLeuc,
                },
              ].map((info) => (
                <p key={info.label}>
                  <b>{info.label}</b> {info.value}
                </p>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};
