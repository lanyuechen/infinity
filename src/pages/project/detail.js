import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import './detail.scss';

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: null
    };
  }

  componentDidMount() {
    this.update();
  }

  update = () => {
    const _id = this.props.match.params.id;
    API.project.findOne(_id).then(res => {
      this.setState({
        project: res
      })
    });
  };

  render() {
    const { project } = this.state;
    if (!project) {
      return null;
    }

    return (
      <div className="project-detail">
        <nav>
          <div className="title">
            <NavLink to="/project"><i className="iconfont icon-home" /></NavLink>&nbsp;/&nbsp;
            {project.name}
          </div>
        </nav>
        <div className="body">
          <div className="sidebar">
            sidebar
          </div>
          <div className="content">
            content
          </div>
        </div>
      </div>
    );
  }
}