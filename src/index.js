import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, HashRouter, Switch, Route, Redirect } from 'react-router-dom';

import * as API from './api';
import Home from './pages/home';
import Project from './pages/project';

import './style.scss';

window.API = API;
window.log = function(...props) {
  if (localStorage.DEBUG) {
    console.log(...props);
  }
};

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route path="/project" component={Project} />
          <Redirect to="/" />
        </Switch>
      </HashRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));