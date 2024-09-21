import { Box, Paper, Typography } from '@mui/material';

const BORDER_COLOR = 'rgb(211, 205, 205)';
// const BORDER_RADIUS = '7px';
interface CardProps {
  label: string;
  data?: number;
}

export const StatisticCard: React.FC<CardProps> = ({ label, data }) => {
  return (
    <>
      <Paper
        elevation={3}
        sx={(theme) => ({
          width: '200px',
          height: '100px',
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
              fontSize: '3rem',
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
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginX: 'auto',
              fontFamily: 'lato',
            }}>
            {label}
          </Typography>
        </Box>
      </Paper>
    </>
  );
};
