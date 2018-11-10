import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import List from './list';
import Detail from './detail';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { match } = this.props;
    return (
      <div>
        <Switch>
          <Route exact path={match.path} component={List} />
          <Route path={`${match.path}/:id`} component={Detail} />
        </Switch>
      </div>
    );
  }
}