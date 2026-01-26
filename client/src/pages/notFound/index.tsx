import { Box, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { DashboardPaper } from 'src/shared/components/dashboard/DashboardPaper';
import { DASHBOARD_PADDING } from 'src/shared/constants';

export const NotFoundPage: React.FC = () => {
  return (
    <DashboardPaper
      sx={{
        padding: DASHBOARD_PADDING,
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          minHeight: '50vh',
          gap: 2,
        }}>
        <ErrorOutlineIcon
          sx={{
            fontSize: 80,
            color: 'text.secondary',
            mb: 2,
          }}
        />
        <Typography variant="h3" component="h1">
          404
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Page Not Found
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 400 }}>
          The page you are looking for does not exist or has been moved.
        </Typography>
      </Box>
    </DashboardPaper>
  );
};
