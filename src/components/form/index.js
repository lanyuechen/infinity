import React, { Component } from 'react';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
    this.data = {};
    React.Children.map(props.children, child => {
      if (child.props.name) {
        this.data[child.props.name] = child.value !== undefined ? child.value : child.defaultValue;
      }
    });
  }

  handleChange = (key, value) => {
    this[key] = value;
    this.data[key] = value;
  };

  render() {
    const { children } = this.props;
    return (
      <form>
        {React.Children.map(children, child => ({
          ...child,
          props: {
            ...child.props,
            onChange: (e) => {
              this.handleChange(child.props.name, e.target.value);
            }
          }
        }))}
      </form>
    );
  }
}