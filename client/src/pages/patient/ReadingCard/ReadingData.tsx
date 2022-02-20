import React from 'react';
import {
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
} from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { createTheme } from "@material-ui/core/styles";
// import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import red from '@material-ui/core/colors/red';
import { Reading } from 'src/shared/types';
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
// ////////////////////////////
  const handleAssess = () => {
    console.log("hello");
  };
  const redTheme = createTheme({ palette: { primary: red } })
// ////////////////////////////

  return (
    <>
      <Typography variant="h5">
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





      
      {/* // //////////////////////////// */}
     <Grid item>
        <Grid container alignItems="flex-start" style={{ gap: 7 }}>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleAssess}>
            
            Assess Referral
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={handleAssess}>
            
            Did Not Attend
          </Button>

          <ThemeProvider theme={redTheme}>
            <Button color="primary" variant="outlined">
              Cancel
            </Button>
          </ThemeProvider> 
        </Grid>
        </Grid>
        {/* // //////////////////////////// */}










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
