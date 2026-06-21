import { FormLabel, Grid, IconButton, Tooltip } from '@mui/material';
import { PrimaryButton } from 'src/shared/components/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import * as handlers from '../multiFieldComponents/handlers';
import { FieldEditorProps } from './types';

export const MultipleSelectFieldEditor = ({
  hook,
  inputLanguages,
}: FieldEditorProps) => (
  <Grid item container spacing={3}>
    <Grid item xs={12}>
      <PrimaryButton
        type="button"
        onClick={() => {
          handlers.handleAddChoice(
            hook.numChoices,
            inputLanguages,
            hook.setNumChoices,
            hook.mcOptions,
            hook.setMcOptions
          );
          hook.setFieldChanged(!hook.fieldChanged);
          hook.setFormDirty(true);
        }}>
        {'Add Option'}
      </PrimaryButton>
    </Grid>
    <Grid item container spacing={3}>
      {Array.from(Array(hook.numChoices).keys()).map((_, index) => (
        <Grid item xs={12} key={`option-${index}`}>
          <Grid
            item
            container
            xs={12}
            sm={6}
            md={4}
            lg={3}
            justifyContent="space-between">
            <FormLabel id="field-type-label" style={{ paddingBottom: '8px' }}>
              <Typography variant="h6">Option {index + 1}</Typography>
            </FormLabel>

            <Tooltip
              disableFocusListener
              disableTouchListener
              title={'Delete field'}
              placement="right"
              arrow>
              <IconButton
                key={`remove-option-${index + 1}`}
                color="error"
                style={{ padding: '0px' }}
                onClick={() => {
                  handlers.handleRemoveMultiChoice(
                    index,
                    hook.numChoices,
                    hook.mcOptions,
                    inputLanguages,
                    hook.setNumChoices,
                    hook.setMcOptions
                  );
                  hook.setFieldChanged(!hook.fieldChanged);
                  hook.setFormDirty(true);
                }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item container>
            {inputLanguages.map((lang) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={`${lang}-mult-select-option-${index + 1}-body`}>
                <TextField
                  key={`${lang}-field-name-mult-select-option-${index + 1}`}
                  label={`${lang} Option ${index + 1}`}
                  required={true}
                  variant="outlined"
                  value={hook.getMcOptionValue(lang, index)}
                  fullWidth
                  multiline
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(e) => {
                    hook.updateMcOption(index, lang, e.target.value);
                    hook.setFieldChanged(!hook.fieldChanged);
                    hook.setFormDirty(true);
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      ))}
    </Grid>
  </Grid>
);
