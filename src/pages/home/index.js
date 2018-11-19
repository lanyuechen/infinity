import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import './style.scss';

export default class extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="home">
        <h2>INFINITY</h2>
        <p>这是一个编辑器</p>
        <p>
          <NavLink to="/project">开始 &gt;</NavLink>
        </p>
      </div>
    );
  }
}