import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/auth/login'
import Register from './components/auth/register'
import {BrowserRouter as Router, Switch, Route, withRouter, Redirect} from 'react-router-dom';
import firebase from "./firebase";
import 'semantic-ui-css/semantic.min.css';
import * as serviceWorker from './serviceWorker';

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      console.log("User", user);
      if (user) return this.props.history.push("/");
      return this.props.history.push("/login");
    });
  };

  render() {
    return (
        <Switch>
          <Route exact path="/" component={App}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>
          <Redirect to="/"/>
        </Switch>
    )
  }
}


//Higher order component
const RootWithAuth = withRouter(Root);


ReactDOM.render(
  // wrapping a router in order to reroute back to home page after login
  <Router>
    <RootWithAuth/>
  </Router>
  , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
