import { Box, Container, Typography, TextField, Button } from '@mui/material';
import { Toast } from 'src/shared/components/toast';
import { DASHBOARD_PADDING } from 'src/shared/constants';
import { Form, Formik, Field, FieldProps } from 'formik';
import { useLoginMutation } from './login-mutation';

export const LoginForm = () => {
  const login = useLoginMutation();

  return (
    <>
      {login.error && (
        <Toast
          severity="error"
          message={login.error.message}
          open={login.isError}
          onClose={login.reset}
          transitionDuration={0}
        />
      )}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
        }}>
        {/* Empty box for padding */}
        <Box
          sx={{
            width: DASHBOARD_PADDING,
          }}></Box>
        <Container
          id={'login-form-container'}
          disableGutters
          sx={{
            minHeight: '400px',
            height: '100%',
            width: 'fit-content',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            '@media (max-height: 500px)': {
              transform: 'scale(0.75)',
            },
          }}>
          <Container
            sx={{
              width: '350px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
            <Typography
              variant={'h4'}
              component={'h4'}
              fontWeight={'bold'}
              sx={{ marginY: '0.5rem' }}>
              Login
            </Typography>
            <Formik
              initialValues={{
                username: '',
                password: '',
              }}
              onSubmit={(credentials) => {
                login.mutate(credentials);
              }}>
              {(formikProps) => (
                <Form onSubmit={formikProps.handleSubmit}>
                  <Container
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                    <Field name={'username'} validate={validateNotEmpty}>
                      {({ field, form, meta }: FieldProps<Credentials>) => (
                        <TextField
                          fullWidth
                          required
                          id={'username-field'}
                          name={field.name}
                          label={'Username / Email'}
                          variant={'filled'}
                          slotProps={TEXT_FIELD_SLOT_PROPS}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                    <Field name={'password'} validate={validateNotEmpty}>
                      {({ field, form, meta }: FieldProps<Credentials>) => (
                        <TextField
                          fullWidth
                          required
                          type={'password'}
                          id={'password-field'}
                          name={field.name}
                          label={'Password'}
                          variant={'filled'}
                          slotProps={TEXT_FIELD_SLOT_PROPS}
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                        />
                      )}
                    </Field>
                    <Button
                      variant={'contained'}
                      fullWidth
                      disabled={!formikProps.isValid || login.isPending}
                      type={'submit'}
                      size={'large'}
                      sx={{
                        fontSize: 'large',
                      }}>
                      Login
                    </Button>
                  </Container>
                </Form>
              )}
            </Formik>
          </Container>
        </Container>
      </Box>
    </>
  );
};

const TEXT_FIELD_SLOT_PROPS = {
  inputLabel: {
    shrink: true,
  },
};

interface Credentials {
  username: string;
  password: string;
}

const validateNotEmpty = (value: string) =>
  value.trim().length == 0 ? 'Field is required' : undefined;
