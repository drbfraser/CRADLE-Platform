import * as Yup from 'yup';
import { ReadingField } from '../state';

const wholeNumErr = (min: number, max: number) => `Must be a whole number between ${min} - ${max}.`;
const requiredErr = 'This field is required.';
const urineTestValidation = Yup.string().when(ReadingField.urineTest, {
                                is: true,
                                then: Yup.string().required(requiredErr)
                            });

export const vitalSignsValidationSchema = Yup.object().shape({
    [ReadingField.bpSystolic]: Yup.number()
        .min(50, wholeNumErr(50, 300))
        .max(300, wholeNumErr(50, 300))
        .required(requiredErr),
    [ReadingField.bpDiastolic]: Yup.number()
        .min(30, wholeNumErr(30, 200))
        .max(200, wholeNumErr(30, 200))
        .required(requiredErr), 
    [ReadingField.heartRateBPM]: Yup.number()
        .min(30, wholeNumErr(30, 250))
        .max(250, wholeNumErr(30, 250))
        .required(requiredErr), 
    [ReadingField.respiratoryRate]: Yup.number()
        .min(1, wholeNumErr(1, 100))
        .max(100, wholeNumErr(1, 100)), 
    [ReadingField.oxygenSaturation]: Yup.number()
        .min(50, wholeNumErr(50, 100))
        .max(100, wholeNumErr(50, 100)),
    [ReadingField.temperature]: Yup.number()
        .min(30, wholeNumErr(30, 45))
        .max(45, wholeNumErr(30, 45)),
    [ReadingField.urineTest]: Yup.boolean(),
    [ReadingField.leukocytes]: urineTestValidation,
    [ReadingField.nitrites]: urineTestValidation,
    [ReadingField.glucose]: urineTestValidation,
    [ReadingField.protein]: urineTestValidation,
    [ReadingField.blood]: urineTestValidation,
});