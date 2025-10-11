import { Close } from '@mui/icons-material';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Paper,
  CircularProgress,


} from '@mui/material';
import { pink, red } from '@mui/material/colors';
import { CustomizedForm } from 'src/pages/customizedForm/components/CustomizedForm';
import { FormRenderStateEnum } from 'src/shared/enums';
import { FormTemplateWithQuestions } from 'src/shared/types/form/formTemplateTypes';
import { CForm } from 'src/shared/types/form/formTypes';

interface IProps {
    openFormModal: boolean,
    form: CForm,
    patientId: string,
    handleCloseForm: () => void;
}

export default function WorkflowFormModal(
    { openFormModal, form, patientId, handleCloseForm }: IProps
) {
    const handleClose = () => { 
        handleCloseForm();
    }
    
    return( 
        <>
            <Modal
                open={openFormModal}
                onClose={handleClose}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%"
                    }}
                >
                    <Box
                        sx={{
                            minWidth: "50vw",
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            overflowY: "auto",
                        }}
                        >
                        {form ? (<CustomizedForm
                            patientId={patientId}
                            fm={form}
                            renderState={FormRenderStateEnum.FIRST_SUBMIT}
                            isModalView={true}
                            handleCloseModal={handleClose}
                        />) : (
                            <Box sx={{ p: 4, textAlign: "center" }}>
                                <CircularProgress /> Loading...
                            </Box>
                        )}
                    </Box>
                </Box>
            </Modal>
        </>
    )
}