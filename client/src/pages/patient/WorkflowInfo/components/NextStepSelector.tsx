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
import { useState } from 'react';

export default function NextStepSelector() {
  const [selectedId, setSelectedId] = useState('branch-1');

  const mockOptions: NextStepOption[] = [
    {
      id: 'branch-1',
      title: 'Check Patient Age',
      isRecommended: true,
      ruleDetails: [
        'Rule: patient.age < 32',
        'Resolved: patient.age = 30',
        'Status: TRUE',
      ],
    },
    {
      id: 'branch-2',
      title: 'Schedule Follow-up',
      isRecommended: false,
      ruleDetails: [
        'Rule: patient.age >= 32',
        'Resolved: patient.age = 30',
        'Status: FALSE',
      ],
    },
    {
      id: 'branch-3',
      title: 'Refer to Specialist',
      isRecommended: false,
      ruleDetails: [
        'Rule: measurement > 7',
        'Resolved: measurement = 4',
        'Status: FALSE',
      ],
    },
  ];

  return (
    <Box sx={{ width: 400 }}>
      <RadioGroup
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}>
        {mockOptions.map((opt) => (
          <Box
            key={opt.id}
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
                value={opt.id}
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
