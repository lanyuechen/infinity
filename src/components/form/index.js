import React, { Component } from 'react';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);

    this.data = {};
    this.invalid = {};

    React.Children.map(props.children, child => {
      if (child.props.name) {
        this.data[child.props.name] = child.value !== undefined ? child.value : child.defaultValue;
      }
    });
  }

  handleChange = (e, key) => {
    this.data[key] = e.target.value;
    if (this.invalid[key] !== !e.target.checkValidity()) {
      this.invalid[key] = !e.target.checkValidity();
      this.forceUpdate();
    }
    this.props.onChange && this.props.onChange(this.data, this.invalid);
  };

  render() {
    const { children } = this.props;
    return (
      <form>
        {React.Children.map(children, child => {
          const { name, className } = child.props;
          return {
            ...child,
            props: {
              ...child.props,
              className: this.invalid[name] ? `infinity-err ${className}` : className,
              onChange: (e) => {
                this.handleChange(e, name);
              }
            }
          }
        })}
      </form>
    );
  }
}