import { Paper, PaperProps, styled } from '@mui/material';

const ElevatedPaper = (props: PaperProps) => <Paper elevation={3} {...props} />;

export default styled(ElevatedPaper)(() => ({}));
