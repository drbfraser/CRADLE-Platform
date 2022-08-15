import Typography from '@mui/material/Typography';

export const NotFoundPage: React.FC = () => (
  <>
    <Typography gutterBottom={true} variant="h4">
      Page not found
    </Typography>
    <Typography variant="body1">
      The page you are looking for could not be found. Use one of the navigation
      links on the left hand side.
    </Typography>
  </>
);
