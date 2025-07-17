import React from 'react';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Box, Typography, Button, Paper } from '@mui/material';

export const WorkflowInfo: React.FC = () => {
  return (
    <Paper sx={{ padding: 2, marginTop: 2, minHeight: 268 }}>
      <Box borderBottom={2} borderColor="divider" pb={2} mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <AccountTreeOutlinedIcon />
              <Typography variant="h5">Ongoing Workflows</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: 'none', height: 36 }}
              startIcon={<span>＋</span>}>
              Start New Workflow
            </Button>
          </Box>
          <Typography
            component="a"
            href="#"
            sx={{
              color: 'primary.main',
              textDecoration: 'underline',
              fontSize: 16,
            }}>
            View Past Workflows
          </Typography>
        </Box>
      </Box>

      <Typography textAlign="center" marginTop={4} color="text.secondary">
        No Ongoing Workflows
      </Typography>
    </Paper>
  );
};
