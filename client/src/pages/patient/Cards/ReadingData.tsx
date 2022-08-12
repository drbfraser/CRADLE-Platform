import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';

import AssessmentIcon from '@mui/icons-material/Assessment';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React from 'react';
import { Reading } from 'src/shared/types';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { getPrettyDate } from 'src/shared/utils';

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
      <Typography variant="h5">
        <AssessmentIcon fontSize="large" />
        Reading
      </Typography>
      {reading.dateTimeTaken !== null && (
        <Typography variant="subtitle1">
          Taken on {getPrettyDate(reading.dateTimeTaken)}
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
          <AccordionSummary expandIcon={<KeyboardArrowDownIcon />}>
            <Typography>
              <b>Urine Test Result</b>
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
                  value: reading.urineTests.urineTestNit,
                },
                {
                  label: 'Glucose',
                  value: reading.urineTests.urineTestGlu,
                },
                {
                  label: 'Protein',
                  value: reading.urineTests.urineTestPro,
                },
                {
                  label: 'Blood',
                  value: reading.urineTests.urineTestBlood,
                },
              ].map((info) => (
                <p key={info.label}>
                  <b>{info.label}:</b> {info.value}
                </p>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </>
  );
};
