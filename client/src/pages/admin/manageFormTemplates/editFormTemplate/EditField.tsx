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
  // MenuItem,
} from '@mui/material';
import {
  CancelButton,
  PrimaryButton,
} from '../../../../shared/components/Button';
// import {ListItem } from 'semantic-ui-react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SetStateAction, useState } from 'react';
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

// const panes = [
//   {
//     menuItem: 'Category',
//     render: () => <Tab.Pane></Tab.Pane>,
//   },
//   {
//     menuItem: 'Number',
//     render: () => <Tab.Pane></Tab.Pane>,
//   },
//   {
//     menuItem: 'Text',
//     render: () => <Tab.Pane></Tab.Pane>,
//   },
//   {
//     menuItem: 'Multiple Choice',
//     render: () => <Tab.Pane></Tab.Pane>,
//   },
//   {
//     menuItem: 'Date',
//     render: () => <Tab.Pane></Tab.Pane>,
//   },
// ];

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
          <Grid container spacing={3}>
            <Grid item sm={12} md={6} lg={4}>
              <TextField
                label={'Field Name'}
                // defaultValue={'Title'}
                required={true}
                variant="outlined"
                fullWidth
                multiline
                inputProps={{
                  maxLength: Number.MAX_SAFE_INTEGER,
                }}
                onChange={(event: any) => {
                  //it is originally a string type!! need transfer
                }}
              />
            </Grid>
            <Grid item sm={12} md={6} lg={4}>
              <TextField
                label={'Question ID'}
                // defaultValue={'Title'}
                required={true}
                variant="outlined"
                fullWidth
                multiline
                inputProps={{
                  maxLength: Number.MAX_SAFE_INTEGER,
                }}
                onChange={(event: any) => {
                  //it is originally a string type!! need transfer
                }}
              />
            </Grid>
            {/*<Grid item sm={12} md={6} lg={4}>*/}
            {/*  <FormControl fullWidth variant="outlined">*/}
            {/*    <InputLabel>Language *</InputLabel>*/}
            {/*    <Select*/}
            {/*      label={'Language'}*/}
            {/*      fullWidth*/}
            {/*      required={true}*/}
            {/*      multiple*/}
            {/*      multiline*/}
            {/*      variant="outlined"*/}
            {/*      onChange={handleChange}*/}
            {/*      value={language}*/}
            {/*      renderValue={(selected: any[]) => selected.join(', ')}>*/}
            {/*      {inputLanguages.map((value) => (*/}
            {/*        <MenuItem key={value} value={value}>*/}
            {/*          /!*{value}*!/*/}
            {/*          <Checkbox checked={language.indexOf(value) > -1} />*/}
            {/*          <ListItemText primary={value} />*/}
            {/*        </MenuItem>*/}
            {/*      ))}*/}
            {/*    </Select>*/}
            {/*  </FormControl>*/}
            {/*</Grid>*/}
          </Grid>
          {/*<Grid container spacing={3}>*/}
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
                <FormControlLabel
                  value="category"
                  control={<Radio />}
                  label="Category"
                />
                <FormControlLabel
                  value="number"
                  control={<Radio />}
                  label="Number"
                />
                <FormControlLabel
                  value="text"
                  control={<Radio />}
                  label="Text"
                />
                <FormControlLabel
                  value="multiple_choice"
                  control={<Radio />}
                  label="Multiple Choice"
                />
                <FormControlLabel
                  value="date"
                  control={<Radio />}
                  label="Date"
                />
              </RadioGroup>
            </Grid>
          </Grid>
          {fieldType}

          {/*</Grid>*/}

          {/*<Tab*/}
          {/*  menu={{*/}
          {/*    secondary: true,*/}
          {/*    pointing: true,*/}
          {/*    className: {*/}
          {/*      display: `fluid`,*/}
          {/*      flexDirection: `row`,*/}
          {/*      flexWrap: `wrap`,*/}
          {/*    },*/}
          {/*  }}*/}
          {/*  panes={panes}*/}
          {/*/>*/}
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
