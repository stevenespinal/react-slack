import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import Login from './components/auth/login'
import Register from './components/auth/register'
import {BrowserRouter as Router, Switch, Route, withRouter, Redirect} from 'react-router-dom';
import firebase from "./firebase";
import 'semantic-ui-css/semantic.min.css';
import {createStore} from "redux";
import {connect} from 'react-redux';
import {Provider} from 'react-redux';
import {composeWithDevTools} from "redux-devtools-extension";
import * as serviceWorker from './serviceWorker';
import rootReducer from "./reducers";
import {setUser, clearUser} from './actions/index';
import Spinner from "./Spinner";

const store = createStore(rootReducer, composeWithDevTools());

class Root extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      console.log("User", user);
      console.log(this.props);
      if (user) {
        this.props.setUser(user);
        this.props.history.push("/")
      } else {
        this.props.history.push("/login");
        this.props.clearUser()
      }
    });
  };

  render() {
    return this.props.isLoading ? <Spinner/> : (
        <Switch>
          <Route exact path="/" component={App}/>
          <Route path="/login" component={Login}/>
          <Route path="/register" component={Register}/>
          <Redirect to="/"/>
        </Switch>
    )
  }
}

const mapStateToProps = (state) => {
  console.log("State",state);
  return {
    isLoading: state.user.isLoading
  }
};

//Higher order component
const RootWithAuth = withRouter(connect(mapStateToProps, {setUser, clearUser})(Root));


ReactDOM.render(
  // wrapping a router in order to reroute back to home page after login
  <Provider store={store}>
    <Router>
      <RootWithAuth/>
    </Router>
  </Provider>
  , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
