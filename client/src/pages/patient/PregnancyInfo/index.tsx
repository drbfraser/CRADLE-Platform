import { Link } from 'react-router-dom';
import { Divider, Paper, Typography } from '@mui/material';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';

import { SexEnum } from 'src/shared/enums';
import PregnancyStats from './PregnancyStats';
import * as Styled from './styled';

type Props = {
  patientId: string;
  patientName: string;
};

export const PregnancyInfo = ({ patientId, patientName }: Props) => {
  return (
    <Paper
      sx={{
        padding: 3,
        backgroundColor: '#fff',
      }}>
      <Styled.Header>
        <Typography component="h5" variant="h5">
          <PregnantWomanIcon fontSize="large" />
          Pregnancy Information
        </Typography>
        <Link to={`/history/${patientId}/${patientName}/${SexEnum.FEMALE}`}>
          View Past Records
        </Link>
      </Styled.Header>

      <Divider />

      <PregnancyStats patientId={patientId} />
    </Paper>
  );
};
