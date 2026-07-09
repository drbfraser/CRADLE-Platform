import {
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Switch,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dispatch, SetStateAction } from 'react';
import { TQuestion } from 'src/shared/types/form/formTemplateTypes';
import { QuestionTypeEnum } from 'src/shared/enums';
import { capitalize } from 'src/shared/utils';
import EditVisibleCondition from '../EditVisibleCondition';
import * as handlers from '../multiFieldComponents/handlers';
import { FIELD_TYPE_ENTRIES } from '../fieldTypeRegistry';
import { EditFieldHook } from './types';

interface EditFieldFormBodyProps {
  hook: EditFieldHook;
  inputLanguages: string[];
  question?: TQuestion;
  questionsArr: TQuestion[];
  visibilityDisabled: boolean;
  visibilityToggle: boolean;
  setVisibilityToggle: Dispatch<SetStateAction<boolean>>;
  FieldEditor: React.ComponentType<{
    hook: EditFieldHook;
    inputLanguages: string[];
  }> | null;
}

export const EditFieldFormBody = ({
  hook,
  inputLanguages,
  question,
  questionsArr,
  visibilityDisabled,
  visibilityToggle,
  setVisibilityToggle,
  FieldEditor,
}: EditFieldFormBodyProps) => (
  <>
    <Grid container spacing={3}>
      <Grid item container xs={12}>
        <FormLabel id="field-details-label">
          <Typography variant="h6">Field Details</Typography>
        </FormLabel>
        <Tooltip
          disableFocusListener
          disableTouchListener
          title={
            <>
              <b>Field Text:</b> Enter a heading for your form question
              <br />
              <b>Question ID:</b> Enter a value to uniquely identify this field
            </>
          }
          arrow
          placement="right">
          <IconButton>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>

      {inputLanguages.map((lang) => (
        <Grid item xs={12} key={lang + '-field-text'}>
          <TextField
            label={capitalize(lang) + ' Field Text'}
            required={true}
            variant="outlined"
            fullWidth
            multiline
            size="small"
            defaultValue={hook.getFieldName(lang)}
            inputProps={{ maxLength: Number.MAX_SAFE_INTEGER }}
            onChange={(e) => {
              hook.addFieldToQuestionLangVersions(lang, e.target.value);
              hook.setFieldChanged(!hook.fieldChanged);
              hook.setFormDirty(true);
            }}
          />
        </Grid>
      ))}

      {hook.fieldType != 'category' && (
        <Grid item xs={12}>
          <TextField
            label={'Question ID'}
            required={true}
            variant="outlined"
            fullWidth
            multiline
            value={hook.userQuestionId || ''}
            size="small"
            inputProps={{ maxLength: Number.MAX_SAFE_INTEGER }}
            onChange={(e) => {
              const formatted = e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '_');
              hook.setUserQuestionId(formatted);
              hook.setFieldChanged(!hook.fieldChanged);
              hook.setFormDirty(true);
            }}
          />
        </Grid>
      )}

      <Grid item container sm={12} md={2} lg={2}>
        <FormLabel id="field-type-label">
          <Typography variant="h6">Field Type</Typography>
        </FormLabel>
        <Tooltip
          disableFocusListener
          disableTouchListener
          title="Select a type for your field. For Multiple Choice and Multi Select options, Add Options to your field as you would like them to appear on your form."
          arrow
          placement="right">
          <IconButton>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item sm={12} md={10} lg={10}>
        <RadioGroup
          aria-labelledby="field-type-label"
          name="field-type-group"
          row
          value={hook.fieldType}
          onChange={(e) => {
            handlers.handleRadioChange(
              e,
              hook.setFieldType,
              hook.setFieldChanged,
              hook.setFormDirty,
              hook.fieldChanged
            );
          }}>
          {FIELD_TYPE_ENTRIES.map((field) => (
            <FormControlLabel
              key={field.label}
              value={field.value}
              control={<Radio />}
              label={field.label}
            />
          ))}
        </RadioGroup>
      </Grid>

      {FieldEditor ? (
        <FieldEditor hook={hook} inputLanguages={inputLanguages} />
      ) : null}

      {questionsArr.some(
        (q) => q != question && q.questionType != QuestionTypeEnum.CATEGORY
      ) && (
        <>
          <Grid item container sm={12} md={10} lg={10}>
            <FormControlLabel
              style={{ marginLeft: 0 }}
              control={
                <Switch
                  checked={visibilityToggle}
                  disabled={visibilityDisabled}
                  onChange={(e) =>
                    handlers.handleVisibilityChange(
                      e,
                      setVisibilityToggle,
                      hook.setFormDirty,
                      hook.setFieldChanged,
                      hook.fieldChanged
                    )
                  }
                  data-testid="conditional-switch"
                />
              }
              label={
                <FormLabel id="vis-label" style={{ display: 'flex' }}>
                  <Typography variant="h6">Conditional Visibility</Typography>
                  <Tooltip
                    disableFocusListener
                    disableTouchListener
                    title={
                      visibilityDisabled
                        ? 'Cannot edit if category already has a visibility condition'
                        : 'Set this field to only appear after a specific field value is entered'
                    }
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
          <Grid item sm={12} md={10} lg={10}>
            {visibilityToggle ? (
              <EditVisibleCondition
                key={hook.editVisCondKey}
                currVisCond={
                  hook.visibleCondition[0] ??
                  question?.visibleCondition[0] ??
                  null
                }
                disabled={visibilityDisabled}
                filteredQs={questionsArr.filter(
                  (q) =>
                    q != question && q.questionType != QuestionTypeEnum.CATEGORY
                )}
                setVisibleCondition={hook.setVisibleCondition}
                setIsVisCondAnswered={hook.setIsVisCondAnswered}
                setFieldChanged={hook.setFieldChanged}
              />
            ) : null}
          </Grid>
        </>
      )}
    </Grid>

    {hook.fieldType != 'category' && (
      <Grid item>
        <FormControlLabel
          style={{ marginLeft: 0 }}
          control={
            <Switch
              checked={hook.isRequired}
              onChange={(e) =>
                handlers.handleRequiredChange(
                  e,
                  hook.setIsRequired,
                  hook.setFormDirty,
                  hook.setFieldChanged,
                  hook.fieldChanged
                )
              }
              data-testid="required-switch"
            />
          }
          label={
            <FormLabel id="required-label" style={{ display: 'flex' }}>
              <Typography variant="h6">Required</Typography>
              <Tooltip
                disableFocusListener
                disableTouchListener
                title={'Make this field required in your form'}
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
    )}
  </>
);
