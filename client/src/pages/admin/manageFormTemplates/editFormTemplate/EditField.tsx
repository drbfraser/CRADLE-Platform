import {
  // Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormLabel,
  // FormControl,
  Grid,
  Radio,
  RadioGroup,
  Table,
  TableCell,
  TableRow,
  // MenuItem,
} from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
// import {ListItem } from 'semantic-ui-react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SetStateAction, useState } from 'react';
import { TableHeader } from 'semantic-ui-react';
// import InputLabel from '@mui/material/InputLabel';
// import { SelectChangeEvent } from '@mui/material/Select';
// import ListItemText from '@mui/material/ListItemText';
// import { useEffect, useState } from 'react';
// import makeStyles from "@mui/styles/makeStyles";

interface IProps {
  open: boolean;
  onClose: () => void;
  inputLanguages: string[];
  // users: IUser[];
  // editUser?: IUser;
}

// interface IFieldTypes {
//   value: string,
//   label: string,
//   render?: () => React.ReactNode
// }

const EditField = ({ open, onClose, inputLanguages }: IProps) => {
  // const classes = useStyles();
  // const [language, setLanguage] = useState<string[]>([]);
  const [fieldType, setFieldType] = useState<string>();

  // useEffect(() => {
  //   setLanguage([]);
  // }, [inputLanguages]);

  // const handleChange = (event: SelectChangeEvent<typeof language>) => {
  //   const {
  //     target: { value },
  //   } = event;
  //   setLanguage(
  //     // On autofill we get a stringified value.
  //     typeof value === 'string' ? value.split(',') : value
  //   );
  // };

  const fieldTypes = {
    category: {
      value: 'category',
      label: 'Category',
      render: () => <>category goes here</>,
    },
    number: {
      value: 'number',
      label: 'Number',
      render: () => <>number goes here</>,
    },
    text: {
      value: 'text',
      label: 'Text',
      render: () => <>text goes here</>,
    },
    mult_choice: {
      value: 'mult_choice',
      label: 'Multiple Choice',
      render: () => (
        <Table>
          <TableRow>
            {inputLanguages.map((lang) => (
              <TableCell size="small" key={lang + 'mult-choice-option-1-body'}>
                <TextField
                  key={lang + '-field-name-mult-choice-option1'}
                  label={lang + ' Option 1'}
                  // defaultValue={'Title'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(event: any) => {
                    //it is originally a string type!! need transfer
                  }}
                />
              </TableCell>
            ))}
            <TableCell>
              <CancelButton>
                <RemoveCircleOutlineIcon />
              </CancelButton>
            </TableCell>
          </TableRow>
        </Table>
      ),
    },
    date: {
      value: 'date',
      label: 'Date',
      render: () => <>date goes here</>,
    },
  };
  const handleRadioChange = (event: {
    target: { value: SetStateAction<string | undefined> };
  }) => {
    setFieldType(event.target.value);
  };

  return (
    <>
      {/*<APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />*/}
      <Dialog open={open} maxWidth="lg" fullWidth>
        <DialogTitle>Create Field</DialogTitle>
        <DialogContent>
          {/*<Grid container spacing={3}>*/}
          <Table>
            <TableHeader>
              <TableRow>
                {inputLanguages.map((lang) => (
                  <TableCell key={lang + '-title'}>{lang}</TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableRow>
              {inputLanguages.map((lang) => (
                <TableCell size="small" key={lang + '-body'}>
                  <TextField
                    key={lang + '-field-name'}
                    label={lang + ' Field Name'}
                    // defaultValue={'Title'}
                    required={true}
                    variant="outlined"
                    fullWidth
                    multiline
                    size="small"
                    inputProps={{
                      maxLength: Number.MAX_SAFE_INTEGER,
                    }}
                    onChange={(event: any) => {
                      //it is originally a string type!! need transfer
                    }}
                  />
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell key="question-id-cell">
                <TextField
                  label={'Question ID'}
                  key={'question-id'}
                  // defaultValue={'Title'}
                  required={true}
                  variant="outlined"
                  fullWidth
                  multiline
                  size="small"
                  inputProps={{
                    maxLength: Number.MAX_SAFE_INTEGER,
                  }}
                  onChange={(event: any) => {
                    //it is originally a string type!! need transfer
                  }}
                />
              </TableCell>
            </TableRow>
          </Table>
          <br />
          <Grid container spacing={3}>
            <Grid item sm={12} md={2} lg={2}>
              <FormLabel id="field-type-label">
                <Typography variant="h6">Field Type</Typography>
              </FormLabel>
            </Grid>
            <Grid item sm={12} md={6} lg={6}>
              <RadioGroup
                aria-labelledby="field-type-label"
                // defaultValue="category"
                name="field-type-group"
                row
                onChange={handleRadioChange}>
                {Object.values(fieldTypes).map((field) => (
                  <FormControlLabel
                    key={field.label}
                    value={field.value}
                    control={<Radio />}
                    label={field.label}
                  />
                ))}
              </RadioGroup>
            </Grid>
          </Grid>

          {fieldType
            ? // @ts-ignore
              fieldTypes[fieldType].render()
            : ''}
        </DialogContent>
        <DialogActions>
          <CancelButton type="button" onClick={onClose}>
            Cancel
          </CancelButton>
          <PrimaryButton type="submit">
            {/* disabled={isSubmitting || !isValid}>*/}
            {/* {creatingNew ? 'Create' : 'Save'}*/}
            {'Save'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

// const useStyles = makeStyles({
//   horizontal_bullet: {
//     display: 'flex',
//     flexDirection: 'row',
//     // padding: 0,
//   }
// });

export default EditField;
