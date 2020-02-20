import React, {Component} from 'react';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { userLoginFetch } from '../../actions/users';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import image from './img/splash_screen_4.png'

const SignupForm = (props) => {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .max(15, 'Must be 15 characters or less')
        .min(5, 'Must be at least 5 characters')
        .required('Required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Required'),
    }),
    onSubmit: values => {
      props.userLoginFetch(values)
    },
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <h1 style={{"font-size" : "50px"}}>Log In</h1>

      <h2>Email</h2>
      <input name="email"
             className='inputStyle'
             placeholder='somebody@example.com'
             {...formik.getFieldProps('email')} />
      {formik.touched.email && formik.errors.email ? (
        <div className="formError">{formik.errors.email}</div>
      ) : null}

      <h2>Password</h2>
      <input name="password"
             className='inputStyle'
             placeholder='********'
             type='password'
             {...formik.getFieldProps('password')} />
      {formik.touched.password && formik.errors.password ? (
        <div className="formError">{formik.errors.password}</div>
      ) : null}

      {/* Error message from server*/}
      {props.errorMessage && <div className="formError">{props.errorMessage}</div>}
      <br/>
      <button type='submit' className='contant-submit white'>Login</button>
    </form>
  );
};

class Login extends Component {

  render() {
    return (
      <div className="loginWrapper">
        <div className='subWrapper'>
          <img src={image} className='imgStyle' ></img>
        </div>
        <div className='subWrapper'>
          <div style={{"position" : "relative", "left" : "-10%"}}>
            <SignupForm {...this.props} />
          </div> 
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ user }) => ({
  email : user.currentUser.email,
  errorMessage: user.serverLoginErrorMessage
})

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      userLoginFetch,
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
