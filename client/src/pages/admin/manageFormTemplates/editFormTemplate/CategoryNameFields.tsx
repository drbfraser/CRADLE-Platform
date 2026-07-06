import { Grid, TextField } from '@mui/material';
import { capitalize } from 'src/shared/utils';

type CategoryNameFieldsProps = {
  inputLanguages: string[];
  questionText: Record<string, string>;
  onNameChange: (language: string, value: string) => void;
};

export const CategoryNameFields = ({
  inputLanguages,
  questionText,
  onNameChange,
}: CategoryNameFieldsProps) => (
  <>
    {inputLanguages.map((lang) => (
      <Grid item xs={12} key={lang + '-category-name'}>
        <TextField
          key={lang + '-field-text'}
          label={capitalize(lang) + ' Category Name'}
          required={true}
          variant="outlined"
          fullWidth
          size="small"
          value={questionText[lang.toLowerCase()] ?? ''}
          inputProps={{
            maxLength: Number.MAX_SAFE_INTEGER,
          }}
          onChange={(e) => onNameChange(lang, e.target.value)}
        />
      </Grid>
    ))}
  </>
);
