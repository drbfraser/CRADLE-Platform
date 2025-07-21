import { PropsWithChildren, UIEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Divider,
  Paper,
  Skeleton,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab';
import CircularProgress from '@mui/material/CircularProgress';
import HistoryIcon from '@mui/icons-material/History';

import { TimelineRecord } from 'src/shared/types/types';
import { getPatientTimelineAsync } from 'src/shared/api';
import { getPrettyDate } from 'src/shared/utils';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';

type RouteParams = {
  patientId: string;
};

export const HistoryTimeline = () => {
  const { patientId } = useParams<RouteParams>();

  const timelineQuery = useInfiniteQuery({
    queryKey: ['patientHistoryTimeline', patientId!],
    queryFn: ({ pageParam }) => getPatientTimelineAsync(patientId!, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.length === 0) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    enabled: !!patientId,
  });

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    const scroll = scrollHeight - scrollTop - clientHeight;

    // User has reached the end of the scroll bar
    if (scroll === 0 && timelineQuery.hasNextPage) {
      timelineQuery.fetchNextPage();
    }
  };

  const isTransformed = useMediaQuery('(min-width: 560px)');

  return (
    <DashboardPaper>
      <Box
        sx={{
          width: '100%',
          padding: '8px',
        }}>
        <Typography
          component="h5"
          variant="h5"
          sx={{
            fontSize: {
              lg: 'xx-large',
              md: 'x-large',
              sm: 'x-large',
              xs: 'large',
            },
            display: 'flex',
            flexDirection: 'row',
            gap: '1rem',
            alignItems: 'center',
          }}>
          <HistoryIcon
            sx={{
              fontSize: {
                lg: '36px',
                md: '32px',
                sm: '28px',
                xs: '24px',
              },
            }}
          />
          Medical History Timeline
        </Typography>
      </Box>

      <Divider />

      <Box
        sx={{
          overflowY: 'auto',
          height: '460px',
        }}
        onScroll={handleScroll}>
        <Timeline>
          {timelineQuery.isError ? (
            <Alert severity="error">
              Something went wrong when trying to load history timeline. Please
              try refreshing.
            </Alert>
          ) : timelineQuery.isPending ? (
            <Skeleton variant="rectangular" height={200} />
          ) : timelineQuery.data.pages.length > 0 ? (
            <>
              {timelineQuery.data.pages.map((page) =>
                page.map((record: TimelineRecord) => (
                  <TimelineItem key={`${record.date}-${record.title}`}>
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
                      <TimelinePaper>
                        <b> {record.title} </b>
                        <Typography style={{ whiteSpace: 'pre-line' }}>
                          {record.information}
                        </Typography>
                      </TimelinePaper>
                    </TimelineContent>
                  </TimelineItem>
                ))
              )}

              {timelineQuery.hasNextPage === false && (
                <TimelineItem>
                  <TimelineOppositeContent
                    style={{ flex: isTransformed ? 0.1 : 0.2 }}
                  />
                  <TimelineDot />
                  <TimelineContent>
                    <TimelinePaper>
                      <b> End of records </b>
                    </TimelinePaper>
                  </TimelineContent>
                </TimelineItem>
              )}

              {timelineQuery.isFetching && (
                <CircularProgress sx={{ marginLeft: '50%' }} />
              )}
            </>
          ) : (
            <p>No records for this patient.</p>
          )}
        </Timeline>
      </Box>
    </DashboardPaper>
  );
};

const TimelinePaper = ({ children }: PropsWithChildren) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: '6px 16px',
      }}>
      {children}
    </Paper>
  );
};
