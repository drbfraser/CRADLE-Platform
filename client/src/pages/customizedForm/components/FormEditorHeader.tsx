import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Field } from 'formik';
import { Autocomplete, AutocompleteRenderInputParams } from 'formik-mui';
import { InputAdornment, TextField, Tooltip } from '@mui/material';
import { capitalize } from 'src/shared/utils';

type FormEditorHeaderProps = {
  languages: string[];
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
};

export const FormEditorHeader = ({
  languages,
  selectedLanguage,
  onLanguageChange,
}: FormEditorHeaderProps) => (
  <Grid item container spacing={3}>
    <Grid item container xs={12} sm={8}>
      <h2>Current Form</h2>
      <div>
        <Tooltip
          disableFocusListener
          disableTouchListener
          title={
            <>
              <EditIcon fontSize="inherit" /> Click to open and edit your field.
              <br />
              <DeleteIcon fontSize="inherit" /> Click to delete your field.
              <br />
              <KeyboardArrowUpIcon fontSize="inherit" /> Click to move field up.
              <br />
              <KeyboardArrowDownIcon fontSize="inherit" /> Click to move field
              down.
            </>
          }
          arrow
          placement="right">
          <IconButton>
            <InfoIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </Grid>
    <Grid item container xs={12} sm={4}>
      <Field
        key="view-lang"
        value={selectedLanguage}
        component={Autocomplete}
        fullWidth
        name={languages[0]}
        options={languages.map((lang) => capitalize(lang))}
        disableClearable={true}
        onChange={(_event: unknown, value: string) => {
          onLanguageChange(value);
        }}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField
            {...params}
            name={languages[0]}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <Tooltip
                    disableFocusListener
                    disableTouchListener
                    title="Select view language for your form"
                    arrow>
                    <InputAdornment position="end">
                      <IconButton>
                        <InfoIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  </Tooltip>
                </>
              ),
            }}
            helperText=""
            label="View Language"
            variant="outlined"
            required
          />
        )}
      />
    </Grid>
  </Grid>
);
