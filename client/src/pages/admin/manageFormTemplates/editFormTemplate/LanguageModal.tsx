import React, { useState } from 'react';
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

import { LanguageModalProps } from 'src/shared/types';
import { getLanguages } from 'src/shared/utils';
import { PrimaryButton } from 'src/shared/components/Button';

const LanguageModal = ({ language, setLanguage }: LanguageModalProps) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showLanguageWarning, setShowLanguageWarning] =
    useState<boolean>(false);
  const languageOptions = getLanguages();

  // handles the change of the multi-select language
  const handleLanguageChange = (
    target: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.checked) {
      setLanguage((prevState) => {
        return [...prevState, target];
      });
    } else {
      setLanguage((prevState) => {
        const newLanguage = prevState.filter((language) => language !== target);
        // making sure at least one language is selected
        if (newLanguage.length === 0) {
          setShowLanguageWarning(true);
          return prevState;
        } else {
          return [...newLanguage];
        }
      });
    }
  };

  return (
    <>
      <TextField
        aria-readonly
        label={'Language'}
        fullWidth
        required={true}
        focused={showModal}
        multiline
        variant="outlined"
        value={language.join(', ')}
        onClick={() => setShowModal(true)}
        InputProps={{
          endAdornment: (
            <Tooltip
              disableFocusListener
              disableTouchListener
              title={'Select your form languages here'}
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
      <Dialog
        fullWidth
        maxWidth={'md'}
        onClose={() => setShowModal(false)}
        open={showModal}>
        <DialogTitle>Language *</DialogTitle>
        <DialogContent dividers={true}>
          <FormControl fullWidth variant="outlined">
            <FormGroup>
              <Grid
                container
                spacing={1}
                sx={{
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}>
                {languageOptions.map((value) => {
                  if (value === undefined) {
                    return <></>;
                  }
                  return (
                    <Grid item key={value} xs={4}>
                      <FormControlLabel
                        label={value}
                        control={
                          <Checkbox
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => handleLanguageChange(value, event)}
                            checked={language.indexOf(value) > -1}
                          />
                        }
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </FormGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            sx={{
              height: '100%',
              marginLeft: '10px',
            }}
            onClick={() => setShowModal(false)}>
            Close
          </PrimaryButton>
        </DialogActions>
      </Dialog>
      <Dialog
        onClose={() => setShowLanguageWarning(false)}
        open={showLanguageWarning}>
        <DialogTitle>Must have at least one language</DialogTitle>
        <DialogContent>
          <Typography>
            You must select at least one language for this form.
          </Typography>
        </DialogContent>
        <DialogActions>
          <PrimaryButton
            sx={{
              height: '100%',
              marginLeft: '10px',
            }}
            onClick={() => setShowLanguageWarning(false)}>
            OK
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LanguageModal;
