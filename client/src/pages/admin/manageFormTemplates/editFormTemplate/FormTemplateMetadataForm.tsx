import { Dispatch, SetStateAction } from 'react';
import { Field } from 'formik';
import {
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { FormTemplateWithQuestionsV2 } from 'src/shared/types/form/formTemplateTypes';
import LanguageModal from './LanguageModal';
import { capitalize } from 'src/shared/utils';

type FormTemplateMetadataFormProps = {
  form: FormTemplateWithQuestionsV2;
  currentLanguage: string;
  language: string[];
  editFormId?: string;
  versionError: boolean;
  setForm: Dispatch<SetStateAction<FormTemplateWithQuestionsV2>>;
  setLanguage: Dispatch<SetStateAction<string[]>>;
  setVersionError: Dispatch<SetStateAction<boolean>>;
  previousVersions?: Array<number | string>;
};

export const FormTemplateMetadataForm = ({
  form,
  currentLanguage,
  language,
  editFormId,
  versionError,
  setForm,
  setLanguage,
  setVersionError,
  previousVersions,
}: FormTemplateMetadataFormProps) => {
  const langKey = currentLanguage.toLowerCase();
  const titleValue = form.classification.name[langKey] ?? '';
  const titleMissing = !titleValue || titleValue.trim() === '';

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>Custom Form Properties</h2>
        </Grid>

        <Grid item xs={12} md={4}>
          <Field
            label="Title"
            component={TextField}
            required={true}
            variant="outlined"
            value={titleValue}
            fullWidth
            inputProps={{ maxLength: 100 }}
            error={titleMissing}
            helperText={
              titleMissing ? `${currentLanguage} title is required` : ''
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const isEnglishLanguage = langKey === 'english';

              setForm((prev) => ({
                ...prev,
                classification: {
                  ...prev.classification,
                  name: {
                    ...prev.classification.name,
                    [langKey]: e.target.value,
                  },
                  nameStringId: isEnglishLanguage
                    ? undefined
                    : prev.classification.nameStringId,
                },
                id: editFormId ? prev.id : undefined,
              }));
            }}
            InputProps={{
              endAdornment: (
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title="Enter your form title here"
                  arrow>
                  <InputAdornment position="end">
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                </Tooltip>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Field
            label="Version"
            component={TextField}
            required={true}
            variant="outlined"
            value={form.version}
            error={versionError}
            helperText={versionError ? 'Must change version number' : ''}
            fullWidth
            inputProps={{ maxLength: 30 }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const newVersion = Number(e.target.value);
              setForm((prev) => ({ ...prev, version: newVersion }));
              setVersionError(
                previousVersions?.includes(newVersion) ?? false
              );
            }}
            InputProps={{
              endAdornment: (
                <Tooltip
                  disableFocusListener
                  disableTouchListener
                  title={
                    editFormId
                      ? 'Edit your form Version here'
                      : 'Edit your form Version here. By default, Version is set to the current DateTime but can be edited'
                  }
                  arrow>
                  <InputAdornment position="end">
                    <IconButton>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                </Tooltip>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <LanguageModal
            language={language.map((lang) => capitalize(lang))}
            setLanguage={setLanguage}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
