import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Typography,
  Tooltip,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { WorkflowNextStepOption } from 'src/shared/types/workflow/workflowUiTypes';

interface IProps {
  selectedId: string;
  setSelectedId: React.Dispatch<React.SetStateAction<string>>;
  options: WorkflowNextStepOption[];
}

export default function NextStepSelector({
  selectedId,
  setSelectedId,
  options,
}: IProps) {
  return (
    <Box sx={{ width: '35vw' }}>
      <RadioGroup
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}>
        {options.map((opt) => (
          <Box
            key={opt.stepId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              p: 1.5,
              borderRadius: 1,
              border: '1px solid #ddd',
            }}>
            <Box>
              <FormControlLabel
                value={opt.stepId}
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>{opt.title}</Typography>

                    {opt.isRecommended && (
                      <Typography
                        sx={{ ml: 1, color: 'primary.main', fontSize: 12 }}>
                        {'(Recommended)'}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </Box>

            <Tooltip
              title={
                <Box>
                  {opt.ruleDetails.map((line, i) => (
                    <Typography key={i} variant="body2">
                      {line}
                    </Typography>
                  ))}
                </Box>
              }
              placement="right"
              arrow>
              <IconButton size="small">
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </RadioGroup>
    </Box>
  );
}
