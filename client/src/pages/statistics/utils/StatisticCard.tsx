import { Box, Paper, Typography } from '@mui/material';

const BORDER_COLOR = 'rgb(211, 205, 205)';
// const BORDER_RADIUS = '7px';
interface CardProps {
  label: string;
  data?: number;
}

export const StatisticCard: React.FC<CardProps> = ({ label, data }) => {
  return (
    <Paper
      elevation={3}
      sx={(theme) => ({
        width: {
          xs: '120px',
          sm: '180px',
          md: '200px',
        },
        height: {
          xs: '80px',
          sm: '90px',
          md: '100px',
        },
        padding: theme.spacing(1, 1, 1, 2),
        borderColor: BORDER_COLOR,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: '7px',
        boxShadow: `3px 1px ${BORDER_COLOR}`,
      })}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          textAlign: 'center',
        }}>
        <Typography
          sx={{
            fontSize: {
              xs: '1.5rem',
              sm: '2.5rem',
              md: '3.5rem',
            },
            mr: {
              xs: 1,
            },
            fontWeight: 'medium',
            fontFamily: 'lato',
          }}>
          {data}
        </Typography>
        <Typography
          variant={'h5'}
          color={'black'}
          sx={{
            width: '100px',
            fontSize: {
              xs: '0.8rem',
              sm: '1rem',
              md: '1rem',
            },
            fontWeight: 'bold',
            textTransform: 'uppercase',
            marginX: 'auto',
            fontFamily: 'lato',
          }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};
