import React, { useEffect, useState } from 'react';

import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CSVLink } from 'react-csv';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { IExportStatRow } from './index';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { SexEnum } from 'src/shared/enums';
import { apiFetch } from 'src/shared/api';

interface IProps {
  url: string;
}

export const ExportStatistics = ({ url }: IProps) => {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <PrimaryButton style={{ float: 'right' }} onClick={handleClickOpen}>
        Export Referrals
      </PrimaryButton>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Export Referral Data</DialogTitle>
        <DialogContent>
          <DialogContentText component={'div'}>
            Please click on the following link to download the CSV file.
            {open && <DownloadCSV url={url} />}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose} autoFocus>
            Close
          </CancelButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const DownloadCSV = ({ url }: IProps) => {
  const headers = [
    { label: 'Referral Date', key: 'parsed_date' },
    { label: 'Referral Time', key: 'parsed_time' },
    { label: 'Patient ID', key: 'patientId' },
    { label: 'Name', key: 'name' },
    { label: 'Gender', key: 'sex' },
    { label: 'Pregnant', key: 'parsed_pregnant' },
    { label: 'Systolic Blood Pressure', key: 'systolic_bp' },
    { label: 'Diastolic Blood Pressure', key: 'diastolic_bp' },
    { label: 'Heart Rate', key: 'heart_rate' },
    { label: 'Traffic Color', key: 'traffic_color' },
    { label: 'Traffic Arrow', key: 'traffic_arrow' },
  ];

  const [data, setData] = useState<IExportStatRow[]>();
  const [errorLoading, setErrorLoading] = useState(false);

  useEffect(() => {
    const getExportData = async () => {
      try {
        const response: IExportStatRow[] = await (await apiFetch(url)).json();

        response.forEach((row) => {
          parseRow(row);
        });

        setData(response);
      } catch (e) {
        setErrorLoading(true);
      }
    };

    getExportData();
  }, [url]);

  return (
    <div>
      <APIErrorToast
        open={errorLoading}
        onClose={() => setErrorLoading(false)}
      />
      {data ? (
        <CSVLink data={data} headers={headers} filename="stats.csv">
          Download stats.csv
        </CSVLink>
      ) : (
        <>Loading...</>
      )}
    </div>
  );
};

function parseRow(row: IExportStatRow) {
  const date = new Date(row.referral_date * 1000);
  row.parsed_date = date.toLocaleDateString();
  row.parsed_time = date.toLocaleTimeString();

  if (row.sex === SexEnum.FEMALE) {
    row.parsed_pregnant = row.pregnant ? 'Yes' : 'No';
  } else {
    row.parsed_pregnant = '';
  }
}
