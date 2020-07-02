import React from 'react';
import { connect } from 'react-redux';
import {
    FormControl,
    Input,
    InputLabel,
    Paper,
} from '@material-ui/core';
import { UrineTestForm } from '../../urineTestForm';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

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
        },
        formFieldDM: {
            margin: theme.spacing(2),
            minWidth: '48ch',
            minHeight: '15ch',
        },
        formControl: {
            margin: theme.spacing(3),
        },

    })
);

const Page: React.FC<any> = () => {
    const classes = useStyles();
    return (
        <div>
            <Paper
                style={{
                    padding: '35px 25px',
                    marginTop: '2%',
                    borderRadius: '15px',
                }}>
                <h1>
                    <b>Vital Sign Assessment</b>
                </h1>

                <form className={classes.root} noValidate autoComplete="off">
                    <FormControl className={classes.formField}>
                        <InputLabel required htmlFor="component-simple">
                            Systolic
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel required htmlFor="component-outlined">
                            Diastolic
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel required htmlFor="component-outlined">
                            Hear Rate
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel htmlFor="component-outlined">
                            Raspiratory Rate
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel htmlFor="component-outlined">
                            Oxygen Saturation
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel htmlFor="component-outlined">
                            Temperature
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                    <FormControl className={classes.formField}>
                        <InputLabel htmlFor="component-outlined">
                            Raspiratory Rate
                        </InputLabel>
                        <Input id="component-outlined" />
                    </FormControl>
                </form>
            </Paper>
            <div style={{ marginTop: '2%' }}>
                <UrineTestForm
                    reading={'' as any}
                    onChange={'' as any}
                    onSwitchChange={'' as any}
                    hasUrineTest={'' as any}
                />
            </div>
        </div>
    );
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});
export const VitalSignAssessment = connect(mapStateToProps, mapDispatchToProps)(Page);
