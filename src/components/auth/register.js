import React, {Component} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';
import md5 from 'md5';

class Register extends Component {
  state = {
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
    errors: [],
    loading: false,
    usersRef: firebase.database().ref('users')
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
    const {email, password, username, errors} = this.state;
    if (this.isFormValid()) {
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(createdUser => {
          console.log("User has been created", createdUser);
          createdUser.user.updateProfile({
              displayName: username,
              photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
            })
            .then(() => {
              this.saveUser(createdUser)
                .then(() => {
                  console.log("User Saved");
                  this.setState({
                    loading: false
                  });
                })
            })
            .catch(error => {
              console.error(error);
              this.setState({
                loading: false,
                errors: errors.concat(error)
              })
            })
        })
        .catch(error => {
          console.log(error);
          this.setState({
            loading: false,
            errors: errors.concat(error)
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

  saveUser = createdUser => {
    const {usersRef} = this.state;
    const {displayName, photoURL} = createdUser.user;
    console.log("Your info returned",createdUser);
    return usersRef.child(createdUser.user.uid).set({
      name: displayName || null,
      avatar: photoURL || null
    })
  };

  handleInputErrors = (errors, inputName) => {
    return errors.some(error => error.message.toLocaleLowerCase().includes(inputName)) ? "error" : ""
  };

  displayErrors = errors => errors.map((err, i) => <p key={i}>{err.message}</p>);

  render() {
    const {username, email, password, passwordConfirmation, errors, loading} = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="App">
        <Grid.Column style={{maxWidth: "450px"}}>
          <Header as="h1" textAlign="center" icon color="orange">
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
                          onChange={this.handleChange} type="email" value={email}
                          className={this.handleInputErrors(errors, "email")}/>
              <Form.Input fluid name="password" iconPosition="left" icon="lock" placeholder="Password"
                          onChange={this.handleChange} type="password" value={password}
                          className={this.handleInputErrors(errors, "password")}/>
              <Form.Input fluid name="passwordConfirmation" iconPosition="left" icon="repeat"
                          placeholder="Password Confirmation" onChange={this.handleChange} type="password"
                          value={passwordConfirmation} className={this.handleInputErrors(errors, "password")}/>
              <Button color="orange" fluid size="large" className={loading ? "loading" : ""}
                      disabled={loading}>Submit</Button>
            </Segment>
          </Form>
          <Message>Already a User? <Link to="/login">Login</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Register;
