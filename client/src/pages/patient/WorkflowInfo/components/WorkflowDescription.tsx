import { Box, Typography } from '@mui/material';

type WorkflowDescriptionProps = {
  description: string;
};

export default function WorkflowDescription({
  description,
}: WorkflowDescriptionProps) {
  return (
    <Box sx={{ mx: 5, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Description
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description || 'N/A'}
      </Typography>
    </Box>
  );
}
