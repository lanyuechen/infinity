import React, { Component } from 'react';

import './style.scss';

/**
 * 宽高比固定的容器
 * ratio: 高度和宽度的比值
 */
export default class extends Component {
  static defaultProps = {
    ratio: 0.618
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { ratio, children } = this.props;
    return (
      <div className="card">
        <div className="bg" style={{paddingBottom: `${ratio * 100}%`}}> </div>
        <div className="container">
          {children}
        </div>
      </div>
    );
  }
}