import {
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import Typography from '@mui/material/Typography';
import * as handlers from '../multiFieldComponents/handlers';
import { FieldEditorProps } from './types';

export const DateFieldEditor = ({ hook }: FieldEditorProps) => (
  <>
    <Grid item>
      <FormControlLabel
        style={{ marginLeft: 0, marginTop: 5 }}
        control={
          <Switch
            checked={hook.allowPastDates}
            onChange={(e) =>
              handlers.handleAllowPastDatesChange(
                e,
                hook.setAllowPastDates,
                hook.setFormDirty,
                hook.setFieldChanged,
                hook.fieldChanged
              )
            }
            data-testid="allow-past-dates-switch"
          />
        }
        label={
          <FormLabel id="allow-past-dates-label" style={{ display: 'flex' }}>
            <Typography variant="h6">Allow Past Dates</Typography>
            <Tooltip
              disableFocusListener
              disableTouchListener
              title={'Allow past dates in your form'}
              arrow
              placement="right">
              <IconButton>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </FormLabel>
        }
        labelPlacement="start"
      />
    </Grid>
    <Grid item>
      <FormControlLabel
        style={{ marginLeft: 0, marginTop: 5 }}
        control={
          <Switch
            checked={hook.allowFutureDates}
            onChange={(e) =>
              handlers.handleAllowFutureDatesChange(
                e,
                hook.setAllowFutureDates,
                hook.setFormDirty,
                hook.setFieldChanged,
                hook.fieldChanged
              )
            }
            data-testid="allow-future-dates-switch"
          />
        }
        label={
          <FormLabel id="allow-future-dates-label" style={{ display: 'flex' }}>
            <Typography variant="h6">Allow Future Dates</Typography>
            <Tooltip
              disableFocusListener
              disableTouchListener
              title={'Allow future dates in your form'}
              arrow
              placement="right">
              <IconButton>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </FormLabel>
        }
        labelPlacement="start"
      />
    </Grid>
  </>
);
