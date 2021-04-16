import { CSVLink } from 'react-csv';
import React, { useState, useEffect } from 'react';
import { apiFetch } from 'src/shared/utils/api';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IStatistic } from './index';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface IProps {
  url: string;
}

export const ExportStatistics: React.FC<IProps> = ({ url }) => {
  const headers = [
    { label: 'Referral Date', key: 'parsed_date' },
    { label: 'Referral Time', key: 'parsed_time' },
    { label: 'Patient Id', key: 'patientId' },
    { label: 'Name', key: 'name' },
    { label: 'Gender', key: 'sex' },
    { label: 'Pregnant', key: 'parsed_pregnant' },
    { label: 'Systolic', key: 'systolic_bp' },
    { label: 'Diastolic', key: 'diastolic_bp' },
    { label: 'Heart Rate', key: 'heart_rate' },
    { label: 'Traffic Color', key: 'traffic_color' },
    { label: 'Traffic Arror', key: 'traffic_arrow' },
  ];

  const [data, setData] = useState<IStatistic[]>([]);
  const [, setloaded] = useState(false);
  const [errorLoading, setErrorLoading] = useState(false);
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const getExportedData = async () => {
      try {
        const response: IStatistic[] = await (await apiFetch(url)).json();
        response.forEach((ele) => {
          parseData(ele);
        });
        setData(response);
        setloaded(true);
      } catch (e) {
        setErrorLoading(true);
      }
    };
    getExportedData();
  }, [url]);

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      <Button
        color="primary"
        variant="contained"
        size="large"
        onClick={handleClickOpen}>
        Export Data
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">
          {'Export Statistics Data as a CSV file'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Please click the following link to download the CSV file. Download
            time is subject to internet speed.
          </DialogContentText>
          <CSVLink data={data} headers={headers} filename={'stats.csv'}>
            Download stats.csv
          </CSVLink>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

function parseData(ele: IStatistic) {
  const time = new Date(ele.referral_date * 1000);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const year = time.getFullYear();
  const month = months[time.getMonth()];
  const date = time.getDate();
  const hour = time.getHours();
  const min = time.getMinutes();
  const sec = time.getSeconds();
  ele.parsed_date = date + ' ' + month + ' ' + year;
  ele.parsed_time = hour + ':' + min + ':' + sec;
  if (ele.sex === 'FEMALE') {
    ele.parsed_pregnant = ele.pregnant === true ? 'Yes' : 'No';
  }
}
