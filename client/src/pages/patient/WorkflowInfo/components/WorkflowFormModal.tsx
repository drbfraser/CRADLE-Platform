import { Close } from '@mui/icons-material';
import {
  Box,
  Typography,
  Modal,
  IconButton,
  Paper,


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
                // sx={{ p: { xs: 3, md: 5 }, mb: 5 }}
                // open={false}
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
                        {/* <Paper> */}
                        {/* <IconButton
                            // onClick={handleClose}
                            // sx={{ position: "absolute", top: 8, right: 8 }}
                            >
                            <Close sx={{ color: red[500] }}/>
                        </IconButton> */}
                    <CustomizedForm
                        patientId={patientId}
                        fm={form}
                        renderState={FormRenderStateEnum.FIRST_SUBMIT}
                        showCloseBtn={true}
                        handleClose={handleClose}
                    />
                    {/* </Paper> */}1
                </Box>
            </Modal>
        </>
    )
}