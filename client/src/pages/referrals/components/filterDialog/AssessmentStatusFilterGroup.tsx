import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { FilterDialogState } from './types';

type Props = Pick<
  FilterDialogState,
  'isAssessed' | 'setIsAssessed' | 'handleRadioButtonClick'
>;

export const AssessmentStatusFilterGroup = ({
  isAssessed,
  setIsAssessed,
  handleRadioButtonClick,
}: Props) => (
  <Grid size={6}>
    <Typography variant="h4" component="h3">
      Assessment Status
    </Typography>
    <RadioGroup
      aria-label="isAssessed"
      value={isAssessed ?? ''}
      onChange={(_, value) => setIsAssessed(value)}>
      <FormControlLabel
        value="1"
        control={
          <Radio
            checked={isAssessed === '1'}
            onClick={(event) => {
              handleRadioButtonClick(event, isAssessed, setIsAssessed);
            }}
          />
        }
        label={
          <>
            <DoneIcon sx={{ color: '#4caf50', padding: '2px' }} />
            Complete
          </>
        }
      />
      <FormControlLabel
        value="0"
        control={
          <Radio
            checked={isAssessed === '0'}
            onClick={(event) => {
              handleRadioButtonClick(event, isAssessed, setIsAssessed);
            }}
          />
        }
        label={
          <>
            <ScheduleIcon sx={{ color: '#f44336', padding: '2px' }} />
            Pending
          </>
        }
      />
    </RadioGroup>
  </Grid>
);
