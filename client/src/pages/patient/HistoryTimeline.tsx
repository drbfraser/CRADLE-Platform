import React, { useEffect, useState } from 'react';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import CircularProgress from '@material-ui/core/CircularProgress';
import TimelineDot from '@material-ui/lab/TimelineDot';
import { Alert, Skeleton } from '@material-ui/lab';
import { Paper, makeStyles, Box, Typography, Divider } from '@material-ui/core';
import { TimelineRecord } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { getPrettyDateTime } from 'src/shared/utils';
import HistoryIcon from '@material-ui/icons/History';

interface IProps {
  patientId: string;
}

export const HistoryTimeline = ({ patientId }: IProps) => {
  const classes = useStyles();
  const [records, setRecords] = useState<TimelineRecord[]>();
  const [page, setPage] = useState(1);
  const [endOfData, setEndOfData] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const url =
    API_URL +
    EndpointEnum.PATIENTS +
    `/${patientId}` +
    EndpointEnum.PATIENT_TIMELINE;

  useEffect(() => {
    getRecords(url);
    // eslint-disable-next-line
  }, [url]);

  const handleScroll = (event: any) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const scroll = scrollHeight - scrollTop - clientHeight;

    //User has reached the end of the scroll bar
    if (scroll === 0 && !endOfData) {
      getRecords(url);
    }
  };

  const getRecords = (url: string) => {
    setIsFetching(true);
    const params =
      '?' +
      new URLSearchParams({
        limit: '5',
        page: page.toString(),
      });
    apiFetch(url + params)
      .then(async (resp) => {
        const json = await resp.json();
        if (
          (page > 1 && json.length === 0) ||
          (page === 1 && json.length > 0 && json.length < 5)
        ) {
          setEndOfData(true);
        }
        if (!records) {
          setRecords(json);
        } else {
          setRecords([...records, ...json]);
          setIsFetching(false);
        }
        setPage(page + 1);
      })
      .catch(() => {
        setErrorLoading(true);
      });
  };

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <HistoryIcon fontSize="large" /> &nbsp; Medical History Timeline
        </Typography>
        <Divider />
        <div className={classes.timeline} onScroll={handleScroll}>
          <Timeline>
            {errorLoading ? (
              <Alert severity="error">
                Something went wrong when trying to load history timeline.
                Please try refreshing.
              </Alert>
            ) : !records ? (
              <Skeleton variant="rect" height={200} />
            ) : records.length > 0 ? (
              records.map((record, index) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent style={{ flex: 0.2 }}>
                    <Typography variant="body2" color="textSecondary">
                      {getPrettyDateTime(record.date)}
                    </Typography>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Paper elevation={3} className={classes.paper}>
                      <b> {record.title} </b>
                      <Typography style={{ whiteSpace: 'pre-line' }}>
                        {record.information}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))
            ) : (
              <p>No records for this patient.</p>
            )}
            {isFetching && <CircularProgress className={classes.progress} />}

            {endOfData && (
              <TimelineItem>
                <TimelineOppositeContent style={{ flex: 0.2 }} />
                <TimelineDot />
                <TimelineContent>
                  <Paper elevation={3} className={classes.paper}>
                    <b> End of records </b>
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            )}
          </Timeline>
        </div>
      </Box>
    </Paper>
  );
};

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: '6px 16px',
  },
  secondaryTail: {
    backgroundColor: theme.palette.secondary.main,
  },
  timeline: {
    overflowY: 'auto',
    maxHeight: '400px',
  },
  progress: {
    marginLeft: '50%',
  },
}));
