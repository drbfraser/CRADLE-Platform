import {
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as handlers from '../multiFieldComponents/handlers';
import { FieldEditorProps } from './types';

export const StringFieldEditor = ({ hook }: FieldEditorProps) => (
  <Grid item>
    <FormControlLabel
      style={{ marginLeft: 0 }}
      control={
        <Switch
          checked={hook.isNumOfLinesRestricted}
          onChange={(e) =>
            handlers.handleIsNumOfLinesRestrictedChange(
              e,
              hook.setIsNumOfLinesRestricted,
              hook.setFormDirty,
              hook.setFieldChanged,
              hook.setStringMaxLines,
              hook.fieldChanged
            )
          }
          data-testid="lines-num-restriction-switch"
        />
      }
      label={
        <FormLabel
          id="lines-num-restriction-label"
          style={{ display: 'flex' }}>
          <Typography variant="h6">Restrict Max Lines</Typography>
          <Tooltip
            disableFocusListener
            disableTouchListener
            title={'Restrict the number of lines for this field'}
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

    {hook.isNumOfLinesRestricted && (
      <Grid item>
        <TextField
          label={`Max Lines`}
          required={hook.isNumOfLinesRestricted}
          variant="outlined"
          fullWidth
          size="small"
          defaultValue={
            !isNaN(Number(hook.stringMaxLines)) &&
            Number(hook.stringMaxLines) > 0
              ? Number(hook.stringMaxLines)
              : ``
          }
          inputProps={{
            maxLength: Number.MAX_SAFE_INTEGER,
            min: 0,
          }}
          onChange={(e) => {
            hook.setStringMaxLines(e.target.value);
            hook.setFieldChanged(!hook.fieldChanged);
            hook.setFormDirty(true);
          }}
        />
      </Grid>
    )}
  </Grid>
);
