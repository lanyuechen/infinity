import React, { Component } from 'react';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ratio, style = {}, children } = this.props;
    return (
      <div className="card" style={style}>
        <div className="container" style={{paddingBottom: `${ratio * 100}%`}}>
          {children}
        </div>
      </div>
    );
  }
}