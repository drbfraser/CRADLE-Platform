import React from 'react';
import Typography from '@material-ui/core/Typography';
import { URINE_TEST_CHEMICALS } from '../../../../utils';
import { ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails } from '@material-ui/core';
import { Icon } from 'semantic-ui-react';
import { Reading } from '../../../../../types';

interface IProps {
  reading: Reading;
};

export const UrineTests: React.FC<IProps> = ({ reading }) => reading.urineTests ? (
  <>
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={ <Icon name="chevron down" /> }
        aria-controls="panel1a-content"
        id="panel1a-header">
        <Typography>
          <b>Urine Tests Result</b>
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <Typography>
          <p>
            <b>{ URINE_TEST_CHEMICALS.LEUC }: </b>{ ' ' }
            { reading.urineTests.urineTestLeuc }{ ' ' }
          </p>
          <p>
            <b>{ URINE_TEST_CHEMICALS.NIT }: </b>{ ' ' }
            { reading.urineTests.urineTestNit }{ ' ' }
          </p>
          <p>
            <b>{ URINE_TEST_CHEMICALS.GLU }: </b>{ ' ' }
            { reading.urineTests.urineTestGlu }{ ' ' }
          </p>
          <p>
            <b>{ URINE_TEST_CHEMICALS.PRO }: </b>{ ' ' }
            { reading.urineTests.urineTestPro }{ ' ' }
          </p>
          <p>
            <b>{ URINE_TEST_CHEMICALS.BLOOD }: </b>{ ' ' }
            { reading.urineTests.urineTestBlood }{ ' ' }
          </p>
        </Typography>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  </>
) : null;
