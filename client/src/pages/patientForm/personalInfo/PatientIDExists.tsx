import { Link } from 'react-router-dom';
import makeStyles from '@mui/styles/makeStyles';

interface IProps {
  patientId: string;
}

export const PatientIDExists = (props: IProps) => {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      Patient ID {props.patientId} already exists.{' '}
      <Link to={'/patients/' + props.patientId}>View patient.</Link>
    </div>
  );
};

const useStyles = makeStyles({
  container: {
    padding: 3,
    color: '#f44336',
  },
});
