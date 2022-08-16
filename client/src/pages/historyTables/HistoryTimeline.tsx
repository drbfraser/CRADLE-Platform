import {
  Alert,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import HistoryIcon from '@mui/icons-material/History';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import { TimelineRecord } from 'src/shared/types';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import { getPatientTimelineAsync } from 'src/shared/api';
import { getPrettyDate } from 'src/shared/utils';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  patientId: string;
  isTransformed: boolean;
}

export const HistoryTimeline = ({ patientId, isTransformed }: IProps) => {
  const classes = useStyles();
  const [records, setRecords] = useState<TimelineRecord[]>([]);
  const [page, setPage] = useState<number>(1);
  const [endOfData, setEndOfData] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const getRecords = async () => {
      setIsFetching(true);

      try {
        const timeline = await getPatientTimelineAsync(patientId, page);

        timeline.length === 0 && setEndOfData(true);

        setRecords((records) => [...records, ...timeline]);
      } catch (e) {
        setErrorLoading(true);
      }

      setIsFetching(false);
    };

    getRecords();
  }, [patientId, page]);

  const handleScroll = (event: any) => {
    const { scrollHeight, scrollTop, clientHeight } = event.target;
    const scroll = scrollHeight - scrollTop - clientHeight;

    //User has reached the end of the scroll bar
    scroll === 0 && !endOfData && setPage(page + 1);

    return true;
  };

  return (
    <Box p={3}>
      <Typography component="h3" variant="h5">
        <HistoryIcon fontSize="large" /> &nbsp; Medical History Timeline
      </Typography>
      <Divider />
      <div className={classes.timeline} onScroll={handleScroll}>
        <Timeline>
          {errorLoading ? (
            <Alert severity="error">
              Something went wrong when trying to load history timeline. Please
              try refreshing.
            </Alert>
          ) : !records ? (
            <Skeleton variant="rectangular" height={200} />
          ) : records.length > 0 ? (
            records.map((record, index) => (
              <TimelineItem key={index}>
                <TimelineOppositeContent
                  style={{ flex: isTransformed ? 0.1 : 0.2 }}>
                  <Typography variant="body2" color="textSecondary">
                    {getPrettyDate(record.date)}
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
              <TimelineOppositeContent
                style={{ flex: isTransformed ? 0.1 : 0.2 }}
              />
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
    height: '460px',
  },
  progress: {
    marginLeft: '50%',
  },
}));
