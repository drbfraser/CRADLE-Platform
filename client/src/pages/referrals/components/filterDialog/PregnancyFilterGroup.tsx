import {
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { FilterDialogState } from './types';

type Props = Pick<
  FilterDialogState,
  'isPregnant' | 'setIsPregnant' | 'handleRadioButtonClick'
>;

export const PregnancyFilterGroup = ({
  isPregnant,
  setIsPregnant,
  handleRadioButtonClick,
}: Props) => (
  <Grid size={6}>
    <Typography variant="h4" component="h3">
      Pregnant
    </Typography>
    <RadioGroup
      aria-label="isPregnant"
      value={isPregnant ?? ''}
      onChange={(_, value) => setIsPregnant(value)}>
      <FormControlLabel
        value="1"
        control={
          <Radio
            checked={isPregnant === '1'}
            onClick={(event) => {
              handleRadioButtonClick(event, isPregnant, setIsPregnant);
            }}
          />
        }
        label="Yes"
      />
      <FormControlLabel
        value="0"
        control={
          <Radio
            checked={isPregnant === '0'}
            onClick={(event) => {
              handleRadioButtonClick(event, isPregnant, setIsPregnant);
            }}
          />
        }
        label="No"
      />
    </RadioGroup>
  </Grid>
);
