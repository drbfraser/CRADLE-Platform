import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Typography from '@material-ui/core/Typography';
import { Button } from '@material-ui/core';
import { Symptoms } from './symptoms';
import { VitalSigns } from './vitalSigns';
import { Assessment } from './assessment';
import { Confirmation } from './confirmation';
import Paper from '@material-ui/core/Paper/Paper';
import Box from '@material-ui/core/Box/Box';

export const NewReadingPage = () => {
  const classes = useStyles();
  const history = useHistory();

  const [pageNum, setPageNum] = useState(0);
  const pages = [Symptoms, VitalSigns, Assessment, Confirmation];
  const PageComponent = pages[pageNum];

  const isFinalPage = pageNum === pages.length - 1;

  const handleNext = () => {
    if (isFinalPage) {
      alert('Create');
    } else {
      setPageNum(pageNum + 1);
    }
  };

  return (
    <div className={classes.container}>
      <div className={classes.title}>
        <Tooltip title="Go back" placement="top">
          <IconButton onClick={history.goBack}>
            <ChevronLeftIcon color="inherit" fontSize="large" />
          </IconButton>
        </Tooltip>
        <Typography variant="h4">New Reading</Typography>
      </div>
      <br />
      <Paper>
        <Box p={2}>
          <PageComponent />
        </Box>
      </Paper>
      <br />
      <Button
        color="primary"
        disabled={pageNum === 0}
        onClick={() => setPageNum(pageNum - 1)}>
        Back
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleNext}
        className={classes.right}>
        {isFinalPage ? 'Create' : 'Next'}
      </Button>
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    maxWidth: 1250,
    margin: '0 auto',
  },
  title: {
    display: `flex`,
    alignItems: `center`,
  },
  right: {
    float: 'right',
  },
});
