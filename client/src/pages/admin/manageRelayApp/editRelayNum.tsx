import { CancelButton, PrimaryButton } from 'src/shared/components/Button';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@mui/material';
import {
    RelayNumField,
    RelayNumTemplate,
    getValidationSchema
} from './state';
import { Field, Form, Formik, FormikHelpers } from 'formik';
import { TextField } from 'formik-mui';
import APIErrorToast from 'src/shared/components/apiErrorToast/APIErrorToast';
import { IRelayNum } from 'src/shared/types';
import { useState } from 'react';
import { saveRelayNumAsync } from 'src/shared/api';

interface IProps {
    open: boolean;
    onClose: () => void;
    relayNums: IRelayNum[];
    editRelayNum?: IRelayNum;
}

const EditRelayNum = ({ open, onClose, relayNums, editRelayNum }: IProps) => {

    console.log("inside click edit:", open, onClose, relayNums, editRelayNum);

    const [submitError, setSubmitError] = useState(false);
    const creatingNew = editRelayNum === undefined;

    console.log("creatingnew: ", creatingNew);

    const handleSubmit = async (
        values: IRelayNum,
        { setSubmitting }: FormikHelpers<IRelayNum>
    ) => {
        try {
            console.log("about to save: ", values.phone);
            await saveRelayNumAsync(values);
            onClose();
        } catch (e) {
            setSubmitting(false);
            setSubmitError(true);
        }
    };

    return (
        <>
            <APIErrorToast open={submitError} onClose={() => setSubmitError(false)} />
            <Dialog open={open} maxWidth="sm" fullWidth>
                <DialogTitle>Edit RelayNum</DialogTitle>
                <DialogContent>
                    <Formik
                        initialValues={editRelayNum ?? RelayNumTemplate}
                        validationSchema={getValidationSchema(
                            creatingNew ? relayNums.map((num) => num.phone) : []
                        )}
                        onSubmit={handleSubmit}>
                        {({ isSubmitting, isValid }) => (
                            <Form>
                                <Field
                                    component={TextField}
                                    fullWidth
                                    required
                                    inputProps={{ maxLength: 50 }}
                                    variant="outlined"
                                    label="Phone Number"
                                    name={RelayNumField.phone}
                                />
                                <br />
                                <br />
                                <Field
                                    component={TextField}
                                    fullWidth
                                    inputProps={{ maxLength: 50 }}
                                    variant="outlined"
                                    label="Location"
                                    name={RelayNumField.description}
                                />
                                <br />
                                <br />
                                <DialogActions>
                                    <CancelButton type="button" onClick={onClose}>
                                        Cancel
                                    </CancelButton>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={isSubmitting || !isValid}>
                                        {creatingNew ? 'Create' : 'Save'}
                                    </PrimaryButton>
                                </DialogActions>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default EditRelayNum;
