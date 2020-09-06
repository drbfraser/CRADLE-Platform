import React from 'react';
import Typography from '@material-ui/core/Typography';

export const NotFoundPage: React.FC = () => (
  <>
    <Typography gutterBottom={true} variant="h4">
      Page not found
    </Typography>
    <Typography variant="body1">
      Use one of the navigation links in the menu to head back to one of the
      pages
    </Typography>
  </>
);
