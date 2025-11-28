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
  const mockOptions: WorkflowNextStepOption[] = [
    {
      branchId: 'branch-1',
      stepId: 'test-workflow-instance-1-step2',
      title: 'Name Assessment',
      isRecommended: true,
      ruleDetails: [
        'Rule: patient.age < 32',
        'Resolved: patient.age = 30',
        'Status: TRUE',
      ],
    },
    {
      branchId: 'branch-2',
      stepId: 'test-workflow-instance-1-step3',
      title: 'Schedule Follow-up',
      isRecommended: false,
      ruleDetails: [
        'Rule: patient.age >= 32',
        'Resolved: patient.age = 30',
        'Status: FALSE',
      ],
    },
  ];

  const test = (e: any) => {
    // TODO: TO REMOVE AFTER DEBUG
    setSelectedId(e.target.value);
    console.log(e.target.value);
  };

  return (
    <Box sx={{ width: 400 }}>
      <RadioGroup value={selectedId} onChange={test}>
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
