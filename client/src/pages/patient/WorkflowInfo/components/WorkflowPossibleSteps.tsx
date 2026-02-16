import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Badge,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ArticleIcon from '@mui/icons-material/Article';

import { Tooltip, IconButton } from '@mui/material';
import { InstanceDetails } from 'src/shared/types/workflow/workflowUiTypes';

export default function WorkflowPossibleSteps(props: {
  workflowInstance: InstanceDetails;
  handleMakeCurrent: (stepId: string, title: string) => void;
}) {
  const { workflowInstance, handleMakeCurrent } = props;

  return (
    <>
      <Box sx={{ mx: 5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6">Possible Steps</Typography>{' '}
          <Tooltip
            title="You may override the workflow order and skip to a new step."
            placement="top">
            <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Tooltip>
        </Box>

        <Paper variant="outlined" sx={{ borderRadius: '12px', p: 3 }}>
          {workflowInstance.possibleSteps.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', py: 4 }}>
              No optional steps available.
            </Typography>
          ) : (
            <>
              <List disablePadding>
                {workflowInstance.possibleSteps.map((path) => (
                  path.branch.map((step) =>(
                    <ListItem
                      key={step.id}
                      sx={{
                        border: 1,
                        borderColor: 'grey.300',
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': { bgcolor: 'grey.50' },
                      }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight={600}>
                            {step.title}
                          </Typography>
                        }
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip
                            title="Set this as current step"
                            placement="top">
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleMakeCurrent(step.id, step.title)
                              }>
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                          {step.form && (
                            <Tooltip
                              title="This step has an associated form"
                              placement="top">
                              <IconButton size="small" disabled>
                                <ArticleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </ListItem>
                  ))
                ))}
              </List>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, textAlign: 'center', display: 'block' }}>
                If a step has a form, the icon will be shown.
              </Typography>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
}
