import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

import { DragSource, DropTarget } from 'lib/dnd';

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

  handleDrop = (data, e) => {
    const boundingRect = e.target.getBoundingClientRect();
    const x = e.pageX - boundingRect.x;
    const y = e.pageY - boundingRect.y;

    console.log('===', x, y)
    //if (data.type === TYPE_VIEW) {
    //  this.modules.push(new View({x, y}));
    //} else {
    //  this.modules.push(new M({x, y}));
    //}
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
            <div>
              <h2>基础组件</h2>
              {DragSource('FUNCTION', {})(
                <div className="brick-card infinity-hover">
                  ƒ(x)
                </div>
              )}
            </div>
            <div>
              <h2>自定义组件</h2>
              {['AAA', 'BBB', 'CCC'].map(d => DragSource('COMPONENT', {})(
                <div className="brick-card infinity-hover">
                  {d}
                </div>
              ))}
            </div>
            <div>
              <h2>公共组件</h2>
              {['111', '222', '333'].map(d => DragSource('COMPONENT', {})(
                <div className="brick-card infinity-hover">
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div className="content">
            {DropTarget(['FUNCTION', 'COMPONENT'], {
              onDrop: this.handleDrop
            })(
              <svg>
                <g className="lines" ref="lines">

                </g>
                <g className="modules">

                </g>
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }
}