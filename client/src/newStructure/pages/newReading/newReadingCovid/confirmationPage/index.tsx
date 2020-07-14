import React from 'react';

import {
    Paper,
} from '@material-ui/core';

import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            '& > *': {
                margin: theme.spacing(2),
            },
        },
        formField: {
            margin: theme.spacing(2),
            minWidth: '22ch',
            width: '30%',
        },
        formFieldDM: {
            margin: theme.spacing(2),
            minWidth: '48ch',
            minHeight: '15ch',
            width: '46.5%',
        },
        formControl: {
            margin: theme.spacing(3),
        },
    })
);

interface IProps {
    patient:any
    symptoms:any
    vitals:any
    assessment:any
    urineTest:any
}

const Page: React.FC<IProps> = (props) => {
    const classes = useStyles();
    return (
        <Paper
            style={{
                padding: '35px 25px',
                marginTop: '2%',
                borderRadius: '15px',
            }}>
            <h1>
                <b>Confirm Information</b>
            </h1>

        </Paper>
    );
};

export const ConfirmationPage = Page;
