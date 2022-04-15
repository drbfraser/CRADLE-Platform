import { makeStyles } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import {
  Autocomplete,
  AutocompleteRenderInputParams,
} from 'formik-material-ui-lab';
import React, { useState } from 'react';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { handleSubmit } from './handlers';
import { initialState, CustomizedFormField, validationSchema } from './state';
// import availableForms from './Forms.json';
// import availableLangs from './Lang.json';
import { Question,FormSchema } from 'src/shared/types';

// import {useEffect } from 'react';
import { EndpointEnum } from 'src/shared/enums';
import { apiFetch, API_URL } from 'src/shared/api';

interface IProps {
  patientId: string;
  setQuestions: (questions: Question[]) => void;
  formSchemas:FormSchema[];
}

// export type customizedForm = {
//   name: string;
//   type: string;
// };

export const SelectHeaderForm = ({ patientId, setQuestions,formSchemas }: IProps) => {
  const classes = useStyles();
  // const [setErrorLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);
  // let availableLangs:string[] = [];
  

  const all_forms: string[] = formSchemas.map(function (item) {
    return item.id;//id is a string here
  });

  console.log(all_forms);
  console.log(formSchemas);

  // useEffect(() => {
   
  //   /*eslint no-useless-concat: "error"*/
  //   // fetchAllLangVersions(selectedFormID);
  // }, [formSchemas]);


  function handleSelectForm(e:any) {
     let selectedFormID = e.target.value;
     fetchAllLangVersions(selectedFormID);
  } 

  function fetchAllLangVersions(form_template_id:string){
    apiFetch(API_URL + EndpointEnum.FORM_TEMPLATE + `${form_template_id}`)
    .then((resp) => resp.json())
    .then((lang_model) => {
      setAvailableLangs(lang_model.lang_versions);
      console.log(lang_model);
    })
    .catch(() => {
      // setErrorLoading(true);
      console.log("Error Loading !!!!!!")
    });
  }
 


  return (
    <>
      <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
      <Formik
        initialValues={initialState}
        validationSchema={validationSchema}
        onSubmit={handleSubmit(patientId, setSubmitError, setQuestions)}>
        {({ touched, errors, isSubmitting }) => (
          <Form>
            <Paper>
              <Box p={2}>
                <h2>Form Template</h2>
                <Box pt={1} pl={3} pr={3}>
                  <Grid container spacing={3}>
                    <Grid item xs={6}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={CustomizedFormField.form_template_id}
                        options={all_forms}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={CustomizedFormField.form_template_id}
                            onChange={handleSelectForm}
                            error={
                              touched[CustomizedFormField.form_template_id] &&
                              !!errors[CustomizedFormField.form_template_id]
                            }
                            helperText={
                              touched[CustomizedFormField.form_template_id]
                                ? errors[CustomizedFormField.form_template_id]
                                : ''
                            }
                            label="Form"
                            variant="outlined"
                            required
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Field
                        component={Autocomplete}
                        fullWidth
                        name={CustomizedFormField.lang}
                        options={availableLangs}
                        disableClearable={true}
                        renderInput={(
                          params: AutocompleteRenderInputParams
                        ) => (
                          <TextField
                            {...params}
                            name={CustomizedFormField.lang}
                            error={
                              touched[CustomizedFormField.lang] &&
                              !!errors[CustomizedFormField.lang]
                            }
                            helperText={
                              touched[CustomizedFormField.lang]
                                ? errors[CustomizedFormField.lang]
                                : ''
                            }
                            label="Language"
                            variant="outlined"
                            required
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </Paper>
            <br />
            <Button
              className={classes.right}
              color="primary"
              variant="contained"
              size="large"
              type="submit"
              disabled={isSubmitting}>
              Fetch Form
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
};

const useStyles = makeStyles({
  right: {
    float: 'right',
  },
});
