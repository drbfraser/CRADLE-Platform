import React, { useEffect, useState } from 'react';
import Timeline from '@material-ui/lab/Timeline';
import TimelineItem from '@material-ui/lab/TimelineItem';
import TimelineSeparator from '@material-ui/lab/TimelineSeparator';
import TimelineConnector from '@material-ui/lab/TimelineConnector';
import TimelineContent from '@material-ui/lab/TimelineContent';
import TimelineOppositeContent from '@material-ui/lab/TimelineOppositeContent';
import TimelineDot from '@material-ui/lab/TimelineDot';
import { Paper, makeStyles, Box, Typography } from '@material-ui/core';
import {  OrNull, MedicalRecord, Pregnancy } from 'src/shared/types';
import { apiFetch, API_URL } from 'src/shared/api';
import { EndpointEnum } from 'src/shared/enums';
import { getPrettyDateTime } from 'src/shared/utils';
import RecentActorsIcon from '@material-ui/icons/RecentActors';

interface IProps {
  patientId: string;
}

interface Record {
  title: string;
  date: number;
  information?: OrNull<string>;
}

export const HistoryTimeline = ({ patientId }: IProps) => {
  const classes = useStyles();
  const [records, setRecords] = useState<Record[]>();

  useEffect(() => {
    getRecords(patientId);
  }, [patientId]);

  const getRecords = async (patientId: string) => {
    try {
      const recordList: Record[] = [];
      const medicalHistoryRecords: any = await apiFetch(
        API_URL +
          EndpointEnum.PATIENTS +
          `/${patientId}` +
          EndpointEnum.MEDICAL_HISTORY
      ).then((resp) => resp.json());

      const pregnancyRecords: any = await apiFetch(
        API_URL +
          EndpointEnum.PATIENTS +
          `/${patientId}` +
          EndpointEnum.PREGNANCY_RECORDS
      ).then((resp) => resp.json());

      medicalHistoryRecords.drug.forEach(
        (medicalHistoryRecord: MedicalRecord) => {
            recordList.push({
            title:'Updated drug history',
            date: medicalHistoryRecord.dateCreated,
            information: medicalHistoryRecord.information,
          });
        }
      );
      medicalHistoryRecords.medical.forEach(
        (medicalHistoryRecord: MedicalRecord) => {
            recordList.push({
            title:'Updated medical history',
            date: medicalHistoryRecord.dateCreated,
            information: medicalHistoryRecord.information,
          });
        }
      );
      pregnancyRecords.forEach((pregnancyRecord: Pregnancy) => {
        recordList.push({
          title:'Started pregnancy',
          date: pregnancyRecord.startDate,
          information: '',
        });
        if (pregnancyRecord.endDate) {
            recordList.push({
            title:'Ended pregnancy',
            date: pregnancyRecord.endDate,
            information: pregnancyRecord.outcome ?? 'Outcome not available',
          });
        }
      });
      console.log(recordList);
      setRecords(recordList);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Paper>
      <Box p={3}>
        <Typography component="h3" variant="h5">
          <RecentActorsIcon fontSize="large" /> &nbsp; Medical History Timeline
        </Typography>
        <Timeline>
        {
            records?.sort((r1, r2) => (r2.date ?? 0) - (r1.date ?? 0))
            .map((record, index)=>(
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
                <Typography>{record.information}</Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
            ))
        }
          
        </Timeline>
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
}));
