import { Box, Paper, Typography } from '@mui/material';

const BORDER_COLOR = 'rgb(211, 205, 205)';
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
        p: 1,
        borderColor: BORDER_COLOR,
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: '7px',
        boxShadow: `3px 1px ${BORDER_COLOR}`,
        overflow: 'hidden',
      })}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          textAlign: 'center',
          gap: {
            xs: 0.25,
            sm: 0.5,
          },
        }}>
        <Typography
          sx={{
            fontSize: {
              xs: '1.25rem',
              sm: '2rem',
              md: '3rem',
            },
            fontWeight: 'medium',
            fontFamily: 'lato',
            flexShrink: 0,
            lineHeight: 1,
          }}>
          {data}
        </Typography>
        <Typography
          variant={'h5'}
          color={'black'}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: {
              xs: '0.65rem',
              sm: '0.9rem',
              md: '1rem',
            },
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontFamily: 'lato',
            lineHeight: 1.1,
          }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};
