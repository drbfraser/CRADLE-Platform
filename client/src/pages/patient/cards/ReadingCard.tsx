import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from '@mui/material';
import { AssignmentInd, KeyboardArrowDown } from '@mui/icons-material';
import { Reading } from 'src/shared/types/readingTypes';
import { TrafficLight } from 'src/shared/components/trafficLight';
import { CardContainer } from './CardContainer';

interface IReadingCardProps {
  reading: Reading;
}

export const ReadingCard = ({ reading }: IReadingCardProps) => {
  const firstLetterUppercase = (str: string) => {
    str = str.trim();
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <CardContainer>
      <Typography variant={'h5'} component={'h5'}>
        <AssignmentInd fontSize="large" />
        Reading
      </Typography>

      <Box px={3}>
        <TrafficLight
          style={{ margin: '5px' }}
          status={reading.trafficLightStatus}
        />
        <p>
          <b>Systolic Blood Pressure:</b> {reading.systolicBloodPressure} mm/Hg
        </p>
        <p>
          <b>Diastolic Blood Pressure:</b> {reading.diastolicBloodPressure}{' '}
          mm/Hg
        </p>
        <p>
          <b>Heart Rate:</b> {reading.heartRate} bpm
        </p>
        {Boolean(reading.symptoms?.length) && (
          <p>
            <b>Symptoms: </b>
            {reading.symptoms?.map((s) => firstLetterUppercase(s)).join(', ')}
          </p>
        )}
        {reading.urineTests && (
          <Accordion>
            <AccordionSummary expandIcon={<KeyboardArrowDown />}>
              <Typography>
                <b>Urine Test Result</b>
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <div>
                {[
                  {
                    label: 'Leukocytes',
                    value: reading.urineTests.leukocytes,
                  },
                  {
                    label: 'Nitrites',
                    value: reading.urineTests.nitrites,
                  },
                  {
                    label: 'Glucose',
                    value: reading.urineTests.glucose,
                  },
                  {
                    label: 'Protein',
                    value: reading.urineTests.protein,
                  },
                  {
                    label: 'Blood',
                    value: reading.urineTests.blood,
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
      </Box>
    </CardContainer>
  );
};
