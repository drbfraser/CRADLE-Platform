import { FormLabel, Grid, IconButton, Tooltip } from '@mui/material';
import { PrimaryButton } from 'src/shared/components/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction } from 'react';
import { McOption } from 'src/shared/types/form/formTypes';
import * as handlers from './handlers';
import { capitalize } from 'src/shared/utils';

interface IProps {
  numChoices: number;
  inputLanguages: string[];
  fieldChanged: boolean;
  mcOptions: McOption[];
  setNumChoices: Dispatch<SetStateAction<number>>;
  setFieldChanged: Dispatch<SetStateAction<boolean>>;
  setFormDirty: Dispatch<SetStateAction<boolean>>;
  setMcOptions: Dispatch<SetStateAction<McOption[]>>;
  getMcOptionValue: (language: string, index: number) => string;
  updateMcOption?: (index: number, language: string, value: string) => void;
}

const MultiChoice = ({
  numChoices,
  inputLanguages,
  fieldChanged,
  mcOptions,
  setNumChoices,
  setFieldChanged,
  setFormDirty,
  setMcOptions,
  getMcOptionValue,
  updateMcOption,
}: IProps) => {
  return (
    <Grid item container spacing={3}>
      <Grid item xs={12}>
        <PrimaryButton
          type="button"
          onClick={() => {
            handlers.handleAddChoice(
              numChoices,
              inputLanguages,
              setNumChoices,
              mcOptions,
              setMcOptions
            );
            setFieldChanged(!fieldChanged);
            setFormDirty(true);
          }}>
          {'Add Option'}
        </PrimaryButton>
      </Grid>
      <Grid item container spacing={3}>
        {Array.from(Array(numChoices).keys()).map((_, index) => (
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
                      numChoices,
                      mcOptions,
                      inputLanguages,
                      setNumChoices,
                      setMcOptions
                    );
                    setFieldChanged(!fieldChanged);
                    setFormDirty(true);
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
                  key={`${capitalize(lang)}-mult-choice-option-${
                    index + 1
                  }-body`}>
                  <TextField
                    key={`${capitalize(lang)}-field-name-mult-choice-option-${
                      index + 1
                    }`}
                    label={`${capitalize(lang)} Option ${index + 1}`}
                    required={true}
                    variant="outlined"
                    value={getMcOptionValue(lang, index)}
                    fullWidth
                    multiline
                    size="small"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      if (updateMcOption) {
                        // Use the hook's update function if provided
                        updateMcOption(index, lang, e.target.value);
                      } else {
                        // Fallback to handler
                        handlers.handleMultiChoiceOptionChange(
                          lang,
                          e.target.value,
                          index,
                          mcOptions,
                          setMcOptions
                        );
                      }
                      setFieldChanged(!fieldChanged);
                      setFormDirty(true);
                    }}
                    inputProps={{
                      maxLength: Number.MAX_SAFE_INTEGER,
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
};

export default MultiChoice;
