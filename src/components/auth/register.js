import React, {Component} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false
  };

  handleChange = (event) => {
    const {name, value} = event.target;
    this.setState({
      [name]: value
    })
  };

  isFormEmpty = ({username, email, password, passwordConfirmation}) => {
    return !username.length || !email.length || !password.length || !passwordConfirmation.length;
  };

  isPasswordLengthValid = ({password, passwordConfirmation}) => {
    // returns false if this.state.password.length or this.state.passwordConfirmation.length is less than 6 otherwise it will be true that it is 6 characters or greater
    return !(password.length < 6 || passwordConfirmation.length < 6);
  };

  passwordsMatch = ({password, passwordConfirmation}) => {
    if (password !== passwordConfirmation) {
      return false
    }
    return password === passwordConfirmation;
  };

  isFormValid = () => {
    let errors = [];
    let error;
    if (this.isFormEmpty(this.state)) {
      //if form is empty
      error = {
        message: "Please fill in all fields."
      };
      this.setState({
        errors: errors.concat(error)
      });
      //should not execute handleSubmit
      return false;
    } else if (!this.isPasswordLengthValid(this.state)) {
      //  if password is not valid
      error = {message: "Password must be at least 6 characters."};
      this.setState({
        errors: errors.concat(error)
      });
      return false;
    } else if (!this.passwordsMatch(this.state)) {
      error = {message: "Passwords do not match."};
      this.setState({
        errors: errors.concat(error)
      });
      return false;
    } else {
      return true;
    }
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const {email, password} = this.state;
    if (this.isFormValid()) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {
          console.log("User has been created", user);
          this.setState({
            loading: false
          });
        })
        .catch(error => {
          console.log(error);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(error)
          });
        });
      this.setState({
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: true
      });
    }
  };

  displayErrors = errors => errors.map((err, i) => <p key={i}>{err.message}</p>);

  render() {
    const {username, email, password, passwordConfirmation, errors, loading} = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="App">
        <Grid.Column style={{maxWidth: "450px"}}>
          <Header as="h2" textAlign="center" icon color="orange">
            <Icon name="puzzle piece" color="orange"/>
            Register for Dev Chat
          </Header>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input fluid name="username" iconPosition="left" icon="user" placeholder="Username"
                          onChange={this.handleChange} type="text" value={username}/>
              <Form.Input fluid name="email" iconPosition="left" icon="mail" placeholder="Email Address"
                          onChange={this.handleChange} type="email" value={email} className={errors.some(error => error.message.toLocaleLowerCase().includes('email')) ? "error" : ""}/>
              <Form.Input fluid name="password" iconPosition="left" icon="lock" placeholder="Password"
                          onChange={this.handleChange} type="password" value={password}/>
              <Form.Input fluid name="passwordConfirmation" iconPosition="left" icon="repeat"
                          placeholder="Password Confirmation" onChange={this.handleChange} type="password"
                          value={passwordConfirmation}/>
              <Button color="orange" fluid size="large" className={loading ? "loading" : ""} disabled={loading}>Submit</Button>
            </Segment>
          </Form>
          <Message>Already a User? <Link to="login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;
