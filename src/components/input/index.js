import React, { Component } from 'react';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { ...other } = this.props;
    if (other.type === 'textarea') {
      return (
        <textarea
          rows="3"
          {...other}
          className={`infinity-input infinity-focus ${other.className || ''}`}
        />
      )
    }

    return (
      <input
        autocomplete="off"
        {...other}
        className={`infinity-input infinity-focus ${other.className || ''}`}
      />
    );
  }
}