import { PatientField } from './state';

export const validateField = (field: PatientField, value: any): boolean => {
    switch(field) {
        case PatientField.patientId:
            return (value.length >= 1 && value.length <= 14 && ~isNaN(+value)) ? true : false;
        case PatientField.patientName:
            return /^\w[\w+\- ]*$/.test(value);
        case PatientField.dateOfBirth:
            const year: string = value.substr(0, value.indexOf('-'));
            const yearNow: number = new Date().getUTCFullYear();
            let age = yearNow - +year;
            return validateField(PatientField.estimatedAge, age);
        case PatientField.estimatedAge:
            return value >= 1 && value <= 100;
        case PatientField.village:
            return /^[0-9]+$/.test(value);
        default:
            return true;
    }
}

// export const isValidGestationalAge = (age: number, unit: string): boolean => {
//     if(unit === GESTATIONAL_AGE_UNITS.WEEKS) {
//         return age >= 1 && age <= 60;
//     } else if (unit === GESTATIONAL_AGE_UNITS.MONTHS) {
//         return age >= 1 && age <= 13;
//     }

//     return false;
// }