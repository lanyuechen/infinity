import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import * as API from './api';
import Home from './pages/home';
import Project from './pages/project';

import './style.scss';

window.API = API;

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/project" component={Project} />
          <Redirect to="/" />
        </Switch>
      </Router>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));