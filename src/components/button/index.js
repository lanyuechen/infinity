import React, { Component } from 'react';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { children, ...other } = this.props;
    return (
      <button
        {...other}
        className={`infinity-btn infinity-hover ${other.className || ''}`}
      >
        {children}
      </button>
    );
  }
}