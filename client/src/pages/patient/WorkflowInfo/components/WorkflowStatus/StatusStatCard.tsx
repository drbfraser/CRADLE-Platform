import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

type StatusStatCardProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  caption?: ReactNode;
};

export default function StatusStatCard({
  icon,
  label,
  value,
  caption,
}: StatusStatCardProps) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      {icon}
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600}>
        {value}
      </Typography>
      {caption}
    </Box>
  );
}
