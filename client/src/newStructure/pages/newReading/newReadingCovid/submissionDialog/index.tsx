import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

interface IProps {
    open: boolean;
    handleDialogClose: any;
}

export default function SubmissionDialog(props: IProps) {
    return (
        <div>
            <Dialog
                open={props.open}
                onClose={props.handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">
                    {'Summary '}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        chicken :
                        kabab:
                        water
                        earth
                        air
                        wind
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleDialogClose} color="primary">
                        Ok!
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
