import React, {Component} from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import firebase from '../../firebase';

class Login extends Component {
  state = {
    email: '',
    password: '',
    errors: [],
    loading: false,
  };

  handleChange = (event) => {
    const {name, value} = event.target;
    this.setState({
      [name]: value
    })
  };

  isFormValid = ({email, password}) => {
    return email && password
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const {email, password, errors} = this.state;
    if (this.isFormValid(this.state)) {
      this.setState({
        email: '',
        password: '',
        errors: [],
        loading: true
      });
      firebase.auth().signInWithEmailAndPassword(email, password).then(signedInUser => {
        console.log(signedInUser);
        this.setState({
          loading: false
        });
      }).catch(error => {
        this.setState({
          errors: errors.concat(error),
          loading: false
        });
      })
    }
  };

  handleInputErrors = (errors, inputName) => {
    return errors.some(error => error.message.toLocaleLowerCase().includes(inputName)) ? "error" : ""
  };

  displayErrors = errors => errors.map((err, i) => <p key={i}>{err.message}</p>);

  render() {
    const { email, password, errors, loading} = this.state;
    return (
      <Grid textAlign="center" verticalAlign="middle" className="App">
        <Grid.Column style={{maxWidth: "450px"}}>
          <Header as="h1" textAlign="center" icon color="violet">
            <Icon name="code branch" color="violet"/>
            Login to Dev Chat
          </Header>
          {errors.length > 0 && (
            <Message error>
              <h3>Error</h3>
              {this.displayErrors(errors)}
            </Message>
          )}
          <Form size="large" onSubmit={this.handleSubmit}>
            <Segment stacked>
              <Form.Input fluid name="email" iconPosition="left" icon="mail" placeholder="Email Address"
                          onChange={this.handleChange} type="email" value={email}
                          className={this.handleInputErrors(errors, "email")}/>
              <Form.Input fluid name="password" iconPosition="left" icon="lock" placeholder="Password"
                          onChange={this.handleChange} type="password" value={password}
                          className={this.handleInputErrors(errors, "password")}/>
              <Button color="violet" fluid size="large" className={loading ? "loading" : ""}
                      disabled={loading}>Submit</Button>
            </Segment>
          </Form>
          <Message>Don't have an account? <Link to="/register">Register</Link></Message>
        </Grid.Column>
      </Grid>
    )
  }
}

export default Login;
