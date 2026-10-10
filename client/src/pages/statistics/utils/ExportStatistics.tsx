import { useState } from 'react';
import { CSVLink } from 'react-csv';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@mui/material';

import { SexEnum } from 'src/shared/enums';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import { IExportStatRow } from './index';

interface IProps {
  getData: () => Promise<IExportStatRow[]>;
}

export const ExportStatistics = ({ getData }: IProps) => {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const isMobile = useMediaQuery('(max-width:720px)');

  return (
    <Box>
      <PrimaryButton
        sx={{
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            md: '1rem',
          },
          px: {
            xs: 0.5,
            sm: 1.5,
            md: 2,
          },
          py: {
            xs: 0.25,
            sm: 0.8,
            md: 1,
          },
        }}
        onClick={handleClickOpen}>
        {isMobile ? 'Export' : 'Export Referrals'}
      </PrimaryButton>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Export Referral Data</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Please click on the following link to download the CSV file.
            {open && <DownloadCSV getData={getData} />}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CancelButton onClick={handleClose} autoFocus>
            Close
          </CancelButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

const DownloadCSV = ({ getData }: IProps) => {
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

  const exportDataQuery = useQuery({
    queryKey: ['exportData'],
    queryFn: getData,
  });
  if (exportDataQuery.isPending) {
    return <>Loading...</>;
  }
  if (exportDataQuery.isError) {
    return <APIErrorToast />;
  }
  exportDataQuery.data.forEach((row) => parseRow(row));

  return (
    <Box>
      <CSVLink
        data={exportDataQuery.data}
        headers={headers}
        filename="stats.csv">
        Download stats.csv
      </CSVLink>
    </Box>
  );
};

function parseRow(row: IExportStatRow) {
  const date = new Date(row.referral_date * 1000);
  row.parsed_date = date.toLocaleDateString();
  row.parsed_time = date.toLocaleTimeString();
  row.parsed_pregnant = '';

  if (row.sex === SexEnum.FEMALE) {
    row.parsed_pregnant = row.pregnant ? 'Yes' : 'No';
  }
}
