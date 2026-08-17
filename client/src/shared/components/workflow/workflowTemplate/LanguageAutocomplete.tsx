import { Autocomplete, SxProps, TextField, Theme } from '@mui/material';

interface LanguageAutocompleteProps {
  options: string[];
  value: string;
  onChange: (newValue: string) => void;
  label?: string;
  sx?: SxProps<Theme>;
}

export const LanguageAutocomplete = ({
  options,
  value,
  onChange,
  label = 'View Language',
  sx,
}: LanguageAutocompleteProps) => (
  <Autocomplete
    disableClearable
    options={options}
    value={value}
    onChange={(_, newValue) => onChange(newValue)}
    sx={sx}
    renderInput={(params) => (
      <TextField {...params} label={label} size="small" />
    )}
  />
);
