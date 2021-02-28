import { OrNull, UrineTests as UrineTestsType } from '@types';

import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

interface IProps {
  urineTests: OrNull<UrineTestsType>;
}

const urineTestChemicals = {
  LEUC: 'Leukocytes',
  NIT: 'Nitrites',
  GLU: 'Glucose',
  PRO: 'Protein',
  BLOOD: 'Blood',
};

export const UrineTests: React.FC<IProps> = ({ urineTests }) => {
  const classes = useStyles();

  return (
    <>
      {urineTests ? (
        <div className={classes.container}>
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
                <p>
                  <b>{urineTestChemicals.LEUC}: </b>
                  {urineTests.urineTestLeuc}
                </p>
                <p>
                  <b>{urineTestChemicals.NIT}: </b>
                  {urineTests.urineTestNit}
                </p>
                <p>
                  <b>{urineTestChemicals.GLU}: </b>
                  {urineTests.urineTestGlu}
                </p>
                <p>
                  <b>{urineTestChemicals.PRO}: </b>
                  {urineTests.urineTestPro}
                </p>
                <p>
                  <b>{urineTestChemicals.BLOOD}: </b>
                  {urineTests.urineTestBlood}
                </p>
              </div>
            </AccordionDetails>
          </Accordion>
        </div>
      ) : null}
    </>
  );
};
